/**
 * Type definitions for Supabase Storage integration
 */

export interface SupabaseStorageFile {
  name: string;
  created_at?: string;
}

export interface SupabaseStorageListResult {
  data: SupabaseStorageFile[] | null;
  error: { message: string } | null;
}

export interface SupabaseStorageUploadResult {
  error: { message: string } | null;
}

export interface SupabaseStorageDownloadResult {
  data: Blob;
  error: { message: string } | null;
}

export interface SupabaseStorageRemoveResult {
  error: { message: string } | null;
}

export interface SupabaseStorageBucket {
  name: string;
}

export interface SupabaseStorageBucketListResult {
  data: SupabaseStorageBucket[] | null;
  error: { message: string } | null;
}

export interface SupabaseStorage {
  from(bucket: string): {
    list(path: string, options?: { limit?: number }): Promise<SupabaseStorageListResult>;
    upload(path: string, fileBody: Buffer, options: { cacheControl: string; upsert: boolean; contentType: string }): Promise<SupabaseStorageUploadResult>;
    download(path: string): Promise<SupabaseStorageDownloadResult>;
    remove(paths: string[]): Promise<SupabaseStorageRemoveResult>;
  };
  listBuckets(): Promise<SupabaseStorageBucketListResult>;
  createBucket(name: string, options: { public: boolean }): Promise<{ error: { message: string } | null }>;
}

export interface SupabaseClient {
  storage: SupabaseStorage;
}

export interface SessionOptions {
  session: string;
  path?: string;
}
