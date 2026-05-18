import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { leadsApi } from '../../api/leadsApi';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import { Phone, MapPin, Clock } from 'lucide-react';

const COLUMNS = [
  { id: 'new', label: 'New', color: 'bg-info/10 text-info border-info/20' },
  { id: 'assigned', label: 'Assigned', color: 'bg-accent/10 text-accent border-accent/20' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-warning/10 text-warning border-warning/20' },
  { id: 'qd_submitted', label: 'QD Pending', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'dispatched', label: 'Dispatched', color: 'bg-success/10 text-success border-success/20' },
];

export function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadsApi.getLeads({ limit: 200 }); // fetch a good chunk for the board
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to load pipeline data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // necessary to allow dropping
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const lead = leads.find(l => l._id === leadId);
    if (!lead || lead.status === targetStatus) return;

    // Optimistic update
    setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: targetStatus } : l));

    try {
      const res = await leadsApi.updateLead(leadId, { status: targetStatus });
      if (res.success) {
        addToast('success', 'Status Updated', `Lead moved to ${targetStatus.replace('_', ' ')}.`);
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not move lead.');
      // Revert on failure
      fetchLeads();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <SectionHeader
        title="Pipeline View"
        subtitle="Drag and drop leads to update their status"
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(column => {
              const columnLeads = leads.filter(l => l.status === column.id);
              
              return (
                <div 
                  key={column.id} 
                  className="w-[320px] flex flex-col bg-background-dark/5 dark:bg-background/5 rounded-[24px] border border-border-light dark:border-border-dark overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className={cn("px-4 py-3 border-b flex items-center justify-between", column.color)}>
                    <h3 className="font-bold text-sm uppercase tracking-wider">{column.label}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-background dark:bg-background-dark text-xs font-bold shadow-sm">
                      {columnLeads.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {columnLeads.map(lead => (
                      <div 
                        key={lead._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead._id)}
                        className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md hover:border-accent/50 cursor-grab active:cursor-grabbing transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-text-muted">{lead.lead_number}</span>
                          {lead.assigned_to && (
                            <Avatar name={lead.assigned_to.name} size="xs" />
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-text-primary dark:text-text-dark-primary mb-3">
                          {lead.customer_name}
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-dark-secondary">
                            <Phone className="w-3.5 h-3.5 text-text-muted" />
                            <span className="font-mono">{lead.mobile}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-dark-secondary">
                            <MapPin className="w-3.5 h-3.5 text-text-muted" />
                            <span className="font-mono">{lead.pincode}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-[10px] font-bold text-text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(lead.updatedAt).toLocaleDateString()}
                          </div>
                          <span className="uppercase tracking-wider">{lead.source}</span>
                        </div>
                      </div>
                    ))}
                    
                    {columnLeads.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-border-light dark:border-border-dark rounded-xl flex items-center justify-center text-xs font-bold text-text-muted uppercase tracking-widest">
                        Drop Here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
