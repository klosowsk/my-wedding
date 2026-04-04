"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";

export default function AdminSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const result = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Admin",
        });
        if (result.error) {
          setError(result.error.message ?? "Registration failed");
          setLoading(false);
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? "Sign in failed");
          setLoading(false);
          return;
        }
      }
      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background font-body text-body">
      <Card className="w-full max-w-sm mx-4 !p-8">
        <h1 className="text-2xl font-bold text-heading text-center mb-6">
          {isRegister ? "Create Admin Account" : "Admin Sign In"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 characters"
          />

          {error && <ErrorAlert>{error}</ErrorAlert>}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="block w-full text-center mt-4 text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          {isRegister
            ? "Already have an account? Sign in"
            : "Need an account? Register"}
        </button>
      </Card>
    </div>
  );
}
