
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Server, ArrowRightLeft, Scale, PlayCircle, 
  Activity, FileText, Settings, HelpCircle, Database, Menu as MenuIcon,
  FileBarChart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Drawer, List, ListItem, ListItemButton, ListItemIcon, 
    ListItemText, IconButton, Box, Typography, Divider, useTheme 
} from '@mui/material';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  drawerWidth: number;
}

const ShieldLogo = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapse, drawerWidth }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard'), path: '/' },
    { id: 'agents', icon: Server, label: t('common.agents'), path: '/agents' },
    { id: 'endpoints', icon: Database, label: t('common.endpoints'), path: '/endpoints' },
    { id: 'pipelines', icon: ArrowRightLeft, label: t('common.pipelines'), path: '/pipelines' },
    { id: 'comparison', icon: Scale, label: t('common.comparison'), path: '/comparison' },
    { id: 'tasks', icon: PlayCircle, label: t('common.tasks'), path: '/tasks' },
    { id: 'monitoring', icon: Activity, label: t('common.monitoring'), path: '/monitoring' },
    { id: 'reports', icon: FileBarChart, label: t('common.reports'), path: '/reports' },
    { id: 'logs', icon: FileText, label: t('common.logs'), path: '/logs' },
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: t('common.settings'), path: '/settings' },
    { id: 'help', icon: HelpCircle, label: t('common.help'), path: '/help' },
  ];

  const renderItem = (item: any) => {
    const isActive = location.pathname === item.path;
    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block', mb: 0.5 }}>
        <ListItemButton
          onClick={() => navigate(item.path)}
          sx={{
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'initial',
            px: 2.5,
            mx: 1,
            borderRadius: 3,
            bgcolor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'primary.contrastText' : 'text.secondary',
            '&:hover': {
               bgcolor: isActive ? 'primary.dark' : 'action.hover',
               color: isActive ? 'primary.contrastText' : 'primary.main',
            }
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: 'center',
              color: 'inherit'
            }}
          >
            <item.icon size={22} />
          </ListItemIcon>
          <ListItemText 
            primary={item.label} 
            sx={{ 
                opacity: collapsed ? 0 : 1, 
                '& .MuiTypography-root': { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' } 
            }} 
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={!collapsed}
      sx={{
        width: collapsed ? 65 : drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
            width: collapsed ? 65 : drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
        },
      }}
    >
      <Box sx={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 1 : 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <Box sx={{ color: 'primary.main', minWidth: 32, display: 'flex' }}>
                <ShieldLogo className="w-8 h-8" />
            </Box>
            {!collapsed && (
                <Typography variant="h6" fontWeight={900} color="text.primary" noWrap>
                    AFCM
                </Typography>
            )}
        </Box>
        {!collapsed && (
            <IconButton onClick={toggleCollapse} size="small">
                <MenuIcon size={20} />
            </IconButton>
        )}
      </Box>
      
      {/* Toggle button when collapsed - centered */}
      {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
             <IconButton onClick={toggleCollapse} size="small">
                <MenuIcon size={20} />
            </IconButton>
          </Box>
      )}

      <List sx={{ flexGrow: 1, py: 2 }}>
        {menuItems.map(renderItem)}
      </List>
      
      <Divider />
      
      <List sx={{ py: 1 }}>
        {bottomItems.map(renderItem)}
      </List>
    </Drawer>
  );
};

export default Sidebar;
