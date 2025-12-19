const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djv9chdo9',
    api_key: process.env.CLOUDINARY_API_KEY || '567472814886263',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'T2RPY8xv7IY3kOoXMP4tThpN_Zc'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'velvii', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'mov'],
        resource_type: 'auto', // Auto-detect image or video
        use_filename: false,
        unique_filename: false,
        overwrite: false,
        public_id: (req, file) => file.originalname, // use filename as display name
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
