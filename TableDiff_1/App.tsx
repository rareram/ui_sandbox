import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Connections from './pages/Connections';
import Wizard from './pages/Wizard';
import Report from './pages/Report';
import Repair from './pages/Repair';
import Admin from './pages/Admin';

const SidebarLink = ({ to, icon, label, filled = false }: { to: string; icon: string; label: string; filled?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
          isActive
            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark'
        }`
      }
    >
      <span className={`material-symbols-outlined ${filled || isActive ? 'icon-fill' : ''} ${isActive ? '' : 'group-hover:text-primary transition-colors'}`}>
        {icon}
      </span>
      <span className={`text-sm font-medium ${isActive ? '' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`}>
        {label}
      </span>
    </NavLink>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark flex flex-col justify-between p-4 hidden md:flex z-50">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white">dns</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-tight dark:text-white">TableDiff</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Enterprise Edition</p>
            </div>
          </div>
          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            <SidebarLink to="/" icon="dashboard" label="Dashboard" />
            <SidebarLink to="/wizard" icon="compare_arrows" label="New Comparison" />
            <SidebarLink to="/connections" icon="database" label="Connections" filled />
            <SidebarLink to="/reports" icon="description" label="Reports" />
            <SidebarLink to="/repair" icon="build" label="Repair" />
            <SidebarLink to="/admin" icon="settings" label="Settings" />
          </nav>
        </div>
        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-card-dark">
          <div
            className="h-9 w-9 rounded-full bg-cover bg-center"
            style={{
              backgroundImage: "url('https://picsum.photos/200/200')",
            }}
          ></div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-medium dark:text-white truncate">ArkData</p>
            <p className="text-xs text-slate-500 truncate">Admin</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;