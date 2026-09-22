import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children, showTopBar = true }) => {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col bg-[radial-gradient(circle_at_92%_2%,_rgba(99,102,241,0.13),_transparent_25%),radial-gradient(circle_at_48%_100%,_rgba(45,212,191,0.08),_transparent_28%),#F8FAFF]">
        {showTopBar && <TopBar />}
        <div className="flex-1 px-6 pb-14 pt-7 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
