import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const STORAGE_KEY = 'orison.sidebar';
const ShellContext = createContext(false);

const Layout = ({ children }) => {
  const nested = useContext(ShellContext);
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'collapsed');

  if (nested) return children ?? null;

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, next ? 'collapsed' : 'expanded');
      return next;
    });
  };

  return (
    <ShellContext.Provider value={true}>
      <div className="flex h-screen overflow-hidden bg-[var(--canvas)]">
        <Sidebar
          open={navOpen}
          collapsed={collapsed}
          onClose={() => setNavOpen(false)}
        />
        <div className="orison-canvas flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <TopBar
            collapsed={collapsed}
            onOpenNav={() => setNavOpen(true)}
            onToggleSidebar={toggleCollapsed}
          />
          <main className="px-4 py-5 sm:px-6 lg:px-8">
            <div key={location.pathname} className="liquid-page-in pb-10">{children ?? <Outlet />}</div>
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
};

export default Layout;
