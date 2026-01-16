
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MOCK_AGENTS, MOCK_PIPELINES } from '../../constants';
import { 
  Server, Edit, Trash2, Search, Plus, MoreVertical, 
  ChevronDown, Database, Activity, Terminal, Save, ArrowRightLeft
} from 'lucide-react';
import { AgentRole, AgentStatus, Agent, ConfigFile } from '../../types';
import AgentWizard from './AgentWizard';
import { useEditor } from '../common/EditorContext';

// --- Types & Helper Components ---

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
        setPosition({ 
            top: rect.bottom + window.scrollY, 
            left: rect.right + window.scrollX - 128 
        });
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
                className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-32 py-1 flex flex-col"
                style={{ top: position.top, left: position.left }}
                onClick={(e) => e.stopPropagation()} 
            >
                <button 
                    onClick={(e) => { 
                        e.stopPropagation();
                        setIsOpen(false);
                        onEdit(); 
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-500 text-left transition-colors"
                >
                    <Edit size={14} /> {t('common.edit')}
                </button>
                <button 
                    onClick={(e) => { 
                        e.stopPropagation();
                        setIsOpen(false);
                        setTimeout(() => onDelete(), 0); 
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 text-left transition-colors"
                >
                    <Trash2 size={14} /> {t('common.delete')}
                </button>
            </div>
        </Portal>
      )}
    </>
  );
};

