import { db } from "@marriage/db";
import { pages } from "@marriage/db";
import { eq, asc } from "drizzle-orm";

export const pageRepository = {
  async findBySlug(slug: string) {
    return db.query.pages.findFirst({
      where: eq(pages.slug, slug),
    });
  },

  async findAll() {
    return db.query.pages.findMany({
      orderBy: [asc(pages.sortOrder)],
    });
  },

  async findPublished() {
    return db.query.pages.findMany({
      where: eq(pages.published, true),
      orderBy: [asc(pages.sortOrder)],
    });
  },

  async create(data: typeof pages.$inferInsert) {
    const [page] = await db.insert(pages).values(data).returning();
    return page;
  },

  async update(id: string, data: Partial<typeof pages.$inferInsert>) {
    const [page] = await db
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return page;
  },

  async remove(id: string) {
    await db.delete(pages).where(eq(pages.id, id));
  },
};
