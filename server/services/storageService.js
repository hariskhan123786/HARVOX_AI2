import { supabase } from '../config/supabase.js';

/**
 * Uploads a file buffer to a specified Supabase storage bucket.
 * 
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mimetype
 * @param {string} bucketName - Target bucket (avatars, documents, screenshots, etc.)
 * @param {string} userId - User ID (used to create a folder path)
 * @returns {Promise<{ url: string, path: string }>} - Public or signed URL and bucket path
 */
export const uploadToSupabase = async (buffer, originalName, mimeType, bucketName, userId) => {
  const cleanName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
  const filePath = `${userId}/${Date.now()}-${cleanName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Generate URL
  if (bucketName === 'avatars') {
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return { url: publicUrlData.publicUrl, path: filePath };
  } else {
    // Generate a signed URL valid for 1 year (31,536,000 seconds)
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000);

    if (signError) {
      throw new Error(`Failed to generate signed URL: ${signError.message}`);
    }

    return { url: signedUrlData.signedUrl, path: filePath };
  }
};
