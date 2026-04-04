import { db } from "@marriage/db";
import { siteConfig } from "@marriage/db";
import { eq, inArray } from "drizzle-orm";

export const siteConfigRepository = {
  async get(key: string) {
    const row = await db.query.siteConfig.findFirst({
      where: eq(siteConfig.key, key),
    });
    return row ?? null;
  },

  async getMany(keys: string[]): Promise<Record<string, string | null>> {
    if (keys.length === 0) return {};

    const rows = await db
      .select()
      .from(siteConfig)
      .where(inArray(siteConfig.key, keys));

    const result: Record<string, string | null> = {};
    for (const key of keys) {
      const row = rows.find((r) => r.key === key);
      result[key] = row?.value ?? null;
    }
    return result;
  },

  async getAll() {
    return db.select().from(siteConfig);
  },

  async set(key: string, value: string | null) {
    const [row] = await db
      .insert(siteConfig)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteConfig.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return row;
  },

  async setMany(entries: Record<string, string | null>) {
    await db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(entries)) {
        await tx
          .insert(siteConfig)
          .values({ key, value, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: siteConfig.key,
            set: { value, updatedAt: new Date() },
          });
      }
    });
  },
};
