import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { dashboardApi } from '../../api/dashboardApi';
import { usersApi } from '../../api/usersApi';
import { PhoneCall, CheckCircle2, TrendingUp, XCircle, Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

export function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, agentsRes] = await Promise.all([
          dashboardApi.getStats(),
          usersApi.getUsers({ role: 'sales_person' })
        ]);

        if (statsRes.success) setStats(statsRes.data.stats);
        if (agentsRes.success) setAgents(agentsRes.data);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Failed to load report data.';
        addToast('error', 'Error', `Failed to load report data: ${errMsg}`);
        console.error('Reports load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRejectionReasons = () => [
    { reason: 'PAN Already Exists', count: 22, percentage: 55, color: 'bg-pink-500' },
    { reason: 'Invalid Pincode', count: 12, percentage: 30, color: 'bg-yellow-500' },
    { reason: 'Not Interested', count: 4, percentage: 10, color: 'bg-purple-500' },
    { reason: 'Other', count: 2, percentage: 5, color: 'bg-green-500' },
  ];

  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', 'Downloaded', `${filename} exported successfully.`);
  };

  const handleExportAgents = () => {
    const headers = ['Agent Name', 'Employee ID', 'Email', 'Mobile', 'Eligible Leads', 'Dispatched', 'Conversion Rate %', 'Status'];
    const rows = agents.map(a => {
      const total = a.leads || 0;
      const disp = a.dispatched || 0;
      const rate = total > 0 ? Math.round((disp / total) * 100) : 0;
      return [a.name, a.employee_id, a.email, a.mobile, total, disp, rate, a.status];
    });
    downloadCSV(`Agent_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleExportDailyReport = () => {
    const headers = ['Date', 'Total Calls', 'Connected Calls', 'Conversion Rate %', 'Rejected Leads'];
    const today = new Date().toLocaleDateString('en-IN');
    const rows = [
      [today, stats?.total_calls || 0, stats?.connected_calls || 0, stats?.connection_rate || 0, 40],
      ...getRejectionReasons().map(r => [`Rejection - ${r.reason}`, '', '', '', r.count])
    ];
    downloadCSV(`Daily_Lead_Report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Reports & Analytics"
        subtitle="Comprehensive sales performance insights"
        action={
          <div className="flex gap-3">
            <select className="bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Quarter to Date</option>
            </select>
            <Button variant="ghost" icon={Download} onClick={handleExportAgents}>Export CSV</Button>
          </div>
        }
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Calls</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-fraunces font-bold text-purple-500">{stats?.total_calls?.toLocaleString() || 0}</h3>
            <PhoneCall className="w-6 h-6 text-purple-500 opacity-20 group-hover:scale-110 transition-transform" />
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-success opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Connected</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-fraunces font-bold text-success">{stats?.connected_calls?.toLocaleString() || 0}</h3>
            <CheckCircle2 className="w-6 h-6 text-success opacity-20 group-hover:scale-110 transition-transform" />
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-warning opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Conversion Rate</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-fraunces font-bold text-warning">{stats?.connection_rate || 0}%</h3>
            <TrendingUp className="w-6 h-6 text-warning opacity-20 group-hover:scale-110 transition-transform" />
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-danger opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Rejected Leads</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-fraunces font-bold text-danger">40</h3>
            <XCircle className="w-6 h-6 text-danger opacity-20 group-hover:scale-110 transition-transform" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <Card title="Agent Performance">
          <div className="mt-2">
            <Table
              columns={[
                { key: 'name', label: 'Agent', render: (v) => <span className="font-bold text-sm">{v}</span> },
                { key: 'calls', label: 'Calls', render: () => <span className="text-text-muted">—</span> }, // Mocked as API doesn't return calls per agent yet
                { key: 'leads', label: 'Eligible', render: (v) => v || 0 },
                { key: 'qd', label: 'QD', render: () => <span className="text-text-muted">—</span> },
                { key: 'dispatched', label: 'Dispatched', render: (v) => <span className="font-bold">{v || 0}</span> },
                { 
                  key: 'rate', 
                  label: 'Rate', 
                  render: (_, r) => {
                    const total = r.leads || 0;
                    const disp = r.dispatched || 0;
                    const rate = total > 0 ? Math.round((disp / total) * 100) : 0;
                    return <span className={cn("font-bold", rate > 50 ? "text-success" : rate > 20 ? "text-warning" : "text-danger")}>{rate}%</span>;
                  } 
                },
              ]}
              rows={agents}
            />
          </div>
        </Card>

        {/* Rejection Reasons */}
        <Card title="Rejection Reasons">
          <div className="mt-6 space-y-6">
            {getRejectionReasons().map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-text-secondary">{item.reason}</span>
                  <span className="text-text-muted text-xs">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-background-dark/10 dark:bg-background/10 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                    style={{ width: `${item.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Daily Lead Report */}
      <Card title="Daily Lead Report" action={<Button variant="ghost" size="sm" icon={Download} onClick={handleExportDailyReport}>Export CSV</Button>}>
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl mt-4">
          <TrendingUp className="w-8 h-8 text-text-muted mb-3 opacity-50" />
          <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">Daily Analytics Chart</p>
          <p className="text-xs text-text-muted mt-1">Click "Export CSV" above to download today's report</p>
        </div>
      </Card>
    </div>
  );
}
