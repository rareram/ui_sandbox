
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Check, ChevronLeft, ChevronRight, Zap, 
  RefreshCw, ShieldCheck, Database, ListTree,
  FileText, Activity, Play, Settings, Layers, 
  Clock, MousePointer2, DatabaseZap, ArrowRight
} from 'lucide-react';
import { 
  TaskConfig, TaskType, ScheduleType, TaskCategory, 
  TaskDetails, TaskStatus
} from '../../types';
import { useTasks } from './TaskContext';
import { MOCK_PIPELINES, MOCK_SOURCES, MOCK_TARGETS } from '../../constants';

// --- Wizard Sub-Components ---

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

const TypeCard = ({ type, icon: Icon, title, desc, selected, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex flex-col gap-4 relative overflow-hidden group ${
      selected 
      ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary' 
      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm'
    }`}
  >
    {selected && <div className="absolute top-4 right-4 text-primary"><Check size={20} /></div>}
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-primary'}`}>
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">{title}</h4>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const TaskWizard = () => {
  const { closeWizard, addTask, editingTask } = useTasks();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState(editingTask?.name || '');
  const [desc, setDesc] = useState(editingTask?.description || '');
  const [taskType, setTaskType] = useState<TaskType | null>(editingTask?.type || null);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(editingTask?.scheduleType || 'ON_DEMAND');
  const [details, setDetails] = useState<TaskDetails>(editingTask?.details || { operationMode: 'START' } as any);

  const steps = [
    { num: 1, label: 'Type Select', icon: ListTree, desc: '수행할 작업의 유형을 선택합니다.' },
    { num: 2, label: 'Configuration', icon: Settings, desc: '작업의 세부 파라미터를 설정합니다.' },
    { num: 3, label: 'Schedule', icon: Clock, desc: '작업의 실행 주기 및 스케줄을 설정합니다.' },
    { num: 4, label: 'Review & Deploy', icon: ShieldCheck, desc: '최종 설정을 검토하고 작업을 배포합니다.' },
  ];

  const handleNext = () => step < 4 && setStep(step + 1);
  const handleBack = () => step > 1 && setStep(step - 1);

  const handleCreate = () => {
    const newTask: TaskConfig = {
      id: editingTask?.id || `task_${Date.now()}`,
      name: name || `${taskType} Task`,
      description: desc,
      category: ['CDC_PIPELINE', 'REPORT_GEN', 'MONITORING_CHECK'].includes(taskType!) ? 'AUTOMATION' : 'DATA_OPERATION',
      type: taskType!,
      scheduleType,
      status: 'IDLE',
      updatedBy: 'Admin',
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      details,
      nextRunAt: scheduleType === 'ON_DEMAND' ? undefined : '2023-11-01 00:00'
    };
    addTask(newTask);
    closeWizard();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-x-12 max-w-5xl mx-auto">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Group A: Data Operations</label>
                <div className="grid grid-cols-2 gap-4">
                  <TypeCard type="INITIAL_LOAD" icon={Database} title="Initial Load" desc="Synchronize baseline data with resume feature." selected={taskType === 'INITIAL_LOAD'} onClick={() => setTaskType('INITIAL_LOAD')} />
                  <TypeCard type="VERIFICATION" icon={ShieldCheck} title="Verification" desc="Compare data consistency between DBs." selected={taskType === 'VERIFICATION'} onClick={() => setTaskType('VERIFICATION')} />
                  <TypeCard type="CORRECTION" icon={DatabaseZap} title="Correction" desc="Repair mismatched data automatically." selected={taskType === 'CORRECTION'} onClick={() => setTaskType('CORRECTION')} />
                  <TypeCard type="DB_REPLICATE" icon={RefreshCw} title="DB Replicate" desc="Basic DB-to-DB object replication." selected={taskType === 'DB_REPLICATE'} onClick={() => setTaskType('DB_REPLICATE')} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Group B: Automation</label>
                <div className="grid grid-cols-2 gap-4">
                  <TypeCard type="CDC_PIPELINE" icon={Play} title="CDC Control" desc="Batch control of CDC pipeline modules." selected={taskType === 'CDC_PIPELINE'} onClick={() => setTaskType('CDC_PIPELINE')} />
                  <TypeCard type="REPORT_GEN" icon={FileText} title="Report Gen" desc="Schedule automated system reports." selected={taskType === 'REPORT_GEN'} onClick={() => setTaskType('REPORT_GEN')} />
                  <TypeCard type="MONITORING_CHECK" icon={Activity} title="Monitoring" desc="System health & lag auto-check." selected={taskType === 'MONITORING_CHECK'} onClick={() => setTaskType('MONITORING_CHECK')} />
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto space-y-4 pt-10 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Identification</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary shadow-inner transition-all" 
                      placeholder="Enter Task Name..." 
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                </div>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all" 
                  placeholder="Task Description (Optional)" 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {taskType === 'CDC_PIPELINE' ? (
                <div className="max-w-xl mx-auto space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Target Pipeline Selection</label>
                    <select className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary shadow-inner appearance-none">
                      <option value="">Select Pipeline...</option>
                      {MOCK_PIPELINES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Operation Mode</label>
                    <div className="grid grid-cols-4 gap-3">
                      {['START', 'STOP', 'RESTART', 'PAUSE'].map(m => (
                        <button 
                            key={m} 
                            className={`py-4 rounded-xl text-xs font-black border-2 transition-all ${details.operationMode === m ? 'border-primary bg-primary/10 text-primary shadow-lg ring-1 ring-primary' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-200'}`} 
                            onClick={() => setDetails({ ...details, operationMode: m } as any)}
                        >
                            {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-inner">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary transition-all"/><span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">Force Restart</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary transition-all"/><span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">Debug Mode</span>
                     </label>
                  </div>
                </div>
            ) : taskType === 'INITIAL_LOAD' ? (
                <div className="max-w-2xl mx-auto space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Source DB Instance</label>
                        <select className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold shadow-inner outline-none">
                            <option>Select Source...</option>
                            {MOCK_SOURCES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target DB Instance</label>
                        <select className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold shadow-inner outline-none">
                            <option>Select Target...</option>
                            {MOCK_TARGETS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Table Selection Pattern</label>
                        <input className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-sm shadow-inner outline-none" placeholder="SCHEMA.* or TABLE_A, TABLE_B"/>
                   </div>
                   <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-inner">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Parallel Threads</label>
                        <input type="number" defaultValue={4} className="w-full p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-black shadow-sm outline-none focus:ring-2 focus:ring-primary"/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Commit Interval</label>
                        <input type="number" defaultValue={1000} className="w-full p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-black shadow-sm outline-none focus:ring-2 focus:ring-primary"/>
                      </div>
                      <div className="col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <label className="flex items-center gap-3 cursor-pointer font-bold text-sm text-slate-600 dark:text-slate-300">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"/> 
                            Enable Auto-Resume on Failure
                        </label>
                      </div>
                   </div>
                </div>
            ) : (
                <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Settings size={48} className="mx-auto mb-4 text-slate-300 animate-spin-slow opacity-50" />
                    <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest">Advanced UI Pending</h3>
                    <p className="text-xs text-slate-400 mt-2">The configuration form for <span className="text-primary font-bold">{taskType}</span> is being optimized for v0.13.</p>
                </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="max-w-xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-inner">
              {(['REALTIME', 'REPEAT', 'SCHEDULED', 'ON_DEMAND'] as ScheduleType[]).map(s => (
                <button 
                    key={s} 
                    className={`flex-1 py-3.5 text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest ${scheduleType === s ? 'bg-white dark:bg-slate-800 text-primary shadow-lg ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`} 
                    onClick={() => setScheduleType(s)}
                >
                    {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <div className="min-h-[250px] flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-800 p-12 shadow-inner">
              {scheduleType === 'REPEAT' && (
                <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">
                   <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Frequency Control</div>
                   <div className="flex items-center gap-6">
                      <input type="number" className="w-28 p-6 bg-white dark:bg-slate-950 rounded-[32px] text-4xl font-black text-center shadow-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-4 focus:ring-primary/20 transition-all" defaultValue={30} />
                      <div className="flex flex-col gap-1">
                          <select className="bg-transparent text-2xl font-black text-primary outline-none border-none cursor-pointer appearance-none">
                              <option>Minutes</option>
                              <option>Hours</option>
                          </select>
                          <div className="h-0.5 bg-primary w-full rounded-full opacity-30" />
                      </div>
                   </div>
                </div>
              )}
              {scheduleType === 'SCHEDULED' && (
                 <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">
                   <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Precision Cron Generator</div>
                   <div className="flex flex-col gap-6">
                      <div className="flex gap-4 items-center justify-center">
                          <input type="time" className="p-5 bg-white dark:bg-slate-950 rounded-[24px] text-2xl font-black shadow-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary transition-all" defaultValue="02:00"/>
                          <div className="text-slate-300 font-black text-2xl">@</div>
                          <div className="flex gap-1.5 p-2 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <button key={i} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black hover:bg-primary hover:text-white transition-all uppercase">{d}</button>)}
                          </div>
                      </div>
                   </div>
                 </div>
              )}
              {scheduleType === 'ON_DEMAND' && (
                 <div className="text-center animate-in fade-in duration-500">
                    <MousePointer2 size={64} className="mx-auto mb-6 text-slate-300 opacity-30" />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Manual Execution Only</p>
                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest opacity-60">This task will only run when manually triggered via UI or API.</p>
                 </div>
              )}
              {scheduleType === 'REALTIME' && (
                 <div className="text-center animate-in fade-in duration-500">
                    <Zap size={64} className="mx-auto mb-6 text-amber-500 animate-pulse-slow" />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Always Active (Real-time)</p>
                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest opacity-60">Persistent background monitoring and immediate processing.</p>
                 </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
             <div className="text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6 shadow-inner ring-4 ring-primary/5">
                   <Check size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Review & Deploy</h3>
                <p className="text-slate-500 text-sm mt-1">최종 작업 설정을 검토하고 시스템에 배포합니다.</p>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                   <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Task Name</span><span className="text-xl font-black text-slate-800 dark:text-white">{name}</span></div>
                   <div className="flex flex-col items-start"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Task Type</span><TaskTypeBadge type={taskType!} /></div>
                   <div className="flex flex-col items-start"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Schedule</span><ScheduleInfo type={scheduleType} /></div>
                   <div className="flex flex-col"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Module</span><span className="font-mono text-sm font-black text-slate-700 dark:text-slate-200">PIPELINE_ORCL_PG_01</span></div>
                </div>
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Internal Configuration Snapshot</span>
                   <pre className="p-6 bg-slate-950 rounded-3xl text-[11px] font-mono text-emerald-500/80 overflow-x-auto shadow-inner border border-slate-800">{JSON.stringify({ details, scheduleType }, null, 2)}</pre>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-950 w-[70%] h-[85vh] rounded-[32px] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Wizard Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingTask ? 'Edit Task' : 'Create Automation Task'}</h2>
            <p className="text-sm text-slate-500">{steps.find(s => s.num === step)?.desc}</p>
          </div>
          <button onClick={closeWizard} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps (Sync with PipelineWizard Style) */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between relative px-10">
                {/* Connector Line Background */}
                <div className="absolute top-[18px] left-[40px] right-[40px] h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
                {/* Active Connector Line */}
                <div 
                    className="absolute top-[18px] left-[40px] h-[2px] bg-primary z-0 transition-all duration-500 ease-out"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 92}%` }}
                ></div>

                {steps.map((s) => (
                    <div key={s.num} className="flex flex-col items-center relative z-10 gap-2">
                        <div className={`
                            flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 shadow-sm border-2
                            ${step >= s.num 
                                ? 'bg-primary border-primary text-white scale-110 shadow-blue-500/30' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}
                        `}>
                            {step > s.num ? <Check size={16} /> : <s.icon size={16} />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${step >= s.num ? 'text-primary' : 'text-slate-400'}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white dark:bg-slate-950">
            {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
             <button 
                onClick={closeWizard}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
                Cancel
            </button>

            <div className="flex gap-3">
                {step > 1 && (
                    <button 
                        onClick={handleBack}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Previous
                    </button>
                )}
                <button 
                    onClick={() => step < 4 ? handleNext() : handleCreate()}
                    disabled={step === 1 && !taskType}
                    className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                    {step === 4 ? 'Deploy Task' : 'Next Step'} <ArrowRight size={18} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TaskWizard;
