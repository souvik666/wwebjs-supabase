import * as fs from "fs";

/**
 * Minimal type definitions for Supabase client
 * (no external packages required)
 */
interface SupabaseStorageFile {
  name: string;
  created_at?: string;
}

interface SupabaseStorageListResult {
  data: SupabaseStorageFile[] | null;
  error: { message: string } | null;
}

interface SupabaseStorageUploadResult {
  error: { message: string } | null;
}

interface SupabaseStorageDownloadResult {
  data: Blob;
  error: { message: string } | null;
}

interface SupabaseStorageRemoveResult {
  error: { message: string } | null;
}

interface SupabaseStorageBucket {
  name: string;
}

interface SupabaseStorageBucketListResult {
  data: SupabaseStorageBucket[] | null;
  error: { message: string } | null;
}

interface SupabaseStorage {
  from(bucket: string): {
    list(path: string, options?: { limit?: number }): Promise<SupabaseStorageListResult>;
    upload(path: string, fileBody: Buffer, options: { cacheControl: string; upsert: boolean; contentType: string }): Promise<SupabaseStorageUploadResult>;
    download(path: string): Promise<SupabaseStorageDownloadResult>;
    remove(paths: string[]): Promise<SupabaseStorageRemoveResult>;
  };
  listBuckets(): Promise<SupabaseStorageBucketListResult>;
  createBucket(name: string, options: { public: boolean }): Promise<{ error: { message: string } | null }>;
}

interface SupabaseClient {
  storage: SupabaseStorage;
}

interface SessionOptions {
  session: string;
  path?: string;
}

/**
 * SupabaseStore
 *
 * Stores WhatsApp session files (.zip) inside Supabase Storage buckets.
 * Requires a server-side Supabase client initialized with a Service Role Key.
 */
export class SupabaseStore {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    if (!client) {
      throw new Error("A valid Supabase client instance is required.");
    }
    this.client = client;
  }

  async sessionExists(options: SessionOptions): Promise<boolean> {
    const bucketName = `whatsapp-${options.session}`;
    const { data, error } = await this.client.storage.from(bucketName).list("", { limit: 1 });

    if (error && error.message.includes("does not exist")) return false;
    if (error) throw new Error(error.message);

    return (data?.length ?? 0) > 0;
  }

  async save(options: SessionOptions): Promise<void> {
    const bucketName = `whatsapp-${options.session}`;
    await this.ensureBucket(bucketName);

    const fileBuffer = fs.readFileSync(`${options.session}.zip`);
    const { error: uploadError } = await this.client.storage
      .from(bucketName)
      .upload(`${options.session}.zip`, fileBuffer, {
        cacheControl: "no-cache",
        upsert: true,
        contentType: "application/zip",
      });
    if (uploadError) throw new Error(uploadError.message);

    await this.deletePrevious(bucketName, options.session);
  }

  async extract(options: Required<Pick<SessionOptions, "session" | "path">>): Promise<void> {
    const bucketName = `whatsapp-${options.session}`;
    const { data, error } = await this.client.storage
      .from(bucketName)
      .download(`${options.session}.zip`);
    if (error) throw new Error(error.message);

    const writeStream = fs.createWriteStream(options.path);
    const arrayBuffer = await data.arrayBuffer();
    writeStream.write(Buffer.from(arrayBuffer));
    writeStream.end();
  }

  async delete(options: SessionOptions): Promise<void> {
    const bucketName = `whatsapp-${options.session}`;
    const { error } = await this.client.storage
      .from(bucketName)
      .remove([`${options.session}.zip`]);
    if (error) throw new Error(error.message);
  }

  private async deletePrevious(bucketName: string, session: string): Promise<void> {
    const { data, error } = await this.client.storage.from(bucketName).list("");
    if (error && !error.message.includes("does not exist")) throw new Error(error.message);

    if (data && data.length > 1) {
      const oldSession = data.reduce((a, b) =>
        new Date(a.created_at || 0) < new Date(b.created_at || 0) ? a : b
      );
      await this.client.storage.from(bucketName).remove([oldSession.name]);
    }
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    const { data: buckets, error } = await this.client.storage.listBuckets();
    if (error) throw new Error(error.message);

    const exists = buckets?.some((b) => b.name === bucketName);
    if (exists) return;

    const { error: createError } = await this.client.storage.createBucket(bucketName, {
      public: false,
    });
    if (createError) throw new Error(createError.message);
  }
}
