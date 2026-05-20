import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { usersApi } from '../../api/usersApi';
import { Search, Download, Plus, Users, UserCheck, UserX, UserPlus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function SalesPersonsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    employee_id: '',
    email: '',
    mobile: '',
    password: '',
    role: 'sales_person'
  });
  const { addToast } = useToast();

  const STATUS_TABS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers({
        role: 'sales_person',
        status: tab !== 'all' ? tab : undefined,
        search
      });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      addToast('error', 'Error', 'Failed to load sales persons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [tab, search]);

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await usersApi.updateUser(id, { status: newStatus });
      if (res.success) {
        addToast('success', 'Status Updated', `Agent is now ${newStatus}.`);
        fetchUsers();
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not change status.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete sales person ${name}?`)) return;
    try {
      const res = await usersApi.deleteUser(id);
      if (res.success) {
        addToast('success', 'User Deleted', `Sales person ${name} deleted successfully.`);
        fetchUsers();
      }
    } catch (err) {
      addToast('error', 'Delete Failed', 'Could not delete sales person.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (editId) {
        // Editing existing user
        const payload = { ...form };
        if (!payload.password) delete payload.password; // Don't send empty password if not changed
        res = await usersApi.updateUser(editId, payload);
      } else {
        // Creating new user
        res = await usersApi.createUser(form);
      }
      
      if (res.success) {
        addToast('success', 'Success', `Sales person ${editId ? 'updated' : 'created'} successfully.`);
        setShowModal(false);
        setEditId(null);
        setForm({ name: '', employee_id: '', email: '', mobile: '', password: '', role: 'sales_person' });
        fetchUsers();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.map(e => e.msg || e.message).join(', ') || 
                       err.response?.data?.message || 
                       `Failed to ${editId ? 'update' : 'create'} user.`;
      addToast('error', 'Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (user) => {
    setForm({
      name: user.name || '',
      employee_id: user.employee_id || '',
      email: user.email || '',
      mobile: user.mobile || '',
      password: '', // Blank by default when editing
      role: user.role || 'sales_person'
    });
    setEditId(user._id || user.id);
    setShowModal(true);
  };

  const getNextEmployeeId = (userList) => {
    if (!userList || userList.length === 0) return 'EMP001';
    let maxIdNum = 0;
    let template = '001';
    let prefix = 'EMP';
    userList.forEach(u => {
      if (!u.employee_id) return;
      const raw = String(u.employee_id).trim();
      const match = raw.match(/^([A-Za-z]*)([0-9]+)$/);
      if (match) {
        const num = parseInt(match[2], 10);
        if (num > maxIdNum) {
          maxIdNum = num;
          prefix = match[1];
          template = match[2];
        }
      }
    });
    if (maxIdNum === 0) return 'EMP001';
    const nextNumStr = String(maxIdNum + 1);
    const paddedNum = nextNumStr.padStart(template.length, '0');
    return prefix + paddedNum;
  };

  const handleAddClick = () => {
    const nextId = getNextEmployeeId(users);
    setForm({ name: '', employee_id: nextId, email: '', mobile: '', password: '', role: 'sales_person' });
    setEditId(null);
    setShowModal(true);
  };

  const handleExport = () => {
    const headers = ['Name', 'Employee ID', 'Email', 'Mobile', 'Role', 'Status', 'Leads', 'Dispatched'];
    const rows = users.map(u => [
      u.name || '',
      u.employee_id || '',
      u.email || '',
      u.mobile || '',
      (u.role || '').replace('_', ' '),
      u.status || '',
      u.leads || 0,
      u.dispatched || 0
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SalesPersons_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', 'Downloaded', 'Sales persons report exported successfully.');
  };

  const totalStaff = users.length;
  const activeStaff = users.filter(u => u.status === 'active').length;
  const suspendedStaff = users.filter(u => u.status === 'suspended').length;
  const newThisMonth = users.filter(u => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Sales Persons"
        subtitle="Manage your WFH sales team"
        action={
          <Button icon={Plus} onClick={handleAddClick}>Add Sales Person</Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat 
          label="Total Staff" 
          value={totalStaff} 
          icon={Users} 
          color="accent" 
        />
        <Stat 
          label="Active" 
          value={activeStaff} 
          icon={UserCheck} 
          color="success" 
        />
        <Stat 
          label="Suspended" 
          value={suspendedStaff} 
          icon={UserX} 
          color="warning" 
        />
        <Stat 
          label="New This Month" 
          value={newThisMonth} 
          icon={UserPlus} 
          color="info" 
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex overflow-x-auto pb-2 -mx-1 px-1">
            <Tabs tabs={STATUS_TABS} active={tab} onChange={setTab} />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff..."
                className="w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <Button variant="ghost" size="sm" icon={Download} onClick={handleExport}>Export</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table
            columns={[
              { 
                key: 'name', 
                label: 'Employee', 
                render: (v, r) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={v} size="sm" />
                    <div>
                      <div className="font-bold">{v}</div>
                      <div className="text-[10px] text-text-muted">{r.email}</div>
                    </div>
                  </div>
                ) 
              },
              { 
                key: 'employee_id', 
                label: 'ID', 
                muted: true, 
                render: (v) => <span className="font-mono text-xs">{v}</span> 
              },
              { 
                key: 'mobile', 
                label: 'Mobile', 
                muted: true, 
                render: (v) => <span className="font-mono text-xs">{v}</span> 
              },
              { 
                key: 'role', 
                label: 'Role', 
                muted: true,
                render: (v) => <span className="capitalize">{v.replace('_', ' ')}</span>
              },
              { 
                key: 'leads', 
                label: 'Leads', 
                render: (v) => <span className="font-bold">{v || 0}</span> 
              },
              { 
                key: 'dispatched', 
                label: 'Dispatched', 
                render: (v) => <span className="font-bold text-success">{v || 0}</span> 
              },
              { 
                key: 'status', 
                label: 'Status', 
                render: (v) => <Badge label={v} color={v === 'active' ? 'success' : 'danger'} /> 
              },
              { 
                key: 'actions', 
                label: 'Actions', 
                render: (_, r) => (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(r)}>Edit</Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={r.status === 'active' ? 'text-warning hover:text-warning' : 'text-success hover:text-success'}
                      onClick={() => handleStatusChange(r._id || r.id, r.status)}
                    >
                      {r.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:text-danger delete"
                      onClick={() => handleDeleteUser(r._id || r.id, r.name)}
                    >
                      Delete
                    </Button>
                  </div>
                ) 
              },
            ]}
            rows={users}
          />
        )}
      </Card>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
              <h3 className="text-xl font-bold font-fraunces">{editId ? 'Edit Staff' : 'Add New Staff'}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4" autoComplete="off">
              <Input 
                label="Full Name" 
                placeholder="e.g. Rahul Sharma"
                autoComplete="new-password"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
              <Input 
                label="Employee ID" 
                placeholder="e.g. EMP005"
                autoComplete="new-password"
                value={form.employee_id} 
                onChange={e => setForm({...form, employee_id: e.target.value})} 
                required 
              />
              <Input 
                label="Email Address" 
                type="email"
                placeholder="e.g. rahul@sbi.com"
                autoComplete="new-password"
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                required 
              />
              <Input 
                label="Mobile Number" 
                placeholder="10-digit mobile"
                maxLength={10}
                autoComplete="new-password"
                value={form.mobile} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({...form, mobile: val});
                }} 
                required 
              />
              <Input 
                label="Password" 
                type="password"
                placeholder={editId ? "Leave blank to keep current" : "Initial password"}
                autoComplete="new-password"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required={!editId} 
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Role</label>
                <Select 
                  value={form.role}
                  onChange={(e) => setForm({...form, role: e.target.value})}
                  options={[
                    { value: 'sales_person', label: 'Sales Person' },
                    { value: 'admin', label: 'Administrator' }
                  ]}
                  className="w-full"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : (editId ? 'Save Changes' : 'Create Account')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
