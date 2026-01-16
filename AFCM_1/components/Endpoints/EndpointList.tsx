
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MOCK_SOURCES, MOCK_TARGETS, MOCK_AGENTS } from '../../constants';
import { 
  Edit, Trash2, Search, Plus, MoreVertical, 
  ChevronDown, Database, Server, 
  ShieldCheck, Clock 
} from 'lucide-react';
import EndpointWizard, { EndpointFormData } from './EndpointWizard';

// --- Types ---
interface ExtendedEndpoint {
    id: string;
    role: 'Source' | 'Target' | 'Both';
    name: string; 
    agentName: string; 
    agentIp: string; 
    dbName: string; 
    type: string;
    ip: string; 
    port: number;
    user: string;
    version: string; 
    status: string;
    pipelineCount: number;
    updatedBy: string; 
    updatedAt: string; // YYYY-MM-DD HH:MM:SS
    description?: string; 
}

// --- Helper Components ---

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return createPortal(children, document.body);
};

// Kebab Menu Component
const KebabMenu = ({ onEdit, onDelete }: { onEdit: () => void, onDelete: () => void }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + window.scrollY, left: rect.right + window.scrollX - 120 });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const close = () => setIsOpen(false);
    if (isOpen) window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [isOpen]);

  return (
    <>
      <button 
        ref={buttonRef} 
        onClick={toggleMenu} 
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <Portal>
            <div 
                className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-32 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100"
                style={{ top: position.top, left: position.left }}
                onClick={(e) => e.stopPropagation()} 
            >
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsOpen(false); 
                        onEdit(); 
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-500 text-left transition-colors font-medium"
                >
                    <Edit size={14} /> {t('common.edit')}
                </button>
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsOpen(false); 
                        setTimeout(() => onDelete(), 0);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 text-left transition-colors font-medium"
                >
                    <Trash2 size={14} /> {t('common.delete')}
                </button>
            </div>
        </Portal>
      )}
    </>
  );
};

// DB Logo Component
const DbLogo = ({ type }: { type: string }) => {
  const logoMap: Record<string, string> = {
    ORACLE: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oracle/oracle-original.svg',
    POSTGRESQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
    MYSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    MSSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-plain.svg',
    MARIADB: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mariadb/mariadb-original.svg',
  };

  const src = logoMap[type.toUpperCase()];

  if (src) {
    return <img src={src} alt={type} className="w-4 h-4 object-contain" />;
  }

  return <Database size={14} className="text-slate-400" />;
};

