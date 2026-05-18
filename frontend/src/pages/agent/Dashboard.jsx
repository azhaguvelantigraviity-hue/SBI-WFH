import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { dashboardApi } from '../../api/dashboardApi';
import { leadsApi } from '../../api/leadsApi';
import { callsApi } from '../../api/callsApi';
import { 
  FileText, 
  CheckCircle2, 
  ArrowUpRight, 
  Award,
  TrendingUp,
  Clock,
  PhoneCall,
  UserPlus
} from 'lucide-react';

export function AgentDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, leadsRes, callsRes] = await Promise.all([
          dashboardApi.getAgentStats(),
          leadsApi.getLeads({ limit: 5 }),
          callsApi.getCalls({ limit: 5 })
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (leadsRes.success) setRecentLeads(leadsRes.data);
        if (callsRes.success) setRecentCalls(callsRes.data);
      } catch (err) {
        console.error('Failed to fetch agent dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader 
        title="My Performance" 
        subtitle="Daily tracking and lead status overview"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat 
          label="Assigned Leads" 
          value={stats?.my_leads || 0} 
          icon={UserPlus} 
          color="accent" 
        />
        <Stat 
          label="Successful Dispatched" 
          value={stats?.my_dispatched || 0} 
          icon={CheckCircle2} 
          color="success" 
        />
        <Stat 
          label="Total Calls" 
          value={stats?.my_calls || 0} 
          icon={PhoneCall} 
          color="warning" 
        />
        <Stat 
          label="My Earnings" 
          value={`₹${(stats?.total_earnings || 0).toLocaleString()}`} 
          icon={Award} 
          color="info" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="My Recent Leads">
            <Table
              columns={[
                { key: 'lead_number', label: 'Lead #', muted: true },
                { key: 'customer_name', label: 'Customer', render: (v) => <span className="font-bold">{v}</span> },
                { 
                  key: 'call_status', 
                  label: 'Status', 
                  render: (v) => {
                    const statusVal = v || 'pending';
                    return <Badge label={statusVal.replace(/_/g, ' ')} color={statusVal} />;
                  }
                },
                { key: 'updatedAt', label: 'Last Action', render: (v) => new Date(v).toLocaleDateString(), muted: true },
              ]}
              rows={recentLeads}
            />
          </Card>

          <Card title="Monthly Progress">
            <div className="p-4 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Dispatch Target</span>
                  <span>{stats?.my_dispatched || 0} / 30</span>
                </div>
                <ProgressBar value={Math.min(((stats?.my_dispatched || 0) / 30) * 100, 100)} color="accent" size="lg" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Connection Rate</p>
                  <p className="text-xl font-bold mt-1">72%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Avg. Call Time</p>
                  <p className="text-xl font-bold mt-1">4:12</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Recent Calls">
            <div className="space-y-5">
              {recentCalls.map((call, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    call.status === 'connected' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{call.customer_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-text-muted" />
                      <span className="text-[10px] font-bold text-text-muted">{call.duration}</span>
                      <Badge label={call.status} color={call.status === 'connected' ? 'success' : 'warning'} size="xs" />
                    </div>
                  </div>
                </div>
              ))}
              {recentCalls.length === 0 && <p className="text-sm text-text-muted text-center py-4">No calls logged yet.</p>}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-accent/5 border-accent/20">
            <h4 className="font-bold text-sm mb-2">Quick Tip</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Leads with "QD Pending" status should be followed up within 24 hours to maximize conversion rates.
            </p>
            <Button variant="ghost" className="w-full mt-4 text-[10px] text-accent">Learn More</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
