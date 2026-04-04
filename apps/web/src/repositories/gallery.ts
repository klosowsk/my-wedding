import { db } from "@marriage/db";
import { photos } from "@marriage/db";
import { eq, asc } from "drizzle-orm";

export const galleryRepository = {
  async findVisible() {
    return db.query.photos.findMany({
      where: eq(photos.visible, true),
      orderBy: [asc(photos.sortOrder)],
      with: { media: true },
    });
  },

  async findAll() {
    return db.query.photos.findMany({
      orderBy: [asc(photos.sortOrder)],
    });
  },

  async findAllWithMedia() {
    return db.query.photos.findMany({
      orderBy: [asc(photos.sortOrder)],
      with: { media: true },
    });
  },

  async findById(id: string) {
    return db.query.photos.findFirst({
      where: eq(photos.id, id),
    });
  },

  async create(data: typeof photos.$inferInsert) {
    const [photo] = await db.insert(photos).values(data).returning();
    return photo;
  },

  async update(id: string, data: Partial<typeof photos.$inferInsert>) {
    const [photo] = await db
      .update(photos)
      .set(data)
      .where(eq(photos.id, id))
      .returning();
    return photo;
  },

  async remove(id: string) {
    await db.delete(photos).where(eq(photos.id, id));
  },
};
