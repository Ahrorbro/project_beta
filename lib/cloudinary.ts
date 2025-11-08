import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param buffer - File buffer
 * @param folder - Cloudinary folder path (e.g., 'rentify/maintenance', 'rentify/properties', 'rentify/leases')
 * @param publicId - Optional public ID for the file
 * @returns Promise with the uploaded file URL
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions: {
      folder: string;
      resource_type: 'auto' | 'image' | 'video' | 'raw';
      use_filename: boolean;
      unique_filename: boolean;
      public_id?: string;
    } = {
      folder: `rentify/${folder}`,
      resource_type: 'auto', // Automatically detect image, video, or raw
      use_filename: true,
      unique_filename: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary
 * @param url - The Cloudinary URL of the file to delete
 * @returns Promise<boolean> - True if deleted successfully
 */
export async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      console.error('Invalid Cloudinary URL:', url);
      return false;
    }

    // Get the public_id (everything after 'upload/v{version}/')
    const afterUpload = urlParts.slice(uploadIndex + 1);
    const versionAndId = afterUpload.join('/');
    const publicId = versionAndId.split('.').slice(0, -1).join('.'); // Remove file extension
    
    // Remove version prefix if present (format: v1234567890/public_id)
    const publicIdWithoutVersion = publicId.includes('/') 
      ? publicId.split('/').slice(1).join('/')
      : publicId;

    // Extract resource type (image, video, raw)
    const resourceType = urlParts[uploadIndex - 1] || 'image';

    const result = await cloudinary.uploader.destroy(publicIdWithoutVersion, {
      resource_type: resourceType,
    });

    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

/**
 * Check if a URL is a Cloudinary URL
 * @param url - URL to check
 * @returns boolean
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com');
}

export { cloudinary };

