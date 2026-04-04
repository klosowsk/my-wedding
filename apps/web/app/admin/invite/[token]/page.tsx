"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface InviteInfo {
  email: string;
  expiresAt: string;
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function validateToken() {
      try {
        const data = await apiGet<InviteInfo>(`/api/v1/invite/${token}`);
        setInvite(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "This invitation is invalid or has expired."
        );
      } finally {
        setLoading(false);
      }
    }
    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!invite) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await signUp.email({
        email: invite.email,
        name,
        password,
      });

      if (result.error) {
        setSubmitError(
          result.error.message || "Failed to create account. Please try again."
        );
        return;
      }

      router.push("/admin");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {loading ? (
          <Card className="p-8">
            <Skeleton height={32} width={200} className="mb-4 mx-auto" />
            <Skeleton height={16} width={250} className="mb-6 mx-auto" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={40} className="mb-3" />
            <Skeleton height={40} />
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">😔</div>
            <h1 className="text-xl font-bold text-heading font-body mb-2">
              Invalid Invitation
            </h1>
            <p className="text-sm text-muted mb-6">{error}</p>
            <Button
              variant="secondary"
              onClick={() => router.push("/admin/signin")}
            >
              Go to Sign In
            </Button>
          </Card>
        ) : invite ? (
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎉</div>
              <h1 className="text-xl font-bold text-heading font-body">
                You&apos;re Invited!
              </h1>
              <p className="text-sm text-muted mt-1">
                Create your account to manage the wedding admin panel.
              </p>
            </div>

            {submitError && (
              <div className="bg-error-bg border border-error/20 text-error rounded-lg px-4 py-3 mb-4 text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={invite.email}
                disabled
              />
              <Input
                label="Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
              <Input
                label="Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
              <Button
                type="submit"
                className="w-full"
                loading={submitting}
              >
                Create Account
              </Button>
            </form>

            <p className="text-xs text-muted text-center mt-4">
              Invite expires in {daysUntil(invite.expiresAt)} days
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
