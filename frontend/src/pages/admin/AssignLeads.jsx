import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useToast } from '../../context/ToastContext';
import { leadsApi } from '../../api/leadsApi';
import { usersApi } from '../../api/usersApi';
import { cn } from '../../utils/cn';

export function AssignLeadsPage() {
  const { addToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [numLeadsToAssign, setNumLeadsToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, agentsRes] = await Promise.all([
        leadsApi.getLeads({ status: 'new', assigned_to: 'unassigned', limit: 100 }), // Get unassigned leads
        usersApi.getUsers({ role: 'sales_person' })
      ]);

      if (leadsRes.success) {
        setLeads(leadsRes.data);
      }
      if (agentsRes.success) {
        setAgents(agentsRes.data);
      }
    } catch (err) {
      console.error('Fetch assignment data error:', err);
      addToast('error', 'Error', 'Failed to load data for assignment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(l => l._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    let idsToAssign = [...selectedLeads];
    
    // If user didn't check boxes but entered a number
    if (idsToAssign.length === 0 && numLeadsToAssign > 0) {
      idsToAssign = leads.slice(0, parseInt(numLeadsToAssign, 10)).map(l => l._id);
    }

    if (idsToAssign.length === 0) {
      addToast('warning', 'Selection Required', 'Please select leads or enter a number.');
      return;
    }
    if (!selectedAgent) {
      addToast('warning', 'Agent Required', 'Please select a sales person to assign leads to.');
      return;
    }

    setAssigning(true);
    try {
      await leadsApi.bulkAssign(idsToAssign, selectedAgent);

      addToast('success', 'Leads Assigned', `Successfully assigned ${idsToAssign.length} leads.`);
      
      // Reset selections
      setSelectedLeads([]);
      setNumLeadsToAssign('');
      setSelectedAgent('');
      
      // Refresh data
      fetchData();
    } catch (err) {
      addToast('error', 'Assignment Failed', 'There was an error assigning some leads.');
    } finally {
      setAssigning(false);
    }
  };

  // Find max load to scale progress bars
  const maxLoad = Math.max(...agents.map(a => a.leads || 0), 10); // at least 10 for scale

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Assign Leads"
        subtitle="Distribute unassigned leads to your sales team"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Unassigned Leads List */}
        <Card title={`Unassigned Leads (${leads.length})`} className="lg:col-span-5 h-[600px] flex flex-col">
          <div className="flex items-center gap-3 pb-4 mb-2 border-b border-border-light dark:border-border-dark">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-border-light dark:border-border-dark text-accent focus:ring-accent/20"
              checked={selectedLeads.length === leads.length && leads.length > 0}
              onChange={handleSelectAll}
            />
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Select All / Bulk Assign
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center p-8 text-sm text-text-muted">No unassigned leads found.</div>
            ) : (
              leads.map(lead => (
                <div 
                  key={lead._id} 
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl border transition-colors cursor-pointer",
                    selectedLeads.includes(lead._id) 
                      ? "bg-accent/5 border-accent" 
                      : "bg-background-dark/5 dark:bg-background/5 border-transparent hover:border-border-light dark:hover:border-border-dark"
                  )}
                  onClick={() => handleSelectLead(lead._id)}
                >
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-border-light dark:border-border-dark text-accent focus:ring-accent/20"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => {}} // handled by parent div click
                  />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="text-sm font-bold truncate">{lead.customer_name}</div>
                    <div className="text-xs font-mono text-text-muted flex items-center">{lead.mobile}</div>
                    <div className="text-xs font-mono text-text-muted flex items-center justify-end">{lead.pincode}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Assign & Team Load */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Quick Assign">
            <div className="space-y-6 mt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Assign To</label>
                <Select 
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  options={[
                    { value: '', label: '— Select Sales Person —' },
                    ...agents.map(a => ({ value: a._id, label: a.name }))
                  ]}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Number of Leads</label>
                <input 
                  type="number"
                  placeholder="e.g. 10"
                  value={numLeadsToAssign}
                  onChange={(e) => {
                    setNumLeadsToAssign(e.target.value);
                    if (e.target.value) setSelectedLeads([]); // clear specific selections if using number
                  }}
                  disabled={selectedLeads.length > 0}
                  className="w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:opacity-50"
                  min="1"
                  max={leads.length}
                />
                {selectedLeads.length > 0 && (
                  <p className="text-xs text-accent mt-1">Manual selection active. Number input disabled.</p>
                )}
              </div>

              <Button 
                className="w-full py-3.5" 
                onClick={handleAssign}
                disabled={assigning || (selectedLeads.length === 0 && !numLeadsToAssign) || !selectedAgent}
              >
                {assigning ? 'Assigning...' : `Assign Leads →`}
              </Button>
            </div>
          </Card>

          <Card title="Team Lead Load">
            <div className="space-y-6 mt-4">
              {agents.map((agent, index) => {
                const colors = ['success', 'accent', 'warning', 'danger', 'info'];
                const color = colors[index % colors.length];
                const count = agent.leads || 0;
                const percentage = Math.max((count / maxLoad) * 100, 5); // at least 5% so bar is visible
                
                return (
                  <div key={agent._id} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{agent.name}</span>
                      <span className="text-text-muted">{count}</span>
                    </div>
                    <div className="h-2 bg-background-dark/10 dark:bg-background/10 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          color === 'success' && "bg-success",
                          color === 'accent' && "bg-accent",
                          color === 'warning' && "bg-warning",
                          color === 'danger' && "bg-danger",
                          color === 'info' && "bg-info"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
