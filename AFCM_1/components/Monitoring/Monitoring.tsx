
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, Server, Database, Network, 
  CheckCircle2, XCircle, AlertTriangle, PauseCircle,
  Cpu, HardDrive, ChevronDown, ChevronUp, Clock, Layers,
  CalendarDays
} from 'lucide-react';
import { 
    Box, Card, CardContent, Typography, 
    Paper, useTheme, Select, MenuItem, FormControl
} from '@mui/material';
import { 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

// --- Constants ---
const PROCESS_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e'  // Rose
];

// --- Types ---
type StatusType = 'RUNNING' | 'STOPPED' | 'ERROR' | 'WARNING';
type AgentStatusType = 'Active' | 'Inactive';
type EndpointStatusType = 'Connected' | 'Disconnected';
type AgentRoleType = 'SOURCE' | 'TARGET' | 'BOTH' | 'RELAY';

interface ModuleMetrics {
  status: StatusType;
  tps?: number;
  throughput_mb?: number;
  network_mb?: number;
  alerts: number;
  lag?: number;
}

interface PipelineMonitor {
  id: string;
  name: string;
  description: string;
  sourceDb: string;
  sourceDbType: string;
  targetDb: string;
  targetDbType: string;
  status: StatusType;
  uptime: string;
  throughput: number;
  modules: {
    extract: ModuleMetrics;
    send: ModuleMetrics;
    post: ModuleMetrics;
  };
}

interface AgentHealth {
  id: string;
  name: string;
  description: string;
  role: AgentRoleType;
  cpu: number;
  mem: number;
  status: AgentStatusType;
  uptime: string;
  processes: {
      agent: number;
      extract: number;
      send: number;
      post: number;
  };
}

interface EndpointHealth {
  id: string;
  name: string;
  description: string;
  role: 'Source' | 'Target' | 'Both';
  dbType: string;
  dbName: string;
  status: EndpointStatusType;
  latency: string;
  uptime: string;
}

// --- Helper Functions ---
const getDbLogo = (type: string) => {
  const map: Record<string, string> = {
    ORACLE: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oracle/oracle-original.svg',
    POSTGRESQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
    MYSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    MSSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-plain.svg',
    MARIADB: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mariadb/mariadb-original.svg',
    TIBERO: '' 
  };
  return map[type.toUpperCase()] || '';
};

// --- Mock Data Helpers ---

// Generic Pipeline Data Generator
const generateTimeSeriesData = (timeRange: string, tick: number) => {
    const points = 20;
    const now = Date.now();
    let intervalMs = 60 * 1000; 

    switch(timeRange) {
        case '10m': intervalMs = 30 * 1000; break;
        case '30m': intervalMs = 90 * 1000; break;
        case '1h': intervalMs = 3 * 60 * 1000; break;
        case '4h': intervalMs = 12 * 60 * 1000; break;
        case '6h': intervalMs = 18 * 60 * 1000; break;
        case '12h': intervalMs = 36 * 60 * 1000; break;
        case '24h': intervalMs = 72 * 60 * 1000; break;
        case '7d': intervalMs = 8.4 * 60 * 60 * 1000; break;
        default: intervalMs = 60 * 1000;
    }

    return Array.from({ length: points }, (_, i) => {
        const time = new Date(now - (points - 1 - i) * intervalMs); 
        const isLongRange = ['24h', '7d'].includes(timeRange);
        const timeStr = isLongRange 
            ? time.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })
            : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        return {
            time: timeStr,
            cpuSrc: Math.floor(20 + Math.random() * 30),
            memSrc: Math.floor(1024 + Math.random() * 512),
            cpuTgt: Math.floor(15 + Math.random() * 25),
            memTgt: Math.floor(2048 + Math.random() * 1024),
            dmlExtract: Math.floor(2000 + Math.random() * 1000),
            ddlExtract: Math.random() > 0.9 ? Math.floor(Math.random() * 50) : 0,
            lagExtract: Number((Math.random() * 0.5).toFixed(2)),
            network: Number((5 + Math.random() * 5).toFixed(1)),
            dmlPost: Math.floor(1950 + Math.random() * 1000),
            ddlPost: Math.random() > 0.9 ? Math.floor(Math.random() * 50) : 0,
            lagPost: Number((Math.random() * 1.5).toFixed(2)),
        };
    });
};

