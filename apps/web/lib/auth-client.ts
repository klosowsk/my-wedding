"use client";

import { createAuthClient } from "better-auth/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authClient: any = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const signIn = authClient.signIn as typeof authClient.signIn;
export const signUp = authClient.signUp as typeof authClient.signUp;
export const signOut = authClient.signOut as typeof authClient.signOut;
export const useSession = authClient.useSession as typeof authClient.useSession;
