
import React, { useState, useEffect, useMemo, useRef, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
// import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { 
  Plus, Save, LayoutDashboard, ChevronDown, Check, 
  X, AlertTriangle, CheckCircle, Database, Server,
  Clock, Network, Layers, ShieldAlert, Zap,
  Maximize2, Activity, BarChart3, Filter,
  Maximize, Download, RefreshCw, SquarePlus, SquareMinus, 
  Search, FileText, User, Terminal, Link2, SquarePen,
  ChevronRight, CircleAlert, CircleStop, GripVertical,
  ListFilter, FileSearch, Trash2, Calendar, Settings,
  Cpu, HardDrive, ListTree, History, Square, CheckSquare,
  LucideIcon, Info, AlertOctagon, CheckCircle2, XCircle,
  DatabaseZap, HardDriveDownload, SendHorizontal, Minimize
} from 'lucide-react';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, Treemap, LineChart, Line,
  Cell, ComposedChart, Rectangle, ScatterChart as RechartsScatterChart, 
  Scatter as RechartsScatter, ZAxis
} from 'recharts';

import { MOCK_PIPELINES, MOCK_AGENTS } from '../../constants';
import { PipelineStatus, DbType, Pipeline, Agent, AgentStatus } from '../../types';
import _ from 'lodash';

// const ResponsiveGridLayout = WidthProvider(Responsive);

// --- 1. Interfaces & Types ---

type WidgetType = 
  | 'kpi_pipeline' | 'kpi_agent' | 'kpi_endpoint' | 'kpi_event'
  | 'linechart_throughput_extract' | 'linechart_throughput_post' 
  | 'barchart_ext_dmlddl' | 'barchart_post_dmlddl'
  | 'linechart_extract_lag' | 'linechart_post_lag'
  | 'heatmap_throughput_extract' | 'heatmap_lag_post'
  | 'treemap_throughput_extract'
  | 'pipeline_diagram'
  | 'list_high_lag' | 'list_events';

interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  selectedPipelineIds: string[];
}

interface LayoutConfig {
  id: string;
  name: string;
  // grid: Layout[];
  grid: any[]; // Changed to any temporarily
  widgets: WidgetConfig[];
}

interface SavedDashboard {
  id: string;
  name: string;
  // layout: Layout[]; 
  layout: any[];
  widgets: Record<string, { 
      type: string;
      title: string;
      selectedPipelineIds: string[];
  }>;
}

type DrillDownViewType = 
  | 'KPI_PIPELINE_DETAIL' | 'KPI_AGENT_DETAIL' 
  | 'LINECHART_THROUGHPUT_EXTRACT_DETAIL' | 'LINECHART_THROUGHPUT_POST_DETAIL' 
  | 'LINECHART_EXT_LAG_DETAIL' | 'LINECHART_POST_LAG_DETAIL'
  | 'BARCHART_EXT_DMLDDL_DETAIL' | 'BARCHART_POST_DMLDDL_DETAIL'
  | 'TOPOLOGY_DIAGRAM_DETAIL' 
  | 'HEAT_THROUGHPUT_EXTRACT_DETAIL' | 'HEATMAP_LAG_POST_DETAIL'
  | 'TREEMAP_THROUGHPUT_EXTRACT_DETAIL' | null;

interface DashboardState {
  activeLayoutId: string;
  layouts: Record<string, LayoutConfig>;
  isSidebarOpen: boolean;
  liveInterval: string;
  timeRange: string;
  refreshKey: number; 
  drillDown: {
    isOpen: boolean;
    viewType: DrillDownViewType;
    contextData: any;
  };
  eventLog: {
    isOpen: boolean;
    contextData: any;
  };
  toast: {
    show: boolean;
    message: string;
  };
}

interface DashboardContextType extends DashboardState {
  setLayout: (id: string) => void;
  saveLayoutState: (grid: Layout[]) => void; 
  persistDashboard: () => void; 
  addNewLayout: (name: string) => void;
  addWidget: (type: WidgetType, title: string) => void;
  removeWidget: (id: string) => void;
  updateWidgetFilter: (widgetId: string, pipelineIds: string[]) => void;
  setLiveInterval: (val: string) => void;
  setTimeRange: (val: string) => void;
  setDrillDown: (val: DashboardState['drillDown']) => void;
  setEventLog: (val: DashboardState['eventLog']) => void;
  showToast: (msg: string) => void;
}

const PROCESS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#6366f1'];
const STORAGE_KEY = 'AFCM_SAVED_DASHBOARDS';

// --- Assets ---
const getDbLogo = (type: string) => {
    const map: Record<string, string> = {
      ORACLE: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oracle/oracle-original.svg',
      POSTGRESQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
      MYSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
      MSSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-plain.svg',
      MARIADB: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mariadb/mariadb-original.svg',
    };
    return map[type.toUpperCase()] || '';
};

// --- 2. Centralized State Management ---

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DashboardState>(() => {
    const savedRaw = localStorage.getItem(STORAGE_KEY);
    let layouts: Record<string, LayoutConfig> = {
      'default': {
        id: 'default',
        name: 'Default View',
        grid: [
          { i: 'w1', x: 0, y: 0, w: 5, h: 3 }, { i: 'w2', x: 5, y: 0, w: 5, h: 3 },
          { i: 'w3', x: 10, y: 0, w: 5, h: 3 }, { i: 'w4', x: 15, y: 0, w: 5, h: 3 },
          { i: 'w5', x: 0, y: 3, w: 10, h: 8 }, { i: 'w6', x: 10, y: 3, w: 10, h: 8 },
        ],
        widgets: [
          { id: 'w1', type: 'kpi_pipeline', title: 'Pipeline Status', selectedPipelineIds: [] },
          { id: 'w2', type: 'kpi_agent', title: 'Agent Status', selectedPipelineIds: [] },
          { id: 'w3', type: 'kpi_endpoint', title: 'Endpoint Status', selectedPipelineIds: [] },
          { id: 'w4', type: 'kpi_event', title: 'Event Severity', selectedPipelineIds: [] },
          { id: 'w5', type: 'linechart_throughput_post', title: 'Throughput (Post)', selectedPipelineIds: MOCK_PIPELINES.map(p => p.id) },
          { id: 'w6', type: 'pipeline_diagram', title: 'Pipeline Topology', selectedPipelineIds: MOCK_PIPELINES.map(p => p.id) },
        ]
      }
    };

    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw) as Record<string, SavedDashboard>;
        Object.keys(parsed).forEach(key => {
          const s = parsed[key];
          layouts[key] = {
            id: s.id,
            name: s.name,
            grid: s.layout,
            widgets: Object.entries(s.widgets).map(([wid, w]) => ({
              id: wid,
              type: w.type as WidgetType,
              title: w.title,
              selectedPipelineIds: w.selectedPipelineIds
            }))
          };
        });
      } catch (e) { console.error("Persistence Restore Failed", e); }
    }

    return {
      activeLayoutId: 'default',
      layouts,
      isSidebarOpen: true,
      liveInterval: 'OFF',
      timeRange: '1h',
      refreshKey: 0,
      drillDown: { isOpen: false, viewType: null, contextData: null },
      eventLog: { isOpen: false, contextData: null },
      toast: { show: false, message: '' }
    };
  });

  useEffect(() => {
    if (state.liveInterval === 'OFF') return;
    const msMap: Record<string, number> = { '3s': 3000, '5s': 5000, '10s': 10000, '20s': 20000, '30s': 30000, '1m': 60000 };
    const intervalId = setInterval(() => { setState(s => ({ ...s, refreshKey: s.refreshKey + 1 })); }, msMap[state.liveInterval] || 5000);
    return () => clearInterval(intervalId);
  }, [state.liveInterval]);

  useEffect(() => {
    const handleToggle = (e: any) => setState(s => ({ ...s, isSidebarOpen: !e.detail.collapsed }));
    window.addEventListener('sidebar-toggle', handleToggle);
    return () => window.removeEventListener('sidebar-toggle', handleToggle);
  }, []);

  const actions = {
    setLayout: (id: string) => setState(s => ({ ...s, activeLayoutId: id })),
    saveLayoutState: (grid: Layout[]) => {
      setState(s => ({
        ...s,
        layouts: { ...s.layouts, [s.activeLayoutId]: { ...s.layouts[s.activeLayoutId], grid } }
      }));
    },
    persistDashboard: () => {
      setState(s => {
        const current = s.layouts[s.activeLayoutId];
        if (!current) return s;
        const persistentData: Record<string, SavedDashboard> = {};
        (Object.values(s.layouts) as LayoutConfig[]).forEach(l => {
          persistentData[l.id] = {
            id: l.id,
            name: l.name,
            layout: l.grid,
            widgets: l.widgets.reduce((acc, w) => ({ ...acc, [w.id]: { type: w.type, title: w.title, selectedPipelineIds: w.selectedPipelineIds } }), {})
          };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentData));
        return { ...s, toast: { show: true, message: 'Dashboard configuration saved.' } };
      });
    },
    addNewLayout: (name: string) => {
      const id = `layout_${Date.now()}`;
      setState(s => ({ ...s, layouts: { ...s.layouts, [id]: { id, name, grid: [], widgets: [] } }, activeLayoutId: id }));
    },
    addWidget: (type: WidgetType, title: string) => {
      setState(s => {
        const id = `widget_${Date.now()}`;
        const layout = s.layouts[s.activeLayoutId];
        const newItem = { i: id, x: (layout.grid.length * 5) % 20, y: Infinity, w: 5, h: 4 };
        return { 
          ...s, 
          layouts: { 
            ...s.layouts, 
            [s.activeLayoutId]: { 
              ...layout, 
              widgets: [...layout.widgets, { id, type, title, selectedPipelineIds: [] }], 
              grid: [...layout.grid, newItem] 
            } 
          } 
        };
      });
    },
    removeWidget: (id: string) => {
      setState(s => {
        const layout = s.layouts[s.activeLayoutId];
        return { ...s, layouts: { ...s.layouts, [s.activeLayoutId]: { ...layout, widgets: layout.widgets.filter(w => w.id !== id), grid: layout.grid.filter(g => g.i !== id) } } };
      });
    },
    updateWidgetFilter: (widgetId: string, pipelineIds: string[]) => {
      setState(s => {
        const layout = s.layouts[s.activeLayoutId];
        return { ...s, layouts: { ...s.layouts, [s.activeLayoutId]: { ...layout, widgets: layout.widgets.map(w => w.id === widgetId ? { ...w, selectedPipelineIds: pipelineIds } : w) } } };
      });
    },
    setLiveInterval: (val: string) => setState(s => ({ ...s, liveInterval: val })),
    setTimeRange: (val: string) => setState(s => ({ ...s, timeRange: val })),
    setDrillDown: (val: DashboardState['drillDown']) => setState(s => ({ ...s, drillDown: val })),
    setEventLog: (val: DashboardState['eventLog']) => setState(s => ({ ...s, eventLog: val })),
    showToast: (message: string) => setState(s => ({ ...s, toast: { show: true, message } })),
  };

  useEffect(() => {
    if (state.toast.show) {
      const t = setTimeout(() => setState(s => ({ ...s, toast: { ...s.toast, show: false } })), 3000);
      return () => clearTimeout(t);
    }
  }, [state.toast.show]);

  return (
    <DashboardContext.Provider value={{ ...state, ...actions }}>
      {children}
    </DashboardContext.Provider>
  );
};

