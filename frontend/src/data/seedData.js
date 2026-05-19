import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Upload, 
  UserPlus, 
  Kanban, 
  CheckSquare, 
  PieChart, 
  Award, 
  PhoneCall, 
  Settings,
  Phone,
  ShieldCheck,
  FileCheck,
  Files,
  UserCircle,
  AlertCircle,
  Landmark
} from 'lucide-react';

export const ADMIN_NAV = [
  { 
    section: 'Overview', 
    items: [{ id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' }] 
  },
  { 
    section: 'Team', 
    items: [{ id: 'salespersons', icon: Users, label: 'Sales Persons', badge: 6 }] 
  },
  { 
    section: 'Leads', 
    items: [
      { id: 'leads', icon: FileText, label: 'All Leads', badge: 142 },
      { id: 'assign', icon: UserPlus, label: 'Assign Leads', badge: 23, badgeColor: 'warning' },
      { id: 'exceptions', icon: AlertCircle, label: 'Exception/Followup' },
    ]
  },
  { 
    section: 'Quality', 
    items: [{ id: 'qd', icon: CheckSquare, label: 'QD Management', badge: 12 }] 
  },
  { 
    section: 'Analytics', 
    items: [
      { id: 'reports', icon: PieChart, label: 'Reports' },
    ]
  },
  { 
    section: 'System', 
    items: [
      { id: 'settings', icon: Settings, label: 'Settings' }
    ]
  },
];

export const SALES_NAV = [
  { 
    section: 'Overview', 
    items: [{ id: 'sp-dashboard', icon: LayoutDashboard, label: 'Dashboard' }] 
  },
  { 
    section: 'Leads', 
    items: [
      { id: 'sp-leads', icon: FileText, label: 'My Leads', badge: 18 },
      { id: 'sp-qd', icon: FileCheck, label: 'QD Form', badge: 3, badgeColor: 'warning' },
    ]
  },
  { 
    section: 'Personal', 
    items: [
      { id: 'sp-profile', icon: UserCircle, label: 'Profile' },
    ]
  },
];

export const SEED = {
  users: [
    { id: 'u1', employee_id: 'EMP001', name: 'Arjun Kumar', email: 'arjun@sf.com', mobile: '9876543210', role: 'sales_person', status: 'active', leads: 34, dispatched: 28 },
    { id: 'u2', employee_id: 'EMP002', name: 'Priya Sharma', email: 'priya@sf.com', mobile: '8765432109', role: 'sales_person', status: 'active', leads: 28, dispatched: 22 },
    { id: 'u3', employee_id: 'EMP003', name: 'Ravi Patel', email: 'ravi@sf.com', mobile: '7654321098', role: 'sales_person', status: 'active', leads: 22, dispatched: 19 },
    { id: 'u4', employee_id: 'EMP004', name: 'Meena Nair', email: 'meena@sf.com', mobile: '9543210987', role: 'sales_person', status: 'active', leads: 18, dispatched: 14 },
    { id: 'u5', employee_id: 'EMP005', name: 'Kiran Raj', email: 'kiran@sf.com', mobile: '6543219876', role: 'sales_person', status: 'suspended', leads: 12, dispatched: 8 },
    { id: 'u6', employee_id: 'EMP006', name: 'Deepa Rao', email: 'deepa@sf.com', mobile: '9876501234', role: 'sales_person', status: 'active', leads: 15, dispatched: 11 },
  ],
  leads: [
    { id: 'l1', lead_number: 'L0001', customer_name: 'Ravi Kumar', mobile: '9876543210', pincode: '600001', status: 'eligible', assigned_to: 'u1', agent_name: 'Arjun Kumar', created_at: '2025-06-15', updated_at: 'Today 10:24' },
    { id: 'l2', lead_number: 'L0002', customer_name: 'Sunita Devi', mobile: '8765432109', pincode: '400001', status: 'qd_submitted', assigned_to: 'u2', agent_name: 'Priya Sharma', created_at: '2025-06-15', updated_at: 'Today 09:15' },
    { id: 'l3', lead_number: 'L0003', customer_name: 'Mohan Lal', mobile: '7654321098', pincode: '110001', status: 'not_eligible', assigned_to: 'u3', agent_name: 'Ravi Patel', created_at: '2025-06-15', updated_at: 'Today 08:50' },
    { id: 'l4', lead_number: 'L0004', customer_name: 'Anjali Singh', mobile: '9543210987', pincode: '500001', status: 'dispatched', assigned_to: 'u1', agent_name: 'Arjun Kumar', created_at: '2025-06-14', updated_at: 'Yesterday' },
    { id: 'l5', lead_number: 'L0005', customer_name: 'Kiran Bala', mobile: '6543219876', pincode: '560001', status: 'in_progress', assigned_to: 'u4', agent_name: 'Meena Nair', created_at: '2025-06-16', updated_at: 'Today 11:02' },
    { id: 'l6', lead_number: 'L0006', customer_name: 'Deepa Rao', mobile: '9876501234', pincode: '600002', status: 'new', assigned_to: null, agent_name: '—', created_at: '2025-06-16', updated_at: 'Today 12:00' },
    { id: 'l7', lead_number: 'L0007', customer_name: 'Suresh Menon', mobile: '8901234567', pincode: '682001', status: 'new', assigned_to: null, agent_name: '—', created_at: '2025-06-16', updated_at: 'Today 12:00' },
    { id: 'l8', lead_number: 'L0008', customer_name: 'Radha K.', mobile: '7890123456', pincode: '700001', status: 'assigned', assigned_to: 'u2', agent_name: 'Priya Sharma', created_at: '2025-06-16', updated_at: 'Today 12:30' },
  ],
  calls: [
    { id: 'c1', customer_name: 'Ravi Kumar', mobile: '9876543210', agent: 'Arjun Kumar', status: 'connected', duration: '5:24', lead_status: 'eligible', time: '10:24 AM' },
    { id: 'c2', customer_name: 'Sunita Devi', mobile: '8765432109', agent: 'Priya Sharma', status: 'connected', duration: '8:02', lead_status: 'qd_submitted', time: '09:15 AM' },
    { id: 'c3', customer_name: 'Mohan Lal', mobile: '7654321098', agent: 'Ravi Patel', status: 'connected', duration: '2:11', lead_status: 'not_eligible', time: '08:50 AM' },
    { id: 'c4', customer_name: 'Kiran Bala', mobile: '6543219876', agent: 'Meena Nair', status: 'not_connected', duration: '—', lead_status: 'in_progress', time: '11:02 AM' },
    { id: 'c5', customer_name: 'Anjali Singh', mobile: '9543210987', agent: 'Arjun Kumar', status: 'connected', duration: '6:18', lead_status: 'dispatched', time: '08:30 AM' },
  ],
  qd: [
    { id: 'q1', customer_name: 'Sunita Devi', mobile: '8765432109', agent: 'Priya Sharma', employment_type: 'salaried', status: 'pending', submitted: 'Today 09:15', docs: 2 },
    { id: 'q2', customer_name: 'Ganesh Babu', mobile: '6789012345', agent: 'Arjun Kumar', employment_type: 'self_employed', status: 'pending', submitted: 'Today 08:30', docs: 1 },
    { id: 'q3', customer_name: 'Anjali Singh', mobile: '9543210987', agent: 'Arjun Kumar', employment_type: 'salaried', status: 'dispatched', submitted: 'Yesterday', docs: 2 },
    { id: 'q4', customer_name: 'Priya Kumari', mobile: '8876543210', agent: 'Priya Sharma', employment_type: 'self_employed', status: 'dispatched', submitted: '2 days ago', docs: 3 },
    { id: 'q5', customer_name: 'Ramesh T.', mobile: '9765432100', agent: 'Ravi Patel', employment_type: 'salaried', status: 'pending', submitted: 'Today 10:00', docs: 2 },
  ],
  incentives: [
    { agent: 'Arjun Kumar', dispatched: 28, gross: 28000, tds: 2800, net: 25200, status: 'paid', month: 'June 2025' },
    { agent: 'Priya Sharma', dispatched: 22, gross: 22000, tds: 2200, net: 19800, status: 'paid', month: 'June 2025' },
    { agent: 'Ravi Patel', dispatched: 19, gross: 19000, tds: 1900, net: 17100, status: 'pending', month: 'June 2025' },
    { agent: 'Meena Nair', dispatched: 14, gross: 14000, tds: 1400, net: 12600, status: 'pending', month: 'June 2025' },
    { agent: 'Kiran Raj', dispatched: 8, gross: 8000, tds: 800, net: 7200, status: 'paid', month: 'June 2025' },
    { agent: 'Deepa Rao', dispatched: 11, gross: 11000, tds: 1100, net: 9900, status: 'pending', month: 'June 2025' },
  ],
};
