import React, { useState } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usersApi } from '../../api/usersApi';
import { User, Lock, Bell, Shield, Moon, Sun } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SettingsPage() {
  const { auth, setAuth } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: auth?.user?.name || '',
    email: auth?.user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In a real app, there would be an update profile endpoint or we use updateUser if admin
      const res = await usersApi.updateUser(auth.user.id, profileForm);
      if (res.success) {
        addToast('success', 'Profile Updated', 'Your profile changes have been saved.');
        // Update local auth state if needed
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return addToast('error', 'Passwords Mismatch', 'New password and confirm password do not match.');
    }
    
    setSaving(true);
    try {
      // Assuming updateUser handles password change if provided
      const res = await usersApi.updateUser(auth.user.id, { password: passwordForm.new_password });
      if (res.success) {
        addToast('success', 'Password Updated', 'Your password has been changed successfully.');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not change password.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Moon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <SectionHeader
        title="Settings"
        subtitle="Manage your account settings and preferences"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar Menu */}
        <div className="md:col-span-3 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  isActive 
                    ? "bg-accent/10 text-accent" 
                    : "text-text-secondary dark:text-text-dark-secondary hover:bg-background-dark/5 dark:hover:bg-background/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-text-muted")} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 space-y-6">
          
          {activeTab === 'profile' && (
            <Card title="Profile Information" className="max-w-2xl">
              <form onSubmit={handleProfileUpdate} className="space-y-4 mt-4">
                <Input 
                  label="Full Name" 
                  value={profileForm.name} 
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                />
                <Input 
                  label="Email Address" 
                  type="email" 
                  value={profileForm.email} 
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} 
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving}>Save Changes</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Change Password" className="max-w-2xl">
              <form onSubmit={handlePasswordUpdate} className="space-y-4 mt-4">
                <Input 
                  label="Current Password" 
                  type="password" 
                  value={passwordForm.current_password} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} 
                  required
                />
                <div className="border-t border-border-light dark:border-border-dark my-4 pt-4 space-y-4">
                  <Input 
                    label="New Password" 
                    type="password" 
                    value={passwordForm.new_password} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} 
                    required
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password" 
                    value={passwordForm.confirm_password} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} 
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving}>Update Password</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card title="System Preferences" className="max-w-2xl">
              <div className="mt-4 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border-light dark:border-border-dark">
                  <div>
                    <h4 className="font-bold text-sm">Theme Appearance</h4>
                    <p className="text-xs text-text-muted mt-1">Toggle between light and dark mode</p>
                  </div>
                  <div className="flex bg-background-dark/5 dark:bg-background/5 rounded-lg p-1">
                    <button className="px-4 py-2 rounded text-xs font-bold bg-white dark:bg-card-dark shadow-sm">Light</button>
                    <button className="px-4 py-2 rounded text-xs font-bold text-text-muted hover:text-text-primary">Dark</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border-light dark:border-border-dark">
                  <div>
                    <h4 className="font-bold text-sm">Compact View</h4>
                    <p className="text-xs text-text-muted mt-1">Reduce spacing in tables and lists</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-background-dark/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notification Preferences" className="max-w-2xl">
              <div className="mt-4 space-y-4">
                {['Email alerts for new leads', 'Daily summary reports', 'System maintenance updates', 'Lead status changes'].map((label, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border-light dark:border-border-dark">
                    <span className="font-bold text-sm">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                      <div className="w-11 h-6 bg-background-dark/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
