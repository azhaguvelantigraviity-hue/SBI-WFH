import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';

export function Layout({ activePage, onPageChange, title, children }) {
  const { auth } = useAuth();

  if (!auth) return children;

  return (
    <div className="flex min-h-screen bg-background dark:bg-background-dark transition-colors duration-200">
      <Sidebar activePage={activePage} onPageChange={onPageChange} />
      
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Topbar title={title} />
        
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
