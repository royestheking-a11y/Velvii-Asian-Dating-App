import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Camera, ShieldCheck, CheckCircle, Loader2, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
// import { getVerificationRequestByUserId } from '@/utils/storage';
import { generateId } from '@/utils/helpers';
import { users as apiUsers } from '@/services/api';
import { toast } from 'sonner';
import { VerificationRequest } from '@/types';

interface VerificationPageProps {
    onClose: () => void;
}

type VerificationStep = 'intro' | 'camera' | 'processing' | 'success' | 'pending' | 'rejected';

export const VerificationPage: React.FC<VerificationPageProps> = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState<VerificationStep>('intro');
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        if (currentUser.isVerified) {
            setStep('success');
            return;
        }

        const checkStatus = async () => {
            try {
                const request = await apiUsers.getVerificationStatus(currentUser.id);
                if (request) {
                    if (request.status === 'approved') {
                        setStep('success');
                    } else if (request.status === 'pending') {
                        setStep('pending');
                    } else if (request.status === 'rejected') {
                        setStep('rejected');
                        setRejectionReason(request.rejectionReason || 'Verification failed. Please try again.');
                    }
                }
            } catch (error) {
                console.error("Failed to check verification status", error);
            }
        };

        checkStatus();
    }, [currentUser]);

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
    }, []);

    const startCamera = useCallback(async () => {
        try {
            setCameraError(null);
            setCameraReady(false);
            setStep('camera');

            // Small delay to ensure video element is rendered
            await new Promise(resolve => setTimeout(resolve, 100));

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for video to be ready
                videoRef.current.onloadeddata = () => {
                    console.log('Video loaded');
                    setCameraReady(true);
                };

                try {
                    await videoRef.current.play();
                } catch (playError) {
                    console.log('Autoplay blocked, user will need to interact');
                }
            }
        } catch (error: any) {
            console.error('Camera error:', error);
            let errorMsg = 'Failed to access camera.';
            if (error.name === 'NotAllowedError') {
                errorMsg = 'Camera access denied. Please allow camera permission.';
            } else if (error.name === 'NotFoundError') {
                errorMsg = 'No camera found on this device.';
            }
            setCameraError(errorMsg);
            setStep('intro');
            toast.error(errorMsg);
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !currentUser) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Mirror horizontally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setSelfiePreview(imageData);
        stopCamera();
        setStep('processing');

        setTimeout(async () => {
            try {
                // Submit via API
                await apiUsers.verify({
                    userId: currentUser.id,
                    selfieUrl: imageData
                });

                setStep('pending');
                toast.success('Verification submitted for review');
            } catch (error) {
                console.error("Verification failed", error);
                setStep('intro'); // Go back to start on fail
                toast.error('Failed to submit verification. Please try again.');
            }
        }, 2000);
    }, [currentUser, stopCamera]);

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    if (!currentUser) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden video that's always mounted */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={step === 'camera' ? 'fixed inset-0 w-full h-full object-cover' : 'hidden'}
                style={{ transform: 'scaleX(-1)' }}
            />

            {/* Intro Screen */}
            {step === 'intro' && (
                <div className="h-full bg-gradient-to-b from-gray-900 to-black flex flex-col">
                    <div className="p-4 flex items-center">
                        <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center text-white">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="flex-1 text-center text-white font-semibold text-lg pr-10">Verify Profile</h1>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="relative mb-8">
                            <img
                                src={currentUser.photos[0]}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
                            />
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">Get Verified</h2>
                        <p className="text-gray-400 mb-8 max-w-xs">
                            Take a selfie to verify you're real.
                        </p>

                        {cameraError && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                                {cameraError}
                            </div>
                        )}

                        <button
                            onClick={startCamera}
                            className="w-full max-w-xs py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                        >
                            <Camera className="w-6 h-6" />
                            Start Camera
                        </button>
                    </div>
                </div>
            )}

            {/* Camera Screen */}
            {step === 'camera' && (
                <div className="absolute inset-0 flex flex-col">
                    <div className="p-4 flex items-center bg-gradient-to-b from-black/80 to-transparent z-10">
                        <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center text-white">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="flex-1 text-center text-white font-medium pr-10">Position your face</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <div
                            className="w-64 h-64 rounded-full border-4 border-white flex items-center justify-center"
                            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
                        >
                            {!cameraReady && (
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            )}
                        </div>
                    </div>

                    <div className="pb-12 pt-4 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent z-10">
                        <p className="text-white mb-4">Look at the camera</p>
                        <button
                            onClick={capturePhoto}
                            disabled={!cameraReady}
                            className={`w-20 h-20 rounded-full flex items-center justify-center ${cameraReady ? 'bg-white' : 'bg-white/30'}`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${cameraReady ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-500'}`}>
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Processing Screen */}
            {step === 'processing' && (
                <div className="h-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6">
                    <Loader2 className="w-12 h-12 text-orange-400 animate-spin mb-6" />
                    <h2 className="text-xl font-bold text-white mb-2">Submitting...</h2>
                </div>
            )}

            {/* Pending Screen - Under Review */}
            {step === 'pending' && (
                <div className="h-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-32 h-32 rounded-full bg-orange-500/20 flex items-center justify-center mb-6"
                    >
                        <Clock className="w-16 h-16 text-orange-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Under Review</h2>
                    <p className="text-gray-400 mb-8 max-w-xs">
                        Your verification request has been submitted. We will notify you once it's approved.
                    </p>
                    <button onClick={onClose} className="px-8 py-3 bg-white/10 text-white hover:bg-white/20 rounded-xl font-semibold transition-colors">
                        Close
                    </button>
                </div>
            )}

            {/* Rejected Screen */}
            {step === 'rejected' && (
                <div className="h-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
                    >
                        <AlertCircle className="w-16 h-16 text-red-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                    <p className="text-gray-300 mb-2 max-w-xs">
                        {rejectionReason}
                    </p>
                    <p className="text-gray-500 text-sm mb-8">
                        Make sure your face is clearly visible and matches your profile photos.
                    </p>

                    <div className="space-y-3 w-full max-w-xs">
                        <button
                            onClick={startCamera}
                            className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Try Again
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 text-gray-400 font-semibold hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Success Screen */}
            {step === 'success' && (
                <div className="h-full bg-gradient-to-b from-emerald-900 to-black flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6"
                    >
                        <CheckCircle className="w-16 h-16 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
                    <p className="text-gray-300 mb-8">Your profile is now verified.</p>
                    <button onClick={handleClose} className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold">
                        Done
                    </button>
                </div>
            )}
        </div>
    );
};