const AgentRoleBadge: React.FC<{ role: AgentRole }> = ({ role }) => {
  const styles = {
    [AgentRole.SOURCE]: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800',
    [AgentRole.TARGET]: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800',
    [AgentRole.BOTH]: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800',
    [AgentRole.RELAY]: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800',
  };

  const labels = {
    [AgentRole.SOURCE]: 'Source',
    [AgentRole.TARGET]: 'Target',
    [AgentRole.BOTH]: 'Both',
    [AgentRole.RELAY]: 'Relay',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider border ${styles[role]}`}>
      {labels[role]}
    </span>
  );
};

// --- Mock Data Helpers for Config List ---
const getMockFiles = (agentId: string, pipelineCount: number) => {
    if (pipelineCount === 0) return { pipelines: [], endpoints: [], extracts: [], sends: [], posts: [] };

    // Simulating data associations
    const pipelines = MOCK_PIPELINES.slice(0, pipelineCount).map(p => ({ name: p.name, desc: p.description }));
    const endpoints = [{ id: `conn_${agentId}`, name: 'default.conn', content: '# DB Connection\nHOST=127.0.0.1' }];
    
    const extracts = Array.from({ length: pipelineCount }, (_, i) => ({
        id: `ext_${agentId}_${i}`,
        conf: { id: `ec_${i}`, name: `extract${String(i+1).padStart(2, '0')}.conf`, content: '# Extract Config', category: 'EXTRACT' as any },
        map: { id: `em_${i}`, name: `extract${String(i+1).padStart(2, '0')}.map`, content: '{"mapping":[]}', category: 'EXTRACT' as any }
    }));

    const sends = [{ id: `snd_${agentId}`, name: 'send.conf', content: '# Send Module Settings', category: 'SEND' as any }];

    const posts = Array.from({ length: pipelineCount }, (_, i) => ({
        id: `pst_${agentId}_${i}`,
        conf: { id: `pc_${i}`, name: `post${String(i+1).padStart(2, '0')}.conf`, content: '# Post Config', category: 'POST' as any },
        map: { id: `pm_${i}`, name: `post${String(i+1).padStart(2, '0')}.map`, content: '{"mapping":[]}', category: 'POST' as any }
    }));

    return { pipelines, endpoints, extracts, sends, posts };
};

interface AgentRowProps {
    agent: Agent;
    expanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const AgentRow: React.FC<AgentRowProps> = ({ 
    agent, 
    expanded, 
    onToggle,
    onEdit,
    onDelete 
}) => {
    const { t } = useTranslation();
    const { openEditor } = useEditor();
    
    const files = useMemo(() => getMockFiles(agent.id, agent.pipelineCount), [agent.id, agent.pipelineCount]);

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            {/* Main Row Content - Single Line Flexbox to avoid wrapping */}
            <div className="flex items-center gap-2 p-4 cursor-pointer whitespace-nowrap overflow-x-auto no-scrollbar" onClick={onToggle}>
                
                {/* 1. Role */}
                <div className="min-w-[80px] shrink-0"><AgentRoleBadge role={agent.role} /></div>

                {/* 2. Name & OS */}
                <div className="min-w-[160px] shrink-0 flex flex-col justify-center overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                        <Server size={14} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-white truncate text-sm" title={agent.name}>{agent.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 pl-5 truncate">{agent.osType}</div>
                </div>

                {/* 3. IP */}
                <div className="min-w-[110px] shrink-0 text-xs font-mono text-slate-600 dark:text-slate-300 pr-2">
                    {agent.ip}
                </div>

                {/* 4. Port/Proto */}
                <div className="min-w-[80px] shrink-0 flex flex-col justify-center text-[10px] pr-2">
                    <span className="font-mono text-slate-600 dark:text-slate-300">{agent.port}</span>
                    <span className="text-slate-400 uppercase">{agent.protocol}</span>
                </div>

                {/* 5. Ver */}
                <div className="min-w-[50px] shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400 pr-2">
                     v{agent.version}
                </div>

                {/* 6. Status */}
                <div className="min-w-[90px] shrink-0">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold ${
                            agent.status === AgentStatus.CONNECTED ? 'text-emerald-600 dark:text-emerald-400' : 
                            'text-rose-600 dark:text-rose-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === AgentStatus.CONNECTED ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`} />
                        {agent.status === AgentStatus.CONNECTED ? 'RUNNING' : 'STOPPED'}
                    </span>
                </div>

                {/* --- File Count Badges --- */}
                
                {/* 7. Pipeline */}
                <div className="min-w-[80px] shrink-0 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                         {agent.pipelineCount}
                    </span>
                </div>

                {/* 8. Endpoint */}
                <div className="min-w-[80px] shrink-0 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold border border-blue-100 dark:border-blue-800/50">
                         {files.endpoints.length}
                    </span>
                </div>

                {/* 9. Extract */}
                <div className="min-w-[80px] shrink-0 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-800/50">
                         {files.extracts.length}
                    </span>
                </div>

                {/* 10. Send */}
                <div className="min-w-[80px] shrink-0 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-bold border border-purple-100 dark:border-purple-800/50">
                         {files.sends.length}
                    </span>
                </div>

                {/* 11. Post */}
                <div className="min-w-[80px] shrink-0 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold border border-amber-100 dark:border-amber-800/50">
                         {files.posts.length}
                    </span>
                </div>

                {/* 12. Updated At - Minimized margins */}
                <div className="min-w-[120px] shrink-0 text-[10px] flex flex-col justify-center px-0">
                     <div className="font-bold text-slate-700 dark:text-slate-300 truncate leading-tight">{agent.updatedBy}</div>
                     <div className="text-slate-400 font-mono leading-tight">{agent.updatedAt}</div>
                </div>

                {/* 13. Actions */}
                <div className="flex-1 min-w-[80px] flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <KebabMenu onEdit={onEdit} onDelete={onDelete} />
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className={`p-1 rounded-full transition-transform duration-200 text-slate-400 hover:text-primary ${expanded ? 'rotate-180 text-primary' : ''}`}
                    >
                        <ChevronDown size={18} />
                    </button>
                </div>
            </div>

            {/* Expanded Accordion Content: 5 Columns Scrollable Listview */}
            {expanded && (
                <div className="px-6 pb-6 pt-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 overflow-x-auto">
                     <div className="grid grid-cols-5 gap-4 min-w-[1000px]">
                        
                        {/* 1. Pipeline */}
                        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-48 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <ArrowRightLeft size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pipeline</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                {files.pipelines.map((p, idx) => (
                                    <div key={idx} className="px-3 py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{p.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{p.desc}</div>
                                    </div>
                                ))}
                                {files.pipelines.length === 0 && <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">No Data</div>}
                            </div>
                        </div>

                        {/* 2. Endpoint */}
                        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-48 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <Database size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Endpoint</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                {files.endpoints.map(f => (
                                    <div 
                                        key={f.id} 
                                        onDoubleClick={() => openEditor([{...f, category: 'GLOBAL'}], () => {})}
                                        className="px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors font-mono"
                                    >
                                        {f.name}
                                    </div>
                                ))}
                                {files.endpoints.length === 0 && <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">No Data</div>}
                            </div>
                        </div>

                        {/* 3. Extract */}
                        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-48 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <Activity size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Extract</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                {files.extracts.map(pair => (
                                    <div 
                                        key={pair.id} 
                                        onDoubleClick={() => openEditor([pair.conf, pair.map], () => {})}
                                        className="px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                                    >
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-mono truncate">{pair.conf.name}</div>
                                        <div className="text-[10px] text-slate-400 italic font-mono truncate">{pair.map.name}</div>
                                    </div>
                                ))}
                                {files.extracts.length === 0 && <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">No Data</div>}
                            </div>
                        </div>

                        {/* 4. Send */}
                        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-48 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <Terminal size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Send</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                {files.sends.map(f => (
                                    <div 
                                        key={f.id} 
                                        onDoubleClick={() => openEditor([f], () => {})}
                                        className="px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg cursor-pointer transition-colors font-mono"
                                    >
                                        {f.name}
                                    </div>
                                ))}
                                {files.sends.length === 0 && <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">No Data</div>}
                            </div>
                        </div>

                        {/* 5. Post */}
                        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-48 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <Save size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Post</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                {files.posts.map(pair => (
                                    <div 
                                        key={pair.id} 
                                        onDoubleClick={() => openEditor([pair.conf, pair.map], () => {})}
                                        className="px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                                    >
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-mono truncate">{pair.conf.name}</div>
                                        <div className="text-[10px] text-slate-400 italic font-mono truncate">{pair.map.name}</div>
                                    </div>
                                ))}
                                {files.posts.length === 0 && <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">No Data</div>}
                            </div>
                        </div>

                     </div>
                </div>
            )}
        </div>
    );
}

// --- Main Agent List Component ---
const AgentList: React.FC = () => {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | AgentRole>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [showWizard, setShowWizard] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);

  const filtered = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            agent.ip.includes(searchTerm);
      const matchesRole = filterRole === 'All' || agent.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, filterRole, agents]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('messages.deleteConfirm') + `\nTarget: ${name}`)) {
        setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleEdit = (agent: Agent) => {
      setEditingAgent(agent);
      setShowWizard(true);
  };

  const handleSaveAgent = (savedAgent: Agent) => {
      setAgents(prev => {
          const exists = prev.find(a => a.id === savedAgent.id);
          if (exists) {
              return prev.map(a => a.id === savedAgent.id ? savedAgent : a);
          } else {
              return [savedAgent, ...prev];
          }
      });
      setShowWizard(false);
      setEditingAgent(undefined);
  };

  const handleOpenAddWizard = () => {
      setEditingAgent(undefined);
      setShowWizard(true);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {['All', AgentRole.SOURCE, AgentRole.TARGET, AgentRole.BOTH, AgentRole.RELAY].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filterRole === role 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {role === 'All' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleOpenAddWizard}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} />
            {t('common.add')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {/* Table Header - Single line flex with full names */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-x-auto no-scrollbar">
            <div className="min-w-[80px]">Role</div>
            <div className="min-w-[160px]">Agent Name</div>
            <div className="min-w-[110px]">IP Address</div>
            <div className="min-w-[80px]">Port/Proto</div>
            <div className="min-w-[50px]">Version</div>
            <div className="min-w-[90px]">Status</div>
            <div className="min-w-[80px] text-center">Pipeline</div>
            <div className="min-w-[80px] text-center">Endpoint</div>
            <div className="min-w-[80px] text-center">Extract</div>
            <div className="min-w-[80px] text-center">Send</div>
            <div className="min-w-[80px] text-center">Post</div>
            <div className="min-w-[120px] px-0">Updated At</div>
            <div className="flex-1 text-right pr-4">Action</div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
            {filtered.map((agent) => (
                <AgentRow 
                    key={agent.id} 
                    agent={agent} 
                    expanded={expandedId === agent.id}
                    onToggle={() => setExpandedId(expandedId === agent.id ? null : agent.id)}
                    onEdit={() => handleEdit(agent)}
                    onDelete={() => handleDelete(agent.id, agent.name)}
                />
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No agents found matching your criteria.</p>
              </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
            <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm outline-none">
                <option>10 rows</option>
                <option>20 rows</option>
                <option>50 rows</option>
            </select>
            <div className="flex gap-4 text-sm text-slate-500">
                <button className="hover:text-primary">{t('common.prev')}</button>
                <span>1 / 1</span>
                <button className="hover:text-primary">{t('common.next')}</button>
            </div>
        </div>
      </div>
      
      {showWizard && (
        <AgentWizard 
            initialData={editingAgent}
            onClose={() => { setShowWizard(false); setEditingAgent(undefined); }}
            onSave={handleSaveAgent}
        />
      )}
    </div>
  );
};

export default AgentList;
