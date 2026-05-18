import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { LeadsPage } from './pages/admin/Leads';
import { AgentDashboard } from './pages/agent/Dashboard';
import { SalesPersonsPage } from './pages/admin/SalesPersons';
import { UploadDatasheetPage } from './pages/admin/UploadDatasheet';
import { AssignLeadsPage } from './pages/admin/AssignLeads';
import { ExceptionFollowupPage } from './pages/admin/ExceptionFollowup';
import { QDManagementPage } from './pages/admin/QDManagement';
import { ReportsPage } from './pages/admin/Reports';
import { IncentivesPage } from './pages/admin/Incentives';
import { CallTrackingPage } from './pages/admin/CallTracking';
import { SettingsPage } from './pages/admin/Settings';
import { CallCustomerPage } from './pages/agent/CallCustomer';
import { VerificationPage } from './pages/agent/Verification';
import { QDFormPage } from './pages/agent/QDForm';
import { DocumentsPage } from './pages/agent/Documents';
import { MyIncentivesPage } from './pages/agent/MyIncentives';
import { MyProfilePage } from './pages/agent/MyProfile';

// Placeholder pages for demonstration
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
    <h2 className="text-2xl font-fraunces font-bold mb-2">{title}</h2>
    <p>This module is currently being migrated to the new design system.</p>
  </div>
);

const PAGE_TITLES = {
  'dashboard': 'Dashboard',
  'salespersons': 'Sales Persons',
  'leads': 'Lead Management',
  'upload': 'Upload Datasheet',
  'assign': 'Assign Leads',
  'exceptions': 'Exception/Followup',
  'qd': 'QD Management',
  'reports': 'Reports',
  'incentives': 'Incentives',
  'calls': 'Call Tracking',
  'settings': 'Settings',
  'sp-dashboard': 'My Dashboard',
  'sp-leads': 'My Leads',
  'sp-call': 'Call Customer',
  'sp-verify': 'Verification',
  'sp-qd': 'QD Form',
  'sp-docs': 'Documents',
  'sp-incentives': 'My Incentives',
  'sp-profile': 'My Profile',
};

function App() {
  const { auth, isAuthenticated } = useAuth();
  
  // Set initial page based on role
  const [page, setPage] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      if (parsed.roleKey === 'admin') return 'dashboard';
      if (parsed.roleKey === 'sales_person') return 'sp-dashboard';
    }
    return 'dashboard';
  });

  // Sync active page to the correct dashboard on authentication or role changes
  React.useEffect(() => {
    if (isAuthenticated && auth?.roleKey) {
      setPage(auth.roleKey === 'admin' ? 'dashboard' : 'sp-dashboard');
    }
  }, [isAuthenticated, auth]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <AdminDashboard onNav={setPage} />;
      case 'salespersons':
        return <SalesPersonsPage />;
      case 'upload':
        return <UploadDatasheetPage />;
      case 'assign':
        return <AssignLeadsPage />;
      case 'exceptions':
        return <ExceptionFollowupPage />;
      case 'qd':
        return <QDManagementPage />;
      case 'reports':
        return <ReportsPage />;
      case 'incentives':
        return <IncentivesPage />;
      case 'calls':
        return <CallTrackingPage />;
      case 'settings':
        return <SettingsPage />;
      case 'sp-dashboard':
        return <AgentDashboard />;
      case 'leads':
      case 'sp-leads':
        return <LeadsPage onNav={setPage} />;
      case 'sp-call':
        return <CallCustomerPage />;
      case 'sp-verify':
        return <VerificationPage />;
      case 'sp-qd':
        return <QDFormPage />;
      case 'sp-docs':
        return <DocumentsPage />;
      case 'sp-incentives':
        return <MyIncentivesPage />;
      case 'sp-profile':
        return <MyProfilePage />;
      default:
        return <PlaceholderPage title={PAGE_TITLES[page] || 'Module'} />;
    }
  };

  return (
    <Layout 
      activePage={page} 
      onPageChange={setPage} 
      title={PAGE_TITLES[page] || 'Dashboard'}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