// Agent Specific Process Data Generator
const generateAgentDetailData = (agent: AgentHealth, timeRange: string, tick: number) => {
    const points = 20;
    const now = Date.now();
    let intervalMs = 60 * 1000;

    switch(timeRange) {
        case '10m': intervalMs = 30 * 1000; break;
        case '30m': intervalMs = 90 * 1000; break;
        case '1h': intervalMs = 3 * 60 * 1000; break;
        case '4h': intervalMs = 12 * 60 * 1000; break;
        case '6h': intervalMs = 18 * 60 * 1000; break;
        case '12h': intervalMs = 36 * 60 * 1000; break;
        case '24h': intervalMs = 72 * 60 * 1000; break;
        case '7d': intervalMs = 8.4 * 60 * 60 * 1000; break;
        default: intervalMs = 60 * 1000;
    }

    return Array.from({ length: points }, (_, i) => {
        const time = new Date(now - (points - 1 - i) * intervalMs);
        const isLongRange = ['24h', '7d'].includes(timeRange);
        const timeStr = isLongRange 
            ? time.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })
            : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const entry: any = { time: timeStr };

        // Helper to generate random metrics for each process instance
        const fillProcessData = (type: string, count: number) => {
            for(let j=0; j < count; j++) {
                // Add consistent randomness based on index to visually separate lines
                const baseLoad = 10 + (j * 5); 
                const randomVar = Math.random() * 20;
                
                entry[`${type}_${j}_cpu`] = Math.max(0, Math.min(100, Math.floor(baseLoad + randomVar)));
                entry[`${type}_${j}_mem`] = Math.max(0, Math.floor(200 + (j * 150) + (Math.random() * 50)));
            }
        };

        fillProcessData('agent', agent.processes.agent);
        fillProcessData('extract', agent.processes.extract);
        fillProcessData('send', agent.processes.send);
        fillProcessData('post', agent.processes.post);

        return entry;
    });
};

const MOCK_MONITORING_DATA = {
  pipelines: [
    {
      id: 'p1',
      name: "Oracle_to_PG_Sales",
      description: "Real-time sales data sync to Analytics DB",
      sourceDb: "KR_SALES",
      sourceDbType: "ORACLE",
      targetDb: "GL_ANALYTICS",
      targetDbType: "POSTGRESQL",
      status: "RUNNING" as StatusType,
      uptime: "15일, 04:20:10",
      throughput: 4980,
      modules: {
        extract: { status: "RUNNING", tps: 2500, throughput_mb: 4.5, alerts: 0, lag: 0.1 },
        send: { status: "RUNNING", network_mb: 4.5, alerts: 0 },
        post: { status: "RUNNING", tps: 2480, throughput_mb: 4.4, alerts: 0, lag: 0.2 }
      }
    },
    {
      id: 'p2',
      name: "Tibero_to_Oracle_HR",
      description: "HR Core data replication for HQ reporting",
      sourceDb: "HR_CORE",
      sourceDbType: "TIBERO",
      targetDb: "HQ_HR_MASTER",
      targetDbType: "ORACLE",
      status: "WARNING" as StatusType,
      uptime: "02일, 11:05:30",
      throughput: 900,
      modules: {
        extract: { status: "RUNNING", tps: 500, throughput_mb: 0.8, alerts: 0, lag: 0.5 },
        send: { status: "WARNING", network_mb: 0.5, alerts: 1 },
        post: { status: "RUNNING", tps: 400, throughput_mb: 0.7, alerts: 0, lag: 1.5 }
      }
    },
    {
      id: 'p3',
      name: "MySQL_Log_Stream",
      description: "Web server access logs to Data Lake",
      sourceDb: "WEB_LOGS",
      sourceDbType: "MYSQL",
      targetDb: "DATA_LAKE",
      targetDbType: "POSTGRESQL",
      status: "ERROR" as StatusType,
      uptime: "00일, 00:00:00",
      throughput: 0,
      modules: {
        extract: { status: "ERROR", tps: 0, throughput_mb: 0, alerts: 2, lag: 3600 },
        send: { status: "STOPPED", network_mb: 0, alerts: 0 },
        post: { status: "STOPPED", tps: 0, throughput_mb: 0, alerts: 0, lag: 0 }
      }
    },
    {
        id: 'p4',
        name: "Legacy_Billing_Sync",
        description: "Legacy billing system migration stream",
        sourceDb: "BILLING_V1",
        sourceDbType: "ORACLE",
        targetDb: "BILLING_V2",
        targetDbType: "POSTGRESQL",
        status: "STOPPED" as StatusType,
        uptime: "-",
        throughput: 0,
        modules: {
          extract: { status: "STOPPED", tps: 0, throughput_mb: 0, alerts: 0, lag: 0 },
          send: { status: "STOPPED", network_mb: 0, alerts: 0 },
          post: { status: "STOPPED", tps: 0, throughput_mb: 0, alerts: 0, lag: 0 }
        }
      }
  ] as PipelineMonitor[],
  agents: [
    { id: 'a1', name: "Agent-Seoul-01", description: "Primary Source Agent in Seoul IDC", role: "SOURCE", cpu: 45, mem: 60, status: "Active", uptime: "45일, 12:00:00", processes: { agent: 1, extract: 2, send: 2, post: 0 } },
    { id: 'a2', name: "Agent-AWS-01", description: "Cloud Target Agent (ap-northeast-2)", role: "TARGET", cpu: 30, mem: 40, status: "Active", uptime: "120일, 02:30:00", processes: { agent: 1, extract: 0, send: 0, post: 4 } },
    { id: 'a3', name: "Agent-Busan-01", description: "DR Site Source Agent", role: "BOTH", cpu: 12, mem: 25, status: "Active", uptime: "05일, 01:10:00", processes: { agent: 1, extract: 1, send: 1, post: 1 } },
    { id: 'a4', name: "Agent-Relay-KR", description: "Internal Network Relay", role: "RELAY", cpu: 55, mem: 40, status: "Active", uptime: "30일, 10:00:00", processes: { agent: 1, extract: 0, send: 4, post: 0 } },
    { id: 'a5', name: "Agent-Dev-Test", description: "Development Server", role: "SOURCE", cpu: 0, mem: 0, status: "Inactive", uptime: "-", processes: { agent: 0, extract: 0, send: 0, post: 0 } }
  ] as AgentHealth[],
  endpoints: [
    { id: 'e1', name: "KR_SALES", description: "Main Sales OLTP", role: "Source", dbType: "ORACLE", dbName: "SALES_KR", status: "Connected", latency: "5ms", uptime: "99일, 10:00:00" },
    { id: 'e2', name: "GL_ANALYTICS", description: "Global Data Warehouse", role: "Target", dbType: "POSTGRESQL", dbName: "DW_PROD", status: "Connected", latency: "12ms", uptime: "45일, 02:20:00" },
    { id: 'e3', name: "HR_CORE", description: "HR Management System", role: "Both", dbType: "TIBERO", dbName: "HR_MAIN", status: "Connected", latency: "3ms", uptime: "120일, 05:00:00" },
    { id: 'e4', name: "HQ_HR_MASTER", description: "HQ Master Data", role: "Target", dbType: "ORACLE", dbName: "HQ_MASTER", status: "Disconnected", latency: "-", uptime: "-" },
    { id: 'e5', name: "WEB_LOGS", description: "Web Access Logs", role: "Source", dbType: "MYSQL", dbName: "LOGS_V1", status: "Connected", latency: "2ms", uptime: "10일, 01:00:00" }
  ] as EndpointHealth[]
};

