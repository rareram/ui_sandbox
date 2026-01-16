import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, ChevronDown, MoreVertical, 
  Edit, Trash2, Database, CirclePlay, CircleStop, 
  CircleAlert, CircleX, FileKey, FileCog, FileText, 
  Terminal, Activity, Save, Server, Zap, SendHorizontal,
  DatabaseZap, Globe, Key
} from 'lucide-react';
import { Pipeline, PipelineStatus, DbType } from '../../types';
import { useEditor } from '../common/EditorContext';

// --- Assets ---
const getDbLogo = (type: DbType | string) => {
  const map: Record<string, string> = {
    ORACLE: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oracle/oracle-original.svg',
    POSTGRESQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
    MYSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    MSSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-plain.svg',
    MARIADB: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mariadb/mariadb-original.svg',
    TIBERO: 'https://www.tmaxdata.com/img/common/logo_tibero.png'
  };
  return map[type.toUpperCase()] || '';
};

// --- Portal Helper ---
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return createPortal(children, document.body);
};

// --- Custom Kebab Menu (Portal) ---
const KebabMenu = ({ onEdit, onDelete }: { onEdit: () => void, onDelete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 5, left: rect.right + window.scrollX - 120 });
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
      <button ref={buttonRef} onClick={toggle} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors">
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <Portal>
          <div 
            className="fixed z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-32 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100"
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { onEdit(); setIsOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold">
              <Edit size={14} /> 편집
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1"></div>
            <button onClick={() => { onDelete(); setIsOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-bold">
              <Trash2 size={14} /> 삭제
            </button>
          </div>
        </Portal>
      )}
    </>
  );
};

// --- Detail Config File List Item ---
// Fix: Added explicit interface and React.FC typing to resolve 'key' prop issue in JSX mapping
interface ConfigFileItemProps {
  name: string;
  subName?: string;
  onDoubleClick: () => void;
  colorType: 'blue' | 'emerald' | 'purple' | 'amber';
}

const ConfigFileItem: React.FC<ConfigFileItemProps> = ({ name, subName, onDoubleClick, colorType }) => {
  const bgColors = {
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    emerald: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    purple: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
    amber: 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
  };

  return (
    <div 
      onDoubleClick={onDoubleClick}
      className={`px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer transition-colors ${bgColors[colorType]}`}
    >
      <div className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300 truncate">{name}</div>
      {subName && <div className="text-[9px] text-slate-400 italic font-mono truncate">{subName}</div>}
    </div>
  );
};

