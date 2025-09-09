"use client"

import { useState } from "react"
import { IconSettings, IconNotification, IconShield, IconPalette, IconDatabase } from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      criticalPatientAlerts: true,
      weeklyReports: false,
      systemUpdates: true,
    },
    privacy: {
      shareAnalytics: false,
      allowDataExport: true,
      sessionTimeout: 30,
    },
    display: {
      theme: "light",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
    performance: {
      autoRefresh: true,
      refreshInterval: 5,
      chartAnimations: true,
    }
  })

  const handleSettingChange = (category: string, setting: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))
  }

  const handleSave = () => {
    // Here you would typically save to an API
    console.log("Saving settings:", settings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconSettings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your dashboard preferences and system settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconNotification className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "emailAlerts", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications for real-time updates
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "pushNotifications", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Patient Alerts</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Immediate notifications for high-risk patients
                    </p>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.criticalPatientAlerts}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "criticalPatientAlerts", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Summary reports delivered every Monday
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "weeklyReports", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about system maintenance and updates
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notifications", "systemUpdates", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconPalette className="h-5 w-5" />
                Display & Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.display.theme}
                    onValueChange={(value) => handleSettingChange("display", "theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.display.language}
                    onValueChange={(value) => handleSettingChange("display", "language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={settings.display.dateFormat}
                    onValueChange={(value) => handleSettingChange("display", "dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select
                    value={settings.display.timeFormat}
                    onValueChange={(value) => handleSettingChange("display", "timeFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconShield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the system by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.shareAnalytics}
                  onCheckedChange={(checked) => 
                    handleSettingChange("privacy", "shareAnalytics", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Data Export</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable exporting of patient data for reporting
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.allowDataExport}
                  onCheckedChange={(checked) => 
                    handleSettingChange("privacy", "allowDataExport", checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.privacy.sessionTimeout]}
                    onValueChange={(value) => 
                      handleSettingChange("privacy", "sessionTimeout", value[0])
                    }
                    max={120}
                    min={5}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">
                    {settings.privacy.sessionTimeout}m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDatabase className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh data at regular intervals
                  </p>
                </div>
                <Switch
                  checked={settings.performance.autoRefresh}
                  onCheckedChange={(checked) => 
                    handleSettingChange("performance", "autoRefresh", checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Refresh Interval (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.performance.refreshInterval]}
                    onValueChange={(value) => 
                      handleSettingChange("performance", "refreshInterval", value[0])
                    }
                    max={30}
                    min={1}
                    step={1}
                    className="flex-1"
                    disabled={!settings.performance.autoRefresh}
                  />
                  <span className="text-sm font-medium w-12">
                    {settings.performance.refreshInterval}m
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chart Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth animations for charts and graphs
                  </p>
                </div>
                <Switch
                  checked={settings.performance.chartAnimations}
                  onCheckedChange={(checked) => 
                    handleSettingChange("performance", "chartAnimations", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
