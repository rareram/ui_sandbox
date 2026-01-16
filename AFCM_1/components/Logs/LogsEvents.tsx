
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Clock, FileText, 
  AlertTriangle, XCircle, Info, AlertOctagon,
  ChevronRight, Download, RefreshCw, Server,
  CheckSquare, Square, Check, Maximize, Minimize,
  CheckCircle2, Filter
} from 'lucide-react';
import { MOCK_AGENTS } from '../../constants';

// --- Types ---
type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
type LogCategory = 'agent' | 'pmon' | 'mgr' | 'ctl' | 'alert' | 'extract' | 'send' | 'recv' | 'post';

interface SystemEvent {
  id: string;
  timestamp: string;
  level: LogLevel;
  agentId: string;
  agentName: string;
  agentIp: string;
  category: LogCategory;
  file: string;
  message: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

// --- Mock Data Generators ---
const generateMockEvents = (count: number): SystemEvent[] => {
  const levels: LogLevel[] = ['INFO', 'INFO', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
  const categories: LogCategory[] = ['extract', 'send', 'post', 'agent', 'pmon'];
  const messages = [
    'Connection established successfully',
    'Buffer pool usage exceeded 80%',
    'Network timeout reached, retrying...',
    'Disk space low on /u01/app',
    'Transaction commit failed: ORA-00001',
    'Agent service restarted',
    'Handshake failed with target'
  ];

  return Array.from({ length: count }, (_, i) => {
    const agent = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
    const date = new Date();
    date.setMinutes(date.getMinutes() - i * 15); 

    // Randomly set some as confirmed
    const isConfirmed = Math.random() > 0.8;

    return {
      id: `evt_${i}`,
      timestamp: date.toISOString().replace('T', ' ').slice(0, 19),
      level: levels[Math.floor(Math.random() * levels.length)],
      agentId: agent.id,
      agentName: agent.name,
      agentIp: agent.ip,
      category: categories[Math.floor(Math.random() * categories.length)],
      file: `${categories[Math.floor(Math.random() * categories.length)]}.log`,
      message: messages[Math.floor(Math.random() * messages.length)],
      confirmedBy: isConfirmed ? 'Admin' : undefined,
      confirmedAt: isConfirmed ? new Date(date.getTime() + 600000).toISOString().replace('T', ' ').slice(0, 19) : undefined,
    };
  });
};

const MOCK_LOG_CONTENT = `[2023-10-27 10:00:01] [INFO] [main] Agent started successfully. Version 2.5.1
[2023-10-27 10:00:05] [INFO] [extract] Connected to Source DB (ORACLE)
[2023-10-27 10:05:23] [INFO] [extract] Initializing transaction buffer...
[2023-10-27 10:15:00] [WARNING] [monitor] CPU usage spike detected (85%)
[2023-10-27 10:20:11] [INFO] [send] Batch #1024 sent (500 records)
[2023-10-27 10:20:12] [INFO] [send] Batch #1024 acknowledged
[2023-10-27 10:45:00] [ERROR] [network] Connection timed out to Target IP 172.16.5.4
[2023-10-27 10:45:01] [INFO] [network] Retrying connection (Attempt 1/5)...
[2023-10-27 10:45:05] [INFO] [network] Connection re-established.
[2023-10-27 11:00:00] [INFO] [pmon] Health check passed.
[2023-10-27 11:15:30] [INFO] [extract] Checkpoint saved at SCN 9283742
[2023-10-27 11:30:00] [INFO] [agent] Rotating logs...
[2023-10-27 12:00:00] [INFO] [extract] Processing batch #2048...
[2023-10-27 12:05:00] [WARNING] [extract] Long running transaction detected (TXID: 998877)
[2023-10-27 12:10:00] [INFO] [post] Apply speed: 2500 rows/sec
[2023-10-27 12:15:00] [INFO] [post] Latency is stable at 0.5s
`;

// --- Components ---

const LevelBadge = ({ level }: { level: LogLevel }) => {
  const styles = {
    INFO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    WARNING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ERROR: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse'
  };

  const icons = {
    INFO: Info,
    WARNING: AlertTriangle,
    ERROR: XCircle,
    CRITICAL: AlertOctagon
  };

  const Icon = icons[level];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[level]}`}>
      <Icon size={12} />
      {level}
    </span>
  );
};

const SummaryCard = ({ title, count, icon: Icon, colorClass, onClick, isActive }: any) => (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border cursor-pointer transition-all ${
            isActive 
            ? 'border-primary ring-1 ring-primary shadow-md transform -translate-y-1' 
            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
        }`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{count}</h3>
            </div>
            <div className={`p-2 rounded-xl ${colorClass} text-white`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const LogsEvents: React.FC = () => {
  const { t } = useTranslation();
  
  // -- State --
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | LogLevel>('ALL');
  
  // Events State
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SystemEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());

  // Log Explorer State
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentSearch, setAgentSearch] = useState('');
  const [activeLogTab, setActiveLogTab] = useState('agent.log');
  const [logSearchKeyword, setLogSearchKeyword] = useState('');
  const [isLogFullScreen, setIsLogFullScreen] = useState(false);
  
  // Local time state for Log Explorer (initialized from global, but independent)
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');

  // Helper to format date for input
  const formatDateForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // -- Initialization --
  useEffect(() => {
    // Default Time: Start = Today 00:00:00, End = Now
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const startStr = formatDateForInput(start);
    const endStr = formatDateForInput(now);

    setStartDate(startStr);
    setEndDate(endStr);
    
    // Sync Log Explorer times initially
    setLogStartDate(startStr);
    setLogEndDate(endStr);

    // Load Mock Data
    const mockEvents = generateMockEvents(50);
    setEvents(mockEvents);
    // setFilteredEvents will be called by useEffect on filterLevel/events change

    // Select first agent by default
    if (MOCK_AGENTS.length > 0) {
        setSelectedAgentId(MOCK_AGENTS[0].id);
    }
  }, []);

  // -- Event Logic --

  const handleSearch = () => {
    let results = events;
    
    // Date Filter
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    results = results.filter(e => {
        const time = new Date(e.timestamp).getTime();
        return time >= start && time <= end;
    });

    // Keyword Filter (search global)
    if (searchKeyword) {
        const lowerKey = searchKeyword.toLowerCase();
        results = results.filter(e => 
            e.message.toLowerCase().includes(lowerKey) ||
            e.agentName.toLowerCase().includes(lowerKey) ||
            e.agentIp.includes(lowerKey) ||
            e.category.toLowerCase().includes(lowerKey) ||
            e.file.toLowerCase().includes(lowerKey) ||
            e.level.toLowerCase().includes(lowerKey)
        );
    }
    
    // Card Level Filter
    if (filterLevel !== 'ALL') {
        results = results.filter(e => e.level === filterLevel);
    }

    setFilteredEvents(results);
    // Clear selection on re-search
    setSelectedEventIds(new Set());
    
    // Sync Log Explorer dates on main search
    setLogStartDate(startDate);
    setLogEndDate(endDate);
  };

  // Re-run search when filterLevel changes or events list updates
  useEffect(() => {
      handleSearch();
  }, [filterLevel, events]);

  const handleRefresh = () => {
      // 1. Update End Date to Now
      const now = new Date();
      setEndDate(formatDateForInput(now));
      
      // 2. Trigger Search (using setTimeout to allow state update to propagate)
      // In a real app with API, we would call fetch here.
      setTimeout(() => handleSearch(), 0);
  };

  const handleConfirmEvents = () => {
      if (selectedEventIds.size === 0) return;

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      
      setEvents(prev => prev.map(evt => {
          if (selectedEventIds.has(evt.id)) {
              return {
                  ...evt,
                  confirmedBy: 'Admin',
                  confirmedAt: nowStr
              };
          }
          return evt;
      }));

      // Clear selection after confirmation
      setSelectedEventIds(new Set());
  };

  // Checkbox Logic
  const toggleSelectAll = () => {
      const unconfirmedEvents = filteredEvents.filter(e => !e.confirmedBy);
      
      // If all currently visible unconfirmed events are selected -> Deselect All
      // Otherwise -> Select All Unconfirmed
      const allSelected = unconfirmedEvents.length > 0 && unconfirmedEvents.every(e => selectedEventIds.has(e.id));
      
      if (allSelected) {
          const newSet = new Set(selectedEventIds);
          unconfirmedEvents.forEach(e => newSet.delete(e.id));
          setSelectedEventIds(newSet);
      } else {
          const newSet = new Set(selectedEventIds);
          unconfirmedEvents.forEach(e => newSet.add(e.id));
          setSelectedEventIds(newSet);
      }
  };

  const toggleSelectOne = (id: string) => {
      const newSet = new Set(selectedEventIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedEventIds(newSet);
  };

  // Stats Calculation
  const stats = useMemo(() => {
      return {
          CRITICAL: events.filter(e => e.level === 'CRITICAL').length,
          ERROR: events.filter(e => e.level === 'ERROR').length,
          WARNING: events.filter(e => e.level === 'WARNING').length,
          INFO: events.filter(e => e.level === 'INFO').length,
          TOTAL: events.length
      };
  }, [events]);

  // -- Log Explorer Logic --

  // Filter Agents List
  const filteredAgents = useMemo(() => {
      return MOCK_AGENTS.filter(a => 
          a.name.toLowerCase().includes(agentSearch.toLowerCase()) || 
          a.ip.includes(agentSearch)
      );
  }, [agentSearch]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={i} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white font-bold">{part}</span> 
            : part
        )}
      </span>
    );
  };

  const downloadLog = () => {
      if (!selectedAgentId) return;
      const element = document.createElement("a");
      const file = new Blob([MOCK_LOG_CONTENT], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${selectedAgentId}_${activeLogTab}`;
      document.body.appendChild(element); 
      element.click();
      document.body.removeChild(element);
  };

  // Helper to determine if "Select All" checkbox should be checked state (visual only)
  const unconfirmedVisible = filteredEvents.filter(e => !e.confirmedBy);
  const isAllSelected = unconfirmedVisible.length > 0 && unconfirmedVisible.every(e => selectedEventIds.has(e.id));

  return (
    <div className="p-6 h-full flex flex-col gap-4 overflow-hidden">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-5 gap-4 shrink-0">
          <SummaryCard title="Critical" count={stats.CRITICAL} icon={AlertOctagon} colorClass="bg-rose-600" onClick={() => setFilterLevel('CRITICAL')} isActive={filterLevel === 'CRITICAL'} />
          <SummaryCard title="Error" count={stats.ERROR} icon={XCircle} colorClass="bg-rose-500" onClick={() => setFilterLevel('ERROR')} isActive={filterLevel === 'ERROR'} />
          <SummaryCard title="Warning" count={stats.WARNING} icon={AlertTriangle} colorClass="bg-amber-500" onClick={() => setFilterLevel('WARNING')} isActive={filterLevel === 'WARNING'} />
          <SummaryCard title="Info" count={stats.INFO} icon={Info} colorClass="bg-blue-500" onClick={() => setFilterLevel('INFO')} isActive={filterLevel === 'INFO'} />
          <SummaryCard title="Total Events" count={stats.TOTAL} icon={Server} colorClass="bg-slate-500" onClick={() => setFilterLevel('ALL')} isActive={filterLevel === 'ALL'} />
      </div>

      {/* 2. Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 flex-wrap flex-1">
              {/* Date Range */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 px-2">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase">Period</span>
                  </div>
                  <input 
                    type="datetime-local"
                    step="1"
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="text-slate-400">~</span>
                  <input 
                    type="datetime-local" 
                    step="1"
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
              </div>

              {/* Keyword Search */}
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                      type="text" 
                      placeholder="Message, Agent, IP, Level..." 
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
              </div>

              <button 
                onClick={handleSearch}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2"
              >
                  <Search size={18} />
                  Search
              </button>
          </div>

          <div className="flex items-center gap-3">
              <button 
                onClick={handleConfirmEvents}
                disabled={selectedEventIds.size === 0}
                className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    selectedEventIds.size > 0 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                  <CheckCircle2 size={18} />
                  Confirm {selectedEventIds.size > 0 && `(${selectedEventIds.size})`}
              </button>

              <button 
                onClick={handleRefresh}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                title="Refresh Events"
              >
                  <RefreshCw size={18} />
              </button>
          </div>
      </div>

      {/* 3. Events List */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
          <div className="grid grid-cols-12 gap-2 px-4 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 text-center flex justify-center">
                  <div 
                    onClick={toggleSelectAll} 
                    className="cursor-pointer text-slate-400 hover:text-primary transition-colors"
                    title="Select All Unconfirmed"
                  >
                      {isAllSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                  </div>
              </div>
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-1">Level</div>
              <div className="col-span-2">Agent IP</div>
              <div className="col-span-1">Log Type</div>
              <div className="col-span-2">Log File</div>
              <div className="col-span-2">Message</div>
              <div className="col-span-1 text-center">Confirmed</div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredEvents.map((evt) => (
                  <div key={evt.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center text-sm group">
                      <div className="col-span-1 flex justify-center">
                          {evt.confirmedBy ? (
                              <Square size={18} className="text-slate-200 dark:text-slate-800 cursor-not-allowed" />
                          ) : (
                              <div className="cursor-pointer" onClick={() => toggleSelectOne(evt.id)}>
                                  {selectedEventIds.has(evt.id) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-slate-400 group-hover:text-slate-500" />}
                              </div>
                          )}
                      </div>
                      <div className="col-span-2 font-mono text-slate-600 dark:text-slate-400 text-xs">{evt.timestamp}</div>
                      <div className="col-span-1"><LevelBadge level={evt.level} /></div>
                      <div className="col-span-2">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{evt.agentName}</div>
                          <div className="text-xs text-slate-500 font-mono truncate">{evt.agentIp}</div>
                      </div>
                      <div className="col-span-1">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border border-slate-200 dark:border-slate-700">
                              {evt.category}
                          </span>
                      </div>
                      <div className="col-span-2 text-slate-600 dark:text-slate-400 font-mono text-xs truncate" title={evt.file}>{evt.file}</div>
                      <div className="col-span-2 text-slate-700 dark:text-slate-300 truncate" title={evt.message}>
                          {evt.message}
                      </div>
                      <div className="col-span-1 text-center">
                          {evt.confirmedBy ? (
                              <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><Check size={10}/> {evt.confirmedBy}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">{evt.confirmedAt?.split(' ')[1]}</span>
                              </div>
                          ) : (
                              <span className="text-slate-300">-</span>
                          )}
                      </div>
                  </div>
              ))}
              {filteredEvents.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p>No events found for this period.</p>
                  </div>
              )}
          </div>
      </div>

      {/* 4. Log Explorer (Split Pane) */}
      <div className={`flex gap-4 shrink-0 transition-all duration-300 ${isLogFullScreen ? 'fixed inset-4 z-[9999] h-auto bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800' : 'h-[400px]'}`}>
          {/* Left Column: Agents List (20%) */}
          <div className="w-[20%] bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-sm flex items-center gap-2">
                      <Server size={14} className="text-slate-400" /> Agent List
                  </h3>
                  <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                          type="text" 
                          placeholder="Search..." 
                          className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-primary outline-none"
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                      />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                  {filteredAgents.map(agent => (
                      <div 
                          key={agent.id}
                          onClick={() => setSelectedAgentId(agent.id)}
                          className={`p-2.5 rounded-xl mb-1 cursor-pointer transition-all flex items-center justify-between group ${
                              selectedAgentId === agent.id 
                              ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                          }`}
                      >
                          <div className="overflow-hidden">
                              <div className={`font-bold text-xs truncate ${selectedAgentId === agent.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {agent.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate">
                                  {agent.ip}
                              </div>
                          </div>
                          {selectedAgentId === agent.id && <ChevronRight size={14} className="text-primary" />}
                      </div>
                  ))}
              </div>
          </div>

          {/* Right Column: Log Viewer (80%) */}
          <div className="w-[80%] bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
              {selectedAgentId ? (
                  <>
                      {/* Top Bar: Tabs & Actions */}
                      <div className="flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                          {/* Tabs */}
                          <div className="flex items-center overflow-x-auto custom-scrollbar pt-2">
                              {['agent.log', 'extract.log', 'send.log', 'post.log', 'error.log'].map(file => (
                                  <button
                                      key={file}
                                      onClick={() => setActiveLogTab(file)}
                                      className={`px-4 py-2.5 text-xs font-bold border-t border-x rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap relative top-[1px] ${
                                          activeLogTab === file 
                                          ? 'border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 bg-white dark:bg-slate-900 text-primary' 
                                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                      }`}
                                  >
                                      <FileText size={12} />
                                      {file}
                                  </button>
                              ))}
                          </div>

                          {/* Toolbar Actions (Search, Download, Fullscreen) */}
                          <div className="flex items-center gap-3 py-1">
                               <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                  <input 
                                      type="text" 
                                      placeholder="Search log..." 
                                      className="w-40 pl-7 pr-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-primary outline-none"
                                      value={logSearchKeyword}
                                      onChange={(e) => setLogSearchKeyword(e.target.value)}
                                  />
                              </div>
                              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                              <button onClick={downloadLog} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title="Download">
                                  <Download size={16} />
                              </button>
                              <button onClick={() => setIsLogFullScreen(!isLogFullScreen)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title={isLogFullScreen ? "Exit Fullscreen" : "Fullscreen"}>
                                  {isLogFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
                              </button>
                          </div>
                      </div>

                      {/* Log Context Info (Date modification) */}
                      <div className="bg-slate-100 dark:bg-slate-950 px-4 py-1.5 text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400"><Clock size={10} /> Log Range:</span>
                              <div className="flex items-center gap-1">
                                  <input 
                                    type="datetime-local" 
                                    step="1"
                                    className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-primary outline-none"
                                    value={logStartDate}
                                    onChange={(e) => setLogStartDate(e.target.value)}
                                  />
                                  <span>~</span>
                                  <input 
                                    type="datetime-local" 
                                    step="1"
                                    className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-primary outline-none"
                                    value={logEndDate}
                                    onChange={(e) => setLogEndDate(e.target.value)}
                                  />
                                  <button className="ml-1 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-primary" title="Search Logs">
                                      <Search size={12} />
                                  </button>
                              </div>
                          </div>
                          <span className="font-mono">Lines: {MOCK_LOG_CONTENT.split('\n').length} / Size: 2KB</span>
                      </div>

                      {/* Viewer */}
                      <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar">
                          {MOCK_LOG_CONTENT.split('\n')
                            .filter(line => !logSearchKeyword || line.toLowerCase().includes(logSearchKeyword.toLowerCase()))
                            .map((line, i) => (
                              <div key={i} className="hover:bg-white/5 px-1 rounded text-slate-300 whitespace-pre-wrap break-all">
                                  {line.includes('[ERROR]') ? (
                                      <span className="text-red-400">{highlightText(line, logSearchKeyword)}</span>
                                  ) : line.includes('[WARNING]') ? (
                                      <span className="text-amber-400">{highlightText(line, logSearchKeyword)}</span>
                                  ) : (
                                      <span>{highlightText(line, logSearchKeyword)}</span>
                                  )}
                              </div>
                          ))}
                      </div>
                  </>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Server size={64} className="mb-4 opacity-20" />
                      <p>Select an Agent to view logs.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default LogsEvents;