// --- Helper Components ---

const SummaryCard = ({ title, count, icon: Icon, colorClass, textColor, onClick, isActive }: any) => (
    <Card 
        onClick={onClick}
        sx={{ 
            flex: 1, 
            borderRadius: 4, 
            boxShadow: isActive ? 4 : 1,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            transform: isActive ? 'translateY(-2px)' : 'none',
            border: isActive ? '2px solid' : '1px solid',
            borderColor: isActive ? 'primary.main' : 'divider',
            '&:hover': {
                boxShadow: 3,
                borderColor: 'primary.light'
            }
        }} 
        className={isActive ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
    >
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '24px !important' }}>
            <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight="900" className={textColor}>
                    {count}
                </Typography>
            </Box>
            <Box className={`p-3 rounded-2xl ${colorClass}`}>
                <Icon size={24} className="text-white" />
            </Box>
        </CardContent>
    </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    let dotClass = 'bg-slate-400';

    const normalizedStatus = status.toUpperCase();

    if (['RUNNING', 'ACTIVE', 'CONNECTED'].includes(normalizedStatus)) {
        colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        dotClass = 'bg-emerald-500 animate-pulse';
    } else if (['WARNING'].includes(normalizedStatus)) {
        colorClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        dotClass = 'bg-amber-500';
    } else if (['ERROR', 'DISCONNECTED', 'INACTIVE', 'STOPPED'].includes(normalizedStatus)) {
        colorClass = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
        dotClass = 'bg-rose-500';
    }

    // Display Map
    const displayMap: Record<string, string> = {
        'ACTIVE': 'Running',
        'INACTIVE': 'Stopped',
        'CONNECTED': 'Connected',
        'DISCONNECTED': 'Disconnected',
        'RUNNING': 'Running',
        'STOPPED': 'Stopped',
        'ERROR': 'Error',
        'WARNING': 'Warning'
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colorClass}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {displayMap[normalizedStatus] || status}
        </span>
    );
};

