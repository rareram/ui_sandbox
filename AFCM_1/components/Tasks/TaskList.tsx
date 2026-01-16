
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, MoreVertical, ChevronDown, 
  Play, Square, Edit, Trash2, Clock, Zap, 
  Activity, CheckCircle2, AlertCircle, RefreshCw,
  Calendar, User, FileText, DatabaseZap, ShieldCheck,
  SearchCode, FileSearch, Settings2
} from 'lucide-react';
import { TaskConfig, TaskStatus, TaskType, ScheduleType } from '../../types';
import { useTasks, TaskProvider } from './TaskContext';
import TaskWizard from './TaskWizard';

// --- Sub Components ---

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return createPortal(children, document.body);
};

const KebabMenu = ({ task }: { task: TaskConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const { openWizard, deleteTask } = useTasks();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: Stop Accordion toggle
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 5, left: rect.right + window.scrollX - 160 });
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
      <button ref={buttonRef} onClick={toggle} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors">
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <Portal>
          <div 
            className="fixed z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-44 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100"
            style={{ top: pos.top, left: pos.left }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { openWizard(task); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold">
              <Edit size={14} /> Edit Configuration
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1" />
            <button onClick={() => { if(confirm('Delete this task?')) deleteTask(task.id); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-bold">
              <Trash2 size={14} /> Delete Task
            </button>
          </div>
        </Portal>
      )}
    </>
  );
};

const TaskStatusIcon = ({ status }: { status: TaskStatus }) => {
  switch (status) {
    case 'RUNNING': return <div className="flex items-center gap-1.5 text-emerald-500 font-black"><Play size={16} fill="currentColor" className="animate-pulse"/> Running</div>;
    case 'IDLE': return <div className="flex items-center gap-1.5 text-slate-400 font-black"><Square size={16}/> Idle</div>;
    case 'PAUSED': return <div className="flex items-center gap-1.5 text-amber-500 font-black"><Activity size={16}/> Paused</div>;
    case 'ERROR': return <div className="flex items-center gap-1.5 text-rose-500 font-black"><AlertCircle size={16}/> Error</div>;
    case 'COMPLETED': return <div className="flex items-center gap-1.5 text-blue-500 font-black"><CheckCircle2 size={16}/> Completed</div>;
    default: return null;
  }
};