// --- Pipeline Row Component ---
const PipelineRow = ({ pipeline, expanded, onToggle, onEdit, onDelete }: any) => {
  const { openEditor } = useEditor();
  
  const getStatusIcon = (status: PipelineStatus) => {
    switch (status) {
      case PipelineStatus.RUNNING: return <CirclePlay size={20} className="text-emerald-500" />;
      case PipelineStatus.ERROR: return <CircleX size={20} className="text-rose-500" />;
      case PipelineStatus.WARNING: return <CircleAlert size={20} className="text-amber-500" />;
      default: return <CircleStop size={20} className="text-slate-400" />;
    }
  };

  const SLogo = getDbLogo(pipeline.source.dbType);
  const TLogo = getDbLogo(pipeline.target.dbType);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 last:border-0 overflow-hidden">
      {/* List Header View */}
      <div className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={onToggle}>
        <div className="col-span-2 font-black text-slate-800 dark:text-white truncate">{pipeline.name}</div>
        <div className="col-span-1 flex justify-center">{getStatusIcon(pipeline.status)}</div>
        
        <div className="col-span-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
            <Database size={14} className="text-slate-400" /> <span className="truncate">{pipeline.source.dbName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-black">
            {SLogo && <img src={SLogo} className="w-3.5 h-3.5 object-contain" alt="" />} {pipeline.source.dbType}
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
            <Database size={14} className="text-slate-400" /> <span className="truncate">{pipeline.target.dbName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-black">
            {TLogo && <img src={TLogo} className="w-3.5 h-3.5 object-contain" alt="" />} {pipeline.target.dbType}
          </div>
        </div>

        <div className="col-span-2"><p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">{pipeline.description || '-'}</p></div>
        
        <div className="col-span-2 flex flex-col text-[10px] leading-tight font-medium">
          <span className="text-slate-800 dark:text-slate-300 font-bold">{pipeline.updatedBy}</span>
          <span className="text-slate-400 font-mono mt-0.5">{pipeline.updatedAt}</span>
        </div>

        <div className="col-span-1 flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <KebabMenu onEdit={onEdit} onDelete={onDelete} />
          <button onClick={onToggle} className={`p-1 rounded-full transition-transform ${expanded ? 'rotate-180 text-primary' : 'text-slate-400'}`}><ChevronDown size={20} /></button>
        </div>
      </div>

      {/* Accordion Detail View (2 Rows, 7 Columns) */}
      {expanded && (
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
            {/* Row 1: Module Information (Light Background) */}
            
            {/* Col 1: Source DB */}
            <div className="p-4 flex flex-col items-center text-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 mb-3"><Database size={14} className="text-blue-500"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source DB</span></div>
              <div className="flex items-center gap-2 mb-1.5">
                {SLogo && <img src={SLogo} className="w-6 h-6 object-contain" alt="" />}
                <span className="text-xs font-black dark:text-white">{pipeline.source.dbType}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">{pipeline.source.dbName}</div>
              <div className="text-[9px] font-mono text-slate-500">{pipeline.source.ip}</div>
            </div>

            {/* Col 2: Source Agent */}
            <div className="p-4 flex flex-col items-center text-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 mb-3"><Server size={14} className="text-slate-400"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Agent</span></div>
              <div className="text-[11px] font-black dark:text-white mb-1 truncate w-full">{pipeline.source.agentName}</div>
              <div className="text-[9px] font-mono text-slate-500">{pipeline.source.agentIp} (8080)</div>
            </div>

            {/* Col 3: Extract */}
            <div className="p-4 flex flex-col items-center text-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 mb-3"><Zap size={14} className="text-emerald-500"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extract</span></div>
              <div className="flex-1 flex items-center"><Activity size={24} className="text-slate-200 dark:text-slate-700" /></div>
            </div>

            {/* Col 4: Send */}
            <div className="p-4 flex flex-col items-center text-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 mb-3"><SendHorizontal size={14} className="text-purple-500"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send</span></div>
              <div className="flex-1 flex items-center"><Globe size={24} className="text-slate-200 dark:text-slate-700" /></div>
            </div>

            {/* Col 5: Post */}
            <div className="p-4 flex flex-col items-center text-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 mb-3"><DatabaseZap size={14} className="text-amber-500"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post</span></div>
              <div className="flex-1 flex items-center"><Terminal size={24} className="text-slate-200 dark:text-slate-700" /></div>
            </div>

            {/* Col 6: Target Agent */}
            <div className="p-4 flex flex-col items-center text-center border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 mb-3"><Server size={14} className="text-slate-400"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Agent</span></div>
              <div className="text-[11px] font-black dark:text-white mb-1 truncate w-full">{pipeline.target.agentName}</div>
              <div className="text-[9px] font-mono text-slate-500">{pipeline.target.agentIp} (8080)</div>
            </div>

            {/* Col 7: Target DB */}
            <div className="p-4 flex flex-col items-center text-center bg-white dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 mb-3"><Database size={14} className="text-emerald-500"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target DB</span></div>
              <div className="flex items-center gap-2 mb-1.5">
                {TLogo && <img src={TLogo} className="w-6 h-6 object-contain" alt="" />}
                <span className="text-xs font-black dark:text-white">{pipeline.target.dbType}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">{pipeline.target.dbName}</div>
              <div className="text-[9px] font-mono text-slate-500">{pipeline.target.ip}</div>
            </div>
          </div>

          {/* Row 2: Configuration Files (Dark Background) */}
          <div className="grid grid-cols-7 h-40">
            {/* Col 1: Source DB Config */}
            <div className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950/40">
              <ConfigFileItem 
                name="default.conn" 
                colorType="blue"
                onDoubleClick={() => openEditor([{ id: 's_conn', name: 'default.conn', content: pipeline.source.configContent, category: 'GLOBAL' }], () => {})} 
              />
            </div>

            {/* Col 2: Source Agent Config */}
            <div className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950/40">
              <ConfigFileItem 
                name="agent.conf" 
                colorType="blue"
                onDoubleClick={() => openEditor([{ id: 's_ag', name: 'agent.conf', content: pipeline.source.agentConfigContent, category: 'AGENT' }], () => {})} 
              />
              <ConfigFileItem 
                name="global.conf" 
                colorType="blue"
                onDoubleClick={() => openEditor([{ id: 's_gl', name: 'global.conf', content: pipeline.source.globalConfigContent, category: 'GLOBAL' }], () => {})} 
              />
            </div>

            {/* Col 3: Extract Configs */}
            <div className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950/40">
              {pipeline.topology.extract.map((e: any) => (
                <ConfigFileItem 
                  key={e.id}
                  name={`${e.name}.conf`}
                  subName={`${e.name}.map`}
                  colorType="emerald"
                  onDoubleClick={() => openEditor([{ ...e, category: 'EXTRACT' }, { id: `m_${e.id}`, name: `${e.name}.map`, content: e.mapContent || '', category: 'EXTRACT' }], () => {})} 
                />
              ))}
            </div>

            {/* Col 4: Send Configs */}
            <div className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950/40">
              {pipeline.topology.send.map((s: any) => (
                <ConfigFileItem 
                  key={s.id}
                  name={`${s.name}.conf`}
                  colorType="purple"
                  onDoubleClick={() => openEditor([{ ...s, category: 'SEND' }], () => {})} 
                />
              ))}
            </div>

            {/* Col 5: Post Configs */}
            <div className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950/40">
              {pipeline.topology.post.map((p: any) => (
                <ConfigFileItem 
                  key={p.id}
                  name={`${p.name}.conf`}
                  subName={`${p.name}.map`}
                  colorType="amber"
                  onDoubleClick={() => openEditor([{ ...p, category: 'POST' }, { id: `m_${p.id}`, name: `${p.name}.map`, content: p.mapContent || '', category: 'POST' }], () => {})} 
                />
              ))}
            </div>

            {/* Col 6: Target Agent Config */}
            <div className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950/40">
              <ConfigFileItem 
                name="agent.conf" 
                colorType="emerald"
                onDoubleClick={() => openEditor([{ id: 't_ag', name: 'agent.conf', content: pipeline.target.agentConfigContent, category: 'AGENT' }], () => {})} 
              />
              <ConfigFileItem 
                name="global.conf" 
                colorType="emerald"
                onDoubleClick={() => openEditor([{ id: 't_gl', name: 'global.conf', content: pipeline.target.globalConfigContent, category: 'GLOBAL' }], () => {})} 
              />
            </div>

            {/* Col 7: Target DB Config */}
            <div className="overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950/40">
              <ConfigFileItem 
                name="default.conn" 
                colorType="emerald"
                onDoubleClick={() => openEditor([{ id: 't_conn', name: 'default.conn', content: pipeline.target.configContent, category: 'GLOBAL' }], () => {})} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Pipeline List Component ---
const PipelineList: React.FC<any> = ({ pipelines, openWizard, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return pipelines.filter((p: Pipeline) => 
      p.name.toLowerCase().includes(s) || 
      p.source.agentName.toLowerCase().includes(s) || 
      p.source.agentIp.includes(s) || 
      p.source.dbName.toLowerCase().includes(s) ||
      p.target.dbName.toLowerCase().includes(s) ||
      p.updatedBy.toLowerCase().includes(s)
    );
  }, [searchTerm, pipelines]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* Top Search & Add Bar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="파이프라인, 에이전트, IP, DB, 사용자 검색..." 
            className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-[480px] shadow-sm transition-all"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button onClick={openWizard} className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-blue-500/30 active:scale-95 transition-all uppercase tracking-widest text-xs">
          <Plus size={18} /> {t('common.add')}
        </button>
      </div>

      {/* List Container */}
      <div className="flex-1 bg-white dark:bg-slate-950 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <div className="col-span-2">Pipeline Name</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2">Source DB</div>
          <div className="col-span-2">Target DB</div>
          <div className="col-span-2">Description</div>
          <div className="col-span-2">Recently Updated</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {paginated.map((p: any) => (
            <PipelineRow 
              key={p.id} 
              pipeline={p} 
              expanded={expandedId === p.id} 
              onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)} 
              onEdit={() => onEdit(p)} 
              onDelete={() => { if(confirm('정말로 삭제하시겠습니까?')) onDelete(p.id); }} 
            />
          ))}
          {paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 uppercase font-black tracking-widest text-xs italic">
                <Activity size={48} className="opacity-10 mb-4" />
                No matching pipelines found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex-1"></div>

          {/* Bottom Center Pagination */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-6">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="text-xs font-black text-slate-500 hover:text-primary disabled:opacity-30 uppercase tracking-widest">Prev</button>
                <span className="text-[11px] font-black text-slate-400 font-mono">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="text-xs font-black text-slate-500 hover:text-primary disabled:opacity-30 uppercase tracking-widest">Next</button>
            </div>
          </div>

          {/* Bottom Right Row Selector */}
          <div className="flex-1 flex justify-end items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show Rows</span>
            <select 
              value={pageSize} 
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-black outline-none cursor-pointer"
            >
              {[10, 15, 20, 30, 50].map(sz => <option key={sz} value={sz}>{sz} Rows</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineList;