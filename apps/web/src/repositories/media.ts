import { db } from "@marriage/db";
import { media } from "@marriage/db";
import { eq } from "drizzle-orm";

export const mediaRepository = {
  async create(data: typeof media.$inferInsert) {
    const [row] = await db.insert(media).values(data).returning();
    return row!;
  },

  async findById(id: string) {
    return db.query.media.findFirst({
      where: eq(media.id, id),
    });
  },

  async findByKey(key: string) {
    return db.query.media.findFirst({
      where: eq(media.key, key),
    });
  },

  async updateProcessingResult(
    id: string,
    data: {
      url: string;
      thumbKey: string;
      thumbUrl: string;
      width: number;
      height: number;
      size: number;
      blurhash: string | null;
      status: "ready" | "failed";
    }
  ) {
    const [updated] = await db
      .update(media)
      .set(data)
      .where(eq(media.id, id))
      .returning();
    return updated ?? null;
  },

  async updateStatus(id: string, status: "processing" | "ready" | "failed") {
    const [updated] = await db
      .update(media)
      .set({ status })
      .where(eq(media.id, id))
      .returning();
    return updated ?? null;
  },

  async remove(id: string) {
    const [deleted] = await db
      .delete(media)
      .where(eq(media.id, id))
      .returning();
    return deleted ?? null;
  },
};
