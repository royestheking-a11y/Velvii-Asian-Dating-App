/**
 * Location Service using OpenStreetMap Nominatim API & ipapi.co
 * Implements robust fallbacks:
 * 1. Browser High Accuracy GPS
 * 2. Browser Low Accuracy (WiFi/Cell)
 * 3. IP-based Location (Server-side lookup)
 */

export interface LocationResult {
    city: string;
    country: string;
    lat: number;
    lng: number;
    formattedAddress?: string;
}

export const LocationService = {
    /**
     * Get current position using browser Geolocation API
     * Strategy: High Accuracy -> Low Accuracy -> IP Location (Nuclear Fallback)
     */
    getCurrentPosition: (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            // Safety check for SSR or environments without navigator
            if (typeof navigator === 'undefined' || !navigator.geolocation) {
                // Try IP location immediately if no navigator
                LocationService.getIpLocation().then(resolve).catch(err => reject(new Error('Geolocation not supported')));
                return;
            }

            const highAccuracyOptions = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
            const lowAccuracyOptions = { enableHighAccuracy: false, timeout: 10000, maximumAge: Infinity };

            // 1. Try High Accuracy (GPS)
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => {
                    console.warn("High accuracy location failed, switching to low accuracy (WiFi/IP)...", error);

                    // 2. Fallback to Low Accuracy (Browser Network Location)
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve(position),
                        async (fallbackError) => {
                            console.warn("Browser geolocation failed entirely, falling back to IP location...", fallbackError);

                            // 3. Fallback to IP Location (ipapi.co / BigDataCloud)
                            try {
                                const ipPosition = await LocationService.getIpLocation();
                                resolve(ipPosition);
                            } catch (ipError) {
                                // If everything fails, reject with the browser's error
                                reject(fallbackError);
                            }
                        },
                        lowAccuracyOptions
                    );
                },
                highAccuracyOptions
            );
        });
    },

    /**
     * Helper to get location from IP address
     * Used when browser geolocation fails
     * Primary: ipwho.is (Free, CORS-friendly, Accurate)
     * Backup: BigDataCloud (Reliability)
     */
    getIpLocation: async (): Promise<GeolocationPosition> => {
        try {
            // Updated Primary Provider: ipwho.is (CORS-friendly, accurate)
            const response = await fetch('https://ipwho.is/');
            if (!response.ok) throw new Error('IP Location failed');

            const data = await response.json();

            if (!data.success) throw new Error('IP Location lookup failed');
            if (!data.latitude || !data.longitude) throw new Error('Invalid IP location data');

            const ipPosition: any = {
                coords: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    accuracy: 5000,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: Date.now()
            };
            return ipPosition;

        } catch (error) {
            console.warn("Primary IP location failed, using backup...", error);

            // Backup Provider: BigDataCloud
            const backupResponse = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
            const backupData = await backupResponse.json();

            const ipPosition: any = {
                coords: {
                    latitude: backupData.latitude,
                    longitude: backupData.longitude,
                    accuracy: 10000,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: Date.now()
            };
            return ipPosition;
        }
    },

    /**
     * Search for cities using Nominatim API
     */
    searchCities: async (query: string): Promise<LocationResult[]> => {
        if (!query || query.length < 3) return [];

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featuretype=city&addressdetails=1&limit=5`,
                {
                    headers: { 'Accept-Language': 'en-US' }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch location data');
            const data = await response.json();

            return data.map((item: any) => ({
                city: item.address?.city || item.address?.town || item.address?.village || item.name,
                country: item.address?.country,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                formattedAddress: item.display_name,
            })).filter((item: LocationResult) => item.city && item.country);

        } catch (error) {
            console.error('Location search error:', error);
            return [];
        }
    },

    /**
     * Get city/country from coordinates (Reverse Geocoding)
     * Strategy: Try Nominatim -> Fallback to BigDataCloud
     */
    reverseGeocode: async (lat: number, lng: number): Promise<LocationResult> => {
        // 1. Try BigDataCloud (More robust for client-side CORS)
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );

            if (!response.ok) throw new Error('BigDataCloud API failed');
            const data = await response.json();

            return {
                city: data.city || data.locality || data.principalSubdivision || 'Unknown City',
                country: data.countryName || 'Unknown Country',
                lat,
                lng,
                formattedAddress: `${data.city}, ${data.countryName}`
            };

        } catch (bdcError) {
            console.warn('BigDataCloud failed, trying fallback API...', bdcError);

            // 2. Fallback to Nominatim
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                    {
                        headers: { 'Accept-Language': 'en-US' }
                    }
                );

                if (!response.ok) throw new Error('Nominatim API failed');
                const data = await response.json();

                if (!data.address) throw new Error('Invalid Nominatim data');

                return {
                    city: data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown City',
                    country: data.address.country || 'Unknown Country',
                    lat,
                    lng,
                    formattedAddress: data.display_name,
                };

            } catch (nominatimError) {
                console.error('All geocoding APIs failed:', nominatimError);
                return {
                    city: 'Unknown City',
                    country: 'Unknown Country',
                    lat,
                    lng
                };
            }
        }
    }
};
