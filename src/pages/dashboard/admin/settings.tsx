import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSettings();
      setSettings(response.settings);
    } catch (error) {
      toast.error("Failed to load settings", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.updateSettings(settings);
      setSettings(response.settings);
      toast.success("Settings saved successfully", {
        description: "Your system configuration has been updated.",
      });
    } catch (error) {
      toast.error("Failed to save settings", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure system settings and preferences."
      >
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </PageHeader>

      {/* General Settings */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">General</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input
              id="platform-name"
              value={settings.platform_name || ""}
              onChange={(e) => updateSetting("platform_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              value={settings.support_email || ""}
              onChange={(e) => updateSetting("support_email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Language</Label>
            <Select
              value={settings.default_language || "en"}
              onValueChange={(val) => updateSetting("default_language", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Swahili</SelectItem>
                <SelectItem value="lg">Luganda</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">API Configuration</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="zoom-api-key">Zoom API Key</Label>
            <Input
              id="zoom-api-key"
              type="password"
              value={settings.zoom_api_key || ""}
              onChange={(e) => updateSetting("zoom_api_key", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zoom-api-secret">Zoom API Secret</Label>
            <Input
              id="zoom-api-secret"
              type="password"
              value={settings.zoom_api_secret || ""}
              onChange={(e) => updateSetting("zoom_api_secret", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jitsi-domain">Jitsi Domain</Label>
            <Input
              id="jitsi-domain"
              value={settings.jitsi_domain || ""}
              onChange={(e) => updateSetting("jitsi_domain", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interswitch-api-key">Interswitch API Key</Label>
            <Input
              id="interswitch-api-key"
              type="password"
              value={settings.interswitch_api_key || ""}
              onChange={(e) =>
                updateSetting("interswitch_api_key", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interswitch-merchant-id">
              Interswitch Merchant ID
            </Label>
            <Input
              id="interswitch-merchant-id"
              type="password"
              value={settings.interswitch_merchant_id || ""}
              onChange={(e) =>
                updateSetting("interswitch_merchant_id", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="email-notifications"
              checked={settings.email_notifications_enabled === "true"}
              onCheckedChange={(checked) =>
                updateSetting(
                  "email_notifications_enabled",
                  checked === true ? "true" : "false",
                )
              }
            />
            <Label htmlFor="email-notifications" className="cursor-pointer">
              Enable email notifications
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="sms-notifications"
              checked={settings.sms_notifications_enabled === "true"}
              onCheckedChange={(checked) =>
                updateSetting(
                  "sms_notifications_enabled",
                  checked === true ? "true" : "false",
                )
              }
            />
            <Label htmlFor="sms-notifications" className="cursor-pointer">
              Enable SMS notifications
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
