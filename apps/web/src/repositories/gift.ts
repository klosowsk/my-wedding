import { db } from "@marriage/db";
import { gifts, giftContributions } from "@marriage/db";
import { eq, ne, asc } from "drizzle-orm";

export const giftRepository = {
  async findAll() {
    return db.query.gifts.findMany({
      orderBy: [asc(gifts.sortOrder)],
    });
  },

  async findById(id: string) {
    return db.query.gifts.findFirst({
      where: eq(gifts.id, id),
    });
  },

  async findPublic() {
    return db.query.gifts.findMany({
      where: ne(gifts.status, "hidden"),
      orderBy: [asc(gifts.sortOrder)],
    });
  },

  async findPublicWithMedia() {
    return db.query.gifts.findMany({
      where: ne(gifts.status, "hidden"),
      orderBy: [asc(gifts.sortOrder)],
      with: { media: true },
    });
  },

  async create(data: typeof gifts.$inferInsert) {
    const [gift] = await db.insert(gifts).values(data).returning();
    return gift;
  },

  async update(id: string, data: Partial<typeof gifts.$inferInsert>) {
    const [gift] = await db
      .update(gifts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gifts.id, id))
      .returning();
    return gift;
  },

  async remove(id: string) {
    await db.delete(gifts).where(eq(gifts.id, id));
  },

  async updateCollected(id: string, collectedCents: number) {
    // First get the gift to check price
    const gift = await db.query.gifts.findFirst({
      where: eq(gifts.id, id),
    });
    if (!gift) return undefined;

    const status: typeof gifts.status.enumValues[number] =
      collectedCents >= gift.priceCents ? "fully_funded" : "available";

    const [updated] = await db
      .update(gifts)
      .set({
        collectedCents,
        status,
        updatedAt: new Date(),
      })
      .where(eq(gifts.id, id))
      .returning();
    return updated;
  },
};

// --- Contribution queries ---

export const giftContributionRepository = {
  async findByGiftId(giftId: string) {
    return db.query.giftContributions.findMany({
      where: eq(giftContributions.giftId, giftId),
    });
  },

  async findById(id: string) {
    return db.query.giftContributions.findFirst({
      where: eq(giftContributions.id, id),
    });
  },

  async findByStripeSessionId(sessionId: string) {
    return db.query.giftContributions.findFirst({
      where: eq(giftContributions.stripeSessionId, sessionId),
    });
  },

  async create(data: typeof giftContributions.$inferInsert) {
    const [contribution] = await db
      .insert(giftContributions)
      .values(data)
      .returning();
    return contribution;
  },

  async update(
    id: string,
    data: Partial<typeof giftContributions.$inferInsert>
  ) {
    const [contribution] = await db
      .update(giftContributions)
      .set(data)
      .where(eq(giftContributions.id, id))
      .returning();
    return contribution;
  },
};
