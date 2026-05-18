import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { incentivesApi } from '../../api/incentivesApi';
import { useToast } from '../../context/ToastContext';

export function MyIncentivesPage() {
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchIncentives = async () => {
      try {
        const res = await incentivesApi.getIncentives();
        if (res.success) {
          setIncentives(res.data);
        }
      } catch (err) {
        addToast('error', 'Error', 'Failed to load incentives.');
      } finally {
        setLoading(false);
      }
    };
    fetchIncentives();
  }, []);

  const currentMonthStr = '2025-06'; // Typically dynamic based on current date
  const thisMonthData = incentives.find(i => i.month === currentMonthStr) || { net: 0, dispatched_count: 0 };
  
  const totalEarned = incentives.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.net, 0);
  const totalPending = incentives.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.net, 0);
  const totalDispatched = incentives.reduce((acc, curr) => acc + curr.dispatched_count, 0);

  const formatShortCurrency = (amount) => `₹${(amount / 1000).toFixed(1).replace('.0', '')}K`;
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="My Incentives"
        subtitle="Track your monthly payouts and dispatched leads"
      />

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative overflow-hidden group border-t-4 border-t-success">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">This Month</p>
          <h3 className="text-4xl font-fraunces font-bold text-success">
            {thisMonthData.net > 0 ? formatShortCurrency(thisMonthData.net) : '₹0'}
          </h3>
        </Card>

        <Card className="p-6 relative overflow-hidden group border-t-4 border-t-warning">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Pending</p>
          <h3 className="text-4xl font-fraunces font-bold text-warning">
            {totalPending > 0 ? formatShortCurrency(totalPending) : '₹0'}
          </h3>
        </Card>

        <Card className="p-6 relative overflow-hidden group border-t-4 border-t-purple-500">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Earned</p>
          <h3 className="text-4xl font-fraunces font-bold text-purple-500">
            {totalEarned > 0 ? formatShortCurrency(totalEarned) : '₹0'}
          </h3>
        </Card>

        <Card className="p-6 relative overflow-hidden group border-t-4 border-t-danger">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Dispatched</p>
          <h3 className="text-4xl font-fraunces font-bold text-danger">
            {totalDispatched || 0}
          </h3>
        </Card>
      </div>

      <Card title="Incentive History">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : incentives.length === 0 ? (
          <div className="text-center p-8 text-sm text-text-muted">No incentive data found. Keep dispatching leads!</div>
        ) : (
          <Table
            columns={[
              { key: 'month', label: 'Month', render: (_, r) => <span className="font-bold text-sm text-text-primary dark:text-text-dark-primary">{r.month_label}</span> },
              { key: 'dispatched', label: 'Dispatched', render: (_, r) => <span className="font-medium">{r.dispatched_count}</span> },
              { key: 'gross', label: 'Gross', render: (_, r) => formatCurrency(r.gross) },
              { key: 'net', label: 'Net (After TDS)', render: (_, r) => <span className="font-bold">{formatCurrency(r.net)}</span> },
              { 
                key: 'status', 
                label: 'Status', 
                render: (_, r) => (
                  <Badge 
                    label={r.status === 'paid' ? 'Paid' : 'Pending'} 
                    color={r.status === 'paid' ? 'success' : 'warning'} 
                  />
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
