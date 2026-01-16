
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Box, Toolbar } from '@mui/material';

interface LayoutProps {
    onLogout: () => void;
    toggleColorMode: () => void;
    mode: 'light' | 'dark';
}

const DRAWER_WIDTH = 256;

const Layout: React.FC<LayoutProps> = ({ onLogout, toggleColorMode, mode }) => {
  const [collapsed, setCollapsed] = useState(false);

  // 대시보드 패널 좌표 계산을 위해 로컬 스토리지나 커스텀 이벤트를 통해 상태 공유 가능
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }));
  }, [collapsed]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Header 
        onLogout={onLogout} 
        toggleColorMode={toggleColorMode} 
        mode={mode} 
        drawerWidth={DRAWER_WIDTH}
        collapsed={collapsed}
      />
      <Sidebar 
        collapsed={collapsed} 
        toggleCollapse={() => setCollapsed(!collapsed)} 
        drawerWidth={DRAWER_WIDTH}
      />
      
      <Box component="main" sx={{ flexGrow: 1, p: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
            <Outlet context={{ isSidebarOpen: !collapsed }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
