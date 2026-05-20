import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../../api/notificationsApi';

export function Topbar({ title, onPageChange }) {
  const { auth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activePopup, setActivePopup] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds for a real-time experience
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Popup logic for unread alerts on dashboard load / notification update
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadAlerts = notifications.filter(n => {
        if (n.read) return false;
        
        const isTargetType = n.type === 'lead_assigned' || n.type === 'qd_dispatched' || n.type === 'qd_submitted' || n.type === 'system' || n.type === 'lead_request';
        const hasKeyword = n.title?.toLowerCase().includes('approve') || 
                            n.title?.toLowerCase().includes('reject') || 
                            n.title?.toLowerCase().includes('assign') ||
                            n.title?.toLowerCase().includes('request') ||
                            n.message?.toLowerCase().includes('approve') ||
                            n.message?.toLowerCase().includes('reject') ||
                            n.message?.toLowerCase().includes('assign') ||
                            n.message?.toLowerCase().includes('request');
                            
        if (!isTargetType && !hasKeyword) return false;

        const poppedList = JSON.parse(sessionStorage.getItem('popped_notifications') || '[]');
        return !poppedList.includes(n._id);
      });

      if (unreadAlerts.length > 0) {
        const target = unreadAlerts[0];
        setActivePopup(target);
        
        const poppedList = JSON.parse(sessionStorage.getItem('popped_notifications') || '[]');
        unreadAlerts.forEach(alert => {
          if (!poppedList.includes(alert._id)) poppedList.push(alert._id);
        });
        sessionStorage.setItem('popped_notifications', JSON.stringify(poppedList));
      }
    }
  }, [notifications]);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleNotificationRedirect = (n) => {
    handleNotificationClick(n._id);
    const isAgent = auth?.roleKey === 'sales_person';
    let targetPage = isAgent ? 'sp-dashboard' : 'dashboard';

    if (n.type === 'lead_assigned') {
      targetPage = isAgent ? 'sp-leads' : 'leads';
    } else if (n.type === 'lead_request') {
      targetPage = 'assign'; // Admins go to Assign Leads
    } else if (n.type === 'qd_submitted') {
      targetPage = isAgent ? 'sp-leads' : 'qd';
    } else if (n.type === 'qd_dispatched' || n.title?.toLowerCase().includes('approve')) {
      targetPage = isAgent ? 'sp-leads' : 'qd';
    } else if (n.title?.toLowerCase().includes('reject')) {
      targetPage = isAgent ? 'sp-leads' : 'qd';
    }

    if (onPageChange) {
      onPageChange(targetPage);
    }
    
    setShowNotifications(false);
    setActivePopup(null);
  };

  const getNotificationIconInfo = (type) => {
    switch (type) {
      case 'lead_assigned':
        return { icon: UserCheck, color: 'text-accent bg-accent/10' };
      case 'lead_request':
        return { icon: UserPlus, color: 'text-warning bg-warning/10' };
      case 'qd_submitted':
        return { icon: Clock, color: 'text-warning bg-warning/10' };
      case 'qd_dispatched':
        return { icon: CheckCircle2, color: 'text-success bg-success/10' };
      default:
        return { icon: Bell, color: 'text-info bg-info/10' };
    }
  };

  const formatTimeAgo = (dateStr) => {
    const created = new Date(dateStr);
    const diffMs = new Date() - created;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHrs = Math.round(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    const diffDays = Math.round(diffHrs / 24);
    return `${diffDays}d`;
  };

  return (
    <header className="sticky top-0 h-16 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark flex items-center px-8 z-40">
      <h2 className="flex-1 font-fraunces font-bold text-lg text-text-primary dark:text-text-dark-primary">
        {title}
      </h2>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl w-64 group transition-all focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent">
          <Search className="w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-xs w-full text-text-primary dark:text-text-dark-primary placeholder:text-text-muted"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark text-text-secondary dark:text-text-dark-secondary hover:bg-background-dark/10 dark:hover:bg-background/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark text-text-secondary dark:text-text-dark-secondary hover:bg-background-dark/10 dark:hover:bg-background/10 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-card-light dark:border-card-dark" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-2xl overflow-hidden z-20"
                  >
                    <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                      <span className="font-bold text-sm">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-accent uppercase tracking-wider hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((n) => {
                        const { icon: Icon, color: iconColor } = getNotificationIconInfo(n.type);
                        return (
                          <div 
                            key={n._id} 
                            onClick={() => handleNotificationRedirect(n)}
                            className={cn(
                              "p-4 border-b border-border-light dark:border-border-dark last:border-none flex gap-3 hover:bg-background-dark/5 dark:hover:bg-background/5 transition-colors cursor-pointer",
                              !n.read && "bg-accent/5 dark:bg-accent/5"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", iconColor)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className={cn("text-xs text-text-primary dark:text-text-dark-primary", !n.read ? "font-bold" : "font-normal")}>
                                {n.title}
                              </h4>
                              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[9px] text-text-muted mt-2 block font-medium uppercase tracking-wider">
                                {formatTimeAgo(n.createdAt)} ago
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {notifications.length === 0 && (
                        <div className="p-8 text-center text-xs text-text-muted">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-8 w-px bg-border-light dark:border-border-dark mx-1" />

        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <h4 className="text-xs font-bold text-text-primary dark:text-text-dark-primary">{auth?.name}</h4>
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{auth?.role?.replace('_', ' ')}</p>
          </div>
          <Avatar name={auth?.name} src={auth?.user?.avatar} size="sm" />
        </div>
      </div>

      {/* Premium Notification Popup Modal */}
      <AnimatePresence>
        {activePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-purple-500 to-indigo-500" />
              
              <div className="flex items-center gap-4 mb-4 mt-2">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                  activePopup.type === 'qd_dispatched' || activePopup.title?.toLowerCase().includes('approve')
                    ? "bg-success/15 text-success"
                    : activePopup.type === 'lead_request' || activePopup.title?.toLowerCase().includes('request')
                    ? "bg-warning/15 text-warning"
                    : activePopup.title?.toLowerCase().includes('reject')
                    ? "bg-danger/15 text-danger"
                    : "bg-accent/15 text-accent"
                )}>
                  {activePopup.type === 'qd_dispatched' || activePopup.title?.toLowerCase().includes('approve') ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : activePopup.type === 'lead_request' || activePopup.title?.toLowerCase().includes('request') ? (
                    <UserPlus className="w-6 h-6" />
                  ) : activePopup.title?.toLowerCase().includes('reject') ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <UserCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-0.5">
                    New Alert
                  </span>
                  <h3 className="text-base font-bold text-text-primary dark:text-text-dark-primary leading-tight">
                    {activePopup.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-background-dark/5 dark:bg-background/5 rounded-2xl mb-6 border border-border-light/40 dark:border-border-dark/40">
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed font-medium">
                  {activePopup.message}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    handleNotificationClick(activePopup._id);
                    setActivePopup(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:bg-background-dark/5 dark:hover:bg-background/5 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleNotificationRedirect(activePopup)}
                  className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white text-xs font-bold rounded-xl shadow-md shadow-accent/20 hover:shadow-accent/30 transition-all flex items-center gap-1.5"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
