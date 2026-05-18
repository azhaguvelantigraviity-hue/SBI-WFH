import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { callsApi } from '../../api/callsApi';
import { usersApi } from '../../api/usersApi';
import { leadsApi } from '../../api/leadsApi';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, Clock, Search, RefreshCw, UserPlus, PhoneCall } from 'lucide-react';

export function ExceptionFollowupPage() {
  const [calls, setCalls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'exception', 'follow_up'
  
  // Reassign Modal State
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [targetAgent, setTargetAgent] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [callsRes, agentsRes] = await Promise.all([
        callsApi.getCalls({ limit: 200 }),
        usersApi.getUsers({ role: 'sales_person' })
      ]);

      if (callsRes.success) {
        // Filter active flagged calls where the lead's current call_status matches the call record status.
        // This ensures exceptions/followups logged by any user (including admins) and those for unassigned leads are visible,
        // and they remain visible until a new call outcome is logged on that lead.
        const flagged = callsRes.data.filter(c => {
          if (!c.lead || !c.agent) return false;
          const isFlagged = c.status === 'exception' || c.status === 'follow_up';
          
          // If lead has an active call_status, match against it. Otherwise fall back to true.
          const isLatestOutcome = c.lead.call_status ? c.lead.call_status === c.status : true;
          
          return isFlagged && isLatestOutcome;
        });
        setCalls(flagged);
      }
      if (agentsRes.success) {
        setAgents(agentsRes.data);
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to load exception and follow-up data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const totalExceptions = calls.filter(c => c.status === 'exception').length;
  const totalFollowups = calls.filter(c => c.status === 'follow_up').length;
  const totalFlagged = calls.length;

  // Filter call list
  const filteredCalls = calls.filter(c => {
    const matchesSearch = 
      c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      (c.lead?.lead_number && c.lead.lead_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAgent = selectedAgent === '' || (c.agent && c.agent._id === selectedAgent);
    
    const matchesTab = activeTab === 'all' || c.status === activeTab;

    return matchesSearch && matchesAgent && matchesTab;
  });

  const handleOpenReassign = (call) => {
    if (!call.lead) {
      addToast('warning', 'No Lead Link', 'This call record does not have a valid associated lead.');
      return;
    }
    setSelectedCall(call);
    setTargetAgent(call.lead.assigned_to || '');
    setReassignOpen(true);
  };

  const handleReassignSubmit = async () => {
    if (!targetAgent) {
      addToast('warning', 'Selection Required', 'Please select an agent to reassign the lead.');
      return;
    }
    setReassigning(true);
    try {
      const leadId = selectedCall.lead._id || selectedCall.lead;
      const res = await leadsApi.updateLead(leadId, { 
        assigned_to: targetAgent, 
        status: 'assigned' 
      });
      if (res.success) {
        const agentName = agents.find(a => a._id === targetAgent)?.name || 'Agent';
        addToast('success', 'Lead Reassigned', `Successfully reassigned to ${agentName} and sent a real-time notification.`);
        setReassignOpen(false);
        fetchData();
      }
    } catch (err) {
      addToast('error', 'Reassignment Failed', err.response?.data?.message || 'Could not reassign lead.');
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Exception & Follow-up Tracker"
        subtitle="Review and re-assign customer accounts requiring immediate manager attention"
        action={
          <Button variant="ghost" icon={RefreshCw} onClick={fetchData}>
            Refresh Data
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Stat 
          label="Total Flagged Accounts" 
          value={totalFlagged} 
          icon={PhoneCall} 
          color="accent" 
        />
        <Stat 
          label="Active Exceptions" 
          value={totalExceptions} 
          icon={AlertCircle} 
          color="danger" 
        />
        <Stat 
          label="Required Follow-ups" 
          value={totalFollowups} 
          icon={Clock} 
          color="warning" 
        />
      </div>

      <Card className="overflow-hidden">
        {/* Filters and Tabs Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex bg-background-dark/5 dark:bg-background/5 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-card-light dark:bg-card-dark text-text-primary dark:text-text-dark-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary dark:hover:text-text-dark-primary'
              }`}
            >
              All Flagged ({totalFlagged})
            </button>
            <button
              onClick={() => setActiveTab('exception')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'exception'
                  ? 'bg-danger text-white shadow-sm shadow-danger/25'
                  : 'text-text-muted hover:text-danger'
              }`}
            >
              Exceptions ({totalExceptions})
            </button>
            <button
              onClick={() => setActiveTab('follow_up')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'follow_up'
                  ? 'bg-warning text-black shadow-sm shadow-warning/25'
                  : 'text-text-muted hover:text-warning'
              }`}
            >
              Follow-ups ({totalFollowups})
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl w-full sm:w-64">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search name, mobile, lead..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-text-primary dark:text-text-dark-primary placeholder:text-text-muted"
              />
            </div>

            {/* Agent Select */}
            <Select 
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              options={[
                { value: '', label: 'All Logged Agents' },
                ...agents.map(a => ({ value: a._id, label: a.name }))
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="text-center p-12 text-sm text-text-muted bg-background-dark/5 dark:bg-background/5 rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark">
            No exception or follow-up accounts found with the selected filters.
          </div>
        ) : (
          <Table
            columns={[
              { 
                key: 'customer', 
                label: 'Customer Info', 
                render: (_, r) => (
                  <div>
                    <div className="font-bold text-sm text-text-primary dark:text-text-dark-primary">{r.customer_name}</div>
                    <div className="text-[10px] font-mono text-text-muted flex items-center gap-2 mt-0.5">
                      <span>{r.lead?.lead_number || 'No Lead ID'}</span>
                      <span>•</span>
                      <span>{r.mobile}</span>
                    </div>
                  </div>
                ) 
              },
              { 
                key: 'agent', 
                label: 'Assigned Agent', 
                render: (_, r) => (
                  <span className="font-medium text-sm text-text-secondary dark:text-text-dark-secondary">
                    {r.agent?.name || 'Unassigned'}
                  </span>
                ) 
              },
              { 
                key: 'status', 
                label: 'Flag Type', 
                render: (v) => (
                  <Badge 
                    label={v === 'exception' ? 'EXCEPTION' : 'FOLLOW UP'} 
                    color={v === 'exception' ? 'danger' : 'warning'} 
                  />
                ) 
              },
              { 
                key: 'notes', 
                label: 'Agent Notes / Reasons', 
                render: (v) => (
                  <span className="text-xs text-text-muted max-w-[280px] inline-block truncate" title={v}>
                    {v || '—'}
                  </span>
                ) 
              },
              { 
                key: 'called_at', 
                label: 'Logged Date', 
                muted: true,
                render: (v) => (
                  <span className="text-xs font-mono">
                    {new Date(v).toLocaleDateString([], { dateStyle: 'short' })}
                  </span>
                )
              },
              { 
                key: 'actions', 
                label: 'Actions', 
                render: (_, r) => (
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    icon={UserPlus} 
                    onClick={() => handleOpenReassign(r)}
                  >
                    Reassign
                  </Button>
                ) 
              },
            ]}
            rows={filteredCalls}
          />
        )}
      </Card>

      {/* Reassign Agent Modal */}
      <Modal
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
        title="Reassign Customer Lead"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setReassignOpen(false)} disabled={reassigning}>
              Cancel
            </Button>
            <Button onClick={handleReassignSubmit} isLoading={reassigning}>
              Assign & Notify Agent
            </Button>
          </div>
        }
      >
        {selectedCall && (
          <div className="space-y-4">
            <div className="bg-background-dark/5 dark:bg-background/5 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Customer Name:</span>
                <span className="text-xs font-bold text-text-primary dark:text-text-dark-primary">{selectedCall.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Lead Number:</span>
                <span className="text-xs font-mono font-bold text-text-primary dark:text-text-dark-primary">{selectedCall.lead?.lead_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Current Call Flag:</span>
                <Badge 
                  label={selectedCall.status === 'exception' ? 'EXCEPTION' : 'FOLLOW UP'} 
                  color={selectedCall.status === 'exception' ? 'danger' : 'warning'} 
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Agent Reason:</span>
                <span className="text-xs italic text-text-muted text-right max-w-[200px] truncate block" title={selectedCall.notes}>
                  "{selectedCall.notes || 'No notes left'}"
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Select New Sales Agent
              </label>
              <Select 
                value={targetAgent}
                onChange={(e) => setTargetAgent(e.target.value)}
                options={[
                  { value: '', label: '— Select Sales Person —' },
                  ...agents.map(a => ({ value: a._id, label: a.name }))
                ]}
              />
              <p className="text-[10px] text-text-muted leading-relaxed mt-1.5">
                Note: Re-assigning this lead will instantly transfer the customer account and trigger a real-time header alert notification on the selected agent's dashboard.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
