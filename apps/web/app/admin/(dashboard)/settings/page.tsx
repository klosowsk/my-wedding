"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Toggle } from "@/components/ui/Toggle";

interface SiteSettings {
  coupleName1: string;
  coupleName2: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueGoogleMapsUrl: string | null;
  venueGoogleMapsEmbedUrl: string | null;
  venueWazeUrl: string | null;
  pixKey: string | null;
  pixName: string | null;
  pixCity: string | null;
  stripeEnabled: boolean;
  pixEnabled: boolean;
  rsvpEnabled: boolean;
  giftsEnabled: boolean;
  galleryEnabled: boolean;
  maxPlusOnes: number;
  currencyCode: string;
  currencyLocale: string;
  contactPhone: string | null;
  contactEmail: string | null;
  rsvpDeadline: string | null;
  inviteImageUrl: string | null;
  heroSubtitlePt: string | null;
  heroSubtitleEn: string | null;
  heroSubtitleEs: string | null;
}

interface SettingsForm {
  coupleName1: string;
  coupleName2: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueGoogleMapsUrl: string;
  venueGoogleMapsEmbedUrl: string;
  venueWazeUrl: string;
  pixKey: string;
  pixName: string;
  pixCity: string;
  stripeEnabled: boolean;
  pixEnabled: boolean;
  rsvpEnabled: boolean;
  giftsEnabled: boolean;
  galleryEnabled: boolean;
  maxPlusOnes: string;
  currencyCode: string;
  currencyLocale: string;
  contactPhone: string;
  contactEmail: string;
  rsvpDeadline: string;
  inviteImageUrl: string;
  heroSubtitlePt: string;
  heroSubtitleEn: string;
  heroSubtitleEs: string;
}

const subtitleTabs = [
  { id: "pt", label: "PT" },
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
];

