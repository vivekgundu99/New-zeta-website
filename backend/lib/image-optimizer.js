// backend/lib/image-optimizer.js
const sharp = require('sharp');

// Optimize image buffer
async function optimizeImage(buffer, options = {}) {
    const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg'
    } = options;

    try {
        const optimized = await sharp(buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat(format, {
                quality,
                progressive: true
            })
            .toBuffer();

        return optimized;
    } catch (error) {
        console.error('Image optimization error:', error);
        throw error;
    }
}

// Create thumbnail
async function createThumbnail(buffer, size = 200) {
    try {
        const thumbnail = await sharp(buffer)
            .resize(size, size, {
                fit: 'cover'
            })
            .toFormat('jpeg', {
                quality: 70
            })
            .toBuffer();

        return thumbnail;
    } catch (error) {
        console.error('Thumbnail creation error:', error);
        throw error;
    }
}

// Get image metadata
async function getImageMetadata(buffer) {
    try {
        const metadata = await sharp(buffer).metadata();
        return metadata;
    } catch (error) {
        console.error('Metadata extraction error:', error);
        throw error;
    }
}

module.exports = {
    optimizeImage,
    createThumbnail,
    getImageMetadata
};