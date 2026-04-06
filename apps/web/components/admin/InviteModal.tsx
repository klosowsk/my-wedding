"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { getPublicAppUrl } from "@/lib/public-url";
import { QRCodeSVG } from "qrcode.react";

type InviteChannel = "manual" | "sms" | "whatsapp" | "email";

interface Guest {
  id: string;
  familyName: string;
  phone: string | null;
  email: string | null;
  language: string;
  token: string;
  inviteStatus: string;
  inviteMethod: string | null;
}

interface InviteResponse {
  guest: Guest;
  message: string;
  url: string;
  channels: InviteChannel[];
}

interface ChannelsResponse {
  channels: InviteChannel[];
}

interface SettingsContext {
  coupleName1: string;
  coupleName2: string;
  eventDate: string;
  venueName: string;
  globalInviteMessagePt: string | null;
  globalInviteMessageEn: string | null;
  globalInviteMessageEs: string | null;
}

interface InviteModalProps {
  guest: Guest;
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}

const channelLabels: Record<InviteChannel, string> = {
  manual: "Manual (Copy & Paste)",
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "Email",
};

const channelDescriptions: Record<InviteChannel, string> = {
  manual: "Copy the invite message and send it yourself",
  sms: "Send an SMS automatically via Twilio",
  whatsapp: "Send a WhatsApp message via Twilio",
  email: "Send a formatted email via Resend",
};

const INVITE_QR_ID = "invite-qr-code";

function ChannelIcon({ channel }: { channel: InviteChannel }) {
  switch (channel) {
    case "manual":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      );
    case "sms":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "email":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
  }
}

function canUseChannel(channel: InviteChannel, guest: Guest): { ok: boolean; reason?: string } {
  switch (channel) {
    case "manual":
      return { ok: true };
    case "sms":
    case "whatsapp":
      if (!guest.phone) return { ok: false, reason: "No phone number" };
      return { ok: true };
    case "email":
      if (!guest.email) return { ok: false, reason: "No email address" };
      return { ok: true };
  }
}

