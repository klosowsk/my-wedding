import { randomBytes } from "crypto";
import { guestRepository } from "@/src/repositories/guest";

const EASY_CHARS = "23456789abcdefghjkmnpqrstuvwxyz";
const MAX_TOKEN_GENERATION_ATTEMPTS = 40;

function randomEasyCode(length: number): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => EASY_CHARS[byte % EASY_CHARS.length]).join("");
}

function buildCandidateToken(): string {
  // Short and readable: e.g. "k7m-p9q"
  return `${randomEasyCode(3)}-${randomEasyCode(3)}`;
}

export async function generateGuestToken(_familyName: string): Promise<string> {
  for (let i = 0; i < MAX_TOKEN_GENERATION_ATTEMPTS; i++) {
    const token = buildCandidateToken();
    const existing = await guestRepository.findByToken(token);

    if (!existing) {
      return token;
    }
  }

  throw new Error("Failed to generate a unique guest token");
}
