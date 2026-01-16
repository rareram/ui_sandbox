
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { 
    AppBar, Toolbar, IconButton, Typography, Box, 
    Avatar, Tooltip, Badge, useTheme 
} from '@mui/material';

interface HeaderProps {
    onLogout: () => void;
    toggleColorMode: () => void;
    mode: 'light' | 'dark';
    drawerWidth: number;
    collapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogout, toggleColorMode, mode, drawerWidth, collapsed }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const theme = useTheme();

  const toggleLang = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLang);
  };

  const getPageTitle = (pathname: string) => {
      switch (pathname) {
          case '/': return { title: t('common.dashboard'), subtitle: 'System Health Overview' };
          case '/agents': return { title: t('common.agents'), subtitle: 'Manage CDC Agents' };
          case '/endpoints': return { title: t('common.endpoints'), subtitle: 'Manage Source & Target Connections' };
          case '/pipelines': return { title: t('common.pipelines'), subtitle: 'Manage Data Replication' };
          case '/tasks': return { title: t('common.tasks'), subtitle: 'Manage Replication Tasks' };
          case '/comparison': return { title: t('common.comparison'), subtitle: 'Data Consistency Check' };
          case '/monitoring': return { title: t('common.monitoring'), subtitle: 'Real-time Metrics' };
          case '/reports': return { title: t('common.reports'), subtitle: 'System Performance Reports' };
          case '/logs': return { title: t('common.logs'), subtitle: 'System Logs & Events' };
          case '/settings': return { title: t('common.settings'), subtitle: 'System Configuration' };
          case '/help': return { title: t('common.help'), subtitle: 'Documentation & Support' };
          default: return { title: 'AFCM', subtitle: '' };
      }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <AppBar 
        position="fixed" 
        color="inherit" 
        elevation={0}
        sx={{ 
            width: `calc(100% - ${collapsed ? 65 : drawerWidth}px)`,
            ml: `${collapsed ? 65 : drawerWidth}px`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
                {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {subtitle}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={t('common.language')} children={
                <IconButton onClick={toggleLang} color="inherit">
                    <Globe size={20} />
                    <Typography variant="caption" fontWeight="bold" sx={{ ml: 0.5 }}>
                        {i18n.language.toUpperCase()}
                    </Typography>
                </IconButton>
            } />

            <Tooltip title={t('common.theme')} children={
                <IconButton onClick={toggleColorMode} color="inherit">
                    {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
            } />

            <Tooltip title="Notifications" children={
                <IconButton color="inherit">
                    <Badge variant="dot" color="error">
                        <Bell size={20} />
                    </Badge>
                </IconButton>
            } />
            
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                ml: 2, 
                pl: 2, 
                borderLeft: `1px solid ${theme.palette.divider}` 
            }}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary" lineHeight={1.2}>
                        Admin User
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        System Administrator
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'action.selected', color: 'text.secondary', width: 36, height: 36 }}>
                    <User size={20} />
                </Avatar>
                <Tooltip title={t('common.logout')} children={
                    <IconButton onClick={onLogout} color="default" sx={{ '&:hover': { color: 'error.main' } }}>
                        <LogOut size={20} />
                    </IconButton>
                } />
            </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
