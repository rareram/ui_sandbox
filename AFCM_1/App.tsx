
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, PaletteMode } from '@mui/material';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import PipelineList from './components/Pipelines/PipelineList';
import PipelineWizard from './components/Pipelines/PipelineWizard';
import AgentList from './components/Agents/AgentList';
import EndpointList from './components/Endpoints/EndpointList';
import TaskList from './components/Tasks/TaskList';
import Monitoring from './components/Monitoring/Monitoring';
import LogsEvents from './components/Logs/LogsEvents';
import Reports from './components/Reports/Reports';
import { EditorProvider } from './components/common/EditorContext';
import { MOCK_PIPELINES } from './constants';
import { Pipeline } from './types';
import './i18n';

// Simplified Shield Logo
const ShieldLogo = ({ className = "" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
  </svg>
);

// Mock Login Component
const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            onLogin();
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-50"></div>
             
             <div className="z-10 bg-slate-800 p-10 rounded-[32px] shadow-2xl border border-slate-700 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 w-16 h-16 text-blue-500 flex items-center justify-center">
                        <ShieldLogo className="w-full h-full" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">AFCM</h1>
                    <p className="text-slate-400">Sign in to manage your data pipelines</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email ID</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="admin@arkdata.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                    >
                        Sign In
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500">
                    <p>Default: admin / password</p>
                </div>
             </div>
        </div>
    );
};

const ProtectedRoute = ({ children, isAuthenticated }: { children?: React.ReactNode, isAuthenticated: boolean }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
      return localStorage.getItem('auth') === 'true';
  });
  const [showWizard, setShowWizard] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | undefined>(undefined);
  const [pipelines, setPipelines] = useState<Pipeline[]>(MOCK_PIPELINES);
  const [mode, setMode] = useState<PaletteMode>('dark');

  useEffect(() => {
    // Sync with Tailwind class
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb' },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f1f5f9', 
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b', 
        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
      }
    },
    typography: {
      fontFamily: '"Inter", "sans-serif"',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 24,
                    backgroundImage: 'none',
                    boxShadow: mode === 'dark' ? '0 1px 3px 0 rgb(0 0 0 / 0.3)' : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    border: mode === 'light' ? '1px solid #e2e8f0' : undefined 
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 12 }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 700 }
            }
        }
    }
  }), [mode]);

  const handleLogin = () => {
      setIsAuthenticated(true);
      localStorage.setItem('auth', 'true');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('auth');
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Pipeline Handlers
  const handleSavePipeline = (savedPipeline: Pipeline) => {
      setPipelines(prev => {
          const exists = prev.find(p => p.id === savedPipeline.id);
          if (exists) {
              return prev.map(p => p.id === savedPipeline.id ? savedPipeline : p);
          } else {
              return [savedPipeline, ...prev];
          }
      });
      setShowWizard(false);
      setEditingPipeline(undefined);
  };

  const handleDeletePipeline = (id: string) => {
      setPipelines(prev => prev.filter(p => p.id !== id));
  };

  const handleOpenAddWizard = () => {
      setEditingPipeline(undefined);
      setShowWizard(true);
  };

  const handleOpenEditWizard = (pipeline: Pipeline) => {
      setEditingPipeline(pipeline);
      setShowWizard(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <EditorProvider>
        <CssBaseline />
        <HashRouter>
            <div className="h-screen flex flex-col">
                <Routes>
                <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
                } />
                
                <Route path="/" element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Layout onLogout={handleLogout} toggleColorMode={toggleColorMode} mode={mode} />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="agents" element={<AgentList />} />
                    <Route path="endpoints" element={<EndpointList />} />
                    <Route 
                        path="pipelines" 
                        element={
                            <PipelineList 
                                pipelines={pipelines} 
                                openWizard={handleOpenAddWizard}
                                onEdit={handleOpenEditWizard}
                                onDelete={handleDeletePipeline}
                            />
                        } 
                    />
                    <Route path="tasks" element={<TaskList />} />
                    <Route path="monitoring" element={<Monitoring />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="logs" element={<LogsEvents />} />
                    
                    <Route path="comparison" element={<div className="p-6">Data Comparison Module (Coming Soon)</div>} />
                    <Route path="settings" element={<div className="p-6">System Configuration (Coming Soon)</div>} />
                    <Route path="help" element={<div className="p-6">Documentation & Support (Coming Soon)</div>} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {showWizard && isAuthenticated && (
                    <PipelineWizard 
                        onClose={() => { setShowWizard(false); setEditingPipeline(undefined); }}
                        onSave={handleSavePipeline}
                        initialData={editingPipeline}
                    />
                )}
            </div>
        </HashRouter>
      </EditorProvider>
    </ThemeProvider>
  );
};

export default App;
