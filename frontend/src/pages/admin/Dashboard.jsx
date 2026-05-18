import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { dashboardApi } from '../../api/dashboardApi';
import { 
  FileText, 
  CheckCircle2, 
  ArrowUpRight, 
  Award,
  ChevronRight,
  TrendingUp,
  History,
  AlertCircle,
  Clock
} from 'lucide-react';

export function AdminDashboard({ onNav }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
        <AlertCircle className="w-12 h-12 text-danger mb-4" />
        <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary mb-1">Failed to load dashboard</h3>
        <p className="text-sm">Please check your network or user permissions.</p>
      </div>
    );
  }

  const { stats, recent_leads, recent_calls, top_performers } = data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader 
        title="Admin Overview" 
        subtitle="Real-time performance metrics across all channels"
      />

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat 
          label="Total Leads" 
          value={stats.total_leads.toLocaleString()} 
          icon={FileText} 
          trend="+12%" 
          color="accent" 
        />
        <Stat 
          label="Eligible Cases" 
          value={stats.eligible.toLocaleString()} 
          icon={CheckCircle2} 
          trend="+5%" 
          color="success" 
        />
        <Stat 
          label="Dispatched" 
          value={stats.dispatched.toLocaleString()} 
          icon={ArrowUpRight} 
          trend="+18%" 
          color="warning" 
        />
        <Stat 
          label="Net Incentives" 
          value={`₹${(stats.total_incentive_paid / 1000).toFixed(1)}K`} 
          icon={Award} 
          trend="+22%" 
          color="info" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Recent Lead Activity" action={<Button variant="ghost" size="sm" onClick={() => onNav('leads')}>View All</Button>}>
            <Table
              columns={[
                { 
                  key: 'customer_name', 
                  label: 'Customer', 
                  render: (v) => (
                    <div className="flex items-center gap-3">
                      <Avatar name={v} size="xs" />
                      <span className="font-bold">{v}</span>
                    </div>
                  ) 
                },
                { 
                  key: 'call_status', 
                  label: 'Status', 
                  render: (v) => {
                    const statusVal = v || 'pending';
                    return <Badge label={statusVal.replace(/_/g, ' ')} color={statusVal} />;
                  }
                },
                { key: 'assigned_to', label: 'Agent', render: (v) => v?.name || '—', muted: true },
                { key: 'updatedAt', label: 'Time', render: (v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), muted: true },
              ]}
              rows={recent_leads}
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Top Performing Agents">
              <div className="space-y-6 pt-2">
                {top_performers.map((agent, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{agent.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <ProgressBar value={Math.min((agent.dispatched / 30) * 100, 100)} color={i === 0 ? 'success' : 'accent'} size="sm" />
                        <span className="text-[10px] font-bold text-text-muted">{agent.dispatched}</span>
                      </div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-success opacity-50" />
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Quick Actions">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Upload Data', id: 'upload', icon: FileText },
                  { label: 'Assign Leads', id: 'assign', icon: History },
                  { label: 'View Reports', id: 'reports', icon: TrendingUp },
                  { label: 'System Settings', id: 'settings', icon: ChevronRight },
                ].map(action => (
                  <button 
                    key={action.id}
                    onClick={() => onNav(action.id)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <action.icon className="w-6 h-6 text-text-muted group-hover:text-accent mb-2" />
                    <span className="text-[11px] font-bold text-text-secondary dark:text-text-dark-secondary text-center leading-tight">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Feed Section */}
        <div className="space-y-8">
          <Card title="Live Call Tracking">
            <div className="space-y-6">
              {recent_calls.map((call, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    call.status === 'connected' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {call.status === 'connected' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm truncate">{call.customer_name}</h4>
                      <span className="text-[10px] font-bold text-text-muted">{new Date(call.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 truncate">by {call.agent?.name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary dark:text-text-dark-secondary">
                        <Clock className="w-3 h-3" />
                        {call.duration}
                      </div>
                      <Badge label={call.status} color={call.status === 'connected' ? 'success' : 'warning'} />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-4 text-[11px] font-bold uppercase tracking-widest py-3">View Full Logs</Button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-accent-light text-white border-none shadow-xl shadow-accent/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <h3 className="font-fraunces font-bold text-xl leading-tight mb-2">Quarterly Target</h3>
              <p className="text-white/80 text-sm mb-6">You've reached 84% of the team goal for June 2025.</p>
              <ProgressBar value={84} color="white" size="lg" className="bg-white/20 mb-6" />
              <Button variant="white" className="w-full text-accent">Manage Incentives</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
