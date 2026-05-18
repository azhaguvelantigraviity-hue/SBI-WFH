import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { incentivesApi } from '../../api/incentivesApi';
import { useToast } from '../../context/ToastContext';
import { Download, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export function IncentivesPage() {
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { addToast } = useToast();

  const currentMonth = '2025-06'; // In a real app, this would be dynamic

  const fetchIncentives = async () => {
    setLoading(true);
    try {
      const res = await incentivesApi.getIncentives({ month: currentMonth });
      if (res.success) {
        setIncentives(res.data);
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to load incentives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await incentivesApi.generateIncentives({ 
        month: currentMonth,
        month_label: 'June 2025'
      });
      if (res.success) {
        addToast('success', 'Generated', `Calculated incentives for ${res.generated} agents.`);
        fetchIncentives();
      }
    } catch (err) {
      addToast('error', 'Generation Failed', 'Could not generate incentives.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePay = async (id) => {
    if (!window.confirm("Mark this incentive as paid?")) return;
    
    try {
      const res = await incentivesApi.markPaid(id);
      if (res.success) {
        addToast('success', 'Payment Logged', 'Incentive marked as paid.');
        fetchIncentives();
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not mark as paid.');
    }
  };

  const totalPaid = incentives.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.net, 0);
  const totalPending = incentives.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.net, 0);
  const totalThisMonth = totalPaid + totalPending;
  const avgPerAgent = incentives.length > 0 ? Math.round(totalThisMonth / incentives.length) : 0;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const formatShortCurrency = (amount) => `₹${(amount / 1000).toFixed(1).replace('.0', '')}K`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Incentive Tracker"
        subtitle="Incentives for dispatched leads only"
        action={
          <div className="flex gap-3">
            <Button variant="ghost" icon={RefreshCw} onClick={handleGenerate} disabled={generating}>
              {generating ? 'Calculating...' : 'Recalculate'}
            </Button>
            <Button icon={Download}>Export Payroll ↓</Button>
          </div>
        }
      />

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-success opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Paid</p>
          <h3 className="text-4xl font-fraunces font-bold text-success">{formatShortCurrency(totalPaid || 0)}</h3>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-warning opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Pending</p>
          <h3 className="text-4xl font-fraunces font-bold text-warning">{formatShortCurrency(totalPending || 0)}</h3>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">This Month</p>
          <h3 className="text-4xl font-fraunces font-bold text-purple-500">{formatShortCurrency(totalThisMonth || 0)}</h3>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-danger opacity-50"></div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Avg Per Agent</p>
          <h3 className="text-4xl font-fraunces font-bold text-danger">{formatShortCurrency(avgPerAgent || 0)}</h3>
        </Card>
      </div>

      <Card title={`Incentive Breakdown — June 2025`}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : incentives.length === 0 ? (
          <div className="text-center p-8 text-sm text-text-muted">No incentives generated for this month. Click Recalculate.</div>
        ) : (
          <Table
            columns={[
              { key: 'agent', label: 'Agent', render: (_, r) => <span className="font-bold text-sm">{r.agent?.name}</span> },
              { key: 'dispatched', label: 'Dispatched', render: (_, r) => r.dispatched_count },
              { key: 'rate', label: 'Rate', render: (_, r) => formatCurrency(r.per_dispatch_rate) },
              { key: 'gross', label: 'Gross', render: (_, r) => formatCurrency(r.gross) },
              { key: 'tds', label: 'TDS', render: (_, r) => formatCurrency(r.tds_amount) },
              { key: 'net', label: 'Net Payable', render: (_, r) => <span className="font-bold">{formatCurrency(r.net)}</span> },
              { 
                key: 'status', 
                label: 'Status', 
                render: (_, r) => (
                  <div className="flex items-center gap-3">
                    <Badge 
                      label={r.status === 'paid' ? 'Paid' : 'Pending'} 
                      color={r.status === 'paid' ? 'success' : 'warning'} 
                    />
                    {r.status === 'pending' && (
                      <button 
                        onClick={() => handlePay(r.id)}
                        className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                )
              },
            ]}
            rows={incentives}
          />
        )}
      </Card>
    </div>
  );
}