const RoleBadge = ({ role }: { role: string }) => {
    const r = role.toUpperCase();
    let classes = 'bg-slate-100 text-slate-600 border-slate-200';
    
    if (r === 'SOURCE') classes = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    else if (r === 'TARGET') classes = 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    else if (r === 'BOTH') classes = 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
    else if (r === 'RELAY') classes = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';

    return (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${classes}`}>
            {role}
        </span>
    );
};

// --- Multi-Line Chart Component for Agents ---
interface MultiProcessChartProps {
    data: any[];
    type: string; // 'agent' | 'extract' | 'send' | 'post'
    metric: 'cpu' | 'mem';
    count: number;
}

const MultiProcessChart: React.FC<MultiProcessChartProps> = ({ data, type, metric, count }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    {Array.from({ length: count }).map((_, i) => (
                        <linearGradient key={`grad_${type}_${i}_${metric}`} id={`grad_${type}_${i}_${metric}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={PROCESS_COLORS[i % PROCESS_COLORS.length]} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={PROCESS_COLORS[i % PROCESS_COLORS.length]} stopOpacity={0}/>
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={metric === 'cpu' ? [0, 100] : ['auto', 'auto']} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                    formatter={(value: any, name: any) => [value, name]}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', marginTop: '5px' }} />
                {Array.from({ length: count }).map((_, i) => (
                    <Area 
                        key={i}
                        type="monotone" 
                        dataKey={`${type}_${i}_${metric}`} 
                        name={`Proc ${i+1}`}
                        stroke={PROCESS_COLORS[i % PROCESS_COLORS.length]} 
                        fill={`url(#grad_${type}_${i}_${metric})`}
                        fillOpacity={1}
                        strokeWidth={1.5}
                        stackId={undefined} // No stacking, allow overlap comparison
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
};

// --- View Components ---

const PipelineAccordionItem: React.FC<{ pipeline: PipelineMonitor; tick: number; timeRange: string }> = ({ pipeline, tick, timeRange }) => {
    const [expanded, setExpanded] = useState(false);
    const chartData = useMemo(() => generateTimeSeriesData(timeRange, tick), [tick, timeRange]);
    const SrcLogo = getDbLogo(pipeline.sourceDbType);
    const TgtLogo = getDbLogo(pipeline.targetDbType);

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="col-span-1 flex justify-center"><StatusBadge status={pipeline.status} /></div>
                <div className="col-span-2 overflow-hidden">
                    <Typography variant="body2" fontWeight="bold" className="text-slate-800 dark:text-white truncate" title={pipeline.name}>{pipeline.name}</Typography>
                    <Typography variant="caption" color="text.secondary" className="block text-[10px] truncate" title={pipeline.description}>{pipeline.description}</Typography>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            {SrcLogo ? <img src={SrcLogo} alt={pipeline.sourceDbType} className="w-4 h-4 object-contain" /> : <Database size={14} className="text-slate-400" />}
                            <span className="text-xs font-bold text-slate-500">{pipeline.sourceDbType}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate" title={pipeline.sourceDb}>{pipeline.sourceDb}</span>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Throughput:</span>
                            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">{pipeline.modules.extract.tps?.toLocaleString() || 0}</span>
                            <span className="text-[10px] text-slate-400">rows/s</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Lag:</span>
                            <span className={`font-mono font-bold text-sm ${pipeline.modules.extract.lag && pipeline.modules.extract.lag > 10 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>{pipeline.modules.extract.lag || 0}</span>
                            <span className="text-[10px] text-slate-400">s</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Throughput:</span>
                            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">{pipeline.modules.post.tps?.toLocaleString() || 0}</span>
                            <span className="text-[10px] text-slate-400">rows/s</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Lag:</span>
                            <span className={`font-mono font-bold text-sm ${pipeline.modules.post.lag && pipeline.modules.post.lag > 10 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>{pipeline.modules.post.lag || 0}</span>
                            <span className="text-[10px] text-slate-400">s</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            {TgtLogo ? <img src={TgtLogo} alt={pipeline.targetDbType} className="w-4 h-4 object-contain" /> : <Database size={14} className="text-slate-400" />}
                            <span className="text-xs font-bold text-slate-500">{pipeline.targetDbType}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate" title={pipeline.targetDb}>{pipeline.targetDb}</span>
                    </div>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-3">
                     <div className="text-right">
                        <Typography variant="caption" fontFamily="monospace" className="text-slate-600 dark:text-slate-400 block whitespace-nowrap font-bold">{pipeline.uptime}</Typography>
                     </div>
                     <div className="text-slate-400">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </div>
            </div>
            {expanded && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col xl:flex-row gap-3 h-[320px]">
                        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><Cpu size={14} className="text-blue-500" /> Source CPU (%)</div>
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorCpuSrc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} domain={[0, 100]} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Area type="monotone" dataKey="cpuSrc" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpuSrc)" /></AreaChart></ResponsiveContainer>
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><HardDrive size={14} className="text-purple-500" /> Source MEM (MB)</div>
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorMemSrc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Area type="monotone" dataKey="memSrc" stroke="#a855f7" fillOpacity={1} fill="url(#colorMemSrc)" /></AreaChart></ResponsiveContainer>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><Database size={14} className="text-emerald-500" /> Extract TPS</div>
                                <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} /><Bar dataKey="dmlExtract" name="DML" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} /><Bar dataKey="ddlExtract" name="DDL" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><Clock size={14} className="text-amber-500" /> Extract Lag</div>
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorLagExt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Area type="monotone" dataKey="lagExtract" stroke="#f59e0b" fill="url(#colorLagExt)" fillOpacity={1} strokeWidth={2} /></AreaChart></ResponsiveContainer>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[180px] bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase"><Network size={14} className="text-indigo-500" /> Send (MB/s)</div>
                            <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Area type="monotone" dataKey="network" stroke="#6366f1" fillOpacity={1} fill="url(#colorNet)" /></AreaChart></ResponsiveContainer>
                        </div>
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><Database size={14} className="text-emerald-500" /> Post TPS</div>
                                <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} /><Bar dataKey="dmlPost" name="DML" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} /><Bar dataKey="ddlPost" name="DDL" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><Clock size={14} className="text-amber-500" /> Post Lag</div>
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorLagPost" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Area type="monotone" dataKey="lagPost" stroke="#f59e0b" fill="url(#colorLagPost)" fillOpacity={1} strokeWidth={2} /></AreaChart></ResponsiveContainer>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                             <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><Cpu size={14} className="text-blue-500" /> Target CPU (%)</div>
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorCpuTgt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} domain={[0, 100]} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Area type="monotone" dataKey="cpuTgt" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpuTgt)" /></AreaChart></ResponsiveContainer>
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase"><HardDrive size={14} className="text-purple-500" /> Target MEM (MB)</div>
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorMemTgt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="time" hide /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px'}} /><Area type="monotone" dataKey="memTgt" stroke="#a855f7" fillOpacity={1} fill="url(#colorMemTgt)" /></AreaChart></ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-right">
                        <span className="text-[10px] text-slate-400 font-mono">Monitoring Window: {timeRange}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const AgentAccordionItem: React.FC<{ agent: AgentHealth; tick: number; timeRange: string }> = ({ agent, tick, timeRange }) => {
    const [expanded, setExpanded] = useState(false);
    const chartData = useMemo(() => generateAgentDetailData(agent, timeRange, tick), [tick, timeRange, agent]);

    const hasExtract = agent.processes.extract > 0;
    const hasSend = agent.processes.send > 0;
    const hasPost = agent.processes.post > 0;

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Header Grid */}
            <div className="grid grid-cols-12 gap-2 p-4 items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                {/* 1. Status (Col 1) */}
                <div className="col-span-1 flex justify-center">
                    <StatusBadge status={agent.status} />
                </div>
                {/* 2. Agent Name (Col 2) */}
                <div className="col-span-2 overflow-hidden flex flex-col justify-center">
                    <Typography variant="body2" fontWeight="bold" className="text-slate-800 dark:text-white truncate" title={agent.name}>{agent.name}</Typography>
                    <Typography variant="caption" color="text.secondary" className="block text-[10px] truncate" title={agent.description}>{agent.description}</Typography>
                </div>
                {/* 3. Role (Col 1) */}
                <div className="col-span-1 flex justify-center">
                    <RoleBadge role={agent.role} />
                </div>
                {/* 4. Extract Proc (Col 1) */}
                <div className="col-span-1 text-center font-mono font-bold text-slate-700 dark:text-slate-200">
                    {agent.processes.extract > 0 ? agent.processes.extract : '-'}
                </div>
                {/* 5. Send Proc (Col 1) */}
                <div className="col-span-1 text-center font-mono font-bold text-slate-700 dark:text-slate-200">
                    {agent.processes.send > 0 ? agent.processes.send : '-'}
                </div>
                {/* 6. Post Proc (Col 1) */}
                <div className="col-span-1 text-center font-mono font-bold text-slate-700 dark:text-slate-200">
                    {agent.processes.post > 0 ? agent.processes.post : '-'}
                </div>
                {/* 7. Uptime (Col 4) - Increased colspan for better spacing */}
                <div className="col-span-4 text-right pr-4">
                     <Typography variant="caption" fontFamily="monospace" className="text-slate-600 dark:text-slate-400 block whitespace-nowrap font-bold">
                        {agent.uptime}
                     </Typography>
                </div>
                {/* 8. Action (Col 1) */}
                <div className="col-span-1 flex justify-end">
                     <div className="text-slate-400">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </div>
            </div>

            {/* Detailed View */}
            {expanded && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* 4 Column Grid for Graphs */}
                    <div className="grid grid-cols-4 gap-4 h-[240px]">
                        {/* Column 1: Agent Process */}
                        <div className="flex flex-col gap-2">
                             <div className="text-xs font-bold text-center text-slate-500 uppercase">Agent Process</div>
                             <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">CPU (%)</div>
                                <MultiProcessChart 
                                    data={chartData} 
                                    type="agent" 
                                    metric="cpu" 
                                    count={agent.processes.agent} 
                                />
                             </div>
                             <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">MEM (MB)</div>
                                <MultiProcessChart 
                                    data={chartData} 
                                    type="agent" 
                                    metric="mem" 
                                    count={agent.processes.agent} 
                                />
                             </div>
                        </div>

                        {/* Column 2: Extract Process */}
                        <div className="flex flex-col gap-2">
                            <div className="text-xs font-bold text-center text-slate-500 uppercase">Extract Process</div>
                            {hasExtract ? (
                                <>
                                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                        <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">CPU (%)</div>
                                        <MultiProcessChart 
                                            data={chartData} 
                                            type="extract" 
                                            metric="cpu" 
                                            count={agent.processes.extract} 
                                        />
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                        <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">MEM (MB)</div>
                                        <MultiProcessChart 
                                            data={chartData} 
                                            type="extract" 
                                            metric="mem" 
                                            count={agent.processes.extract} 
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">No Process</div>
                            )}
                        </div>

                         {/* Column 3: Send Process */}
                         <div className="flex flex-col gap-2">
                            <div className="text-xs font-bold text-center text-slate-500 uppercase">Send Process</div>
                            {hasSend ? (
                                <>
                                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                        <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">CPU (%)</div>
                                        <MultiProcessChart 
                                            data={chartData} 
                                            type="send" 
                                            metric="cpu" 
                                            count={agent.processes.send} 
                                        />
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                        <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">MEM (MB)</div>
                                        <MultiProcessChart 
                                            data={chartData} 
                                            type="send" 
                                            metric="mem" 
                                            count={agent.processes.send} 
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">No Process</div>
                            )}
                        </div>

                         {/* Column 4: Post Process */}
                         <div className="flex flex-col gap-2">
                            <div className="text-xs font-bold text-center text-slate-500 uppercase">Post Process</div>
                            {hasPost ? (
                                <>
                                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                        <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">CPU (%)</div>
                                        <MultiProcessChart 
                                            data={chartData} 
                                            type="post" 
                                            metric="cpu" 
                                            count={agent.processes.post} 
                                        />
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 relative">
                                        <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-400">MEM (MB)</div>
                                        <MultiProcessChart 
                                            data={chartData} 
                                            type="post" 
                                            metric="mem" 
                                            count={agent.processes.post} 
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">No Process</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EndpointAccordionItem: React.FC<{ endpoint: EndpointHealth }> = ({ endpoint }) => {
    const [expanded, setExpanded] = useState(false);
    const Logo = getDbLogo(endpoint.dbType);

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Header Grid */}
            <div className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                {/* 1. Status (Col 1) */}
                <div className="col-span-1 flex justify-center">
                    <StatusBadge status={endpoint.status} />
                </div>
                {/* 2. Endpoint Name (Col 3) */}
                <div className="col-span-3 overflow-hidden flex flex-col justify-center">
                    <Typography variant="body2" fontWeight="bold" className="text-slate-800 dark:text-white truncate" title={endpoint.name}>{endpoint.name}</Typography>
                    <Typography variant="caption" color="text.secondary" className="block text-[10px] truncate" title={endpoint.description}>{endpoint.description}</Typography>
                </div>
                {/* 3. Role (Col 1) */}
                <div className="col-span-1 flex justify-center">
                    <RoleBadge role={endpoint.role} />
                </div>
                {/* 4. DB Info (Col 4) */}
                <div className="col-span-4 flex items-center gap-3">
                     <div className="flex items-center gap-1.5 min-w-[80px]">
                        {Logo ? <img src={Logo} alt={endpoint.dbType} className="w-5 h-5 object-contain" /> : <Database size={16} className="text-slate-400" />}
                        <span className="text-xs font-bold text-slate-500">{endpoint.dbType}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate" title={endpoint.dbName}>{endpoint.dbName}</span>
                        {endpoint.status === 'Connected' && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                Latency: <span className="text-emerald-500 font-mono font-bold">{endpoint.latency}</span>
                            </span>
                        )}
                    </div>
                </div>
                {/* 5. Uptime (Col 2) */}
                <div className="col-span-2 text-right">
                     <Typography variant="caption" fontFamily="monospace" className="text-slate-600 dark:text-slate-400 block whitespace-nowrap font-bold">
                        {endpoint.uptime}
                     </Typography>
                </div>
                {/* 6. Action (Col 1) */}
                <div className="col-span-1 flex justify-end">
                     <div className="text-slate-400">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </div>
            </div>

            {/* Detailed View */}
            {expanded && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4 h-[120px]">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                                <Activity size={14} className="text-blue-500"/> Connection Stats
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Active Connections</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">12</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Max Connections</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">50</span>
                                </div>
                            </div>
                        </div>
                         <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                                <Network size={14} className="text-purple-500"/> Network Health
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Packet Loss</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">0%</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Avg Jitter</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">2ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PipelinesView = ({ tick, timeRange }: { tick: number, timeRange: string }) => {
    const data = MOCK_MONITORING_DATA.pipelines;
    const [filterStatus, setFilterStatus] = useState<'ALL' | StatusType>('ALL');

    const stats = {
        total: data.length,
        running: data.filter(p => p.status === 'RUNNING').length,
        warning: data.filter(p => p.status === 'WARNING').length,
        error: data.filter(p => p.status === 'ERROR').length,
        stopped: data.filter(p => p.status === 'STOPPED').length,
    };

    const filteredData = filterStatus === 'ALL' 
        ? data 
        : data.filter(p => p.status === filterStatus);

    return (
        <Box className="space-y-6">
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <SummaryCard title="Total" count={stats.total} icon={Layers} colorClass="bg-blue-500" textColor="text-blue-600 dark:text-blue-400" onClick={() => setFilterStatus('ALL')} isActive={filterStatus === 'ALL'} />
                <SummaryCard title="Running" count={stats.running} icon={CheckCircle2} colorClass="bg-emerald-500" textColor="text-emerald-600 dark:text-emerald-400" onClick={() => setFilterStatus('RUNNING')} isActive={filterStatus === 'RUNNING'} />
                <SummaryCard title="Warning" count={stats.warning} icon={AlertTriangle} colorClass="bg-amber-500" textColor="text-amber-600 dark:text-amber-400" onClick={() => setFilterStatus('WARNING')} isActive={filterStatus === 'WARNING'} />
                <SummaryCard title="Error" count={stats.error} icon={XCircle} colorClass="bg-rose-500" textColor="text-rose-600 dark:text-rose-400" onClick={() => setFilterStatus('ERROR')} isActive={filterStatus === 'ERROR'} />
                <SummaryCard title="Stopped" count={stats.stopped} icon={PauseCircle} colorClass="bg-slate-500" textColor="text-slate-600 dark:text-slate-400" onClick={() => setFilterStatus('STOPPED')} isActive={filterStatus === 'STOPPED'} />
            </Box>

            <Card sx={{ borderRadius: 5, overflow: 'hidden' }} className="border border-slate-200 dark:border-slate-800 shadow-sm">
                 <CardContent sx={{ p: 0 }}>
                    <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-2">Pipeline Name</div>
                        <div className="col-span-2">Source</div>
                        <div className="col-span-2">Extract</div>
                        <div className="col-span-2">Post</div>
                        <div className="col-span-2">Target</div>
                        <div className="col-span-1 text-right">Uptime</div>
                    </div>
                    <div className="flex flex-col">
                        {filteredData.map(pipeline => (<PipelineAccordionItem key={pipeline.id} pipeline={pipeline} tick={tick} timeRange={timeRange} />))}
                        {filteredData.length === 0 && <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No pipelines found.</div>}
                    </div>
                 </CardContent>
            </Card>
        </Box>
    );
};

const AgentsView = ({ tick, timeRange }: { tick: number, timeRange: string }) => {
    const data = MOCK_MONITORING_DATA.agents;
    const [filterStatus, setFilterStatus] = useState<'ALL' | AgentStatusType>('ALL');

    const stats = {
        total: data.length,
        running: data.filter(a => a.status === 'Active').length,
        stopped: data.filter(a => a.status === 'Inactive').length,
    };

    const filteredData = filterStatus === 'ALL' 
        ? data 
        : data.filter(a => a.status === filterStatus);

    return (
        <Box className="space-y-6">
            {/* Row 1: Status Cards (Updated to just Total, Running, Stopped) */}
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard title="Total Agents" count={stats.total} icon={Server} colorClass="bg-blue-500" textColor="text-blue-600 dark:text-blue-400" onClick={() => setFilterStatus('ALL')} isActive={filterStatus === 'ALL'} />
                <SummaryCard title="Running" count={stats.running} icon={CheckCircle2} colorClass="bg-emerald-500" textColor="text-emerald-600 dark:text-emerald-400" onClick={() => setFilterStatus('Active')} isActive={filterStatus === 'Active'} />
                <SummaryCard title="Stopped" count={stats.stopped} icon={XCircle} colorClass="bg-rose-500" textColor="text-rose-600 dark:text-rose-400" onClick={() => setFilterStatus('Inactive')} isActive={filterStatus === 'Inactive'} />
            </Box>

            {/* Row 2: Agent List Accordion */}
            <Card sx={{ borderRadius: 5, overflow: 'hidden' }} className="border border-slate-200 dark:border-slate-800 shadow-sm">
                 <CardContent sx={{ p: 0 }}>
                    <div className="grid grid-cols-12 gap-2 px-4 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-2">Agent Name</div>
                        <div className="col-span-1 text-center">Role</div>
                        <div className="col-span-1 text-center">Ext Proc</div>
                        <div className="col-span-1 text-center">Snd Proc</div>
                        <div className="col-span-1 text-center">Pst Proc</div>
                        <div className="col-span-4 text-right pr-4">Uptime</div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="flex flex-col">
                        {filteredData.map(agent => (<AgentAccordionItem key={agent.id} agent={agent} tick={tick} timeRange={timeRange} />))}
                        {filteredData.length === 0 && <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No agents found.</div>}
                    </div>
                 </CardContent>
            </Card>
        </Box>
    );
};

const EndpointsView = () => {
    const data = MOCK_MONITORING_DATA.endpoints;
    const [filterStatus, setFilterStatus] = useState<'ALL' | EndpointStatusType>('ALL');

    const stats = {
        total: data.length,
        connected: data.filter(e => e.status === 'Connected').length,
        disconnected: data.filter(e => e.status === 'Disconnected').length,
    };

    const filteredData = filterStatus === 'ALL' 
        ? data 
        : data.filter(e => e.status === filterStatus);

    return (
        <Box className="space-y-6">
            {/* Row 1: Status Cards */}
            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard title="Total" count={stats.total} icon={Database} colorClass="bg-blue-500" textColor="text-blue-600 dark:text-blue-400" onClick={() => setFilterStatus('ALL')} isActive={filterStatus === 'ALL'} />
                <SummaryCard title="Connected" count={stats.connected} icon={CheckCircle2} colorClass="bg-emerald-500" textColor="text-emerald-600 dark:text-emerald-400" onClick={() => setFilterStatus('Connected')} isActive={filterStatus === 'Connected'} />
                <SummaryCard title="Disconnected" count={stats.disconnected} icon={XCircle} colorClass="bg-rose-500" textColor="text-rose-600 dark:text-rose-400" onClick={() => setFilterStatus('Disconnected')} isActive={filterStatus === 'Disconnected'} />
            </Box>

             {/* Row 2: Endpoint List Accordion */}
             <Card sx={{ borderRadius: 5, overflow: 'hidden' }} className="border border-slate-200 dark:border-slate-800 shadow-sm">
                 <CardContent sx={{ p: 0 }}>
                    <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-3">Endpoint Name</div>
                        <div className="col-span-1">Role</div>
                        <div className="col-span-4">DB Information</div>
                        <div className="col-span-2 text-right">Uptime</div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="flex flex-col">
                        {filteredData.map(endpoint => (<EndpointAccordionItem key={endpoint.id} endpoint={endpoint} />))}
                        {filteredData.length === 0 && <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No endpoints found.</div>}
                    </div>
                 </CardContent>
            </Card>
        </Box>
    );
};

// --- Main Component ---
const Monitoring: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<'pipelines' | 'agents' | 'endpoints'>('pipelines');
    const [updateInterval, setUpdateInterval] = useState(0); // Default OFF (0)
    const [timeRange, setTimeRange] = useState('10m'); // Default 10m
    const [tick, setTick] = useState(0);

    // Live update ticker
    useEffect(() => {
        if (updateInterval === 0) return; // Stop updates if interval is 0 (OFF)

        const intervalId = setInterval(() => {
            setTick(prev => prev + 1);
        }, updateInterval);
        return () => clearInterval(intervalId);
    }, [updateInterval]);

    // Reset Live Update when tab changes
    useEffect(() => {
        setUpdateInterval(0);
    }, [activeTab]);

    const counts = {
        pipelines: MOCK_MONITORING_DATA.pipelines.length,
        agents: MOCK_MONITORING_DATA.agents.length,
        endpoints: MOCK_MONITORING_DATA.endpoints.length,
    };

    const tabs = [
        { id: 'pipelines', icon: Activity, label: t('common.pipelines') },
        { id: 'agents', icon: Server, label: t('common.agents') },
        { id: 'endpoints', icon: Network, label: t('common.endpoints') },
    ];

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Header Area */}
            <div className="mb-6 flex justify-between items-center shrink-0">
                {/* Tab Navigation */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                                    ${isActive 
                                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }
                                `}
                            >
                                <tab.icon size={16} className={isActive ? 'text-primary' : ''} />
                                {tab.label}
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                                    isActive 
                                    ? 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {counts[tab.id as keyof typeof counts]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right Controls: Live Update & Time Range */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    
                    {/* Live Updates Control */}
                    <Paper sx={{ pl: 2, pr: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {updateInterval > 0 ? (
                                <Box className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </Box>
                            ) : (
                                <Box className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                            <Typography variant="caption" fontWeight="bold">Live Update</Typography>
                        </Box>
                        <FormControl size="small" variant="standard">
                            <Select
                                value={updateInterval}
                                onChange={(e) => setUpdateInterval(Number(e.target.value))}
                                disableUnderline
                                sx={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 'bold', 
                                    color: updateInterval > 0 ? 'primary.main' : 'text.disabled',
                                    '& .MuiSelect-select': { py: 0.5, pr: '24px !important' } 
                                }}
                            >
                                <MenuItem value={0}>OFF</MenuItem>
                                <MenuItem value={3000}>3초</MenuItem>
                                <MenuItem value={5000}>5초</MenuItem>
                                <MenuItem value={10000}>10초</MenuItem>
                                <MenuItem value={20000}>20초</MenuItem>
                                <MenuItem value={30000}>30초</MenuItem>
                                <MenuItem value={60000}>1분</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>

                    {/* Time Range Selector */}
                    <Paper sx={{ pl: 2, pr: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <CalendarDays size={14} />
                            <Typography variant="caption" fontWeight="bold">Time Range</Typography>
                        </Box>
                        <FormControl size="small" variant="standard">
                            <Select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                disableUnderline
                                sx={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 'bold', 
                                    color: 'text.primary',
                                    '& .MuiSelect-select': { py: 0.5, pr: '24px !important' } 
                                }}
                            >
                                <MenuItem value="10m">10분</MenuItem>
                                <MenuItem value="30m">30분</MenuItem>
                                <MenuItem value="1h">1시간</MenuItem>
                                <MenuItem value="4h">4시간</MenuItem>
                                <MenuItem value="6h">6시간</MenuItem>
                                <MenuItem value="12h">12시간</MenuItem>
                                <MenuItem value="24h">1일</MenuItem>
                                <MenuItem value="7d">1주일</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>
                </Box>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'pipelines' && <PipelinesView tick={tick} timeRange={timeRange} />}
                {activeTab === 'agents' && <AgentsView tick={tick} timeRange={timeRange} />}
                {activeTab === 'endpoints' && <EndpointsView />}
            </div>
        </div>
    );
}

export default Monitoring;