const EMPTY_FORM: SettingsForm = {
  coupleName1: "",
  coupleName2: "",
  eventDate: "",
  eventTime: "",
  venueName: "",
  venueAddress: "",
  venueGoogleMapsUrl: "",
  venueGoogleMapsEmbedUrl: "",
  venueWazeUrl: "",
  pixKey: "",
  pixName: "",
  pixCity: "",
  stripeEnabled: false,
  pixEnabled: true,
  rsvpEnabled: true,
  giftsEnabled: true,
  galleryEnabled: true,
  maxPlusOnes: "4",
  currencyCode: "BRL",
  currencyLocale: "pt-BR",
  contactPhone: "",
  contactEmail: "",
  rsvpDeadline: "",
  inviteImageUrl: "",
  heroSubtitlePt: "",
  heroSubtitleEn: "",
  heroSubtitleEs: "",
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);
  const [subtitleLangTab, setSubtitleLangTab] = useState("pt");

  const { data: settings, isLoading, error } = useQuery<SiteSettings>({
    queryKey: ["admin", "settings"],
    queryFn: () => apiGet("/api/v1/admin/settings"),
  });

  useEffect(() => {
    if (settings && !initialized) {
      setForm({
        coupleName1: settings.coupleName1,
        coupleName2: settings.coupleName2,
        eventDate: settings.eventDate,
        eventTime: settings.eventTime,
        venueName: settings.venueName,
        venueAddress: settings.venueAddress,
        venueGoogleMapsUrl: settings.venueGoogleMapsUrl ?? "",
        venueGoogleMapsEmbedUrl: settings.venueGoogleMapsEmbedUrl ?? "",
        venueWazeUrl: settings.venueWazeUrl ?? "",
        pixKey: settings.pixKey ?? "",
        pixName: settings.pixName ?? "",
        pixCity: settings.pixCity ?? "",
        stripeEnabled: settings.stripeEnabled,
        pixEnabled: settings.pixEnabled,
        rsvpEnabled: settings.rsvpEnabled,
        giftsEnabled: settings.giftsEnabled,
        galleryEnabled: settings.galleryEnabled,
        maxPlusOnes: String(settings.maxPlusOnes),
        currencyCode: settings.currencyCode,
        currencyLocale: settings.currencyLocale,
        contactPhone: settings.contactPhone ?? "",
        contactEmail: settings.contactEmail ?? "",
        rsvpDeadline: settings.rsvpDeadline ?? "",
        inviteImageUrl: settings.inviteImageUrl ?? "",
        heroSubtitlePt: settings.heroSubtitlePt ?? "",
        heroSubtitleEn: settings.heroSubtitleEn ?? "",
        heroSubtitleEs: settings.heroSubtitleEs ?? "",
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPatch("/api/v1/admin/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast({ message: "Settings saved", type: "success" });
    },
    onError: (err: Error) => {
      toast({ message: err.message || "Failed to save settings", type: "error" });
    },
  });

  function setField<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    saveMutation.mutate({
      coupleName1: form.coupleName1,
      coupleName2: form.coupleName2,
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      venueName: form.venueName,
      venueAddress: form.venueAddress,
      venueGoogleMapsUrl: form.venueGoogleMapsUrl || null,
      venueGoogleMapsEmbedUrl: form.venueGoogleMapsEmbedUrl || null,
      venueWazeUrl: form.venueWazeUrl || null,
      pixKey: form.pixKey || null,
      pixName: form.pixName || null,
      pixCity: form.pixCity || null,
      stripeEnabled: form.stripeEnabled,
      pixEnabled: form.pixEnabled,
      rsvpEnabled: form.rsvpEnabled,
      giftsEnabled: form.giftsEnabled,
      galleryEnabled: form.galleryEnabled,
      maxPlusOnes: Number.parseInt(form.maxPlusOnes || "0", 10),
      currencyCode: form.currencyCode,
      currencyLocale: form.currencyLocale,
      contactPhone: form.contactPhone || null,
      contactEmail: form.contactEmail || null,
      rsvpDeadline: form.rsvpDeadline || null,
      inviteImageUrl: form.inviteImageUrl || null,
      heroSubtitlePt: form.heroSubtitlePt || null,
      heroSubtitleEn: form.heroSubtitleEn || null,
      heroSubtitleEs: form.heroSubtitleEs || null,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={32} width={160} />
        <Skeleton height={640} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Settings" />
        <ErrorAlert>Failed to load settings. Please try again.</ErrorAlert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <Card>
          <h2 className="text-lg font-bold text-heading font-body mb-4">💍 Event</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Couple name #1"
              value={form.coupleName1}
              onChange={(e) => setField("coupleName1", e.target.value)}
              required
            />
            <Input
              label="Couple name #2"
              value={form.coupleName2}
              onChange={(e) => setField("coupleName2", e.target.value)}
              required
            />
            <Input
              label="Event date"
              type="date"
              value={form.eventDate}
              onChange={(e) => setField("eventDate", e.target.value)}
              required
            />
            <Input
              label="Event time"
              type="time"
              value={form.eventTime}
              onChange={(e) => setField("eventTime", e.target.value)}
              required
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-heading font-body mb-4">📍 Venue</h2>
          <div className="space-y-4">
            <Input
              label="Venue name"
              value={form.venueName}
              onChange={(e) => setField("venueName", e.target.value)}
              required
            />
            <Input
              label="Venue address"
              value={form.venueAddress}
              onChange={(e) => setField("venueAddress", e.target.value)}
              required
            />
            <Input
              label="Google Maps URL"
              type="url"
              value={form.venueGoogleMapsUrl}
              onChange={(e) => setField("venueGoogleMapsUrl", e.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <Input
              label="Google Maps embed URL"
              type="url"
              value={form.venueGoogleMapsEmbedUrl}
              onChange={(e) => setField("venueGoogleMapsEmbedUrl", e.target.value)}
              placeholder="https://www.google.com/maps/embed?..."
            />
            <Input
              label="Waze URL"
              type="url"
              value={form.venueWazeUrl}
              onChange={(e) => setField("venueWazeUrl", e.target.value)}
              placeholder="https://waze.com/ul?..."
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-heading font-body mb-4">💳 Payments</h2>
          <div className="space-y-4">
            <Input
              label="PIX Key"
              value={form.pixKey}
              onChange={(e) => setField("pixKey", e.target.value)}
              placeholder="CPF, email, phone, or random key"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="PIX Name"
                value={form.pixName}
                onChange={(e) => setField("pixName", e.target.value)}
                placeholder="Recipient name"
              />
              <Input
                label="PIX City"
                value={form.pixCity}
                onChange={(e) => setField("pixCity", e.target.value)}
                placeholder="City"
              />
            </div>

            <Toggle
              checked={form.pixEnabled}
              onChange={(value) => setField("pixEnabled", value)}
              label="Enable PIX"
              description="Controls PIX as an available payment method on gift checkout"
            />

            <Toggle
              checked={form.stripeEnabled}
              onChange={(value) => setField("stripeEnabled", value)}
              label="Enable Stripe"
              description="Requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET env vars"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-heading font-body mb-4">🧩 Features & Currency</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Currency code"
                value={form.currencyCode}
                onChange={(e) => setField("currencyCode", e.target.value.toUpperCase())}
                placeholder="BRL"
                maxLength={3}
              />
              <Input
                label="Currency locale"
                value={form.currencyLocale}
                onChange={(e) => setField("currencyLocale", e.target.value)}
                placeholder="pt-BR"
              />
            </div>

            <Input
              label="Max plus-ones per invitation"
              type="number"
              min="0"
              max="20"
              value={form.maxPlusOnes}
              onChange={(e) => setField("maxPlusOnes", e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Toggle
                checked={form.rsvpEnabled}
                onChange={(value) => setField("rsvpEnabled", value)}
                label="Enable RSVP"
              />
              <Toggle
                checked={form.giftsEnabled}
                onChange={(value) => setField("giftsEnabled", value)}
                label="Enable Gifts"
              />
              <Toggle
                checked={form.galleryEnabled}
                onChange={(value) => setField("galleryEnabled", value)}
                label="Enable Gallery"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-heading font-body mb-4">📞 Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => setField("contactPhone", e.target.value)}
              placeholder="+55 11 99999-9999"
            />
            <Input
              label="Email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setField("contactEmail", e.target.value)}
              placeholder="contact@example.com"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-heading font-body mb-4">✉️ RSVP & Invites</h2>
          <div className="space-y-4">
            <Input
              label="RSVP Deadline"
              type="date"
              value={form.rsvpDeadline}
              onChange={(e) => setField("rsvpDeadline", e.target.value)}
              helperText="After this date, guests will no longer be able to confirm"
            />

            <Input
              label="Invite Image URL"
              type="url"
              value={form.inviteImageUrl}
              onChange={(e) => setField("inviteImageUrl", e.target.value)}
              placeholder="https://example.com/invite-card.jpg"
              helperText="Optional image to include with invites"
            />

            <div className="space-y-3">
              <Tabs
                tabs={subtitleTabs}
                activeTab={subtitleLangTab}
                onTabChange={setSubtitleLangTab}
              />

              {subtitleLangTab === "pt" && (
                <Textarea
                  label="Hero subtitle (PT-BR)"
                  value={form.heroSubtitlePt}
                  onChange={(e) => setField("heroSubtitlePt", e.target.value)}
                  placeholder="convidam você para celebrar, com amor, o início de sua história como um só"
                  rows={3}
                  helperText="Optional override for the landing subtitle in Portuguese"
                />
              )}

              {subtitleLangTab === "en" && (
                <Textarea
                  label="Hero subtitle (EN)"
                  value={form.heroSubtitleEn}
                  onChange={(e) => setField("heroSubtitleEn", e.target.value)}
                  placeholder="invite you to celebrate, with love, the beginning of their story as one"
                  rows={3}
                  helperText="Optional override for the landing subtitle in English"
                />
              )}

              {subtitleLangTab === "es" && (
                <Textarea
                  label="Hero subtitle (ES)"
                  value={form.heroSubtitleEs}
                  onChange={(e) => setField("heroSubtitleEs", e.target.value)}
                  placeholder="los invitan a celebrar, con amor, el inicio de su historia como uno solo"
                  rows={3}
                  helperText="Optional override for the landing subtitle in Spanish"
                />
              )}
            </div>

            {form.inviteImageUrl && (
              <div className="mt-3">
                <p className="text-xs text-muted mb-2">Preview:</p>
                <img
                  src={form.inviteImageUrl}
                  alt="Invite preview"
                  className="max-w-[200px] rounded-lg border border-secondary"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saveMutation.isPending}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
