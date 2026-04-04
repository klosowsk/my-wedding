import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@marriage/db";
import * as schema from "@marriage/db";
import {
  hasPendingInvitation,
  acceptInvitationByEmail,
} from "@/src/repositories/admin-team";
import { isSuperAdminEmail } from "./super-admin";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3333",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          // Superadmins: always allowed
          if (isSuperAdminEmail(newUser.email)) {
            return true;
          }
          // Invited admins: check DB for a valid pending invitation
          const hasInvite = await hasPendingInvitation(newUser.email);
          return hasInvite;
        },
        after: async (createdUser) => {
          // Mark any pending invitation as accepted
          await acceptInvitationByEmail(createdUser.email);
        },
      },
    },
  },
});
