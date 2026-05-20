import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { read, utils } from 'xlsx';
import { cn } from '../../utils/cn';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { InfoRow } from '../../components/ui/InfoRow';
import { leadsApi } from '../../api/leadsApi';
import { usersApi } from '../../api/usersApi';
import { useToast } from '../../context/ToastContext';
import { Search, Download, Plus, Filter, ArrowUpDown, Eye, UploadCloud, Zap } from 'lucide-react';

export function LeadsPage({ onNav }) {
  const { auth } = useAuth();
  const isAgent = auth?.roleKey === 'sales_person';
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilter, setShowFilter] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoAssign, setAutoAssign] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const { addToast } = useToast();
  const [editedLeads, setEditedLeads] = useState({});
  const [savingRow, setSavingRow] = useState(null);
  const [requestingLeads, setRequestingLeads] = useState(false);

  const handleRequestLeads = async () => {
    setRequestingLeads(true);
    try {
      const res = await leadsApi.requestLeads();
      if (res.success) {
        addToast('success', 'Request Sent', 'Your request for more leads has been sent to the admin.');
      }
    } catch (err) {
      addToast('error', 'Request Failed', 'Could not send lead request.');
    } finally {
      setRequestingLeads(false);
    }
  };

  const handleRowChange = (leadId, field, value) => {
    setEditedLeads(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [field]: value
      }
    }));
  };

  const getRowValue = (lead, field) => {
    if (editedLeads[lead._id] && editedLeads[lead._id][field] !== undefined) {
      return editedLeads[lead._id][field];
    }
    if (field === 'status') return lead.verification_status || '';
    return lead[field] || '';
  };

  const handleSaveRow = async (lead) => {
    const edits = editedLeads[lead._id];
    if (!edits) {
      addToast('info', 'No Changes', 'No changes made to this row.');
      return;
    }

    const pincodeVal = edits.pincode !== undefined ? edits.pincode : lead.pincode;
    const panVal = edits.pan !== undefined ? edits.pan : lead.pan;
    const statusVal = edits.status !== undefined ? edits.status : lead.verification_status;
    const followUpNotes = edits.follow_up_notes !== undefined ? edits.follow_up_notes : '';

    if (!pincodeVal || !panVal || !statusVal) {
      addToast('warning', 'Validation Error', 'Pincode, PAN Card, and Status are required.');
      return;
    }

    if ((statusVal === 'Follow Up' || statusVal === 'Exception') && !followUpNotes.trim()) {
      addToast('warning', 'Notes Required', 'Please enter comments explaining the follow-up or exception.');
      return;
    }

    // PAN Validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panVal.toUpperCase().trim())) {
      addToast('warning', 'Invalid PAN', 'PAN Card must be in ABCDE1234F format.');
      return;
    }

    // Pincode Validation
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincodeVal.trim())) {
      addToast('warning', 'Invalid Pincode', 'Pincode must be a 6-digit number.');
      return;
    }

    setSavingRow(lead._id);
    try {
      // Map display status to pipeline status
      let newStatus = lead.status;
      if (statusVal === 'Listed Pincode') {
        newStatus = 'eligible';
      } else if (statusVal === 'Pincode Not Listed') {
        newStatus = 'rejected';
      } else if (statusVal === 'Fresh') {
        newStatus = 'assigned';
      } else if (statusVal === 'Follow Up' || statusVal === 'Exception') {
        newStatus = 'in_progress';
      }

      const res = await leadsApi.updateLead(lead._id, {
        pincode: pincodeVal.trim(),
        pan: panVal.toUpperCase().trim(),
        verification_status: statusVal,
        status: newStatus,
        notes: followUpNotes.trim() || `Row updated on My Leads: ${statusVal}`
      });

      if (res.success) {
        addToast('success', 'Lead Saved', `Lead ${lead.customer_name} updated successfully.`);
        setEditedLeads(prev => {
          const updated = { ...prev };
          delete updated[lead._id];
          return updated;
        });
        fetchLeads();
      }
    } catch (err) {
      addToast('error', 'Save Failed', 'Could not save lead changes.');
    } finally {
      setSavingRow(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    addToast('info', 'Processing', `Reading ${file.name}...`);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = utils.sheet_to_json(worksheet);

      if (rows.length === 0) {
        addToast('error', 'Empty File', 'No data found in the file.');
        return;
      }

      const leadsToImport = rows.map(r => {
        const entry = {};
        Object.keys(r).forEach(k => { entry[k.toLowerCase().replace(/\s+/g, '_')] = r[k]; });
        return {
          customer_name: entry.customer_name || entry.name || entry.customer || entry.full_name || '',
          mobile: String(entry.mobile || entry.phone || entry.contact || '').replace(/\D/g, '').slice(0, 10),
          pincode: String(entry.pincode || entry.pin || entry.zip || '').replace(/\D/g, '').slice(0, 6),
        };
      }).filter(l => l.customer_name && l.mobile.length === 10);

      if (leadsToImport.length === 0) {
        addToast('error', 'Import Error', 'No valid leads found. Check headers (Name, Mobile).');
        return;
      }

      const res = await leadsApi.bulkImport(leadsToImport, autoAssign);

      if (res.success) {
        addToast('success', 'Import Success', autoAssign 
          ? `${res.results.created} leads imported and auto-assigned.` 
          : `${res.results.created} leads imported cleanly as unassigned.`
        );
        setShowUploadModal(false);
        fetchLeads();
      }
    } catch (err) {
      addToast('error', 'Upload Failed', 'There was an error processing the file.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const activeFilterCount = [filterStatus, filterAgent, filterDateFrom, filterDateTo].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterAgent('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setPage(1);
  };

  const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'eligible', label: 'Eligible' },
    { value: 'qd_submitted', label: 'QD Pending' },
    { value: 'dispatched', label: 'Dispatched' },
  ];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadsApi.getLeads({
        status: filterStatus || (tab !== 'all' ? tab : undefined),
        search,
        assigned_to: isAgent ? (auth?.user?.id || auth?.user?._id) : (filterAgent || selectedAgent),
        date_from: filterDateFrom || undefined,
        date_to: filterDateTo || undefined,
        page,
        limit: 10,
        sort: sortOrder
      });
      if (res.success) {
        setLeads(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await usersApi.getUsers({ role: 'sales_person' });
      if (res.success) {
        setAgents(res.data.map(u => ({ value: u._id || u.id, label: u.name })));
      }
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

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

  const handleExportLeads = () => {
    if (!leads || leads.length === 0) {
      addToast('warning', 'No Data', 'No leads available to export.');
      return;
    }

    const headers = ['Lead Number', 'Customer Name', 'Mobile', 'Pincode', 'PAN Card', 'Status', 'Agent Name', 'Updated At'];
    const rows = leads.map(l => [
      l.lead_number,
      l.customer_name,
      l.mobile,
      l.pincode,
      l.pan || '—',
      l.status,
      l.assigned_to?.name || 'Unassigned',
      new Date(l.updatedAt).toLocaleDateString('en-IN')
    ]);

    downloadCSV(`Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [tab, search, selectedAgent, filterStatus, filterAgent, filterDateFrom, filterDateTo, page, sortOrder]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title={isAgent ? "My Leads" : "Lead Management"}
        subtitle={isAgent ? `${total} leads assigned to you` : `${total} total leads across all agents`}
        action={
          !isAgent ? (
            <div className="flex gap-3">
              <Button variant="ghost" icon={Download} onClick={handleExportLeads}>Export CSV</Button>
              <Button icon={Plus} onClick={() => setShowUploadModal(true)}>Upload Leads</Button>
            </div>
          ) : (
            <Button variant="primary" icon={Plus} onClick={handleRequestLeads} loading={requestingLeads}>
              Request More Leads
            </Button>
          )
        }
      />

      <div className="flex overflow-x-auto pb-2 -mx-1 px-1">
        <Tabs tabs={STATUS_TABS} active={tab} onChange={(v) => { setTab(v); setPage(1); }} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search leads..."
                className="w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            {!isAgent && (
              <Select 
                value={selectedAgent} 
                onChange={(e) => { setSelectedAgent(e.target.value); setPage(1); }} 
                options={[{ value: '', label: 'All Agents' }, ...agents]} 
                className="w-40 hidden sm:block"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showFilter ? 'primary' : 'ghost'} 
              size="sm" 
              icon={Filter} 
              className="text-[11px] font-bold uppercase tracking-wider relative"
              onClick={() => setShowFilter(v => !v)}
            >
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              icon={ArrowUpDown} 
              className="text-[11px] font-bold uppercase tracking-wider"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              Sort {sortOrder === 'desc' ? '▼' : '▲'}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="mb-6 p-4 bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="eligible">Eligible</option>
                  <option value="qd_submitted">QD Pending</option>
                  <option value="dispatched">Dispatched</option>
                </select>
              </div>
              {!isAgent && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Agent</label>
                  <select
                    value={filterAgent}
                    onChange={e => { setFilterAgent(e.target.value); setPage(1); }}
                    className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="">All Agents</option>
                    {agents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }}
                  className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={e => { setFilterDateTo(e.target.value); setPage(1); }}
                  className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button onClick={clearFilters} className="text-xs font-bold text-accent hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <Table
              columns={isAgent ? [
                { 
                  key: 'lead_number', 
                  label: '#', 
                  render: (v) => <span className="font-mono text-[11px] font-bold tracking-tight">{v}</span> 
                },
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
                  key: 'mobile', 
                  label: 'Mobile', 
                  render: (v) => <span className="font-mono text-sm font-bold">{v}</span> 
                },
                { 
                  key: 'pincode', 
                  label: 'Pincode', 
                  render: (v, r) => {
                    const isCompleted = r.status !== 'new' && r.status !== 'assigned';
                    return (
                      <input
                        type="text"
                        className="w-20 px-2 py-1 text-xs border rounded bg-background dark:bg-background-dark border-border-light dark:border-border-dark font-mono focus:ring-1 focus:ring-accent disabled:opacity-60 disabled:bg-background-dark/20 dark:disabled:bg-background/20 disabled:cursor-not-allowed"
                        value={getRowValue(r, 'pincode')}
                        onChange={(e) => handleRowChange(r._id, 'pincode', e.target.value)}
                        maxLength={6}
                        disabled={isCompleted}
                      />
                    );
                  } 
                },
                { 
                  key: 'pan', 
                  label: 'PAN Card', 
                  render: (v, r) => {
                    const isCompleted = r.status !== 'new' && r.status !== 'assigned';
                    return (
                      <input
                        type="text"
                        className="w-28 px-2 py-1 text-xs border rounded bg-background dark:bg-background-dark border-border-light dark:border-border-dark font-mono uppercase focus:ring-1 focus:ring-accent disabled:opacity-60 disabled:bg-background-dark/20 dark:disabled:bg-background/20 disabled:cursor-not-allowed"
                        value={getRowValue(r, 'pan')}
                        onChange={(e) => handleRowChange(r._id, 'pan', e.target.value.toUpperCase())}
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        disabled={isCompleted}
                      />
                    );
                  } 
                },
                { 
                  key: 'status', 
                  label: 'Status', 
                  render: (v, r) => {
                    const isCompleted = r.status !== 'new' && r.status !== 'assigned';
                    const currentStatus = getRowValue(r, 'status');
                    const hasNotes = currentStatus !== '';
                    return (
                      <div className="flex flex-col gap-1.5 min-w-[150px]">
                        <select
                          className="w-36 px-2 py-1 text-xs border rounded bg-background dark:bg-background-dark border-border-light dark:border-border-dark font-semibold focus:ring-1 focus:ring-accent disabled:opacity-60 disabled:bg-background-dark/20 dark:disabled:bg-background/20 disabled:cursor-not-allowed"
                          value={currentStatus}
                          onChange={(e) => handleRowChange(r._id, 'status', e.target.value)}
                          disabled={isCompleted}
                        >
                          <option value="">Select status...</option>
                          <option value="Listed Pincode">Listed Pincode</option>
                          <option value="Pincode Not Listed">Pincode Not Listed</option>
                          <option value="Fresh">Fresh</option>
                          <option value="Follow Up">Follow Up</option>
                          <option value="Exception">Exception</option>
                        </select>
                        {!isCompleted && hasNotes && (
                          <input
                            type="text"
                            placeholder="Type comments..."
                            className="w-36 px-2 py-1.5 text-[10px] border rounded bg-background dark:bg-background-dark border-border-light dark:border-border-dark focus:ring-1 focus:ring-accent shadow-inner placeholder:text-text-muted font-medium"
                            value={getRowValue(r, 'follow_up_notes')}
                            onChange={(e) => handleRowChange(r._id, 'follow_up_notes', e.target.value)}
                          />
                        )}
                      </div>
                    );
                  } 
                },
                { 
                  key: 'qd_status', 
                  label: 'QD', 
                  render: (v, r) => {
                    if (r.status === 'qd_submitted' || r.status === 'dispatched' || r.status === 'closed' || r.status === 'rejected') {
                      return <Badge label="Generated" color="success" />;
                    }
                    return (
                      <Button 
                        size="xs" 
                        onClick={() => {
                          localStorage.setItem('selectedLeadId', r._id);
                          onNav('sp-qd');
                        }}
                      >
                        Generate QD
                      </Button>
                    );
                  }
                },
                { 
                  key: 'granted_qd', 
                  label: 'Granted QD', 
                  render: (v, r) => {
                    if (r.status === 'dispatched' || r.status === 'closed') {
                      return <Badge label="Granted" color="success" />;
                    }
                    if (r.status === 'qd_submitted') {
                      return <Badge label="Pending Review" color="warning" />;
                    }
                    if (r.status === 'rejected') {
                      return <Badge label="Rejected" color="danger" />;
                    }
                    return <span className="text-text-muted text-xs">—</span>;
                  }
                },
                { 
                  key: '_id', 
                  label: 'Actions', 
                  render: (v, r) => {
                    const isEdited = editedLeads[r._id] !== undefined;
                    return (
                      <div className="flex items-center gap-1.5">
                        <Button 
                          size="xs" 
                          variant={isEdited ? 'default' : 'ghost'}
                          disabled={savingRow === r._id}
                          onClick={() => handleSaveRow(r)}
                        >
                          {savingRow === r._id ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                          size="xs" 
                          variant="ghost" 
                          icon={Eye} 
                          onClick={(e) => { e.stopPropagation(); setSelectedLead(r); }}
                        />
                      </div>
                    );
                  } 
                },
              ] : [
                { 
                  key: 'lead_number', 
                  label: '#', 
                  render: (v) => <span className="font-mono text-[11px] font-bold tracking-tight">{v}</span> 
                },
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
                  key: 'mobile', 
                  label: 'Mobile', 
                  render: (v) => <span className="font-mono text-sm font-bold">{v}</span> 
                },
                { 
                  key: 'pincode', 
                  label: 'Pincode', 
                  render: (v) => <span className="font-mono text-sm font-bold">{v}</span> 
                },
                { key: 'assigned_to', label: 'Agent', render: (v) => <span className="font-bold">{v?.name || '—'}</span> },
                { 
                  key: 'status', 
                  label: 'Status', 
                  render: (v, r) => {
                    if (r.status === 'dispatched' || r.status === 'closed') {
                      return <Badge label="Approved" color="success" />;
                    }
                    if (r.status === 'rejected') {
                      return <Badge label="Rejected" color="danger" />;
                    }
                    return <Badge label="Pending" color="warning" />;
                  }
                },
                { 
                  key: 'updatedAt', 
                  label: 'Updated', 
                  render: (v) => <span className="text-sm font-bold">{new Date(v).toLocaleDateString()}</span> 
                },
                { 
                  key: '_id', 
                  label: '', 
                  render: (v, r) => (
                    <Button variant="ghost" size="sm" icon={Eye} onClick={(e) => { e.stopPropagation(); setSelectedLead(r); }}>
                      View
                    </Button>
                  ) 
                },
              ]}
              rows={leads}
            />

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light dark:border-border-dark">
              <p className="text-xs text-text-muted font-medium tracking-tight">
                Showing <span className="text-text-primary dark:text-text-dark-primary font-bold">1–{leads.length}</span> of {total} leads
              </p>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="px-4"
                >
                  ← Prev
                </Button>
                
                <div className="flex items-center">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all mx-0.5 ${page === pageNum ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:bg-background-dark/5 dark:hover:bg-background/5"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="mx-1 text-text-muted">...</span>}
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={page >= totalPages || total === 0} 
                  onClick={() => setPage(p => p + 1)}
                  className="px-4"
                >
                  Next →
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal 
        open={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        title={`Lead — ${selectedLead?.customer_name || 'Details'}`}
        width="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedLead(null)}>Close</Button>
            <Button>Assign to Agent</Button>
          </>
        }
      >
        {selectedLead && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em]">Lead Details</h4>
              <div className="space-y-1">
                <InfoRow label="Lead #" value={selectedLead.lead_number || '—'} mono />
                <InfoRow label="Name" value={selectedLead.customer_name || '—'} />
                <InfoRow label="Mobile" value={selectedLead.mobile || '—'} mono />
                <InfoRow label="Pincode" value={selectedLead.pincode || '—'} mono />
                <InfoRow label="PAN Number" value={selectedLead.pan || '—'} mono />
                <InfoRow label="Verification Status" value={selectedLead.verification_status || '—'} />
                <InfoRow label="Father's Name" value={selectedLead.father_name || '—'} />
                <InfoRow label="Mother's Name" value={selectedLead.mother_name || '—'} />
                <InfoRow label="State" value={selectedLead.state || '—'} />
                <InfoRow label="District" value={selectedLead.district || '—'} />
                <InfoRow label="Pipeline Stage" value={<Badge label={(selectedLead.status || 'new').replace(/_/g, ' ')} color={selectedLead.status || 'new'} />} />
                <InfoRow label="Call Status" value={<Badge label={(selectedLead.call_status || 'pending').replace(/_/g, ' ')} color={selectedLead.call_status || 'pending'} />} />
                <InfoRow label="Agent" value={selectedLead.assigned_to?.name || 'Unassigned'} />
                <InfoRow label="Source" value={selectedLead.source || '—'} />
                <InfoRow label="Created" value={selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : '—'} />
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em]">Status Timeline</h4>
              {(selectedLead.status_history || []).length === 0 ? (
                <p className="text-sm text-text-muted">No history available.</p>
              ) : (
                <div className="relative space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border-light dark:before:bg-border-dark">
                  {(selectedLead.status_history || []).map((item, i) => (
                    <div key={i} className="flex gap-4 relative group">
                      <div className="w-[12px] h-[12px] rounded-full shrink-0 z-10 ring-4 ring-card-light dark:ring-card-dark bg-success scale-110 shadow-[0_0_8px_rgba(46,204,143,0.5)]" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-text-primary dark:text-text-dark-primary capitalize">{(item.status || '').replace(/_/g, ' ')}</h4>
                        <p className="text-[10px] text-text-muted font-medium mt-0.5">{item.changed_at ? new Date(item.changed_at).toLocaleString() : '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload & Auto-Assign"
        width="max-w-md"
      >
        <div className="space-y-6 py-2">
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-accent">Smart Auto-Assign</h4>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                Leads will be automatically distributed to available agents in batches of 10.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-2xl">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-text-primary dark:text-text-dark-primary">Enable Auto-Assignment</label>
              <p className="text-[10px] text-text-muted">Turn off to manually distribute leads later via Assign page.</p>
            </div>
            <button
              onClick={() => setAutoAssign(!autoAssign)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-2",
                autoAssign ? "bg-accent" : "bg-border-light dark:bg-border-dark"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  autoAssign ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="relative group">
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <div className={cn(
              "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all",
              uploading ? "bg-accent/5 border-accent" : "bg-background-dark/5 dark:bg-background/5 border-border-light dark:border-border-dark group-hover:border-accent/50"
            )}>
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                uploading ? "bg-accent/20 text-accent animate-pulse" : "bg-accent/10 text-accent group-hover:scale-110"
              )}>
                {uploading ? <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <UploadCloud className="w-7 h-7" />}
              </div>
              <p className="text-sm font-bold text-text-primary dark:text-text-dark-primary">
                {uploading ? 'Processing Data...' : 'Drop Excel File here'}
              </p>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">xlsx, xls, csv supported</p>
            </div>
          </div>
          
          <div className="flex justify-center text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] pt-2">
            AI Column Mapping Enabled
          </div>
        </div>
      </Modal>
    </div>
  );
}
