import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey;

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

class StorageService {
  private bucketName = 'resumes';
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = supabase !== null;
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
    }
  }

  /**
   * Upload resume file to Supabase Storage
   */
  async uploadResume(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ filePath: string; url: string }> {
    this.ensureConfigured();

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.');
    }

    // Validate file size (max 5MB)
    if (fileBuffer.byteLength > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Reject executables and scripts
    const forbiddenExtensions = ['.exe', '.bat', '.sh', '.cmd', '.ps1', '.scr', '.com', '.pif', '.msp', '.msi'];
    if (forbiddenExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
      throw new Error('Executable files are not allowed.');
    }

    // Create unique file name
    const fileExtension = fileName.split('.').pop() || '';
    const uniqueFileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload file
    const { data, error } = await supabase!.storage
      .from(this.bucketName)
      .upload(uniqueFileName, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Generate signed URL with short expiry (1 hour)
    const { data: urlData } = await supabase!.storage
      .from(this.bucketName)
      .createSignedUrl(uniqueFileName, 3600); // 1 hour expiry

    if (!urlData) {
      throw new Error('Failed to generate signed URL');
    }

    return {
      filePath: uniqueFileName,
      url: urlData.signedUrl
    };
  }

  /**
   * Download resume file
   */
  async downloadResume(filePath: string): Promise<Buffer> {
    this.ensureConfigured();

    const { data, error } = await supabase!.storage
      .from(this.bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  }

  /**
   * Delete resume file
   */
  async deleteResume(filePath: string): Promise<void> {
    this.ensureConfigured();

    const { error } = await supabase!.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Check if Supabase storage is configured
   */
  isStorageConfigured(): boolean {
    return this.isConfigured;
  }
}

export const storageService = new StorageService();