// --- Row Component ---
interface EndpointRowProps {
    endpoint: ExtendedEndpoint;
    expanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const EndpointRow: React.FC<EndpointRowProps> = ({ endpoint, expanded, onToggle, onEdit, onDelete }) => {
    
    const getRoleBadge = (role: string) => {
        const styles = {
            'Source': 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'Target': 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
            'Both': 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${styles[role as keyof typeof styles]}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Main Grid Row (12 Cols) */}
            <div className="grid grid-cols-12 gap-2 p-4 items-center cursor-pointer" onClick={onToggle}>
                
                {/* 1. Role (1 col) */}
                <div className="col-span-1">
                    {getRoleBadge(endpoint.role)}
                </div>

                {/* 2. Endpoint Name (1.5 cols) */}
                <div className="col-span-1.5 flex flex-col justify-center overflow-hidden">
                    <span className="font-bold text-slate-800 dark:text-white truncate text-sm" title={endpoint.name}>
                        {endpoint.name}
                    </span>
                </div>

                {/* 3. Agent (1.5 cols) */}
                <div className="col-span-1.5 flex flex-col justify-center overflow-hidden border-l border-slate-100 dark:border-slate-800 pl-2 ml-1">
                    <span className="font-bold text-slate-700 dark:text-white text-xs truncate" title={endpoint.agentName}>
                        {endpoint.agentName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate leading-tight">
                        {endpoint.agentIp}
                    </span>
                </div>

                {/* 4. DB Name & Type (1.5 cols) */}
                <div className="col-span-1.5 flex flex-col justify-center overflow-hidden border-l border-slate-100 dark:border-slate-800 pl-2 ml-1">
                    <span className="font-bold text-slate-700 dark:text-white text-xs truncate" title={endpoint.dbName}>
                        {endpoint.dbName}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                        <DbLogo type={endpoint.type} />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{endpoint.type}</span>
                    </div>
                </div>

                {/* 5. DB IP & Port (1.5 cols) */}
                <div className="col-span-1.5 flex flex-col justify-center border-l border-slate-100 dark:border-slate-800 pl-2 ml-1">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate">{endpoint.ip}</span>
                    <span className="text-[10px] text-slate-400 font-mono leading-tight pr-1">Port: {endpoint.port}</span>
                </div>

                {/* 6. DB Version (1 col) */}
                <div className="col-span-1 text-center">
                    <span className="inline-block px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800/50 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                        {endpoint.version}
                    </span>
                </div>

                {/* 7. Status (1 col) */}
                <div className="col-span-1">
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${
                        endpoint.status === 'CONNECTED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                            endpoint.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`} />
                        {endpoint.status === 'CONNECTED' ? 'ONLINE' : 'OFFLINE'}
                    </div>
                </div>

                {/* 8. Pipeline Count (0.5 col) */}
                <div className="col-span-0.5 text-center">
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-black border border-slate-200 dark:border-slate-700">
                         {endpoint.pipelineCount}
                    </span>
                </div>

                {/* 9. Updated At (1.5 col) */}
                <div className="col-span-1.5 flex flex-col justify-center text-[10px] pl-2 border-l border-slate-100 dark:border-slate-800 ml-1">
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate leading-tight">{endpoint.updatedBy}</span>
                     <span className="text-slate-400 font-mono truncate leading-tight">{endpoint.updatedAt}</span>
                </div>

                {/* 10. Action (1 col) */}
                <div className="col-span-1 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <KebabMenu onEdit={onEdit} onDelete={onDelete} />
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className={`p-1 rounded-full transition-transform duration-200 text-slate-400 hover:text-primary ${expanded ? 'rotate-180 text-primary' : ''}`}
                    >
                        <ChevronDown size={18} />
                    </button>
                </div>
            </div>

            {/* Accordion Detail View */}
            {expanded && (
                <div className="px-6 pb-6 pt-2 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">
                                <Server size={14} className="text-blue-500" /> Connection Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="col-span-2">
                                    <span className="block text-slate-400 mb-1">JDBC URL</span>
                                    <code className="block bg-slate-100 dark:bg-slate-900 p-2 rounded text-slate-600 dark:text-slate-300 font-mono break-all leading-tight border border-slate-200 dark:border-slate-700">
                                        jdbc:{endpoint.type.toLowerCase()}://{endpoint.ip}:{endpoint.port}/{endpoint.dbName}
                                    </code>
                                </div>
                                <div>
                                    <span className="block text-slate-400 mb-1">DB User</span>
                                    <span className="block font-medium text-slate-700 dark:text-slate-200">{endpoint.user}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 mb-1">Last Checked</span>
                                    <span className="block font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                        <Clock size={12} className="text-slate-400" /> 2 mins ago
                                    </span>
                                </div>
                            </div>
                        </div>

                         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">
                                <ShieldCheck size={14} className="text-emerald-500" /> Security & Attributes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-600">SSL Enabled</span>
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-600">ReadOnly: {endpoint.role === 'Source' ? 'YES' : 'NO'}</span>
                            </div>
                            <div className="mt-4 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
                                <p className="italic">"{endpoint.description || 'No description provided.'}"</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main List Component ---
const EndpointList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | 'Source' | 'Target' | 'Both'>('All');
  
  // State for Endpoints
  const [endpoints, setEndpoints] = useState<ExtendedEndpoint[]>(() => {
    const initialList: ExtendedEndpoint[] = [];
    
    MOCK_SOURCES.forEach((s, idx) => {
        const agent = MOCK_AGENTS[idx % MOCK_AGENTS.length];
        initialList.push({
            ...s,
            role: 'Source',
            agentName: agent.name,
            agentIp: agent.ip,
            dbName: `${s.type}_SVC`,
            version: s.type === 'ORACLE' ? '19c' : '8.0.32',
            updatedBy: s.registeredBy,
            updatedAt: '2023-10-27 10:00:00',
            description: 'Production Source DB'
        } as ExtendedEndpoint);
    });

    MOCK_TARGETS.forEach((t, idx) => {
        if (!initialList.find(e => e.id === t.id)) {
            const agent = MOCK_AGENTS[(idx + 2) % MOCK_AGENTS.length];
            initialList.push({
                ...t,
                role: 'Target',
                agentName: agent.name,
                agentIp: agent.ip,
                dbName: `${t.type}_DW`,
                version: t.type === 'POSTGRESQL' ? '15.2' : '19c',
                updatedBy: t.registeredBy,
                updatedAt: '2023-10-26 14:30:00',
                description: 'Warehouse Target DB'
            } as ExtendedEndpoint);
        }
    });
    return initialList;
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ExtendedEndpoint | undefined>(undefined);

  const filtered = useMemo(() => {
    return endpoints.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.agentIp.includes(searchTerm) ||
                              item.dbName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.ip.includes(searchTerm);
        
        let matchesRole = true;
        if (filterRole !== 'All') {
            matchesRole = item.role === filterRole;
        }

        return matchesSearch && matchesRole;
      });
  }, [endpoints, searchTerm, filterRole]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(t('messages.deleteConfirm') + `\nTarget: ${name}`)) {
        setEndpoints(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleEdit = (endpoint: ExtendedEndpoint) => {
      setEditingEndpoint(endpoint);
      setShowWizard(true);
  };

  const handleAdd = () => {
      setEditingEndpoint(undefined);
      setShowWizard(true);
  };

  const handleSaveEndpoint = (data: EndpointFormData) => {
      // 선택된 에이전트 정보 찾기
      const selectedAgent = MOCK_AGENTS.find(a => a.id === data.agentId);

      setEndpoints(prev => {
          if (editingEndpoint) {
              return prev.map(e => e.id === editingEndpoint.id ? {
                  ...e,
                  ...data,
                  agentName: selectedAgent?.name || e.agentName,
                  agentIp: selectedAgent?.ip || e.agentIp,
                  port: Number(data.port),
                  updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                  updatedBy: 'Admin'
              } : e);
          } else {
              const newEndpoint: ExtendedEndpoint = {
                  id: `e_new_${Date.now()}`,
                  role: data.role,
                  name: data.name,
                  agentName: selectedAgent?.name || 'Unknown Agent', 
                  agentIp: selectedAgent?.ip || '0.0.0.0',
                  dbName: data.dbName,
                  type: data.type,
                  ip: data.ip,
                  port: Number(data.port),
                  user: data.user,
                  version: 'Unknown',
                  status: 'CONNECTED',
                  pipelineCount: 0,
                  updatedBy: 'Admin',
                  updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                  description: data.description
              };
              return [newEndpoint, ...prev];
          }
      });
      setShowWizard(false);
  };

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {['All', 'Source', 'Target', 'Both'].map((role) => (
                <button
                    key={role}
                    onClick={() => setFilterRole(role as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        filterRole === role 
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {role}
                </button>
            ))}
        </div>

        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={t('common.search')}
                    className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={handleAdd}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
                <Plus size={18} />
                {t('common.add')}
             </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {/* Table Header (12 Cols) */}
        <div className="grid grid-cols-12 gap-2 px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
            <div className="col-span-1">Role</div>
            <div className="col-span-1.5">Endpoint Name</div>
            <div className="col-span-1.5 pl-2 ml-1">Agent Info</div>
            <div className="col-span-1.5 pl-2 ml-1">DB Name / Type</div>
            <div className="col-span-1.5 pl-2 ml-1">IP / Port</div>
            <div className="col-span-1 text-center">Version</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-0.5 text-center">Pipeline</div>
            <div className="col-span-1.5 pl-2 ml-1">Recently Updated</div>
            <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
            {filtered.map((endpoint) => (
                <EndpointRow 
                    key={endpoint.id} 
                    endpoint={endpoint}
                    expanded={expandedId === endpoint.id}
                    onToggle={() => setExpandedId(expandedId === endpoint.id ? null : endpoint.id)}
                    onEdit={() => handleEdit(endpoint)}
                    onDelete={() => handleDelete(endpoint.id, endpoint.name)}
                />
            ))}
             {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No endpoints found matching your criteria.</p>
              </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
            <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm outline-none">
                <option>10 rows</option>
                <option>20 rows</option>
                <option>50 rows</option>
            </select>
            <div className="flex gap-4 text-sm text-slate-500 font-medium">
                <button className="hover:text-primary transition-colors">{t('common.prev')}</button>
                <span>1 / 1</span>
                <button className="hover:text-primary transition-colors">{t('common.next')}</button>
            </div>
        </div>
      </div>

      {showWizard && (
          <EndpointWizard 
            onClose={() => setShowWizard(false)}
            onSave={handleSaveEndpoint}
            initialData={editingEndpoint ? {
                id: editingEndpoint.id,
                name: editingEndpoint.name,
                description: editingEndpoint.description || '',
                role: editingEndpoint.role,
                agentId: MOCK_AGENTS.find(a => a.name === editingEndpoint.agentName)?.id || '',
                type: editingEndpoint.type,
                dbName: editingEndpoint.dbName,
                ip: editingEndpoint.ip,
                port: editingEndpoint.port.toString(),
                user: editingEndpoint.user,
                password: '' 
            } : undefined}
          />
      )}
    </div>
  );
};

export default EndpointList;
