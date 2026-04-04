import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { db, guests, guestMembers, gifts, giftContributions, expenses } from "@marriage/db";
import { sql, eq, count, sum, and } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();

    const [guestStats, memberStats, giftStats, contributionStats, expenseStats, confirmedMemberCount] =
      await Promise.all([
        // Guest counts by status
        db
          .select({
            status: guests.status,
            count: count(),
          })
          .from(guests)
          .groupBy(guests.status),

        // Member counts by status and ageGroup
        db
          .select({
            status: guestMembers.status,
            ageGroup: guestMembers.ageGroup,
            count: count(),
          })
          .from(guestMembers)
          .groupBy(guestMembers.status, guestMembers.ageGroup),

        // Gift totals
        db
          .select({
            total: count(),
            totalCollectedCents: sum(gifts.collectedCents),
            totalPriceCents: sum(gifts.priceCents),
          })
          .from(gifts),

        // Confirmed contributions
        db
          .select({
            count: count(),
            totalCents: sum(giftContributions.amountCents),
          })
          .from(giftContributions)
          .where(eq(giftContributions.paymentStatus, "confirmed")),

        // Expense totals
        db
          .select({
            totalBudgeted: sum(expenses.budgetCents),
            totalPaid: sql<string>`SUM(CASE WHEN ${expenses.paid} = true THEN COALESCE(${expenses.amountCents}, ${expenses.budgetCents}) ELSE 0 END)`,
          })
          .from(expenses),

        // Confirmed guest members (for cost per guest)
        db
          .select({ count: count() })
          .from(guestMembers)
          .where(eq(guestMembers.status, "confirmed")),
      ]);

    // Build guest status map
    const guestsByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      declined: 0,
      partial: 0,
    };
    let totalGuests = 0;
    for (const row of guestStats) {
      guestsByStatus[row.status] = row.count;
      totalGuests += row.count;
    }

    // Build member breakdown
    const confirmedMembers = { adult: 0, child: 0, infant: 0, total: 0 };
    let totalMembers = 0;
    for (const row of memberStats) {
      totalMembers += row.count;
      if (row.status === "confirmed") {
        confirmedMembers[row.ageGroup as keyof typeof confirmedMembers] +=
          row.count;
        confirmedMembers.total += row.count;
      }
    }

    return NextResponse.json({
      guests: {
        total: totalGuests,
        ...guestsByStatus,
      },
      members: {
        total: totalMembers,
        confirmed: confirmedMembers,
      },
      gifts: {
        total: giftStats[0]?.total ?? 0,
        totalCollectedCents: Number(giftStats[0]?.totalCollectedCents ?? 0),
        totalPriceCents: Number(giftStats[0]?.totalPriceCents ?? 0),
      },
      contributions: {
        confirmed: contributionStats[0]?.count ?? 0,
        confirmedTotalCents: Number(contributionStats[0]?.totalCents ?? 0),
      },
      expenses: (() => {
        const totalPaid = Number(expenseStats[0]?.totalPaid ?? 0);
        const totalBudgeted = Number(expenseStats[0]?.totalBudgeted ?? 0);
        const totalRevenue = Number(contributionStats[0]?.totalCents ?? 0);
        const confirmed = confirmedMemberCount[0]?.count ?? 0;

        const grossCostPerGuest =
          confirmed > 0 ? Math.round(totalPaid / confirmed) : 0;
        const netCostPerGuest =
          confirmed > 0 ? Math.round((totalPaid - totalRevenue) / confirmed) : 0;

        return {
          totalPaidCents: totalPaid,
          totalBudgetedCents: totalBudgeted,
          overUnderCents: totalPaid - totalBudgeted,
          costPerConfirmedGuestCents: grossCostPerGuest,
          grossCostPerConfirmedGuestCents: grossCostPerGuest,
          netCostPerConfirmedGuestCents: netCostPerGuest,
          netSpentCents: totalPaid - totalRevenue,
          confirmedGuests: confirmed,
        };
      })(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : 500;
    return NextResponse.json({ message }, { status });
  }
}
