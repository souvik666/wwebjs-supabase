/**
 * wwebjs-supabase
 * 
 * A Supabase plugin for whatsapp-web.js to store session data in Supabase Storage
 * 
 * @author souvik dutta
 * @license MIT
 */

// Export the main class
export { SupabaseStore } from "./SupabaseStore";

// Export types for TypeScript users
export type {
  SupabaseClient,
  SupabaseStorage,
  SupabaseStorageFile,
  SupabaseStorageListResult,
  SupabaseStorageUploadResult,
  SupabaseStorageDownloadResult,
  SupabaseStorageRemoveResult,
  SupabaseStorageBucket,
  SupabaseStorageBucketListResult,
  SessionOptions
} from "./types";

// Default export for convenience
export { SupabaseStore as default } from "./SupabaseStore";
