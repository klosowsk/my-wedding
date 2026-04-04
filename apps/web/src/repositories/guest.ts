import { db } from "@marriage/db";
import { guests, guestMembers } from "@marriage/db";
import { eq, desc, ilike, and, type SQL } from "drizzle-orm";

export const guestRepository = {
  async findByToken(token: string) {
    return db.query.guests.findFirst({
      where: eq(guests.token, token),
      with: { members: true },
    });
  },

  async findById(id: string) {
    return db.query.guests.findFirst({
      where: eq(guests.id, id),
      with: { members: true },
    });
  },

  async findAll(filters?: { status?: string; search?: string }) {
    const conditions: SQL[] = [];

    if (filters?.status) {
      conditions.push(
        eq(guests.status, filters.status as typeof guests.status.enumValues[number])
      );
    }

    if (filters?.search) {
      conditions.push(ilike(guests.familyName, `%${filters.search}%`));
    }

    return db.query.guests.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { members: true },
      orderBy: [desc(guests.createdAt)],
    });
  },

  async create(data: typeof guests.$inferInsert) {
    const [guest] = await db.insert(guests).values(data).returning();
    return guest;
  },

  async update(id: string, data: Partial<typeof guests.$inferInsert>) {
    const [guest] = await db
      .update(guests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(guests.id, id))
      .returning();
    return guest;
  },

  async remove(id: string) {
    await db.delete(guests).where(eq(guests.id, id));
  },

  async updateStatus(
    id: string,
    status: typeof guests.status.enumValues[number],
    confirmedAt?: Date
  ) {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };
    if (confirmedAt) {
      updateData.confirmedAt = confirmedAt;
    }
    const [guest] = await db
      .update(guests)
      .set(updateData)
      .where(eq(guests.id, id))
      .returning();
    return guest;
  },
};

// --- Guest Member queries ---

export const guestMemberRepository = {
  async findByGuestId(guestId: string) {
    return db.query.guestMembers.findMany({
      where: eq(guestMembers.guestId, guestId),
    });
  },

  async findById(id: string) {
    return db.query.guestMembers.findFirst({
      where: eq(guestMembers.id, id),
    });
  },

  async create(data: typeof guestMembers.$inferInsert) {
    const [member] = await db.insert(guestMembers).values(data).returning();
    return member;
  },

  async update(id: string, data: Partial<typeof guestMembers.$inferInsert>) {
    const [member] = await db
      .update(guestMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(guestMembers.id, id))
      .returning();
    return member;
  },

  async remove(id: string) {
    await db.delete(guestMembers).where(eq(guestMembers.id, id));
  },
};