const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};

const Portal: React.FC<{ children: ReactNode }> = ({ children }) => {
  return createPortal(children, document.body);
};

// --- 4. WidgetWrapper ---

interface WidgetWrapperProps {
  widgetId: string;
  title: string;
  selectedIds: string[];
  allPipelines: Pipeline[];
  onRemove: () => void;
  onFilterChange: (ids: string[]) => void;
  children: (filteredIds: string[]) => ReactNode;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ 
  widgetId, title, selectedIds, allPipelines, onRemove, onFilterChange, children 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.right + window.scrollX - 220 });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const togglePipeline = (id: string) => {
    const newIds = selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id];
    onFilterChange(newIds);
  };

  // KPI 위젯이나 'Global View' 위젯에서만 필터를 숨깁니다. 
  // 'Pipeline Topology'는 선택된 파이프라인만 보여줘야 하므로 필터가 필요합니다.
  const isKPI = title.toLowerCase().includes('status') || title.toLowerCase().includes('severity');
  const isGlobalWidget = title.toLowerCase().includes('global view');

  return (
    <div className="h-full w-full bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden group/widget">
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30 drag-handle cursor-grab shrink-0 rounded-t-lg">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-400" />
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{title}</span>
        </div>
        
        <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
          {!isKPI && !isGlobalWidget && (
            <div className="relative">
              <button 
                ref={buttonRef}
                onClick={toggleDropdown}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedIds.length > 0 ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ListFilter size={14} />
                {selectedIds.length === 0 ? 'Select Pipelines' : `${selectedIds.length} Selected`}
              </button>
              
              {isDropdownOpen && (
                <Portal>
                  <div ref={dropdownRef} className="fixed z-[9999] w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1 flex flex-col animate-in zoom-in-95 duration-100" style={{ top: dropdownPos.top, left: dropdownPos.left }}>
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Select Target Pipelines</div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {allPipelines.map(p => (
                        <div key={p.id} onClick={() => togglePipeline(p.id)} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${selectedIds.includes(p.id) ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'}`}>{selectedIds.includes(p.id) && <Check size={12} className="text-white" />}</div>
                          <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Portal>
              )}
            </div>
          )}
          <button onClick={onRemove} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-850">
        {!isKPI && !isGlobalWidget && selectedIds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900/50">
            <Activity size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">Please select pipelines from the header<br/>to visualize real-time data.</p>
          </div>
        ) : children(selectedIds)}
      </div>
    </div>
  );
};

// --- 5. DashboardControls ---

const DashboardControls = () => {
  const { activeLayoutId, layouts, setLayout, addNewLayout, persistDashboard, liveInterval, setLiveInterval, timeRange, setTimeRange, addWidget } = useDashboard();
  const [isAddLayoutModalOpen, setIsAddLayoutModalOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);
  const widgetButtonRef = useRef<HTMLButtonElement>(null);
  const [widgetMenuPos, setWidgetMenuPos] = useState({ top: 0, left: 0 });

  const widgetCatalog = [
    { category: 'KPI Cards', items: [{ type: 'kpi_pipeline', title: 'Pipeline Status' }, { type: 'kpi_agent', title: 'Agent Status' }, { type: 'kpi_endpoint', title: 'Endpoint Status' }, { type: 'kpi_event', title: 'Event Severity' }] },
    { category: 'ReCharts', items: [{ type: 'linechart_throughput_extract', title: 'Throughput (Extract)' }, { type: 'linechart_throughput_post', title: 'Throughput (Post)' }, { type: 'barchart_ext_dmlddl', title: 'Throughput (EXT DML/DDL)' }, { type: 'barchart_post_dmlddl', title: 'Throughput (POST DML/DDL)' }, { type: 'linechart_extract_lag', title: 'Lag (Extract)' }, { type: 'linechart_post_lag', title: 'Lag (Post)' }] },
    { category: 'Heat Map', items: [{ type: 'heatmap_throughput_extract', title: 'Throughput (Extract)' }, { type: 'heatmap_lag_post', title: 'Lag (Post)' }] },
    { category: 'Treemap', items: [{ type: 'treemap_throughput_extract', title: 'Extract Volume (Today)' }] },
    { category: 'Diagram', items: [{ type: 'pipeline_diagram', title: 'Pipeline Topology' }] },
    { category: 'Lists', items: [{ type: 'list_high_lag', title: 'High Lag Top 5' }, { type: 'list_events', title: 'Recent Events' }] }
  ];

  const handleWidgetMenuToggle = () => {
    if (!isWidgetMenuOpen && widgetButtonRef.current) {
      const rect = widgetButtonRef.current.getBoundingClientRect();
      setWidgetMenuPos({ top: rect.bottom + window.scrollY + 8, left: rect.right + window.scrollX - 450 });
    }
    setIsWidgetMenuOpen(!isWidgetMenuOpen);
  };

  useEffect(() => {
    const handleClose = () => setIsWidgetMenuOpen(false);
    if (isWidgetMenuOpen) window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isWidgetMenuOpen]);

  return (
    <div className="sticky top-0 z-[500] flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 rounded-2xl border border-slate-700/50 shadow-inner group">
          <LayoutDashboard size={18} className="text-primary group-hover:rotate-12 transition-transform" />
          <select value={activeLayoutId} onChange={e => setLayout(e.target.value)} className="bg-transparent text-white text-sm font-black outline-none border-none cursor-pointer focus:ring-0 pr-6">
            {(Object.values(layouts) as LayoutConfig[]).map(l => (<option key={l.id} value={l.id} className="bg-slate-800 text-white font-bold">{l.name}</option>))}
          </select>
        </div>
        <button onClick={() => setIsAddLayoutModalOpen(true)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all active:scale-95 border border-slate-200 dark:border-slate-700 shadow-sm"><Plus size={18} /></button>
        <button onClick={persistDashboard} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 transition-all active:scale-95 border border-slate-200 dark:border-slate-700 shadow-sm" title="Save Dashboard State"><Save size={18} /></button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live</span><select value={liveInterval} onChange={e => setLiveInterval(e.target.value)} className="bg-transparent text-xs font-black text-slate-600 dark:text-slate-200 outline-none border-none cursor-pointer p-0">{['OFF', '3s', '5s', '10s', '20s', '30s', '1m'].map(v => (<option key={v} value={v}>{v}</option>))}</select></div>
        <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">최근</span><select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="bg-transparent text-xs font-black text-slate-600 dark:text-slate-200 outline-none border-none cursor-pointer p-0">{['10m', '30m', '1h', '4h', '6h', '12h', '1d', '1w'].map(v => (<option key={v} value={v}>{v}</option>))}</select></div>
        <div className="relative">
          <button ref={widgetButtonRef} onClick={(e) => { e.stopPropagation(); handleWidgetMenuToggle(); }} className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black shadow-lg shadow-blue-500/30 flex items-center gap-2 text-xs uppercase tracking-widest active:scale-95 transition-all"><Plus size={16} /> Widget</button>
          {isWidgetMenuOpen && (
            <Portal>
              <div className="fixed z-[2000] w-[450px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 animate-in slide-in-from-top-2 duration-200" style={{ top: widgetMenuPos.top, left: widgetMenuPos.left }} onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {widgetCatalog.map(cat => (
                    <div key={cat.category}>
                      <div className="px-1 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 mb-2">{cat.category}</div>
                      <div className="space-y-1">{cat.items.map(item => (<button key={item.type} onClick={() => { addWidget(item.type as WidgetType, item.title); setIsWidgetMenuOpen(false); }} className="w-full text-left px-2 py-2 text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-primary dark:hover:text-primary rounded-lg transition-all group/item flex items-center justify-between"><span>{item.title}</span><Plus size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" /></button>))}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Portal>
          )}
        </div>
      </div>
      {isAddLayoutModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 w-[400px] max-w-full text-center animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-black mb-6 text-slate-800 dark:text-white">New Dashboard</h3>
              <input autoFocus className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner" placeholder="Enter name..." value={newLayoutName} onChange={e => setNewLayoutName(e.target.value)} />
              <div className="flex gap-4 mt-8">
                <button onClick={() => setIsAddLayoutModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold uppercase text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancel</button>
                <button onClick={() => { if (newLayoutName.trim()) { addNewLayout(newLayoutName); setIsAddLayoutModalOpen(false); setNewLayoutName(''); } }} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 uppercase text-xs active:scale-95 transition-all">Save</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

// --- 6. Specific Widgets ---

const KPICard = ({ type }: { type: 'PIPELINE' | 'AGENT' | 'ENDPOINT' | 'EVENT' }) => {
  const { setDrillDown } = useDashboard();
  const config = {
    PIPELINE: { icon: Layers, color: 'bg-blue-500', labels: ['Total', 'Running', 'Error', 'Warning', 'Stopped'], counts: [15, 12, 1, 1, 1], view: 'KPI_PIPELINE_DETAIL' },
    AGENT: { icon: Server, color: 'bg-emerald-500', labels: ['Total', 'Running', 'Error', 'Stopped'], counts: [8, 7, 0, 1], view: 'KPI_AGENT_DETAIL' },
    ENDPOINT: { icon: Database, color: 'bg-purple-500', labels: ['Total', 'Connected', 'Disconnected'], counts: [12, 11, 1], view: null },
    EVENT: { icon: ShieldAlert, color: 'bg-rose-500', labels: ['Total', 'Critical', 'Error', 'Warning', 'Info'], counts: [45, 2, 8, 24, 11], view: null },
  }[type];

  return (
    <div className="h-full flex flex-col p-4 bg-white dark:bg-slate-850 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => config.view && setDrillDown({ isOpen: true, viewType: config.view as DrillDownViewType, contextData: null })}>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl ${config.color} text-white shadow-lg`}><config.icon size={18} /></div>
        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{type} Status</span>
      </div>
      <div className="flex-1 flex items-center justify-between px-2">
        {config.labels.map((l, i) => (
          <div key={l} className="flex flex-col items-center">
            <span className="text-[8px] text-slate-400 font-bold uppercase mb-1">{l}</span>
            <span className={`text-xl font-black ${l === 'Error' || l === 'Critical' || l === 'Disconnected' ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {config.counts[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RechartsWidget = ({ type, selectedIds }: { type: WidgetType, selectedIds: string[] }) => {
  const { setDrillDown, refreshKey } = useDashboard();
  const data = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    time: `10:${(i * 5).toString().padStart(2, '0')}`,
    ...Object.fromEntries(MOCK_PIPELINES.map((p) => [p.id, Math.floor(Math.random() * 5000) + 500])),
    ...Object.fromEntries(MOCK_PIPELINES.map((p) => [`${p.id}_dml`, Math.floor(Math.random() * 4000)])),
    ...Object.fromEntries(MOCK_PIPELINES.map((p) => [`${p.id}_ddl`, Math.floor(Math.random() * 100)]))
  })), [refreshKey]);
  const visiblePipelines = MOCK_PIPELINES.filter(p => selectedIds.includes(p.id));
  const isBar = type.includes('barchart');
  const getDrillType = (): DrillDownViewType => {
    if (type === 'linechart_throughput_extract') return 'LINECHART_THROUGHPUT_EXTRACT_DETAIL';
    if (type === 'linechart_throughput_post') return 'LINECHART_THROUGHPUT_POST_DETAIL';
    if (type === 'barchart_ext_dmlddl') return 'BARCHART_EXT_DMLDDL_DETAIL';
    if (type === 'barchart_post_dmlddl') return 'BARCHART_POST_DMLDDL_DETAIL';
    if (type === 'linechart_extract_lag') return 'LINECHART_EXT_LAG_DETAIL';
    if (type === 'linechart_post_lag') return 'LINECHART_POST_LAG_DETAIL';
    return null;
  };
  const handlePointClick = (id: string, payload: any) => { setDrillDown({ isOpen: true, viewType: getDrillType(), contextData: { id, time: payload?.time || '10:00' } }); };
  return (
    <div className="h-full w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        {isBar ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} dy={10} reversed />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} width={35} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff'}} />
            <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{fontSize: '9px', fontWeight: 'bold', paddingBottom: '10px'}} />
            {visiblePipelines.map((p, i) => (
              <React.Fragment key={p.id}>
                <Bar dataKey={`${p.id}_dml`} name={`${p.name} DML`} stackId={p.id} fill={PROCESS_COLORS[i % PROCESS_COLORS.length]} radius={[0, 0, 0, 0]} onClick={(payload: any) => handlePointClick(p.id, payload)} />
                <Bar dataKey={`${p.id}_ddl`} name={`${p.name} DDL`} stackId={p.id} fill="#94a3b8" radius={[4, 4, 0, 0]} onClick={(payload: any) => handlePointClick(p.id, payload)} />
              </React.Fragment>
            ))}
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} dy={10} reversed />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} width={35} />
            <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff'}} />
            <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{fontSize: '9px', fontWeight: 'bold', paddingBottom: '10px'}} />
            {visiblePipelines.map((p, i) => (
              <Line key={p.id} type="monotone" dataKey={p.id} name={p.name} stroke={PROCESS_COLORS[i % PROCESS_COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 6, onClick: (e: any, d: any) => handlePointClick(p.id, d.payload) }} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

interface HeatMapPoint { x: number; y: number; value: number; timeLabel: string; pipeLabel: string; }
const HeatmapWidget = ({ type }: { type: WidgetType }) => {
    const { setDrillDown, refreshKey } = useDashboard();
    const isLag = type === 'heatmap_lag_post';
    const allPipelines = MOCK_PIPELINES;
    const pipelineCount = allPipelines.length;
    const data: HeatMapPoint[] = useMemo(() => {
        const results: HeatMapPoint[] = [];
        allPipelines.forEach((p, pIdx) => {
            for (let hIdx = 0; hIdx < 24; hIdx++) {
                const baseVal = isLag ? p.metrics.lagApply : p.metrics.epsExtract;
                const hourFactor = (hIdx > 8 && hIdx < 19) ? 1.5 : 0.4;
                const val = Math.floor(baseVal * hourFactor * (0.6 + Math.random() * 0.8));
                results.push({ x: hIdx, y: pIdx, value: val, timeLabel: `${String(hIdx).padStart(2, '0')}:00`, pipeLabel: p.name });
            }
        });
        return results;
    }, [isLag, refreshKey]);
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    const getColor = (val: number) => {
        const ratio = Math.min(val / (maxValue || 1), 1);
        if (ratio === 0) return 'rgba(148, 163, 184, 0.05)'; 
        if (isLag) {
            if (ratio > 0.8) return '#ef4444';
            if (ratio > 0.6) return '#b91c1c'; 
            if (ratio > 0.4) return '#7f1d1d'; 
            if (ratio > 0.1) return '#450a0a';
            return '#1e293b'; 
        } else {
            if (ratio > 0.8) return '#60a5fa';
            if (ratio > 0.6) return '#2563eb'; 
            if (ratio > 0.4) return '#1e3a8a'; 
            if (ratio > 0.1) return '#172554';
            return '#1e293b'; 
        }
    };
    const CustomShape = (props: any) => {
        const { cx, cy, value, xAxis, yAxis, payload } = props;
        if (!xAxis || !yAxis || typeof xAxis.scale !== 'function' || typeof yAxis.scale !== 'function') return null;
        const xDomain = xAxis.domain;
        const yDomain = yAxis.domain;
        const boxWidth = Math.abs(xAxis.scale(xDomain[0] + 1) - xAxis.scale(xDomain[0]));
        const boxHeight = Math.abs(yAxis.scale(yDomain[0] + 1) - yAxis.scale(yDomain[0]));
        return (<rect x={cx - boxWidth / 2} y={cy - boxHeight / 2} width={boxWidth} height={boxHeight} fill={getColor(value)} stroke="#0f172a" strokeWidth={1} className="cursor-pointer hover:opacity-80 transition-all" onClick={() => setDrillDown({ isOpen: true, viewType: isLag ? 'HEATMAP_LAG_POST_DETAIL' : 'HEAT_THROUGHPUT_EXTRACT_DETAIL', contextData: { pipeline: payload.pipeLabel, time: payload.timeLabel, value: payload.value } })} />);
    };
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload as HeatMapPoint;
            return (<div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-100 min-w-[160px]"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time: {d.timeLabel}</p><p className="text-xs font-black text-white mb-2 pb-1 border-b border-slate-800">Pipeline: {d.pipeLabel}</p><p className="flex justify-between text-[11px] items-center"><span className="text-slate-500 font-bold">{isLag ? 'Lag' : 'Rows'}:</span><span className={`font-black font-mono ${isLag ? 'text-rose-400' : 'text-blue-400'}`}>{d.value.toLocaleString()}{isLag ? 's' : ''}</span></p></div>);
        }
        return null;
    };
    return (
        <div className="h-full w-full p-4 overflow-hidden select-none bg-slate-900/10 relative">
            <ResponsiveContainer width="99.9%" height="100%" minWidth={0} minHeight={0}>
                <RechartsScatterChart margin={{ top: 20, right: 0, bottom: 0, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} opacity={0.05} />
                    <XAxis type="number" dataKey="x" domain={[-0.5, 23.5]} tickCount={24} interval={0} axisLine={false} tickLine={false} tickFormatter={(val) => `${String(Math.round(val)).padStart(2, '0')}:00`} tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8'}} />
                    <YAxis type="number" dataKey="y" domain={[-0.5, pipelineCount - 0.5]} tickCount={pipelineCount} reversed={true} axisLine={false} tickLine={false} tickFormatter={(val) => allPipelines[Math.round(val)]?.name || ''} tick={{fontSize: 9, fontWeight: '900', fill: '#94a3b8'}} width={110} />
                    <ZAxis type="number" dataKey="value" range={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
                    <RechartsScatter data={data} shape={<CustomShape />} isAnimationActive={false} />
                </RechartsScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

const TreemapWidget = ({ selectedIds }: { selectedIds: string[] }) => {
    const { setDrillDown, refreshKey } = useDashboard();
    const data = useMemo(() => MOCK_PIPELINES.filter(p => selectedIds.includes(p.id)).map(p => ({ name: p.name, value: Math.max(500, p.metrics.epsExtract * (0.8 + Math.random() * 0.4)), source: p.source, target: p.target, postRows: p.metrics.epsPost })), [selectedIds, refreshKey]);
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    const getColor = (value: number) => {
        const ratio = value / maxValue;
        if (ratio > 0.8) return '#3b82f6';
        if (ratio > 0.6) return '#2563eb';
        if (ratio > 0.4) return '#1d4ed8';
        if (ratio > 0.2) return '#1e40af';
        return '#1e3a8a';
    };
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            const SLogo = getDbLogo(d.source.dbType);
            return (<div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100 min-w-[220px]"><p className="text-white font-black text-sm mb-3 border-b border-slate-700 pb-2">{d.name}</p><div className="space-y-2"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Source DB:</span><div className="flex items-center gap-1.5 overflow-hidden">{SLogo && <img src={SLogo} className="w-3.5 h-3.5 object-contain" alt="DB" />}<span className="text-xs text-white font-bold truncate max-w-[100px]">{d.source.dbName}</span></div></div><div className="flex justify-between items-center pt-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Extract Rows:</span><span className="text-xs text-blue-400 font-black font-mono">{Math.floor(d.value).toLocaleString()}</span></div><div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Post Rows:</span><span className="text-xs text-emerald-400 font-black font-mono">{Math.floor(d.postRows).toLocaleString()}</span></div></div></div>);
        }
        return null;
    };
    const CustomContent = (props: any) => {
        const { x, y, width, height, name, value } = props;
        return (<g><rect x={x} y={y} width={width} height={height} rx={6} ry={6} fill={getColor(value)} stroke="#0f172a" strokeWidth={1} className="hover:brightness-110 transition-all cursor-pointer" onClick={() => setDrillDown({ isOpen: true, viewType: 'TREEMAP_THROUGHPUT_EXTRACT_DETAIL', contextData: { pipelineName: name } })} />{width > 60 && height > 30 && (<text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="900" className="pointer-events-none uppercase tracking-tighter opacity-90">{name}</text>)}</g>);
    };
    return (<div className="h-full w-full p-4 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"><div className="mb-3 flex items-center justify-between"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Extract Volume by Pipeline</span></div>{data.length > 0 ? (<div className="flex-1 overflow-hidden"><ResponsiveContainer width="100%" height="100%"><Treemap data={data} dataKey="value" stroke="#fff" aspectRatio={4 / 3} content={<CustomContent />}><Tooltip content={<CustomTooltip />} /></Treemap></ResponsiveContainer></div>) : (<div className="flex-1 flex flex-col items-center justify-center text-slate-500 uppercase font-black text-[10px] italic gap-3"><Layers size={32} className="opacity-20" />Select pipelines to visualize volume</div>)}</div>);
};

const TopologyNode = ({ type, title, ip, metrics, status, onDetail, isDb, pipelineName }: any) => {
  const color = status === 'ok' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : status === 'warning' ? 'bg-amber-500' : 'bg-slate-500';
  const themeColor = type === 'Extract' ? 'text-blue-400' : type === 'Post' ? 'text-emerald-400' : 'text-slate-400';
  const Icon = isDb ? Database : (type === 'Extract' ? Zap : (type === 'Send' ? SendHorizontal : Server));
  return (
    <div className="relative flex flex-col items-center">
      {pipelineName && <div className="absolute -top-7 left-0 px-2 py-0.5 bg-slate-900/60 rounded-md border border-slate-700/50 backdrop-blur-sm z-10"><span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter whitespace-nowrap">{pipelineName}</span></div>}
      <div className={`h-24 w-44 rounded-xl flex flex-col p-3 relative shadow-lg group cursor-pointer transition-all hover:scale-105 border ${isDb ? 'bg-slate-950 border-slate-800' : 'bg-slate-800 border-slate-700'} hover:border-primary/50`} onClick={onDetail}>
        <div className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${color} shadow-sm`} />
        <div className="flex items-center gap-2 mb-1.5"><div className={`p-1.5 rounded-lg bg-slate-900/50 ${themeColor}`}><Icon size={18} /></div><span className={`text-[10px] font-black uppercase tracking-widest ${themeColor}`}>{type}</span></div>
        <div className="flex-1 min-w-0"><div className="text-[11px] font-bold text-slate-100 truncate" title={title}>{title}</div>{ip && <div className="text-[9px] font-mono text-slate-500 truncate">{ip}</div>}</div>
        {metrics && <div className="mt-auto pt-1.5 border-t border-slate-700/50 flex items-center justify-between"><span className="text-[10px] font-black text-slate-400">{metrics.label}</span><span className={`text-[10px] font-mono font-black ${themeColor}`}>{metrics.value}</span></div>}
      </div>
    </div>
  );
};

const TopologyWidget = ({ selectedIds }: { selectedIds: string[] }) => {
  const { setDrillDown } = useDashboard();
  const pipelines = useMemo(() => selectedIds.length === 0 ? MOCK_PIPELINES : MOCK_PIPELINES.filter(p => selectedIds.includes(p.id)), [selectedIds]);
  return (
    <div className="h-full w-full flex flex-col overflow-y-auto custom-scrollbar p-6 bg-slate-950/20">
        <style>{`@keyframes moving-dot { from { offset-distance: 0%; } to { offset-distance: 100%; } } .animate-particle { animation: moving-dot linear infinite; }`}</style>
        {pipelines.map((p) => {
            const status = p.status === 'RUNNING' ? 'ok' : p.status === 'ERROR' ? 'error' : p.status === 'WARNING' ? 'warning' : 'stopped';
            const extSpeed = Math.max(0.6, 2 / (1 + (p.metrics.lagExtract ? 0 : 5))); 
            const sndSpeed = Math.max(0.6, 5 / (1 + p.metrics.bpsSend / 10));
            const pstSpeed = Math.max(0.6, 2 / (1 + (p.metrics.lagApply ? 0 : 5)));
            return (
                <div key={p.id} className="flex items-center p-12 border-b border-slate-800/50 last:border-0 hover:bg-slate-900/10 transition-colors">
                    <TopologyNode isDb pipelineName={p.name} type="Source" title={p.source.dbName} ip={p.source.ip} status="ok" onDetail={(e: any) => { e.stopPropagation(); setDrillDown({ isOpen: true, viewType: 'TOPOLOGY_DIAGRAM_DETAIL', contextData: { nodeId: `${p.id}_src` } }); }} />
                    <div className="flex-1 h-px bg-slate-600 relative overflow-visible"><svg className="absolute inset-0 w-full h-2 overflow-visible" style={{ top: '-1px' }}><path id={`path1_${p.id}`} d="M 0 1 L 5000 1" className="stroke-transparent fill-none" /><circle r="3" className="fill-blue-400 animate-particle shadow-[0_0_8px_#60a5fa]" style={{ animationDuration: `${extSpeed}s` }}><animateMotion repeatCount="indefinite" dur={`${extSpeed}s`}><mpath href={`#path1_${p.id}`} /></animateMotion></circle></svg></div>
                    <TopologyNode type="Extract" title={`ext_${p.id}_01`} metrics={{ label: 'Rows/s', value: p.metrics.epsExtract.toLocaleString() }} status={status} onDetail={(e: any) => { e.stopPropagation(); setDrillDown({ isOpen: true, viewType: 'TOPOLOGY_DIAGRAM_DETAIL', contextData: { nodeId: `${p.id}_ext` } }); }} />
                    <div className="flex-1 h-px bg-slate-600 relative overflow-visible"><svg className="absolute inset-0 w-full h-2 overflow-visible" style={{ top: '-1px' }}><path id={`path2_${p.id}`} d="M 0 1 L 5000 1" className="stroke-transparent fill-none" /><circle r="3" className="fill-blue-400 animate-particle shadow-[0_0_8px_#60a5fa]" style={{ animationDuration: `${sndSpeed}s` }}><animateMotion repeatCount="indefinite" dur={`${sndSpeed}s`}><mpath href={`#path2_${p.id}`} /></animateMotion></circle></svg></div>
                    <TopologyNode type="Send" title="Network Channel" metrics={{ label: 'MB/s', value: p.metrics.bpsSend.toFixed(1) }} status={status} onDetail={(e: any) => { e.stopPropagation(); setDrillDown({ isOpen: true, viewType: 'TOPOLOGY_DIAGRAM_DETAIL', contextData: { nodeId: `${p.id}_snd` } }); }} />
                    <div className="flex-1 h-px bg-slate-600 relative overflow-visible"><svg className="absolute inset-0 w-full h-1 overflow-visible" style={{ top: '-1.5px' }}><path id={`path3_${p.id}`} d="M 0 2 L 5000 2" className="stroke-transparent fill-none" /><circle r="3" className="fill-blue-400 animate-particle shadow-[0_0_8px_#60a5fa]" style={{ animationDuration: `${pstSpeed}s` }}><animateMotion repeatCount="indefinite" dur={`${pstSpeed}s`}><mpath href={`#path3_${p.id}`} /></animateMotion></circle></svg></div>
                    <TopologyNode type="Post" title={`pst_${p.id}_A`} metrics={{ label: 'Rows/s', value: p.metrics.epsPost.toLocaleString() }} status={status} onDetail={(e: any) => { e.stopPropagation(); setDrillDown({ isOpen: true, viewType: 'TOPOLOGY_DIAGRAM_DETAIL', contextData: { nodeId: `${p.id}_pst` } }); }} />
                    <div className="flex-1 h-px bg-slate-600 relative overflow-visible"><svg className="absolute inset-0 w-full h-1 overflow-visible" style={{ top: '-1.5px' }}><path id={`path4_${p.id}`} d="M 0 2 L 5000 2" className="stroke-transparent fill-none" /><circle r="3" className="fill-emerald-400 animate-particle shadow-[0_0_8px_#34d399]" style={{ animationDuration: '1s' }}><animateMotion repeatCount="indefinite" dur="1s"><mpath href={`#path4_${p.id}`} /></animateMotion></circle></svg></div>
                    <TopologyNode isDb type="Target" title={p.target.dbName} ip={p.target.ip} status="ok" onDetail={(e: any) => { e.stopPropagation(); setDrillDown({ isOpen: true, viewType: 'TOPOLOGY_DIAGRAM_DETAIL', contextData: { nodeId: `${p.id}_tgt` } }); }} />
                </div>
            );
        })}
    </div>
  );
};

// --- Drill Down Content ---

const AgentStatusDetailGrid = () => (
    <div className="h-full overflow-hidden flex flex-col p-4">
        <div className="overflow-auto custom-scrollbar flex-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="p-3">에이전트 명</th>
                        <th className="p-3">상태</th>
                        <th className="p-3">DB 타입/명</th>
                        <th className="p-3">Extract Status + Rows</th>
                        <th className="p-3">Send Status + MB/s</th>
                        <th className="p-3">Post Status + Rows</th>
                        <th className="p-3 text-right">Pipelines</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {MOCK_AGENTS.map(agent => (
                        <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                            <td className="p-3 font-black text-slate-700 dark:text-slate-200 uppercase">{agent.name}</td>
                            <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${agent.status === AgentStatus.CONNECTED ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700'}`}>
                                    {agent.status}
                                </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500 font-bold uppercase">{agent.osType} / ARK_SVC</td>
                            <td className="p-3"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <span className="font-mono font-bold">1,250 r/s</span></div></td>
                            <td className="p-3"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <span className="font-mono font-bold">4.2 MB/s</span></div></td>
                            <td className="p-3"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <span className="font-mono font-bold">1,248 r/s</span></div></td>
                            <td className="p-3 text-right font-black text-blue-500">{agent.pipelineCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ThroughputGridMatrix = ({ baseTime }: { baseTime: string }) => {
    const times = useMemo(() => {
        const [h, m] = baseTime.split(':').map(Number);
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(); d.setHours(h, m - (i * 5));
            return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        }).reverse();
    }, [baseTime]);
    return (
        <div className="h-full overflow-hidden p-4">
             <div className="overflow-auto h-full border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="p-3 sticky left-0 bg-slate-50 dark:bg-slate-950 z-20 border-r border-slate-200 dark:border-slate-800">Pipeline Audit</th>
                            {times.map(t => <th key={t} className="p-3 text-center">{t}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {MOCK_PIPELINES.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                                <td className="p-3 font-black sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap text-slate-700 dark:text-slate-200 uppercase">{p.name}</td>
                                {times.map(t => (<td key={t} className="p-3 text-center font-mono text-[11px] font-bold text-emerald-600">{(Math.floor(Math.random() * 5000) + 1000).toLocaleString()}</td>))}
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

const DmlMatrixGrid = () => {
    const ops = ['INSERT', 'DELETE', 'UPDATE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME'];
    return (
        <div className="h-full overflow-hidden p-4">
             <div className="overflow-auto h-full border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="p-3 sticky left-0 bg-slate-50 dark:bg-slate-950 z-20">Pipeline Name</th>
                            {ops.map(o => <th key={o} className="p-3 text-center">{o}</th>)}
                            <th className="p-3 text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {MOCK_PIPELINES.map(p => {
                            const vals = ops.map(() => Math.floor(Math.random() * 1000));
                            const total = vals.reduce((a,b) => a+b, 0);
                            return (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                                    <td className="p-3 font-black sticky left-0 bg-white dark:bg-slate-900 z-10 text-slate-700 dark:text-slate-200 uppercase">{p.name}</td>
                                    {vals.map((v, i) => <td key={i} className="p-3 text-center font-mono text-slate-500 font-bold">{v.toLocaleString()}</td>)}
                                    <td className="p-3 text-right font-black text-blue-600">{total.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

const Sparkline = ({ color }: { color: string }) => (
    <div className="h-6 w-24"><ResponsiveContainer width="100%" height="100%"><LineChart data={Array.from({length: 10}, () => ({v: Math.random()*100}))}><Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} minPointSize={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
);

const TreeGridRow: React.FC<{ item: any; expanded: Set<string>; toggle: (id: string) => void; onLogRequest: (aid: string) => void; }> = ({ item, expanded, toggle, onLogRequest }) => {
    const isExpanded = expanded.has(item.id);
    const isChild = !!item.role;
    return (
        <div className="contents group"><div className={`p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 ${isChild ? 'pl-10' : ''}`}>{!isChild && item.children ? (<button onClick={() => toggle(item.id)} className="text-slate-400 hover:text-primary transition-colors shrink-0">{isExpanded ? <SquareMinus size={14}/> : <SquarePlus size={14}/>}</button>) : <div className="w-3.5 shrink-0" />}<div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : item.status === 'error' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-300'}`} /><span className={`truncate text-xs ${!isChild ? 'font-black text-slate-800 dark:text-white uppercase tracking-tight' : 'text-slate-500'}`}>{isChild ? "" : item.name}</span></div><div className="p-3 border-b border-slate-100 dark:border-slate-800 text-center font-black text-[9px] text-slate-400 uppercase tracking-widest">{item.role || ''}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 truncate font-bold flex items-center gap-2">{item.typeIcon && <item.typeIcon size={14} className="text-slate-400" />}{item.typeLabel}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 truncate flex items-center gap-2">{item.procStatusIcon && <div className={`w-1.5 h-1.5 rounded-full ${item.procStatusIcon === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'}`} />}{item.procName || ''}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-center">{item.tputTrend && <Sparkline color="#10b981" />}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-center">{item.lagTrend && <Sparkline color="#f59e0b" />}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-center font-mono text-[11px] font-bold text-slate-500">{item.cpuTrend ? <Sparkline color="#3b82f6" /> : (item.cpuValue ? `${item.cpuValue}%` : '')}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-center font-mono text-[11px] font-bold text-slate-500">{item.memTrend ? <Sparkline color="#8b5cf6" /> : (item.memValue ? `${item.memValue}%` : '')}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-center font-mono text-[11px] font-bold text-slate-500">{item.diskTrend ? <Sparkline color="#94a3b8" /> : (item.diskValue ? `${item.diskValue}%` : '')}</div><div className="p-3 border-b border-slate-100 dark:border-slate-800 text-right pr-6">{item.events && (<div className="flex gap-1.5 justify-end cursor-pointer" onDoubleClick={() => onLogRequest(item.id)}><span className="px-1.5 py-0.5 bg-rose-600/20 text-rose-500 rounded text-[9px] font-black border border-rose-500/20">{item.events.c}</span><span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[9px] font-black border border-rose-500/20">{item.events.e}</span><span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-black border border-amber-500/20">{item.events.w}</span></div>)}</div>{isExpanded && item.children && item.children.map((child: any) => (<TreeGridRow key={child.id} item={child} expanded={expanded} toggle={toggle} onLogRequest={onLogRequest} />))}</div>
    );
};

const TreeDataGrid = ({ onLogRequest }: { onLogRequest: (aid: string) => void }) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const toggle = (id: string) => { const n = new Set(expanded); n.has(id) ? n.delete(id) : n.add(id); setExpanded(n); };
    const mockData = useMemo(() => MOCK_PIPELINES.slice(0, 5).map(p => ({ id: p.id, name: p.name, status: p.status === 'RUNNING' ? 'ok' : 'error', children: [{ id: `${p.id}_src_db`, role: 'Source', typeIcon: Database, typeLabel: 'DB', procName: p.source.dbName, procStatusIcon: 'ok', status: 'ok' }, { id: `${p.id}_src_ag`, role: 'Source', typeIcon: Server, typeLabel: 'Agent', procName: "Agent-Src", procStatusIcon: 'ok', cpuTrend: true, memTrend: true, diskTrend: true, events: {c:0, e:1, w:2}, status: 'ok' }, { id: `${p.id}_ext`, role: 'Source', typeIcon: Zap, typeLabel: 'Extract', procName: `ext_${p.name.slice(0,4)}_01`, procStatusIcon: 'ok', tputTrend: true, lagTrend: true, cpuTrend: true, memTrend: true, events: {c:0, e:0, w:5}, status: 'ok' }, { id: `${p.id}_snd_1`, role: 'Source', typeIcon: Network, typeLabel: 'Send', procName: `snd_net_${p.name.slice(0,4)}_01`, procStatusIcon: 'ok', tputTrend: true, lagTrend: true, cpuTrend: true, memTrend: true, events: {c:0, e:0, w:0}, status: 'ok' }, { id: `${p.id}_pst_1`, role: 'Target', typeIcon: DatabaseZap, typeLabel: 'Post', procName: `pst_bulk_${p.name.slice(0,4)}_A`, procStatusIcon: 'error', tputTrend: true, lagTrend: true, cpuTrend: true, memTrend: true, events: {c:0, e:2, w:10}, status: 'error' }, { id: `${p.id}_tgt_ag`, role: 'Target', typeIcon: Server, typeLabel: 'Agent', procName: "Agent-Tgt", procStatusIcon: 'ok', cpuTrend: true, memTrend: true, diskTrend: true, events: {c:0, e:0, w:0}, status: 'ok' }, { id: `${p.id}_tgt_db`, role: 'Target', typeIcon: Database, typeLabel: 'DB', procName: p.target.dbName, procStatusIcon: 'ok', status: 'ok' }] })), []);
    return (<div className="grid grid-cols-[2fr_0.6fr_1fr_1.8fr_1fr_1fr_1fr_1fr_1fr_1fr] min-w-[1500px]"><div className="contents bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 shadow-sm"><div className="p-4 border-b border-slate-200 dark:border-slate-800">Pipeline Name</div><div className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">Role</div><div className="p-4 border-b border-slate-200 dark:border-slate-800">Module Type</div><div className="p-4 border-b border-slate-200 dark:border-slate-800">Process Name</div><div className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">Throughput Trend</div><div className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">Lag Trend</div><div className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">CPU %</div><div className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">Mem %</div><div className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">Disk %</div><div className="p-4 border-b border-slate-200 dark:border-slate-800 text-right pr-6">Event</div></div>{mockData.map(item => <TreeGridRow key={item.id} item={item} expanded={expanded} toggle={toggle} onLogRequest={onLogRequest} />)}</div>);
};

const Timeline = () => (<div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar">{Array.from({length: 8}).map((_, i) => (<div key={i} className="flex gap-4 group"><div className="flex flex-col items-center"><div className={`w-2 h-2 rounded-full mt-2 ${i % 3 === 0 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-300'}`} /><div className="flex-1 w-px bg-slate-200 dark:bg-slate-800 mt-1" /></div><div className="flex-1 pb-6"><div className="flex justify-between items-center mb-1"><span className="text-[10px] font-mono text-slate-400">2023-10-27 14:{30 - i}:12</span><span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${i % 3 === 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{i % 3 === 0 ? 'CRITICAL' : 'INFO'}</span></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm group-hover:border-primary/50 transition-colors"><p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Node {i + 1} state change detected. Heartbeat interval adjusted.</p></div></div></div>))}</div>);

const DrillDownPanel = () => {
  const { drillDown, setDrillDown, isSidebarOpen, setEventLog } = useDashboard();
  const [height, setHeight] = useState(window.innerHeight * 0.45);
  const [leftBasis, setLeftBasis] = useState(70); 
  const isDraggingV = useRef(false);
  const isDraggingH = useRef(false);
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDraggingV.current) setHeight(Math.max(window.innerHeight * 0.3, Math.min(window.innerHeight * 0.9, window.innerHeight - e.clientY)));
      if (isDraggingH.current) { const panel = document.getElementById('drill-down-content'); if (panel) { const rect = panel.getBoundingClientRect(); setLeftBasis(Math.max(20, Math.min(80, ((e.clientX - rect.left) / rect.width) * 100))); } }
    };
    const handleUp = () => { isDraggingV.current = false; isDraggingH.current = false; document.body.style.cursor = 'default'; };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, []);
  if (!drillDown.isOpen) return null;
  const layoutType: 'single' | 'split' = (drillDown.viewType === 'KPI_PIPELINE_DETAIL' || drillDown.viewType === 'LINECHART_THROUGHPUT_POST_DETAIL' || drillDown.viewType === 'TOPOLOGY_DIAGRAM_DETAIL' || drillDown.viewType === 'HEAT_THROUGHPUT_EXTRACT_DETAIL' || drillDown.viewType === 'HEATMAP_LAG_POST_DETAIL' || drillDown.viewType === 'TREEMAP_THROUGHPUT_EXTRACT_DETAIL') ? 'single' : 'split';
  const getHeader = () => {
      switch(drillDown.viewType) {
          case 'KPI_PIPELINE_DETAIL': case 'LINECHART_THROUGHPUT_POST_DETAIL': return 'Pipeline Status Detail';
          case 'KPI_AGENT_DETAIL': return 'Agent Operational Status Detail';
          case 'LINECHART_THROUGHPUT_EXTRACT_DETAIL': return 'Extract Throughput Historical Audit';
          case 'BARCHART_EXT_DMLDDL_DETAIL': case 'BARCHART_POST_DMLDDL_DETAIL': return 'DML/DDL Event Matrix Analysis';
          case 'TOPOLOGY_DIAGRAM_DETAIL': return 'Pipeline Node Topology Inspector';
          case 'HEAT_THROUGHPUT_EXTRACT_DETAIL': return 'Heatmap Volume Detail Analysis';
          case 'HEATMAP_LAG_POST_DETAIL': return 'Heatmap Lag Peak Audit';
          case 'TREEMAP_THROUGHPUT_EXTRACT_DETAIL': return 'Treemap Focused Pipeline Profile';
          default: return 'Detail Diagnostic Analysis';
      }
  };
  const renderContent = () => {
      switch(drillDown.viewType) {
          case 'KPI_PIPELINE_DETAIL': case 'LINECHART_THROUGHPUT_POST_DETAIL': case 'TOPOLOGY_DIAGRAM_DETAIL': return <TreeDataGrid onLogRequest={(aid) => setEventLog({ isOpen: true, contextData: { aid } })} />;
          case 'KPI_AGENT_DETAIL': return <AgentStatusDetailGrid />;
          case 'LINECHART_THROUGHPUT_EXTRACT_DETAIL': return <ThroughputGridMatrix baseTime={drillDown.contextData?.time || '10:00'} />;
          case 'BARCHART_EXT_DMLDDL_DETAIL': case 'BARCHART_POST_DMLDDL_DETAIL': return <DmlMatrixGrid />;
          case 'HEAT_THROUGHPUT_EXTRACT_DETAIL': case 'HEATMAP_LAG_POST_DETAIL': return <div className="p-8 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic">Detailed metric history for {drillDown.contextData?.pipeline} @ {drillDown.contextData?.time}...</div>;
          case 'TREEMAP_THROUGHPUT_EXTRACT_DETAIL': return <div className="p-8 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic">Full analysis profile for pipeline: {drillDown.contextData?.pipelineName}</div>;
          default: return <div className="p-8 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic">Metric data loading...</div>;
      }
  };
  return (<><div className="fixed inset-0 bg-black/25 z-30 animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setDrillDown({ ...drillDown, isOpen: false })} /><div className="transition-[left] duration-300 ease-in-out fixed bottom-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col rounded-t-xl overflow-hidden" style={{ height: `${height}px`, left: isSidebarOpen ? '256px' : '64px', width: `calc(100% - ${isSidebarOpen ? '256px' : '64px'})` }}><div className="h-6 flex flex-col items-center justify-center cursor-row-resize hover:bg-slate-50 dark:hover:bg-slate-800 group shrink-0 relative" onMouseDown={e => { e.preventDefault(); isDraggingV.current = true; document.body.style.cursor = 'row-resize'; }}><div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover:bg-primary transition-colors" /><button onClick={() => setDrillDown({ ...drillDown, isOpen: false })} className="absolute right-6 top-1 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={16}/></button></div><div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3 shrink-0"><Activity size={16} className="text-primary" /><h4 className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{getHeader()}</h4>{drillDown.contextData?.time && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold ml-2">Audit Time: {drillDown.contextData.time}</span>}</div><div id="drill-down-content" className="flex-1 overflow-hidden flex">{layoutType === 'single' ? (<div className="flex-1 overflow-auto custom-scrollbar">{renderContent()}</div>) : (<><div className="overflow-auto custom-scrollbar border-r border-slate-100 dark:border-slate-800" style={{ width: `${leftBasis}%` }}>{renderContent()}</div><div className="w-1.5 hover:bg-primary/30 cursor-col-resize flex flex-col items-center justify-center transition-colors shrink-0" onMouseDown={e => { e.preventDefault(); isDraggingH.current = true; document.body.style.cursor = 'col-resize'; }}><div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 rounded-full" /></div><div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30"><Timeline /></div></>)}</div></div></>);
};

// --- 8. Event Log Popup ---

interface LogEvent { id: string; timestamp: string; severity: 'Info' | 'Warning' | 'Error' | 'Critical'; pipeline: string; role: 'Source' | 'Target' | 'Both'; moduleType: 'DB' | 'Agent' | 'Extract' | 'Send' | 'Recv' | 'Post' | 'Pmon'; processName: string; message: string; confirmedBy?: string; confirmedAt?: string; }
const EventLogPopup = () => {
  const { eventLog, setEventLog } = useDashboard();
  const [startTime, setStartTime] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0, 19); });
  const [endTime, setEndDate] = useState(new Date().toISOString().slice(0, 19));
  const [selectedPipeline, setSelectedPipeline] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | LogEvent['severity']>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [events, setEvents] = useState<LogEvent[]>(() => Array.from({ length: 50 }).map((_, i) => ({ id: `evt_${i}`, timestamp: new Date(Date.now() - i * 1800000).toISOString().replace('T', ' ').slice(0, 16), severity: (['Info', 'Warning', 'Error', 'Critical'][Math.floor(Math.random() * 4)]) as LogEvent['severity'], pipeline: MOCK_PIPELINES[Math.floor(Math.random() * MOCK_PIPELINES.length)].name, role: (['Source', 'Target', 'Both'][Math.floor(Math.random() * 3)]) as LogEvent['role'], moduleType: (['DB', 'Agent', 'Extract', 'Send', 'Recv', 'Post', 'Pmon'][Math.floor(Math.random() * 7)]) as LogEvent['moduleType'], processName: `proc_m_${String(i).padStart(2, '0')}`, message: i % 7 === 0 ? "Network connection timed out" : "Initial load completed", confirmedBy: i > 40 ? 'Admin' : undefined, confirmedAt: i > 40 ? '2023-10-27 10:00' : undefined })));
  const filteredEvents = useMemo(() => events.filter(e => (severityFilter === 'ALL' || e.severity === severityFilter) && (selectedPipeline === 'ALL' || e.pipeline === selectedPipeline) && (!keyword || e.message.toLowerCase().includes(keyword.toLowerCase()))), [events, severityFilter, selectedPipeline, keyword]);
  if (!eventLog.isOpen) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col w-[80%] h-[80%]">
          <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50 shrink-0"><div className="flex items-center gap-3"><div className="p-2 bg-primary rounded-xl text-white shadow-lg"><FileSearch size={20}/></div><h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Event Log Analysis</h2></div><button onClick={() => setEventLog({ isOpen: false, contextData: null })} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors text-slate-400 hover:text-rose-500"><X size={22}/></button></div>
          <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner shrink-0"><div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"><Calendar size={14} className="text-slate-400"/><input type="datetime-local" step="1" className="bg-transparent border-none text-[11px] font-bold outline-none" value={startTime} onChange={e => setStartTime(e.target.value)} /><span className="text-slate-300">~</span><input type="datetime-local" step="1" className="bg-transparent border-none text-[11px] font-bold outline-none" value={endTime} onChange={e => setEndDate(e.target.value)} /></div><select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none" value={selectedPipeline} onChange={e => setSelectedPipeline(e.target.value)}><option value="ALL">Pipeline: ALL</option>{MOCK_PIPELINES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select><div className="flex-1 relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input placeholder="Keyword..." className="w-full pl-10 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold outline-none" value={keyword} onChange={e => setKeyword(e.target.value)} /></div><button className="px-5 py-1.5 bg-primary text-white rounded-xl font-black text-[11px] shadow-md">Search</button></div>
            <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-inner min-h-0"><div className="grid grid-cols-[40px_130px_90px_160px_1fr_120px] gap-2 p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase sticky top-0 z-10"><div></div><div>Timestamp</div><div>Severity</div><div>Pipeline</div><div>Message</div><div className="text-right">Action</div></div><div className="flex-1 overflow-y-auto custom-scrollbar">{filteredEvents.map((evt) => (<div key={evt.id} className="grid grid-cols-[40px_130px_90px_160px_1fr_120px] gap-2 p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"><div><input type="checkbox" checked={selectedIds.has(evt.id)} onChange={() => { const n = new Set(selectedIds); n.has(evt.id) ? n.delete(evt.id) : n.add(evt.id); setSelectedIds(n); }} /></div><div className="font-mono text-slate-600 dark:text-slate-400 text-xs">{evt.timestamp}</div><div><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${evt.severity === 'Critical' ? 'bg-rose-600 text-white' : evt.severity === 'Error' ? 'bg-orange-500 text-white' : evt.severity === 'Warning' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{evt.severity}</span></div><div className="font-black uppercase">{evt.pipeline}</div><div className="truncate">{evt.message}</div><div className="text-right">{evt.confirmedBy ? <span className="text-emerald-500 font-bold">{evt.confirmedBy}</span> : '-'}</div></div>))}</div></div>
            <div className="h-[200px] flex gap-4 shrink-0"><div className="w-[20%] bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar"><h4 className="text-[10px] font-black uppercase mb-2">Agent List</h4>{MOCK_AGENTS.map(a => <div key={a.id} onClick={() => setActiveAgentId(a.id)} className={`p-2 rounded-lg cursor-pointer text-[10px] font-bold ${activeAgentId === a.id ? 'bg-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}>{a.name}</div>)}</div><div className="flex-1 bg-slate-950 rounded-2xl p-4 font-mono text-[11px] text-emerald-500/80 overflow-y-auto custom-scrollbar">{activeAgentId ? (<><div>[INFO] Agent process monitor started</div><div>[DEBUG] Initializing connector...</div><div>[ERROR] Connection timeout to target IDC</div></>) : <div className="h-full flex items-center justify-center italic text-slate-700 uppercase">Select agent to explorer logs</div>}</div></div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

// --- 9. Dashboard Layout ---

const DashboardContent = () => {
  const { layouts, activeLayoutId, removeWidget, updateWidgetFilter, toast } = useDashboard();
  const currentLayout = layouts[activeLayoutId];
  if (!currentLayout) return <div className="p-8 text-slate-500 text-center">Dashboard configuration not found.</div>;

  const renderWidget = (w: WidgetConfig, filteredIds: string[]) => {
    if (w.type.startsWith('kpi_')) return <KPICard type={w.type.replace('kpi_', '').toUpperCase() as any} />;
    if (w.type.startsWith('linechart_') || w.type.startsWith('barchart_')) return <RechartsWidget type={w.type} selectedIds={filteredIds} />;
    if (w.type === 'heatmap_throughput_extract' || w.type === 'heatmap_lag_post') return <HeatmapWidget type={w.type} />;
    if (w.type === 'treemap_throughput_extract') return <TreemapWidget selectedIds={filteredIds} />;
    if (w.type === 'pipeline_diagram') return <TopologyWidget selectedIds={filteredIds} />;
    if (w.type === 'list_events') return <Timeline />;
    if (w.type === 'list_high_lag') return <div className="p-4 text-xs italic text-slate-400">High Lag Top 5 List (WIP)...</div>;
    return <div className="p-4 text-xs italic text-slate-400">Widget {w.type} not implemented</div>;
  };

  const getWidgetSpan = (type: string) => {
    if (type.startsWith('kpi_')) return 'col-span-1 md:col-span-1 lg:col-span-1 h-32';
    if (type === 'pipeline_diagram') return 'col-span-1 md:col-span-2 lg:col-span-2 h-96';
    if (type.includes('throughput') || type.includes('lag')) return 'col-span-1 md:col-span-2 lg:col-span-2 h-80';
    return 'col-span-1 md:col-span-2 lg:col-span-2 h-80';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      <DashboardControls />
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
          {currentLayout.widgets.map(w => (
            <div key={w.id} className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm ${getWidgetSpan(w.type)}`}>
               <WidgetWrapper widgetId={w.id} title={w.title} selectedIds={w.selectedPipelineIds} allPipelines={MOCK_PIPELINES} onRemove={() => removeWidget(w.id)} onFilterChange={(ids) => updateWidgetFilter(w.id, ids)}>
                {(filteredIds) => renderWidget(w, filteredIds)}
              </WidgetWrapper>
            </div>
          ))}
        </div>
      </div>
      <DrillDownPanel />
      <EventLogPopup />
      {toast.show && (<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[6000] px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300"><CheckCircle2 size={18} className="text-emerald-500" /><span className="text-sm font-bold">{toast.message}</span></div>)}
    </div>
  );
};

const Dashboard = () => (<DashboardProvider><DashboardContent /></DashboardProvider>);
export default Dashboard;