function formatInviteDate(dateIso: string, language: string): string {
  const locale = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateIso}T12:00:00`));
}

function applyTemplateVars(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template
  );
}

function InviteModal({ guest, open, onClose, onSent }: InviteModalProps) {
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<InviteChannel>("manual");
  const [sentResult, setSentResult] = useState<InviteResponse | null>(null);
  const [showMessageEditor, setShowMessageEditor] = useState(false);
  const [editableMessage, setEditableMessage] = useState("");

  // Fetch available channels
  const { data: channelsData } = useQuery<ChannelsResponse>({
    queryKey: ["admin", "invite-channels"],
    queryFn: () => apiGet("/api/v1/admin/invites/channels"),
    enabled: open,
    staleTime: 60_000, // channels don't change often
  });

  const availableChannels = channelsData?.channels ?? ["manual"];

  const { data: settings } = useQuery<SettingsContext>({
    queryKey: ["admin", "settings", "invite-modal"],
    queryFn: () => apiGet("/api/v1/admin/settings"),
    enabled: open,
    staleTime: 60_000,
  });

  // Send invite mutation
  const sendMutation = useMutation({
    mutationFn: ({ method, message }: { method: InviteChannel; message?: string }) =>
      apiPost<InviteResponse>(`/api/v1/admin/guests/${guest.id}/invite`, { method, message: message || undefined }),
    onSuccess: (data) => {
      setSentResult(data);
      if (data.channels) {
        // channels come back in the response too
      }
      if (selectedChannel !== "manual") {
        toast({ message: "Invite sent successfully!", type: "success" });
      }
      onSent();
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to send invite", type: "error" });
    },
  });

  // Reset state when modal opens/closes
  const resetState = useCallback(() => {
    setSentResult(null);
    setSelectedChannel("manual");
    setShowMessageEditor(false);
    setEditableMessage("");
    sendMutation.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, resetState]);

  function handleShowEditor() {
    // Build the default message so the admin can preview/edit it
    const baseUrl = getPublicAppUrl();
    const link = `${baseUrl}/${guest.language}/i/${guest.token}`;
    const p1 = settings?.coupleName1 || "Partner 1";
    const p2 = settings?.coupleName2 || "Partner 2";
    const venueName = settings?.venueName || "Wedding Venue";
    const familyName = guest.familyName;
    const eventDate = formatInviteDate(settings?.eventDate || "2026-12-31", guest.language);

    const globalTemplate =
      guest.language === "en"
        ? settings?.globalInviteMessageEn
        : guest.language === "es"
          ? settings?.globalInviteMessageEs
          : settings?.globalInviteMessagePt;

    let defaultMsg: string;
    if (globalTemplate) {
      defaultMsg = applyTemplateVars(globalTemplate, {
        familyName,
        couple: `${p1} & ${p2}`,
        person1: p1,
        person2: p2,
        date: eventDate,
        venue: venueName,
        link,
      });
    } else if (guest.language === "en") {
      defaultMsg = `Hello, ${familyName}! ${p1} and ${p2} would like to invite you to our wedding!\n\u{1F4C5} ${eventDate} | \u{1F4CD} ${venueName}\nConfirm here: ${link}`;
    } else if (guest.language === "es") {
      defaultMsg = `\u{00A1}Hola, ${familyName}! ${p1} y ${p2} nos encantaria invitarles a nuestra boda!\n\u{1F4C5} ${eventDate} | \u{1F4CD} ${venueName}\nConfirma aqui: ${link}`;
    } else {
      defaultMsg = `Ola, ${familyName}! ${p1} e ${p2} gostariam de convida-los para o casamento!\n\u{1F4C5} ${eventDate} | \u{1F4CD} ${venueName}\nConfirme aqui: ${link}`;
    }

    setEditableMessage(defaultMsg);
    setShowMessageEditor(true);
  }

  function handleSend() {
    sendMutation.mutate({
      method: selectedChannel,
      message: editableMessage || undefined,
    });
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({ message: `${label} copied!`, type: "success" });
    } catch {
      toast({ message: "Failed to copy", type: "error" });
    }
  }

  async function getQrPngBlob(size = 768): Promise<Blob> {
    const svg = document.getElementById(INVITE_QR_ID) as SVGSVGElement | null;
    if (!svg) {
      throw new Error("QR code not found");
    }

    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to render QR code image"));
        img.src = svgUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to create canvas context");
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(image, 0, 0, size, size);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to export QR image"));
            return;
          }
          resolve(blob);
        }, "image/png");
      });

      return pngBlob;
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  async function downloadQrCode() {
    try {
      const blob = await getQrPngBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `rsvp-${guest.token}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ message: "QR image downloaded!", type: "success" });
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Failed to download QR image",
        type: "error",
      });
    }
  }

  async function copyQrCodeImage() {
    try {
      if (typeof ClipboardItem === "undefined") {
        throw new Error("Image copy is not supported in this browser");
      }

      const blob = await getQrPngBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast({ message: "QR image copied!", type: "success" });
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Failed to copy QR image",
        type: "error",
      });
    }
  }

  function handleClose() {
    onClose();
  }

  // After sending via manual channel — show message + copy buttons
  if (sentResult && selectedChannel === "manual") {
    return (
      <Modal open={open} onClose={handleClose} title="Invite Ready" size="md">
        <p className="text-sm text-muted mb-3">
          Copy this message and send it via WhatsApp or your preferred channel:
        </p>

        <div className="bg-surface rounded-lg p-4 mb-4">
          <pre className="text-sm text-body whitespace-pre-wrap font-body leading-relaxed">
            {sentResult.message}
          </pre>
        </div>

        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="bg-white border border-secondary/50 rounded-lg p-3">
            <QRCodeSVG
              id={INVITE_QR_ID}
              value={sentResult.url}
              size={160}
              level="M"
              includeMargin
              bgColor="#FFFFFF"
              fgColor="#2C2522"
            />
          </div>
          <p className="text-xs text-muted text-center">
            QR code for quick RSVP access ({guest.token})
          </p>
        </div>

        {/* Remind about invite image if configured */}
        <p className="text-xs text-muted mb-4">
          Don&apos;t forget to attach the invite image if you have one configured in Settings.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => copyToClipboard(sentResult.message, "Message")}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy Message
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => copyToClipboard(sentResult.url, "Link")}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.188" />
            </svg>
            Copy Link
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={downloadQrCode}
          >
            Download QR (PNG)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={copyQrCodeImage}
          >
            Copy QR Image
          </Button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-secondary/50">
          <div className="flex items-center gap-2">
            <Badge variant="confirmed">Marked as Sent</Badge>
            <span className="text-xs text-muted">via manual</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  // After sending via automated channel — show success
  if (sentResult && selectedChannel !== "manual") {
    return (
      <Modal open={open} onClose={handleClose} title="Invite Sent" size="sm">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-accent-faint rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-heading mb-2">
            Invite sent to {guest.familyName}
          </h3>
          <p className="text-sm text-muted mb-1">
            {sentResult.message}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge variant="confirmed">Sent</Badge>
            <span className="text-xs text-muted">via {selectedChannel}</span>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-secondary/50">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  // Message editor step — preview/edit before sending
  if (showMessageEditor && !sentResult) {
    return (
      <Modal open={open} onClose={handleClose} title="Edit Message" size="md">
        <p className="text-sm text-muted mb-3">
          Review and edit the invite message for <strong className="text-heading">{guest.familyName}</strong>:
        </p>

        <textarea
          value={editableMessage}
          onChange={(e) => setEditableMessage(e.target.value)}
          rows={6}
          className="w-full bg-surface border border-secondary rounded-lg px-4 py-3 text-sm text-body font-body placeholder:text-muted-light focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-200 resize-y"
        />

        <p className="text-xs text-muted mt-2 mb-4">
          Sending via <strong>{channelLabels[selectedChannel]}</strong>
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-secondary/50">
          <Button variant="ghost" size="sm" onClick={() => setShowMessageEditor(false)}>
            Back
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            loading={sendMutation.isPending}
          >
            {selectedChannel === "manual" ? "Generate & Copy" : `Send via ${channelLabels[selectedChannel]}`}
          </Button>
        </div>
      </Modal>
    );
  }

  // Channel selection — main view
  return (
    <Modal open={open} onClose={handleClose} title="Send Invite" size="md">
      <p className="text-sm text-muted mb-1">
        Send an invitation to <strong className="text-heading">{guest.familyName}</strong>
      </p>

      {/* Guest contact info */}
      <div className="flex flex-wrap gap-3 mb-5">
        {guest.phone && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {guest.phone}
          </span>
        )}
        {guest.email && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {guest.email}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
          {guest.language}
        </span>
      </div>

      {/* Previous invite status */}
      {guest.inviteStatus !== "not_sent" && (
        <div className="bg-surface/50 rounded-lg px-4 py-3 mb-5">
          <div className="flex items-center gap-2">
            <Badge variant={guest.inviteStatus === "sent" || guest.inviteStatus === "delivered" ? "confirmed" : guest.inviteStatus === "failed" ? "declined" : "pending"}>
              {guest.inviteStatus}
            </Badge>
            {guest.inviteMethod && (
              <span className="text-xs text-muted">
                Previously sent via {guest.inviteMethod}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Channel selection */}
      <div className="space-y-2 mb-6">
        <p className="text-sm font-semibold text-heading">Choose delivery method:</p>
        {availableChannels.map((channel) => {
          const { ok, reason } = canUseChannel(channel, guest);
          const isSelected = selectedChannel === channel;
          const isDisabled = !ok;

          return (
            <Card
              key={channel}
              className={[
                "!p-4 cursor-pointer transition-all duration-200",
                isSelected && !isDisabled
                  ? "!border-primary !bg-primary/5 ring-1 ring-primary/30"
                  : "",
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:!border-primary/50",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <label
                className={[
                  "flex items-center gap-3",
                  isDisabled ? "cursor-not-allowed" : "cursor-pointer",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="invite-channel"
                  value={channel}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => setSelectedChannel(channel)}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <div className="flex items-center gap-2 text-primary">
                  <ChannelIcon channel={channel} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">
                    {channelLabels[channel]}
                  </p>
                  <p className="text-xs text-muted">
                    {isDisabled ? reason : channelDescriptions[channel]}
                  </p>
                </div>
              </label>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-secondary/50">
        <Button variant="ghost" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleShowEditor}
          disabled={!canUseChannel(selectedChannel, guest).ok}
        >
          Next: Edit Message
        </Button>
      </div>
    </Modal>
  );
}

export { InviteModal };
export type { InviteModalProps };
