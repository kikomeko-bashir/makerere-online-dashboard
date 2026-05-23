import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

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

interface SettingsState {
  platformName: string;
  supportEmail: string;
  defaultLanguage: string;
  zoomApiKey: string;
  jitsiDomain: string;
  interswitchApiKey: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const defaultSettings: SettingsState = {
  platformName: "Makerere Online",
  supportEmail: "support@mak.ac.ug",
  defaultLanguage: "en",
  zoomApiKey: "zm_****************************",
  jitsiDomain: "meet.mak.ac.ug",
  interswitchApiKey: "isw_****************************",
  emailNotifications: true,
  smsNotifications: false,
};

export default function DashboardSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  const handleSave = () => {
    toast.success("Settings saved successfully", {
      description: "Your system configuration has been updated.",
    });
  };

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure system settings and preferences."
      >
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
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
              value={settings.platformName}
              onChange={(e) => updateSetting("platformName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => updateSetting("supportEmail", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Language</Label>
            <Select
              value={settings.defaultLanguage}
              onValueChange={(val) => updateSetting("defaultLanguage", val)}
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
              value={settings.zoomApiKey}
              onChange={(e) => updateSetting("zoomApiKey", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jitsi-domain">Jitsi Domain</Label>
            <Input
              id="jitsi-domain"
              type="password"
              value={settings.jitsiDomain}
              onChange={(e) => updateSetting("jitsiDomain", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interswitch-api-key">Interswitch API Key</Label>
            <Input
              id="interswitch-api-key"
              type="password"
              value={settings.interswitchApiKey}
              onChange={(e) =>
                updateSetting("interswitchApiKey", e.target.value)
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
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                updateSetting("emailNotifications", checked === true)
              }
            />
            <Label htmlFor="email-notifications" className="cursor-pointer">
              Enable email notifications
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="sms-notifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) =>
                updateSetting("smsNotifications", checked === true)
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
