import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { Monitor, Moon, Sun, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export function LoginPage() {
  const { login, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@sbi.com');
  const [password, setPassword] = useState('Admin@123');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setEmail('admin@sbi.com');
      setPassword('Admin@123');
    } else {
      setEmail('arjun@sbi.com');
      setPassword('Sales@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      addToast('success', 'Welcome back!', `Successfully signed in.`);
    } else {
      addToast('error', 'Login Failed', res.message);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-success/5 blur-[120px] pointer-events-none" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-secondary dark:text-text-dark-secondary hover:shadow-lg transition-all"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-[32px] p-8 sm:p-10 shadow-premium dark:shadow-premium-dark relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#00a4e4" />
              <circle cx="50" cy="50" r="15" fill="#fff" />
              <rect x="46" y="50" width="8" height="45" fill="#fff" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-text-primary dark:text-text-dark-primary tracking-tight">
            SBI Online Login
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-2 font-bold text-xs tracking-widest uppercase">
            WFH Sales Team Portal
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex p-1 bg-background-dark/5 dark:bg-background/5 rounded-2xl mb-8 border border-border-light/50 dark:border-border-dark/50">
          <button
            onClick={() => handleRoleChange('admin')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              role === 'admin' 
                ? "bg-white dark:bg-card-dark text-accent shadow-sm ring-1 ring-border-light/50 dark:ring-border-dark/50" 
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => handleRoleChange('sales')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              role === 'sales' 
                ? "bg-white dark:bg-card-dark text-accent shadow-sm ring-1 ring-border-light/50 dark:ring-border-dark/50" 
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Users className="w-4 h-4" />
            Sales Person
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="you@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="space-y-1">
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border-light dark:border-border-dark text-accent focus:ring-accent/20" />
                <span className="text-xs text-text-secondary dark:text-text-dark-secondary font-medium group-hover:text-text-primary transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-accent hover:underline">Forgot password?</button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-3.5 rounded-2xl text-base shadow-xl shadow-accent/20 mt-4" 
            disabled={authLoading}
          >
            {authLoading ? 'Signing in...' : 'Sign In'}
            {!authLoading && <ArrowRight className="w-4.5 h-4.5" />}
          </Button>
        </form>

        <p className="mt-8 text-center text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] opacity-60">
          Secure JWT Authentication
        </p>
      </motion.div>
    </div>
  );
}
