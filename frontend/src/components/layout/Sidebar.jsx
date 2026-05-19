import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_NAV, SALES_NAV } from '../../data/seedData';
import { Avatar } from '../ui/Avatar';
import { LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '../../utils/cn';
import { leadsApi } from '../../api/leadsApi';
import { usersApi } from '../../api/usersApi';
import { qdApi } from '../../api/qdApi';

export function Sidebar({ activePage, onPageChange }) {
  const { theme, toggleTheme } = useTheme();
  const { auth, logout } = useAuth();
  const isAgent = auth?.roleKey === 'sales_person';
  const nav = isAgent ? SALES_NAV : ADMIN_NAV;

  const [counts, setCounts] = useState({
    salespersons: 0,
    leads: 0,
    assign: 0,
    qd: 0,
    'sp-leads': 0,
    'sp-qd': 0
  });

  const fetchCounts = async () => {
    try {
      if (!auth) return;
      if (isAgent) {
        // Fetch My Leads total count (includes assigned, in_progress, eligible, etc.)
        // For My Leads page
        const [leadsRes, qdRes] = await Promise.all([
          leadsApi.getLeads({ limit: 1 }),
          leadsApi.getLeads({ status: 'eligible', limit: 1 })
        ]);
        setCounts(prev => ({
          ...prev,
          'sp-leads': leadsRes.success ? leadsRes.total : 0,
          'sp-qd': qdRes.success ? qdRes.total : 0
        }));
      } else {
        // Fetch Admin dashboard sidebar counts
        const [usersRes, leadsRes, assignRes, qdRes] = await Promise.all([
          usersApi.getUsers({ role: 'sales_person' }),
          leadsApi.getLeads({ limit: 1 }),
          leadsApi.getLeads({ status: 'new', assigned_to: 'unassigned', limit: 1 }),
          qdApi.getQDs({ status: 'pending', limit: 1 })
        ]);
        
        const salespersonCount = usersRes.success 
          ? (Array.isArray(usersRes.data) ? usersRes.data.length : (Array.isArray(usersRes) ? usersRes.length : 0))
          : 0;

        setCounts(prev => ({
          ...prev,
          salespersons: salespersonCount,
          leads: leadsRes.success ? leadsRes.total : 0,
          assign: assignRes.success ? assignRes.total : 0,
          qd: qdRes.success ? qdRes.total : 0
        }));
      }
    } catch (err) {
      console.error('Failed to fetch sidebar counts:', err);
    }
  };

  useEffect(() => {
    fetchCounts();
    // Poll every 10 seconds to keep the numbers perfectly synced with the database
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [auth, isAgent]);

  return (
    <aside className={cn(
      "fixed top-0 left-0 h-screen w-64 border-r flex flex-col z-50 transition-colors duration-300 bg-sidebar-light dark:bg-sidebar-dark border-border-light dark:border-border-dark"
    )}>
      {/* Logo Area */}
      <div className="p-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 select-none shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#00a4e4" />
              <circle cx="50" cy="50" r="15" fill="#fff" />
              <rect x="46" y="50" width="8" height="45" fill="#fff" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-text-primary dark:text-text-dark-primary select-none">
              SBI Online Login
            </h1>
            <p className="text-[9px] font-extrabold text-text-muted tracking-widest uppercase opacity-75">
              WFH PORTAL
            </p>
          </div>
        </div>
        
        {/* Role Tag */}
        <div className={cn(
          "mt-5 px-3.5 py-2 rounded-xl flex items-center gap-2.5 border transition-all",
          isAgent 
            ? "bg-accent/10 border-accent/20 text-accent shadow-sm" 
            : "bg-background-dark/5 dark:bg-background/5 border-transparent text-text-muted"
        )}>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(46,204,143,0.5)]" />
          <span className="text-[11px] font-bold tracking-wider uppercase">
            {isAgent ? 'Sales Person' : 'Administrator'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-7 custom-scrollbar">
        {nav.map(section => (
          <div key={section.section}>
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-text-muted/60">
              {section.section}
            </h3>
            <div className="space-y-1.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 group relative",
                      isActive 
                        ? "bg-accent/10 text-accent shadow-sm ring-1 ring-accent/10"
                        : "text-text-secondary dark:text-text-dark-secondary hover:bg-background-dark/5 dark:hover:bg-background/5 hover:text-text-primary dark:hover:text-text-dark-primary"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full shadow-[0_0_8px_rgba(123,94,167,0.4)]" />
                    )}
                    
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                      isActive ? "bg-accent/10" : "bg-transparent"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                      )} />
                    </div>

                    <span className="flex-1 text-left">{item.label}</span>
                    
                    {(() => {
                      const badgeValue = counts[item.id];
                      // If the badge is not dynamic (i.e. not tracked in dynamic counts), fall back to seedData
                      if (badgeValue === undefined) {
                        if (!item.badge) return null;
                        return (
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm",
                            item.badgeColor === 'warning' 
                              ? "bg-yellow-400 text-black" 
                              : "bg-emerald-500 text-white"
                          )}>
                            {item.badge}
                          </span>
                        );
                      }
                      // Hide badge when count is 0 for premium aesthetics
                      if (badgeValue <= 0) return null;
                      return (
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-fade-in",
                          item.badgeColor === 'warning' 
                            ? "bg-yellow-400 text-black" 
                            : "bg-emerald-500 text-white"
                        )}>
                          {badgeValue}
                        </span>
                      );
                    })()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t space-y-3 border-border-light dark:border-border-dark bg-background-dark/5 dark:bg-background/5">
        {/* User Info */}
        <div className="flex items-center gap-3 p-1">
          <div className="relative">
            <Avatar name={auth?.name} size="sm" className="ring-2 ring-accent/20" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-white dark:border-card-dark rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold truncate text-text-primary dark:text-text-dark-primary">
              {auth?.name}
            </h4>
            <p className="text-[10px] text-text-muted font-bold truncate uppercase opacity-60">
              {auth?.employee_id || auth?.roleKey}
            </p>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/5 transition-all"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
