import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { qdApi } from '../../api/qdApi';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, XCircle, FileText, AlertCircle, Eye, FileDigit, Landmark, Briefcase, Download, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../api/axiosInstance';

export function QDManagementPage() {
  const [qds, setQds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const { addToast } = useToast();

  const STATUS_TABS = [
    { value: 'pending', label: 'Pending' },
    { value: 'dispatched', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const [selectedQD, setSelectedQD] = useState(null);
  const [downloadingDoc, setDownloadingDoc] = useState(null); // tracks 'qdId-docIndex'

  // Download handler — handles both direct stream and static fallback
  const handleDownload = async (qdId, docIndex, originalname) => {
    const key = `${qdId}-${docIndex}`;
    setDownloadingDoc(key);
    try {
      // Fetch as arraybuffer so we can inspect the content-type
      const response = await api.get(`/qd/${qdId}/docs/${docIndex}/download`, {
        responseType: 'arraybuffer',
      });

      const contentType = response.headers['content-type'] || '';

      if (contentType.includes('application/json')) {
        // Backend returned JSON fallback — file not on its disk
        const text = new TextDecoder().decode(response.data);
        const json = JSON.parse(text);
        if (json.fallback && json.staticUrl) {
          // Open the /uploads static URL directly in a new tab
          const baseUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : '';
          const link = document.createElement('a');
          link.href = `${baseUrl}${json.staticUrl}`;
          link.setAttribute('download', json.originalname || originalname);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          addToast('error', 'Download Failed', json.message || 'File not available.');
        }
      } else {
        // Binary file — create blob and trigger download
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', originalname);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      addToast('error', 'Download Failed', 'Could not download the document.');
    } finally {
      setDownloadingDoc(null);
    }
  };

  const fetchQDs = async () => {
    setLoading(true);
    try {
      const res = await qdApi.getQDs({ limit: 100 });
      if (res.success) {
        setQds(res.data);
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to load QD submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQDs();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const status = action === 'dispatch' ? 'dispatched' : 'rejected';
      const payload = { status };
      
      if (status === 'rejected') {
        const reason = window.prompt("Enter rejection reason:");
        if (reason === null) return; // user cancelled
        payload.rejection_reason = reason;
      }

      const res = await qdApi.updateQD(id, payload);
      if (res.success) {
        addToast('success', 'QD Updated', `Submission has been ${status}.`);
        if (selectedQD?._id === id) setSelectedQD(null);
        fetchQDs();
      }
    } catch (err) {
      addToast('error', 'Action Failed', 'Could not process QD submission.');
    }
  };

  const pendingCount = qds.filter(q => q.status === 'pending').length;
  const approvedCount = qds.filter(q => q.status === 'dispatched').length;
  const rejectedCount = qds.filter(q => q.status === 'rejected').length;

  const filteredQDs = qds.filter(q => q.status === tab);

  const getDocIcon = (docType) => {
    if (!docType) return <FileText className="w-4 h-4 text-text-muted" />;
    const lower = docType.toLowerCase();
    if (lower.includes('aadhar') || lower.includes('pan')) return <FileDigit className="w-4 h-4 text-info" />;
    if (lower.includes('bank') || lower.includes('statement')) return <Landmark className="w-4 h-4 text-accent" />;
    if (lower.includes('salary') || lower.includes('payslip')) return <Briefcase className="w-4 h-4 text-success" />;
    return <FileText className="w-4 h-4 text-text-muted" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="QD Management"
        subtitle="Review and dispatch quality data submissions"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat 
          label="Pending Review" 
          value={pendingCount} 
          icon={AlertCircle} 
          color="warning" 
        />
        <Stat 
          label="Approved" 
          value={approvedCount} 
          icon={CheckCircle2} 
          color="success" 
        />
        <Stat 
          label="Rejected" 
          value={rejectedCount} 
          icon={XCircle} 
          color="danger" 
        />
        <Stat 
          label="Total" 
          value={qds.length} 
          icon={FileText} 
          color="accent" 
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto pb-2 -mx-1 px-1 mb-6 border-b border-border-light dark:border-border-dark">
          <Tabs 
            tabs={STATUS_TABS.map(t => ({
              ...t,
              label: `${t.label} (${t.value === 'pending' ? pendingCount : t.value === 'dispatched' ? approvedCount : rejectedCount})`
            }))} 
            active={tab} 
            onChange={setTab} 
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredQDs.length === 0 ? (
          <div className="text-center p-8 text-sm text-text-muted">No {STATUS_TABS.find(t=>t.value===tab)?.label.split(' ')[0]} submissions found.</div>
        ) : (
          <Table
            columns={[
              { 
                key: 'lead', 
                label: 'Lead', 
                render: (_, r) => (
                  <div>
                    <div className="font-bold text-sm text-text-primary dark:text-text-dark-primary">{r.lead?.customer_name}</div>
                    <div className="text-[10px] font-mono text-text-muted flex items-center gap-2 mt-0.5">
                      <span>{r.lead?.lead_number}</span>
                      <span>•</span>
                      <span>{r.lead?.mobile}</span>
                    </div>
                  </div>
                ) 
              },
              { 
                key: 'agent', 
                label: 'Agent', 
                render: (_, r) => <span className="font-medium text-sm">{r.agent?.name}</span>
              },
              { 
                key: 'employment', 
                label: 'Employment', 
                render: (_, r) => (
                  <Badge 
                    label={r.employment_type?.replace(/_/g, ' ') || 'Unknown'} 
                    color={r.employment_type === 'salaried' ? 'info' : 'accent'} 
                    size="sm"
                  />
                )
              },
              { 
                key: 'submitted', 
                label: 'Submitted', 
                muted: true,
                render: (_, r) => (
                  <span className="text-xs">
                    {new Date(r.submitted_at || r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )
              },
              { 
                key: 'documents', 
                label: 'Documents', 
                render: (_, r) => (
                  <div className="flex items-center gap-2">
                    {r.documents && r.documents.length > 0 ? (
                      r.documents.slice(0, 3).map((d, i) => (
                        <div key={i} title={d.originalname}>
                          {getDocIcon(d.originalname)}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                    {r.documents?.length > 3 && (
                      <span className="text-[10px] font-bold text-text-muted">+{r.documents.length - 3}</span>
                    )}
                  </div>
                )
              },
              { 
                key: '_id', 
                label: 'Actions', 
                render: (_, r) => (
                  <div className="flex items-center gap-2">
                    {(r.status === 'pending' || r.status === 'rejected') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(r._id, 'dispatch'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors text-[11px] font-bold"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Approve
                      </button>
                    )}
                    {r.status === 'pending' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(r._id, 'reject'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors text-[11px] font-bold"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedQD(r); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-dark/10 dark:bg-background/10 text-text-primary dark:text-text-dark-primary hover:bg-background-dark/20 dark:hover:bg-background/20 transition-colors text-[11px] font-bold"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                ) 
              },
            ]}
            rows={filteredQDs}
          />
        )}
      </Card>

      {/* View QD Modal */}
      {selectedQD && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
              <h3 className="text-lg font-fraunces font-bold text-text-primary dark:text-text-dark-primary">
                QD Review — {selectedQD.lead?.customer_name}
              </h3>
              <button onClick={() => setSelectedQD(null)} className="p-2 hover:bg-background-dark/10 rounded-xl transition-colors">
                <XCircle className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Lead Information</h4>
                  <div className="space-y-3 bg-background-dark/5 dark:bg-background/5 p-4 rounded-xl">
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Name</span><span className="text-sm font-bold">{selectedQD.lead?.customer_name}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Mobile</span><span className="text-sm font-mono">{selectedQD.lead?.mobile}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Employee ID</span><span className="text-sm font-mono">{selectedQD.agent?.employee_id || '—'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Agent</span><span className="text-sm font-bold">{selectedQD.agent?.name}</span></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Employment Details</h4>
                  <div className="space-y-3 bg-background-dark/5 dark:bg-background/5 p-4 rounded-xl">
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Type</span><Badge label={selectedQD.employment_type} color="info" size="xs" /></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Salary</span><span className="text-sm font-bold">₹{selectedQD.salary?.toLocaleString() || '—'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Company</span><span className="text-sm font-bold">{selectedQD.company_name || '—'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-text-muted">Designation</span><span className="text-sm font-bold">{selectedQD.designation || '—'}</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Uploaded Documents ({selectedQD.documents?.length || 0})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedQD.documents?.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-border-light dark:border-border-dark rounded-xl bg-white dark:bg-card-dark">
                        {getDocIcon(doc.originalname)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" title={doc.originalname}>{doc.originalname}</p>
                          <p className="text-[10px] text-text-muted">{(doc.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={() => handleDownload(selectedQD._id, i, doc.originalname)}
                          disabled={downloadingDoc === `${selectedQD._id}-${i}`}
                          className="p-1.5 hover:bg-accent/10 rounded-lg text-accent transition-colors disabled:opacity-50"
                          title={`Download ${doc.originalname}`}
                        >
                          {downloadingDoc === `${selectedQD._id}-${i}`
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Download className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3 bg-background-dark/5 dark:bg-background/5">
              <button onClick={() => setSelectedQD(null)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:bg-background-dark/10 transition-all">Close</button>
              {selectedQD.status === 'pending' && (
                <button onClick={() => handleAction(selectedQD._id, 'reject')} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-danger/10 text-danger hover:bg-danger/20 transition-all">Reject Submission</button>
              )}
              {(selectedQD.status === 'pending' || selectedQD.status === 'rejected') && (
                <button onClick={() => handleAction(selectedQD._id, 'dispatch')} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-success text-white shadow-lg shadow-success/20 hover:scale-[1.02] transition-all">Dispatch / Approve</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
