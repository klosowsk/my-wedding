"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormActions } from "@/components/ui/FormActions";
import type { BadgeVariant } from "@/components/ui/Badge";

interface GuestMember {
  id: string;
  name: string;
  ageGroup: string;
  status: string;
}

interface Guest {
  id: string;
  familyName: string;
  phone: string | null;
  email: string | null;
  language: string;
  status: string;
  inviteStatus: string;
  inviteMethod: string | null;
  token: string;
  notes: string | null;
  members: GuestMember[];
  createdAt: string;
}

interface NewMember {
  name: string;
  ageGroup: "adult" | "child" | "infant";
}

const statusVariantMap: Record<string, BadgeVariant> = {
  confirmed: "confirmed",
  pending: "pending",
  declined: "declined",
  partial: "info",
};

const inviteStatusVariantMap: Record<string, BadgeVariant> = {
  not_sent: "default",
  sent: "info",
  delivered: "confirmed",
  read: "confirmed",
  failed: "declined",
};

function GuestTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={52} />
      ))}
    </div>
  );
}

export default function AdminGuestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteFilter, setInviteFilter] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);

  // Form state for new guest
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLanguage, setNewLanguage] = useState("pt-BR");
  const [newNotes, setNewNotes] = useState("");
  const [newMembers, setNewMembers] = useState<NewMember[]>([]);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  const qs = queryParams.toString();

  const { data: guestsRaw, isLoading, error } = useQuery<Guest[]>({
    queryKey: ["admin", "guests", search, statusFilter],
    queryFn: () => apiGet(`/api/v1/admin/guests${qs ? `?${qs}` : ""}`),
  });

  // Client-side invite status filter
  const guests = guestsRaw?.filter((g) =>
    inviteFilter === "all" ? true : g.inviteStatus === inviteFilter
  );

  function copyToken(e: React.MouseEvent, token: string) {
    e.stopPropagation();
    navigator.clipboard.writeText(token).catch(() => {});
    toast({ message: "Token copied!", type: "success" });
  }

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost("/api/v1/admin/guests", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "guests"] });
      toast({ message: "Guest created successfully", type: "success" });
      closeAddModal();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to create guest", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/admin/guests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "guests"] });
      toast({ message: "Guest deleted", type: "success" });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to delete guest", type: "error" });
    },
  });

  function closeAddModal() {
    setAddModalOpen(false);
    setNewFamilyName("");
    setNewPhone("");
    setNewEmail("");
    setNewLanguage("pt-BR");
    setNewNotes("");
    setNewMembers([]);
  }

  function addMemberRow() {
    setNewMembers((prev) => [...prev, { name: "", ageGroup: "adult" }]);
  }

  function updateMemberRow(index: number, field: keyof NewMember, value: string) {
    setNewMembers((prev) =>
      prev.map((member, i) =>
        i === index
          ? {
              ...member,
              [field]: field === "ageGroup" ? (value as NewMember["ageGroup"]) : value,
            }
          : member
      )
    );
  }

  function removeMemberRow(index: number) {
    setNewMembers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCreateGuest(e: React.FormEvent) {
    e.preventDefault();

    const validMembers = newMembers
      .filter((member) => member.name.trim().length > 0)
      .map((member) => ({
        name: member.name.trim(),
        ageGroup: member.ageGroup,
      }));

    createMutation.mutate({
      familyName: newFamilyName,
      phone: newPhone || null,
      email: newEmail || null,
      language: newLanguage,
      notes: newNotes || null,
      ...(validMembers.length > 0 ? { members: validMembers } : {}),
    });
  }

  return (
    <div>
      <PageHeader title="Guests">
        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          + Add Guest
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="declined">Declined</option>
            <option value="partial">Partial</option>
          </Select>
          <Select
            value={inviteFilter}
            onChange={(e) => setInviteFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="all">All Invites</option>
            <option value="not_sent">Not Sent</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <ErrorAlert className="mb-6">
          Failed to load guests. Please try again.
        </ErrorAlert>
      )}

      {/* Table */}
      {isLoading ? (
        <GuestTableSkeleton />
      ) : guests && guests.length > 0 ? (
        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-secondary bg-surface/50">
                  <th className="text-left px-4 py-3 font-semibold text-heading">
                    Family Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-heading">
                    Members
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-heading">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-heading">
                    Invite
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-heading">
                    Token
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-heading">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-secondary/50 hover:bg-surface/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/guests/${guest.id}`)}
                  >
                    <td className="px-4 py-3 font-semibold text-heading">
                      {guest.familyName}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {guest.members?.length ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariantMap[guest.status] ?? "default"}>
                        {guest.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={inviteStatusVariantMap[guest.inviteStatus] ?? "default"}
                        >
                          {guest.inviteStatus?.replace("_", " ")}
                        </Badge>
                        {guest.inviteMethod && (
                          <span className="text-xs text-muted">
                            via {guest.inviteMethod}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => copyToken(e, guest.token)}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary font-mono bg-surface/50 rounded px-2 py-1 transition-colors cursor-pointer"
                        title="Click to copy full token"
                      >
                        {guest.token.length > 12 ? `${guest.token.slice(0, 12)}...` : guest.token}
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/guests/${guest.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error hover:text-error"
                          onClick={() => setDeleteTarget(guest)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState message='No guests found. Click "Add Guest" to create one.' />
      )}

      {/* Guest count */}
      {guests && guests.length > 0 && (
        <p className="text-xs text-muted mt-3 font-body">
          Showing {guests.length} guest{guests.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Add Guest Modal */}
      <Modal
        open={addModalOpen}
        onClose={closeAddModal}
        title="Add Guest"
        size="md"
      >
        <form onSubmit={handleCreateGuest} className="space-y-4">
          <Input
            label="Family Name"
            required
            value={newFamilyName}
            onChange={(e) => setNewFamilyName(e.target.value)}
            placeholder="e.g., Silva Family"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+55 11 99999-9999"
            />
            <Input
              label="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <Select
            label="Language"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
          >
            <option value="pt-BR">Portuguese (BR)</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </Select>
          <Input
            label="Notes"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Optional notes..."
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-heading">
                Members ({newMembers.length})
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMemberRow}
              >
                + Add Member
              </Button>
            </div>

            {newMembers.map((member, index) => (
              <div key={index} className="flex items-start gap-2">
                <Input
                  placeholder="Member name"
                  value={member.name}
                  onChange={(e) => updateMemberRow(index, "name", e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={member.ageGroup}
                  onChange={(e) => updateMemberRow(index, "ageGroup", e.target.value)}
                  className="w-28"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="infant">Infant</option>
                </Select>
                <button
                  type="button"
                  onClick={() => removeMemberRow(index)}
                  className="p-2 rounded-lg text-muted hover:text-error hover:bg-error-bg transition-colors shrink-0 cursor-pointer"
                  aria-label="Remove member"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {newMembers.length === 0 && (
              <p className="text-xs text-muted">
                You can add family members now or later from the guest detail page.
              </p>
            )}
          </div>

          <FormActions
            onCancel={closeAddModal}
            submitLabel="Create Guest"
            loading={createMutation.isPending}
            className="sticky bottom-0 z-10 bg-warm-white border-t border-secondary pt-3 mt-6"
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Guest"
        loading={deleteMutation.isPending}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.familyName}</strong>? This will also remove all
          family members and cannot be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}
