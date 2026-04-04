"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { FormActions } from "@/components/ui/FormActions";
import { InviteModal } from "@/components/admin/InviteModal";
import { getPublicAppUrl } from "@/lib/public-url";
import type { BadgeVariant } from "@/components/ui/Badge";

interface GuestMember {
  id: string;
  name: string;
  ageGroup: string;
  status: string;
  dietaryNotes: string | null;
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

const statusVariantMap: Record<string, BadgeVariant> = {
  confirmed: "confirmed",
  pending: "pending",
  declined: "declined",
  partial: "info",
};

const memberStatusVariantMap: Record<string, BadgeVariant> = {
  confirmed: "confirmed",
  pending: "pending",
  declined: "declined",
};

export default function AdminGuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const guestId = params.id as string;

  // Guest edit form
  const [familyName, setFamilyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [notes, setNotes] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Add member form
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberAgeGroup, setMemberAgeGroup] = useState("adult");
  const [memberDietaryNotes, setMemberDietaryNotes] = useState("");

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const { data: guest, isLoading, error } = useQuery<Guest>({
    queryKey: ["admin", "guest", guestId],
    queryFn: () => apiGet(`/api/v1/admin/guests/${guestId}`),
  });

  // Populate form when data loads
  if (guest && !initialized) {
    setFamilyName(guest.familyName);
    setPhone(guest.phone ?? "");
    setEmail(guest.email ?? "");
    setLanguage(guest.language);
    setNotes(guest.notes ?? "");
    setInitialized(true);
  }

  const updateGuestMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPatch(`/api/v1/admin/guests/${guestId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "guest", guestId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "guests"] });
      toast({ message: "Guest updated", type: "success" });
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to update guest", type: "error" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost(`/api/v1/admin/guests/${guestId}/members`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "guest", guestId] });
      toast({ message: "Member added", type: "success" });
      closeAddMember();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to add member", type: "error" });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiDelete(`/api/v1/admin/guests/${guestId}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "guest", guestId] });
      toast({ message: "Member removed", type: "success" });
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to remove member", type: "error" });
    },
  });

  function handleInviteSent() {
    queryClient.invalidateQueries({ queryKey: ["admin", "guest", guestId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "guests"] });
  }

  function closeAddMember() {
    setAddMemberOpen(false);
    setMemberName("");
    setMemberAgeGroup("adult");
    setMemberDietaryNotes("");
  }

  function handleSaveGuest(e: React.FormEvent) {
    e.preventDefault();
    updateGuestMutation.mutate({
      familyName,
      phone: phone || null,
      email: email || null,
      language,
      notes: notes || null,
    });
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    addMemberMutation.mutate({
      name: memberName,
      ageGroup: memberAgeGroup,
      dietaryNotes: memberDietaryNotes || null,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={32} width={200} />
        <Skeleton height={200} />
        <Skeleton height={300} />
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div>
        <ErrorAlert>
          Failed to load guest details.
        </ErrorAlert>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/admin/guests")}>
          Back to Guests
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/guests")}
            className="p-2 -ml-2 rounded-lg text-muted hover:text-heading hover:bg-surface transition-colors cursor-pointer"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
           <div>
            <h1 className="text-2xl font-bold text-heading font-body">
              {guest.familyName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={statusVariantMap[guest.status] ?? "default"}>
                {guest.status}
              </Badge>
              {guest.inviteStatus !== "not_sent" && (
                <Badge variant={guest.inviteStatus === "sent" || guest.inviteStatus === "delivered" ? "confirmed" : guest.inviteStatus === "failed" ? "declined" : "pending"}>
                  invite {guest.inviteStatus?.replace("_", " ")}
                  {guest.inviteMethod ? ` via ${guest.inviteMethod}` : ""}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <code className="text-xs font-mono bg-surface rounded px-2 py-1 text-muted">
                {guest.token}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(guest.token);
                  toast({ message: "Token copied!", type: "success" });
                }}
                className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                Copy Token
              </button>
              <button
                type="button"
                onClick={() => {
                  const baseUrl = getPublicAppUrl();
                  const link = `${baseUrl}/${guest.language}/i/${guest.token}`;
                  navigator.clipboard.writeText(link);
                  toast({ message: "RSVP link copied!", type: "success" });
                }}
                className="text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                Copy RSVP Link
              </button>
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setInviteModalOpen(true)}
        >
          Send Invite
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest Info */}
        <Card>
          <h2 className="text-lg font-bold text-heading font-body mb-4">
            Guest Information
          </h2>
          <form onSubmit={handleSaveGuest} className="space-y-4">
            <Input
              label="Family Name"
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Select
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="pt-BR">Portuguese (BR)</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </Select>
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this guest..."
              className="[&_textarea]:min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={updateGuestMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Members */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-heading font-body">
              Members ({guest.members?.length ?? 0})
            </h2>
            <Button size="sm" variant="secondary" onClick={() => setAddMemberOpen(true)}>
              + Add
            </Button>
          </div>

          {guest.members && guest.members.length > 0 ? (
            <div className="space-y-3">
              {guest.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-surface/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-heading truncate">
                        {member.name}
                      </p>
                      <Badge variant={memberStatusVariantMap[member.status] ?? "default"}>
                        {member.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted capitalize">
                        {member.ageGroup}
                      </span>
                      {member.dietaryNotes && (
                        <span className="text-xs text-muted">
                          | {member.dietaryNotes}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMemberMutation.mutate(member.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error-bg transition-colors cursor-pointer shrink-0"
                    aria-label={`Remove ${member.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-6">
              No members yet. Add family members to this guest.
            </p>
          )}
        </Card>
      </div>

      {/* Add Member Modal */}
      <Modal
        open={addMemberOpen}
        onClose={closeAddMember}
        title="Add Member"
        size="sm"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Name"
            required
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="e.g., Joao Silva"
          />
          <Select
            label="Age Group"
            value={memberAgeGroup}
            onChange={(e) => setMemberAgeGroup(e.target.value)}
          >
            <option value="adult">Adult</option>
            <option value="child">Child</option>
            <option value="infant">Infant</option>
          </Select>
          <Input
            label="Dietary Notes"
            value={memberDietaryNotes}
            onChange={(e) => setMemberDietaryNotes(e.target.value)}
            placeholder="e.g., Vegetarian, allergies..."
          />
          <FormActions
            onCancel={closeAddMember}
            submitLabel="Add Member"
            loading={addMemberMutation.isPending}
          />
        </form>
      </Modal>

      {/* Invite Modal */}
      <InviteModal
        guest={guest}
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSent={handleInviteSent}
      />
    </div>
  );
}