const TaskTypeBadge = ({ type }: { type: TaskType }) => {
  const styles: Record<TaskType, string> = {
    CDC_PIPELINE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
    INITIAL_LOAD: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
    VERIFICATION: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
    CORRECTION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
    DB_REPLICATE: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200',
    REPORT_GEN: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
    MONITORING_CHECK: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[type]}`}>{type.replace('_', ' ')}</span>;
};

const ScheduleInfo = ({ type }: { type: ScheduleType }) => {
  const icons = {
    REALTIME: <Zap size={14} className="text-amber-500" />,
    REPEAT: <RefreshCw size={14} className="text-blue-500" />,
    SCHEDULED: <Clock size={14} className="text-purple-500" />,
    EVENT_TRIGGER: <Zap size={14} className="text-rose-500" />,
    ON_DEMAND: <Play size={14} className="text-slate-500" />
  };
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
      {icons[type]}
      <span>{type.replace('_', ' ')}</span>
    </div>
  );
};

/* Fix: Used React.FC typing for TaskItem to ensure correct property matching in list rendering */
const TaskItem: React.FC<{ task: TaskConfig }> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const { updateTaskStatus } = useTasks();

  const handleAction = (status: TaskStatus) => {
    updateTaskStatus(task.id, status);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 last:border-0 overflow-hidden">
      <div 
        className="grid grid-cols-12 gap-4 p-5 items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="col-span-3">
          <div className="font-black text-slate-800 dark:text-white text-base truncate">{task.name}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">{task.description || 'No description provided'}</div>
        </div>
        <div className="col-span-1 flex justify-center"><TaskTypeBadge type={task.type} /></div>
        <div className="col-span-2">
            <div className="text-[11px] text-slate-500 uppercase font-black tracking-tighter truncate">
                {task.type === 'CDC_PIPELINE' ? 'Pipeline Control' : 'Operation Details'}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {JSON.stringify(task.details).slice(0, 30)}...
            </div>
        </div>
        <div className="col-span-2 flex justify-center"><TaskStatusIcon status={task.status} /></div>
        <div className="col-span-1.5 flex justify-center"><ScheduleInfo type={task.scheduleType} /></div>
        <div className="col-span-1.5 flex flex-col text-[10px] leading-tight border-l border-slate-100 dark:border-slate-800 pl-4">
          <span className="text-slate-800 dark:text-slate-300 font-bold flex items-center gap-1"><User size={10}/>{task.updatedBy}</span>
          <span className="text-slate-400 font-mono mt-1 flex items-center gap-1"><Calendar size={10}/>{task.updatedAt}</span>
        </div>
        <div className="col-span-1 flex items-center justify-end gap-1">
          <KebabMenu task={task} />
          <div className={`p-1 rounded-full transition-transform ${expanded ? 'rotate-180 text-primary' : 'text-slate-400'}`}><ChevronDown size={20} /></div>
        </div>
      </div>

      {expanded && (
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-8 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Settings2 size={14} /> Task Configuration Details
                  </h4>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner grid grid-cols-2 gap-y-4 gap-x-8">
                      {Object.entries(task.details).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">{String(val)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <FileSearch size={14} /> Last Execution Log
                  </h4>
                  {task.lastExecutionLog ? (
                    <div className="bg-slate-900 rounded-2xl p-5 font-mono text-xs border border-slate-800">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-500">{task.lastExecutionLog.timestamp}</span>
                        <span className={`font-black ${task.lastExecutionLog.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>{task.lastExecutionLog.status}</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed">{task.lastExecutionLog.message}</div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs italic">No execution history found.</div>
                  )}
                </div>
            </div>

            <div className="space-y-6">
               <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operations Control</h4>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => handleAction('RUNNING')}
                      disabled={task.status === 'RUNNING'}
                      className="flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Play size={16} fill="currentColor" /> Run Task Now
                    </button>
                    <button 
                      onClick={() => handleAction('IDLE')}
                      disabled={task.status === 'IDLE'}
                      className="flex items-center justify-center gap-2 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Square size={16} fill="currentColor" /> Force Stop
                    </button>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Next Scheduled</h4>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <Clock size={16} className="text-primary" />
                    <span className="text-sm font-black font-mono">{task.nextRunAt || 'Not Scheduled'}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

const TaskListContent = () => {
  const { tasks, openWizard, isWizardOpen } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return tasks.filter(t => 
      t.name.toLowerCase().includes(s) || 
      t.type.toLowerCase().includes(s) ||
      t.category.toLowerCase().includes(s)
    );
  }, [tasks, searchTerm]);

  return (
    <div className="p-8 h-full flex flex-col gap-6 bg-slate-50 dark:bg-slate-950">
      {/* Header Bar */}
      <div className="flex justify-between items-center shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by task name or type..." 
            className="pl-12 pr-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-[400px] shadow-sm transition-all outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openWizard()}
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-blue-500/30 active:scale-95 transition-all uppercase tracking-widest text-xs"
        >
          <Plus size={20} /> Add Task
        </button>
      </div>

      {/* ListView Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          <div className="col-span-3 pl-2">Task Info</div>
          <div className="col-span-1 text-center">Type</div>
          <div className="col-span-2">Execution Target</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1.5 text-center">Schedule</div>
          <div className="col-span-1.5 pl-4">Recently Updated</div>
          <div className="col-span-1 text-right pr-4">Action</div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => <TaskItem key={task.id} task={task} />)
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 uppercase font-black tracking-widest text-xs italic opacity-40 py-20">
              <DatabaseZap size={64} className="mb-4" />
              No tasks configured
            </div>
          )}
        </div>
      </div>

      {isWizardOpen && <TaskWizard />}
    </div>
  );
};

const TaskList = () => (
  <TaskProvider>
    <TaskListContent />
  </TaskProvider>
);

export default TaskList;
