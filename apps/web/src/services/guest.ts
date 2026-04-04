import { guestRepository, guestMemberRepository } from "../repositories/guest";
import { rsvpConfirmSchema } from "@marriage/shared/validators";
import type { RSVPConfirmInput } from "@marriage/shared";

type MemberStatus = "pending" | "confirmed" | "declined";
type GuestStatus = "pending" | "confirmed" | "declined" | "partial";

export const guestService = {
  async getByToken(token: string) {
    const guest = await guestRepository.findByToken(token);
    return guest ?? null;
  },

  async confirmRSVP(token: string, input: RSVPConfirmInput) {
    // Validate input
    const parsed = rsvpConfirmSchema.parse(input);

    // Find the guest
    const guest = await guestRepository.findByToken(token);
    if (!guest) {
      throw new Error("Guest not found");
    }

    // Update each member's status and dietary notes
    for (const memberInput of parsed.members) {
      const existingMember = guest.members.find((m) => m.id === memberInput.id);
      if (!existingMember) {
        throw new Error(`Member ${memberInput.id} not found in this invitation`);
      }

      await guestMemberRepository.update(memberInput.id, {
        status: memberInput.status,
        dietaryNotes: memberInput.dietaryNotes ?? null,
      });
    }

    // Build a combined list of member statuses after the update:
    // use the submitted statuses for members that were part of the submission,
    // keep existing statuses for members that weren't submitted
    const updatedStatuses: MemberStatus[] = guest.members.map((m) => {
      const submitted = parsed.members.find((s) => s.id === m.id);
      return submitted ? submitted.status : m.status;
    });

    // Calculate overall guest status
    const overallStatus = calculateStatus(updatedStatuses);

    // Update guest with message and status
    const now = new Date();
    await guestRepository.update(guest.id, {
      status: overallStatus,
      message: parsed.message ?? guest.message,
      confirmedAt: overallStatus !== "pending" ? now : undefined,
    });

    // Return the updated guest
    return guestRepository.findByToken(token);
  },
};

export function calculateStatus(memberStatuses: MemberStatus[]): GuestStatus {
  if (memberStatuses.length === 0) return "pending";

  const allConfirmed = memberStatuses.every((s) => s === "confirmed");
  const allDeclined = memberStatuses.every((s) => s === "declined");
  const allPending = memberStatuses.every((s) => s === "pending");

  if (allConfirmed) return "confirmed";
  if (allDeclined) return "declined";
  if (allPending) return "pending";
  return "partial";
}
