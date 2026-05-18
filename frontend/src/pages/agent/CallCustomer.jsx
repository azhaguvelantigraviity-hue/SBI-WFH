import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { leadsApi } from '../../api/leadsApi';
import { callsApi } from '../../api/callsApi';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { PhoneCall, Calendar, CheckCircle2, AlertCircle, FileText, User } from 'lucide-react';
import { cn } from '../../utils/cn';

export function CallCustomerPage() {
  const [leads, setLeads] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  
  const [form, setForm] = useState({
    status: 'connected',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [leadsRes, logsRes] = await Promise.all([
        leadsApi.getLeads({ limit: 100 }), // Automatically filtered to active agent's assigned leads
        callsApi.getCalls({ date: today, limit: 20 })
      ]);

      if (leadsRes.success) setLeads(leadsRes.data);
      if (logsRes.success) setCallLogs(logsRes.data);
    } catch (err) {
      addToast('error', 'Error', 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeLead = leads.find(l => l._id === selectedLead);

  const handleSaveLog = async () => {
    if (!selectedLead) return addToast('warning', 'Required', 'Please select a lead first.');

    setSaving(true);
    try {
      const payload = {
        lead_id: selectedLead,
        status: form.status,
        duration: '—',
        duration_seconds: 0,
        notes: form.notes,
        lead_status_after: 'in_progress', // Move lead to in_progress stage
      };

      const res = await callsApi.logCall(payload);
      if (res.success) {
        addToast('success', 'Status Logged', 'Lead call status saved successfully.');
        setForm({ status: 'connected', notes: '' });
        setSelectedLead('');
        fetchData(); // Refresh list & today's logs
      }
    } catch (err) {
      addToast('error', 'Error', 'Could not save call log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Update Call Status"
        subtitle="Log customer interactions and update pipeline statuses directly"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Update Status Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Log Call Outcome">
            <div className="mt-4 space-y-6">
              
              {/* Select Lead */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Select Customer Lead
                </label>
                <Select 
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                  options={[
                    { value: '', label: '— Choose a lead —' },
                    ...leads.map(l => ({ value: l._id, label: `${l.customer_name} • ${l.mobile}` }))
                  ]}
                  className="w-full"
                />
              </div>

              {/* Selected Lead Summary Info */}
              {activeLead ? (
                <div className="bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3 border-b border-border-light dark:border-border-dark pb-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">{activeLead.customer_name}</h4>
                      <p className="text-xs font-mono text-text-muted mt-0.5">{activeLead.mobile}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Lead ID</span>
                      <span className="font-mono font-bold text-text-primary dark:text-text-dark-primary">{activeLead.lead_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Current Status</span>
                      <div className="mt-0.5">
                        <Badge label={activeLead.status.replace(/_/g, ' ')} color={activeLead.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Pincode</span>
                      <span className="font-mono font-medium text-text-primary dark:text-text-dark-primary">{activeLead.pincode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">State/District</span>
                      <span className="text-text-primary dark:text-text-dark-primary truncate block" title={`${activeLead.district}, ${activeLead.state}`}>
                        {activeLead.district || '—'}, {activeLead.state || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-background-dark/5 dark:bg-background/5 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-text-muted max-w-[200px] leading-relaxed">
                    Please select an assigned customer lead above to load details and update status.
                  </p>
                </div>
              )}

              {/* Status and Notes Fields */}
              <div className="space-y-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Call Outcome Status
                  </label>
                  <Select 
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    options={[
                      { value: 'connected', label: 'Connected' },
                      { value: 'not_connected', label: 'Not Connected' },
                      { value: 'busy', label: 'Number Busy' },
                      { value: 'switched_off', label: 'Switched Off' },
                      { value: 'follow_up', label: 'Follow Up (Needs callback)' },
                      { value: 'exception', label: 'Exception (Verification issue)' },
                    ]}
                    className="w-full"
                    disabled={!selectedLead}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Call Notes & Logs
                  </label>
                  <textarea 
                    placeholder="Enter call notes or exception reasons here..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent min-h-[100px] resize-none"
                    disabled={!selectedLead}
                  />
                </div>

                <Button 
                  className="w-full py-3" 
                  onClick={handleSaveLog}
                  disabled={saving || !selectedLead}
                  icon={CheckCircle2}
                >
                  {saving ? 'Saving Outcome...' : 'Save Call Status'}
                </Button>
              </div>

            </div>
          </Card>
        </div>

        {/* Today's Call Log Panel */}
        <div className="lg:col-span-7">
          <Card title="Today's Status Log" className="h-full min-h-[500px]">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : callLogs.length === 0 ? (
              <div className="text-center p-8 text-sm text-text-muted mt-8">No status changes logged today.</div>
            ) : (
              <div className="mt-6 space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-light dark:before:via-border-dark before:to-transparent">
                {callLogs.map((log, i) => {
                  const isConnected = log.status === 'connected';
                  const isException = log.status === 'exception';
                  const isFollowup = log.status === 'follow_up';

                  return (
                    <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                      {/* Timeline Dot */}
                      <div className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
                        isException ? "bg-danger border-danger/20" : isFollowup ? "bg-warning border-warning/20" : isConnected ? "bg-success border-success/20" : "bg-text-muted/40 border-text-muted/10",
                        "dark:bg-background-dark border-background"
                      )}></div>
                      
                      {/* Card Content */}
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-border-light dark:border-border-dark bg-background-dark/5 dark:bg-background/5">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary">{log.customer_name}</h4>
                          <span className="text-[10px] font-bold text-text-muted">
                            {new Date(log.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted mb-2">
                          <span className={cn(
                            "font-bold uppercase",
                            isException ? "text-danger" : isFollowup ? "text-warning" : isConnected ? "text-success" : "text-text-muted"
                          )}>
                            {log.status.replace(/_/g, ' ')}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[9px]">{log.lead?.lead_number || 'No ID'}</span>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-text-secondary mt-2 bg-background-dark/10 dark:bg-background/10 p-2 rounded-lg italic">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
