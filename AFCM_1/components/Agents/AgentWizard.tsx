
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Check, ArrowRight, Server, Settings, Play, 
  FileText, Terminal, Activity, Save, ShieldCheck, Cpu, Edit3
} from 'lucide-react';
import { Agent, AgentRole, AgentStatus, ConfigFile } from '../../types';
import { useEditor } from '../common/EditorContext';

interface AgentWizardProps {
  onClose: () => void;
  onSave: (agent: Agent) => void;
  initialData?: Agent;
}

// Mock Templates
const MOCK_AGENT_CONF = `# agent.conf template
# Basic Identification
agent.name=new_agent
agent.port=8080
agent.home=/u01/app/arkdata/agent

# Logging
log.level=INFO
log.dir=./logs
log.retention.days=7

# Java Settings
java.heap.min=512m
java.heap.max=2048m
`;

const MOCK_GLOBAL_CONF = `# global.conf template
# Network Settings
server.encoding=UTF-8
network.timeout=3000
buffer.size=8192

# Manager Connection
manager.ip=10.10.10.1
manager.port=9000
manager.connect.retry=5
`;

const AgentWizard: React.FC<AgentWizardProps> = ({ onClose, onSave, initialData }) => {
  const { t } = useTranslation();
  const { openEditor } = useEditor();
  const [step, setStep] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'FAIL'>(initialData ? 'SUCCESS' : 'IDLE');
  
  // Step 1: Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData ? 'Existing agent configuration' : ''); 
  const [ip, setIp] = useState(initialData?.ip || '');
  const [port, setPort] = useState(initialData?.port.toString() || '8080');
  const [agentKey, setAgentKey] = useState(initialData ? '******' : '');
  const [version, setVersion] = useState(initialData?.version || '');
  const [osType, setOsType] = useState(initialData?.osType || '');

  // Step 2: Config Files State
  const [configs, setConfigs] = useState<ConfigFile[]>([
      { id: 'agent_conf', name: 'agent.conf', content: MOCK_AGENT_CONF, category: 'AGENT' },
      { id: 'global_conf', name: 'global.conf', content: MOCK_GLOBAL_CONF, category: 'GLOBAL' }
  ]);

  const steps = [
    { num: 1, label: t('pipeline.wizard.step1'), icon: Server, desc: 'Agent 기본 정보를 입력 합니다.' },
    { num: 2, label: t('pipeline.wizard.step5'), icon: Settings, desc: 'Agent 환경 설정 파일을 생성 합니다.' },
    { num: 3, label: t('pipeline.wizard.step6'), icon: Play, desc: '테스트 후 정보를 저장합니다.' },
  ];

  const handleTestConnection = () => {
    if (!ip || !port || !agentKey) {
        alert("IP, Port, Agent Key를 모두 입력해주세요.");
        return;
    }
    setConnectionStatus('TESTING');
    
    // Mock API Call simulation
    setTimeout(() => {
        setConnectionStatus('SUCCESS');
        // Auto-fill retrieved info
        setVersion('2.6.5');
        setOsType('Linux (CentOS 7)');
    }, 1500);
  };

  const handleSave = () => {
      const newAgent: Agent = {
          id: initialData?.id || `a_new_${Date.now()}`,
          name: name,
          role: initialData?.role || AgentRole.SOURCE, // Default role, could be added to Step 1 if needed
          ip: ip,
          port: Number(port),
          protocol: initialData?.protocol || 'HTTP',
          version: version || 'Unknown',
          osType: osType || 'Unknown',
          status: initialData?.status || AgentStatus.CONNECTED,
          pipelineCount: initialData?.pipelineCount || 0,
          registeredAt: initialData?.registeredAt || new Date().toISOString().split('T')[0],
          user: initialData?.user || 'Admin',
          updatedAt: new Date().toISOString(),
          updatedBy: 'Admin'
      };
      onSave(newAgent);
  };

  const handleEditConfig = (fileId: string) => {
      // Open the global editor with the selected file first
      const targetFile = configs.find(c => c.id === fileId);
      if (!targetFile) return;

      const orderedFiles = [targetFile, ...configs.filter(c => c.id !== fileId)];
      
      openEditor(orderedFiles, (updatedFiles) => {
          setConfigs(prev => prev.map(p => {
              const updated = updatedFiles.find(u => u.id === p.id);
              return updated ? updated : p;
          }));
      });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1.1 Agent 이름</label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all" 
                        placeholder="에이전트 이름을 입력하세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                 </div>
                 
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1.2 설명</label>
                    <textarea 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none h-24 resize-none transition-all" 
                        placeholder="설명을 입력하세요"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1.3 Agent IP</label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="192.168.x.x"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1.4 Agent Port</label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="8080"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                    />
                 </div>

                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1.5 Agent Key</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" 
                                placeholder="인증 키를 입력하세요"
                                value={agentKey}
                                onChange={(e) => setAgentKey(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleTestConnection}
                            disabled={connectionStatus === 'TESTING'}
                            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                connectionStatus === 'SUCCESS' 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30' 
                                : 'bg-slate-800 text-white hover:bg-slate-700 shadow-lg'
                            }`}
                        >
                            {connectionStatus === 'TESTING' ? (
                                <Activity size={18} className="animate-spin" />
                            ) : connectionStatus === 'SUCCESS' ? (
                                <Check size={18} />
                            ) : (
                                <Server size={18} />
                            )}
                            {connectionStatus === 'TESTING' ? '연결 중...' : connectionStatus === 'SUCCESS' ? '연결 성공' : 'Agent 연결 확인'}
                        </button>
                    </div>
                 </div>

                 {/* 1.6 & 1.7 Show only on Success */}
                 {connectionStatus === 'SUCCESS' && (
                     <div className="col-span-2 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                         <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                             <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">1.6 Agent Version</label>
                             <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{version}</div>
                         </div>
                         <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                             <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">1.7 Server OS Type</label>
                             <div className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Cpu size={16} />
                                {osType}
                             </div>
                         </div>
                     </div>
                 )}
             </div>
          </div>
        );
      case 2:
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Configuration Files</h3>
                    <p className="text-sm text-slate-500">Edit the agent.conf and global.conf settings below.</p>
                </div>
                
                <div className="w-full max-w-3xl grid grid-cols-2 gap-6">
                    {configs.map(file => (
                        <div 
                            key={file.id} 
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-primary dark:hover:border-primary transition-all cursor-pointer group shadow-sm hover:shadow-lg relative overflow-hidden"
                            onClick={() => handleEditConfig(file.id)}
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
                                    <Edit3 size={16} />
                                 </div>
                            </div>

                            <div className="flex flex-col h-full gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${file.id === 'agent_conf' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'}`}>
                                        {file.id === 'agent_conf' ? <FileText size={24} /> : <Terminal size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{file.name}</h4>
                                        <span className="text-xs text-slate-500 font-mono uppercase">{file.category}</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 bg-white dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-500 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-slate-950 opacity-50 pointer-events-none" />
                                    <pre>{file.content}</pre>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 3:
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-8">
                 <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
                     <Server size={48} />
                 </div>
                 
                 <div className="text-center">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Ready to Deploy</h3>
                      <p className="text-slate-500">Review the configuration summary below.</p>
                 </div>

                 <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="grid grid-cols-2 gap-y-4">
                          <div className="text-sm text-slate-500">Agent Name</div>
                          <div className="text-sm font-bold text-right text-slate-800 dark:text-slate-200">{name}</div>
                          
                          <div className="text-sm text-slate-500">Address</div>
                          <div className="text-sm font-bold text-right text-slate-800 dark:text-slate-200 font-mono">{ip}:{port}</div>
                          
                          <div className="text-sm text-slate-500">System Info</div>
                          <div className="text-sm font-bold text-right text-slate-800 dark:text-slate-200">{osType} / {version}</div>
                          
                          <div className="col-span-2 h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
                          
                          <div className="text-sm text-slate-500">Config Files</div>
                          <div className="text-sm font-bold text-right flex justify-end gap-2">
                              {configs.map(c => (
                                  <div key={c.id} className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs">
                                      <Check size={10} className="text-emerald-500" />
                                      <span className="text-slate-600 dark:text-slate-300">{c.name}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                 </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Width 60% as requested, matching PipelineWizard styling */}
      <div className="bg-white dark:bg-slate-950 w-[60%] h-[80vh] rounded-[32px] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Wizard Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Edit Agent Wizard' : 'Create Agent Wizard'}</h2>
            <p className="text-sm text-slate-500">{steps.find(s => s.num === step)?.desc}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps (Visual Style matching PipelineWizard) */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between relative px-20">
                {/* Connector Line Background */}
                <div className="absolute top-[18px] left-[50px] right-[50px] h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
                {/* Active Connector Line */}
                <div 
                    className="absolute top-[18px] left-[50px] h-[2px] bg-primary z-0 transition-all duration-500 ease-out"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 88}%` }}
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-slate-950">
            {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
             <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
                {t('common.cancel')}
            </button>

            <div className="flex gap-3">
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {t('common.prev')}
                    </button>
                )}
                {step < 3 ? (
                    <button 
                        onClick={() => setStep(step + 1)}
                        // Disable Next if connection not verified in Step 1
                        disabled={step === 1 && connectionStatus !== 'SUCCESS'} 
                        className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.next')} <ArrowRight size={18} />
                    </button>
                ) : (
                    <button 
                        onClick={handleSave}
                        className="px-8 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 flex items-center gap-2 active:scale-95 transition-all"
                    >
                        {t('common.save')} <Save size={18} />
                    </button>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AgentWizard;
