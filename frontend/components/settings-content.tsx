'use client';

import { useState } from 'react';
import { Bell, Lock, Users, Moon, Globe, Database, Eye, Volume2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const settingSections: SettingSection[] = [
  { id: 'general', title: 'General', description: 'Basic app settings', icon: <Globe className="w-5 h-5" /> },
  { id: 'notifications', title: 'Notifications', description: 'Alert preferences', icon: <Bell className="w-5 h-5" /> },
  { id: 'appearance', title: 'Appearance', description: 'Theme and display', icon: <Moon className="w-5 h-5" /> },
  { id: 'privacy', title: 'Privacy & Security', description: 'Security settings', icon: <Lock className="w-5 h-5" /> },
  { id: 'team', title: 'Team', description: 'Manage team members', icon: <Users className="w-5 h-5" /> },
  { id: 'data', title: 'Data & Storage', description: 'Backup settings', icon: <Database className="w-5 h-5" /> },
];

export function SettingsContent() {
  const [activeSection, setActiveSection] = useState('general');

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Default Game View</p>
                    <p className="text-sm text-muted-foreground">Set your preferred dashboard view</p>
                  </div>
                  <select className="px-3 py-2 bg-background border border-secondary-foreground/20 rounded-lg text-sm text-foreground">
                    <option>Analytics</option>
                    <option>Games</option>
                    <option>Activity</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Time Zone</p>
                    <p className="text-sm text-muted-foreground">UTC-5 (Eastern Time)</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Auto-save Projects</p>
                    <p className="text-sm text-muted-foreground">Automatically save changes every 5 minutes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { label: 'Game launches', desc: 'Notify when a game goes live' },
                  { label: 'Team invitations', desc: 'New team member requests' },
                  { label: 'Performance alerts', desc: 'CCU drops below threshold' },
                  { label: 'Deployment updates', desc: 'GitHub deployment status' },
                  { label: 'Weekly digest', desc: 'Summary of studio activity' },
                ].map((notif, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{notif.label}</p>
                      <p className="text-sm text-muted-foreground">{notif.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-3">Theme</p>
                  <div className="flex gap-3">
                    {['Dark', 'Light', 'System'].map(theme => (
                      <Button
                        key={theme}
                        variant={theme === 'Dark' ? 'default' : 'outline'}
                        className={theme === 'Dark' ? 'bg-accent hover:bg-accent/90' : ''}
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for more information</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Reduce Motion</p>
                    <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Privacy & Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Badge className="bg-green-500/20 text-green-300">Enabled</Badge>
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">30 minutes of inactivity</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">3 devices logged in</p>
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Team Management</h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-foreground">Team Members (8/10)</p>
                      <p className="text-sm text-muted-foreground">You have 2 invitations pending</p>
                    </div>
                    <Button className="bg-accent hover:bg-accent/90">Invite Member</Button>
                  </div>
                  <div className="space-y-2">
                    {['Alex Chen (Lead)', 'Sam Rodriguez (Artist)', 'Jordan Kim (Dev)'].map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-background rounded">
                        <span className="text-sm text-foreground">{member}</span>
                        <Button variant="ghost" size="sm" className="text-xs">Remove</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Data & Storage</h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <p className="font-medium text-foreground mb-3">Storage Usage</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Used: 245 GB</span>
                      <span className="text-muted-foreground">Available: 755 GB</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                      <div className="bg-accent h-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Automatic Backups</p>
                    <p className="text-sm text-muted-foreground">Daily at 2:00 AM UTC</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary border border-secondary-foreground/20 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Export Data</p>
                    <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-2 sticky top-20">
            {settingSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-accent text-foreground'
                    : 'bg-secondary border border-secondary-foreground/20 text-foreground hover:border-accent/50'
                }`}
              >
                {section.icon}
                <div>
                  <p className="text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-muted-foreground opacity-70">{section.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {renderSection(activeSection)}
        </div>
      </div>
    </div>
  );
}
