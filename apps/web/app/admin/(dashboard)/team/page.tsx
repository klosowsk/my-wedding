"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormActions } from "@/components/ui/FormActions";

interface Admin {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string; email: string } | null;
}

interface TeamResponse {
  admins: Admin[];
  invitations: Invitation[];
}

interface InviteResponse {
  invitation: { id: string; email: string; token: string; expiresAt: string };
  inviteUrl: string;
  emailSent: boolean;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function TeamSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-center gap-4">
            <Skeleton className="rounded-full" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton height={18} width={150} />
              <Skeleton height={14} width={200} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function AdminTeamPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteResult, setInviteResult] = useState<InviteResponse | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Admin | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);

  const { data, isLoading, error } = useQuery<TeamResponse>({
    queryKey: ["admin", "team"],
    queryFn: () => apiGet("/api/v1/admin/team"),
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) =>
      apiPost<InviteResponse>("/api/v1/admin/team/invite", { email }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
      setInviteResult(result);
      if (result.emailSent) {
        toast({ message: "Invitation email sent!", type: "success" });
      }
    },
    onError: (err: Error) => {
      toast({
        message: err.message || "Failed to send invitation",
        type: "error",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/api/v1/admin/team/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
      toast({ message: "Admin removed", type: "success" });
      setRemoveTarget(null);
    },
    onError: (err: Error) => {
      toast({
        message: err.message || "Failed to remove admin",
        type: "error",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/api/v1/admin/team/invitations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
      toast({ message: "Invitation revoked", type: "success" });
      setRevokeTarget(null);
    },
    onError: (err: Error) => {
      toast({
        message: err.message || "Failed to revoke invitation",
        type: "error",
      });
    },
  });

  function handleInviteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail.trim());
  }

  function closeInviteModal() {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteResult(null);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ message: "Copied to clipboard!", type: "success" });
  }

  return (
    <div>
      <PageHeader title="Team">
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          + Invite Admin
        </Button>
      </PageHeader>

      {error && (
        <ErrorAlert className="mb-6">
          Failed to load team data. Please try again.
        </ErrorAlert>
      )}

      {isLoading ? (
        <TeamSkeleton />
      ) : (
        <div className="space-y-8">
          {/* Admins Section */}
          <section>
            <h2 className="text-lg font-semibold text-heading font-body mb-4">
              Admins
            </h2>
            {data?.admins && data.admins.length > 0 ? (
              <div className="space-y-3">
                {data.admins.map((admin) => (
                  <Card key={admin.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-semibold text-sm">
                            {(admin.name || admin.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-heading text-sm truncate">
                              {admin.name || "No name"}
                            </p>
                            {admin.isSuperAdmin && (
                              <Badge variant="info">Super</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted truncate">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                      {!admin.isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error hover:text-error shrink-0"
                          onClick={() => setRemoveTarget(admin)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <p className="text-center text-muted py-4">No admins found.</p>
              </Card>
            )}
          </section>

          {/* Pending Invitations Section */}
          {data?.invitations && data.invitations.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-heading font-body mb-4">
                Pending Invitations
              </h2>
              <div className="space-y-3">
                {data.invitations.map((inv) => (
                  <Card key={inv.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-heading text-sm truncate">
                          {inv.email}
                        </p>
                        <p className="text-xs text-muted">
                          Invited by {inv.invitedBy?.name ?? "Unknown"} ·{" "}
                          {daysUntil(inv.expiresAt)}d left
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:text-error shrink-0"
                        onClick={() => setRevokeTarget(inv)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={closeInviteModal}
        title={inviteResult ? "Invitation Created" : "Invite a New Admin"}
        size="sm"
      >
        {inviteResult ? (
          <div className="space-y-4">
            <p className="text-sm text-body">
              {inviteResult.emailSent
                ? `An invitation email was sent to ${inviteResult.invitation.email}.`
                : `Share this link with ${inviteResult.invitation.email}:`}
            </p>
            {!inviteResult.emailSent && (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteResult.inviteUrl}
                  className="flex-1 bg-surface border border-secondary rounded-lg px-3 py-2 text-sm text-body font-mono truncate"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(inviteResult.inviteUrl)}
                >
                  Copy
                </Button>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={closeInviteModal}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="admin@example.com"
            />
            <FormActions
              onCancel={closeInviteModal}
              submitLabel="Send Invite"
              loading={inviteMutation.isPending}
            />
          </form>
        )}
      </Modal>

      {/* Remove Admin Confirmation */}
      <ConfirmModal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && removeMutation.mutate(removeTarget.id)}
        title="Remove Admin"
        confirmLabel="Remove"
        loading={removeMutation.isPending}
      >
        <p>
          Are you sure you want to remove{" "}
          <strong>{removeTarget?.name || removeTarget?.email}</strong> from the
          admin team? They will lose access immediately.
        </p>
      </ConfirmModal>

      {/* Revoke Invitation Confirmation */}
      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget.id)}
        title="Revoke Invitation"
        confirmLabel="Revoke"
        loading={revokeMutation.isPending}
      >
        <p>
          Are you sure you want to revoke the invitation for{" "}
          <strong>{revokeTarget?.email}</strong>? They won&apos;t be able to use the
          link anymore.
        </p>
      </ConfirmModal>
    </div>
  );
}
