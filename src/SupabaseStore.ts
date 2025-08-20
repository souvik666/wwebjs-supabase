import * as fs from "fs";
import { SupabaseClient, SessionOptions } from "./types";

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

  /**
   * Check if a session exists in Supabase Storage
   */
  async sessionExists(options: SessionOptions): Promise<boolean> {
    const bucketName = `whatsapp-${options.session}`;
    const { data, error } = await this.client.storage.from(bucketName).list("", { limit: 1 });

    if (error && error.message.includes("does not exist")) return false;
    if (error) throw new Error(error.message);

    return (data?.length ?? 0) > 0;
  }

  /**
   * Save session data to Supabase Storage
   */
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

  /**
   * Extract session data from Supabase Storage
   */
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

  /**
   * Delete session data from Supabase Storage
   */
  async delete(options: SessionOptions): Promise<void> {
    const bucketName = `whatsapp-${options.session}`;
    const { error } = await this.client.storage
      .from(bucketName)
      .remove([`${options.session}.zip`]);
    if (error) throw new Error(error.message);
  }

  /**
   * Delete previous session files, keeping only the latest
   */
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

  /**
   * Ensure the bucket exists, create if it doesn't
   */
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
