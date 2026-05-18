import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { callsApi } from '../../api/callsApi';
import { usersApi } from '../../api/usersApi';
import { useToast } from '../../context/ToastContext';
import { PhoneCall, CheckCircle2, PhoneOff, Clock, Download } from 'lucide-react';

export function CallTrackingPage() {
  const [calls, setCalls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [callsRes, statsRes, agentsRes] = await Promise.all([
        callsApi.getCalls({ agent: selectedAgent, date: selectedDate, limit: 100 }),
        callsApi.getCallStats({ agent: selectedAgent }),
        usersApi.getUsers({ role: 'sales_person' })
      ]);

      if (callsRes.success) setCalls(callsRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (agentsRes.success) setAgents(agentsRes.data);
    } catch (err) {
      addToast('error', 'Error', 'Failed to load call tracking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAgent, selectedDate]);

  const totalCalls = stats.reduce((acc, curr) => acc + curr.count, 0);
  const connectedStats = stats.find(s => s._id === 'connected') || { count: 0, total_seconds: 0 };
  const notAnsweredStats = stats.find(s => s._id === 'not_answered') || { count: 0 };
  const totalSeconds = stats.reduce((acc, curr) => acc + curr.total_seconds, 0);
  
  const avgSeconds = totalCalls > 0 ? Math.round(totalSeconds / totalCalls) : 0;
  const avgMins = Math.floor(avgSeconds / 60);
  const avgSecsRemainder = avgSeconds % 60;
  const avgFormatted = `${avgMins}:${avgSecsRemainder.toString().padStart(2, '0')}`;

  const handleExport = () => {
    if (calls.length === 0) {
      addToast('warning', 'No Data', 'No call logs to export.');
      return;
    }

    const headers = ['Customer Name', 'Lead #', 'Mobile', 'Agent', 'Status', 'Duration', 'Notes', 'Date Time'];
    const csvContent = [
      headers.join(','),
      ...calls.map(c => [
        `"${c.customer_name}"`,
        `"${c.lead?.lead_number || ''}"`,
        `"${c.mobile}"`,
        `"${c.agent?.name || ''}"`,
        `"${c.status}"`,
        `"${c.duration}"`,
        `"${c.notes || ''}"`,
        `"${new Date(c.called_at).toLocaleString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `call_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Export Success', 'Call logs exported to CSV.');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Call Tracking"
        subtitle="Monitor agent call logs and connection metrics"
        action={<Button variant="ghost" icon={Download} onClick={handleExport}>Export Call Logs</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat 
          label="Total Calls" 
          value={totalCalls} 
          icon={PhoneCall} 
          color="accent" 
        />
        <Stat 
          label="Connected" 
          value={connectedStats.count} 
          icon={CheckCircle2} 
          color="success" 
        />
        <Stat 
          label="Not Answered" 
          value={notAnsweredStats.count} 
          icon={PhoneOff} 
          color="warning" 
        />
        <Stat 
          label="Avg Duration" 
          value={avgFormatted} 
          icon={Clock} 
          color="info" 
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select 
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            options={[
              { value: '', label: 'All Agents' },
              ...agents.map(a => ({ value: a._id, label: a.name }))
            ]}
            className="w-full md:w-64"
          />
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center p-8 text-sm text-text-muted">No call logs found for the selected filters.</div>
        ) : (
          <Table
            columns={[
              { 
                key: 'customer', 
                label: 'Customer', 
                render: (_, r) => (
                  <div>
                    <div className="font-bold text-sm text-text-primary dark:text-text-dark-primary">{r.customer_name}</div>
                    <div className="text-[10px] font-mono text-text-muted flex items-center gap-2 mt-0.5">
                      <span>{r.lead?.lead_number}</span>
                      <span>•</span>
                      <span>{r.mobile}</span>
                    </div>
                  </div>
                ) 
              },
              { key: 'agent', label: 'Agent', render: (_, r) => <span className="font-medium text-sm">{r.agent?.name}</span> },
              { 
                key: 'status', 
                label: 'Status', 
                render: (v) => <Badge label={v.replace(/_/g, ' ')} color={v === 'connected' ? 'success' : 'warning'} /> 
              },
              { 
                key: 'duration', 
                label: 'Duration', 
                render: (v) => <span className="font-mono text-xs font-bold">{v}</span> 
              },
              { 
                key: 'notes', 
                label: 'Notes', 
                muted: true,
                render: (v) => <span className="text-xs truncate max-w-[200px] inline-block" title={v}>{v || '—'}</span> 
              },
              { 
                key: 'called_at', 
                label: 'Date & Time', 
                muted: true,
                render: (v) => (
                  <span className="text-xs">
                    {new Date(v).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )
              },
            ]}
            rows={calls}
          />
        )}
      </Card>
    </div>
  );
}
