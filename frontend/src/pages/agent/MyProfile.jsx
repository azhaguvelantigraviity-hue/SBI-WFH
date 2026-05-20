import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/usersApi';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import { Avatar } from '../../components/ui/Avatar';
import { Camera } from 'lucide-react';

export function MyProfilePage() {
  const { auth, setAuth } = useAuth();
  const { addToast } = useToast();
  
  const [form, setForm] = useState({
    name: auth?.user?.name || '',
    mobile: auth?.user?.mobile || '',
    email: auth?.user?.email || '',
    avatar: auth?.user?.avatar || '',
    password: ''
  });

  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('warning', 'File Too Large', 'Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar: reader.result }));
      addToast('info', 'Photo Selected', 'Click Update Profile below to save your new photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't send empty password

      const res = await usersApi.updateUser(auth.user.id, payload);
      
      if (res.success) {
        addToast('success', 'Profile Updated', 'Your profile has been updated successfully.');
        setForm(prev => ({ ...prev, password: '' }));
        
        // Construct the updated user and auth payload
        const updatedUser = {
          ...auth.user,
          name: res.data.name || auth.user.name,
          mobile: res.data.mobile || auth.user.mobile,
          email: res.data.email || auth.user.email,
          avatar: res.data.avatar || auth.user.avatar,
        };

        const updatedAuth = {
          ...auth,
          user: updatedUser,
          name: updatedUser.name,
        };

        setAuth(updatedAuth);
        localStorage.setItem('auth', JSON.stringify(updatedAuth));
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SP';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Edit Panel */}
        <Card className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer mb-4">
              <Avatar 
                name={auth?.user?.name} 
                src={form.avatar} 
                size="xl" 
                className="w-24 h-24 shadow-lg transition-transform duration-300 group-hover:scale-105" 
              />
              <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white cursor-pointer select-none">
                <Camera className="w-5 h-5 mb-1 text-accent-light" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange} 
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary">{auth?.user?.name}</h2>
            <p className="text-sm text-text-muted mt-1">Employee ID: {auth?.user?.employee_id || 'EMP001'}</p>
            <div className="mt-3 px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Active
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input 
                label="Full Name" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})} 
              />
              <Input 
                label="Mobile" 
                value={form.mobile} 
                onChange={(e) => setForm({...form, mobile: e.target.value})} 
              />
            </div>
            
            <Input 
              label="Email" 
              type="email"
              value={form.email} 
              onChange={(e) => setForm({...form, email: e.target.value})} 
              disabled // Usually email isn't easily editable by agent
            />

            <Input 
              label="New Password" 
              type="password"
              placeholder="Leave blank to keep current"
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
            />

            <div className="pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Performance Summary Panel */}
        <Card title="Performance Summary" className="p-8">
          <div className="mt-6 space-y-8">
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-secondary dark:text-text-dark-secondary">Total Calls This Month</span>
                <span className="font-bold">156</span>
              </div>
              <div className="w-full bg-background-dark/10 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-secondary dark:text-text-dark-secondary">Leads Converted</span>
                <span className="font-bold">82%</span>
              </div>
              <div className="w-full bg-background-dark/10 rounded-full h-1.5">
                <div className="bg-success h-1.5 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-secondary dark:text-text-dark-secondary">QD Approval Rate</span>
                <span className="font-bold">90%</span>
              </div>
              <div className="w-full bg-background-dark/10 rounded-full h-1.5">
                <div className="bg-warning h-1.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border-light dark:border-border-dark">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Join Date</p>
              <p className="font-mono text-lg text-text-primary dark:text-text-dark-primary">
                {auth?.user?.createdAt 
                  ? new Date(auth.user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '01 January 2025'}
              </p>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}
