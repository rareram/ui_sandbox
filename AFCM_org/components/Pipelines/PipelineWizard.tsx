
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Check, ArrowRight, Database, Settings, GitBranch, Layers, Play, 
  Search, ChevronDown, CircleCheck, CircleAlert, Sheet, Columns2, 
  FileCog, FileBraces, CirclePlus, Trash2, AlertTriangle, Link2, SquarePen,
  FileText
} from 'lucide-react';
import { MOCK_AGENTS, MOCK_SOURCES, MOCK_TARGETS } from '../../constants';
import { Pipeline, PipelineStatus, DbType, ConfigFile, FileCategory } from '../../types';
import { useEditor } from '../common/EditorContext';

// --- Types & Interfaces ---
interface WizardProps {
  onClose: () => void;
  onSave: (pipeline: Pipeline) => void;
  initialData?: Pipeline;
}

interface TableData {
  id: string;
  name: string;
  isMatched: boolean;
}

interface ColumnData {
  id: string;
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  isMatched: boolean;
}

interface PairedConfig {
  id: string;
  config: ConfigFile;
  map: ConfigFile;
}

// --- Mock Templates (Simulating files from "config_template" folder) ---
const TEMPLATE_EXTRACT_CONF = `# config_template/extract.conf
# Extract Module Configuration
extract.mode=log
extract.parallelism=4
extract.buffer.size=8192
extract.checkpoint.interval=10s
`;

const TEMPLATE_EXTRACT_MAP = `{
  // config_template/extract.map
  "mapping": [
    {
      "source_table": "SCHEMA.TABLE_A",
      "target_table": "SCHEMA.TABLE_A",
      "columns": "*"
    }
  ]
}`;

const TEMPLATE_SEND_CONF = `# config_template/send.conf
# Network Transmission Settings
send.protocol=tcp
send.batch.size=1000
send.compression=lz4
send.timeout=30s
`;

const TEMPLATE_POST_CONF = `# config_template/post.conf
# Post (Apply) Module Configuration
post.mode=bulk
post.commit.interval=5000
post.error.policy=retry
post.parallelism=8
`;

const TEMPLATE_POST_MAP = `{
  // config_template/post.map
  "mapping": [
    {
      "source_table": "SCHEMA.TABLE_A",
      "target_table": "SCHEMA.TABLE_A",
      "action": "INSERT,UPDATE,DELETE"
    }
  ]
}`;

// --- Mock Data Generators ---
const generateMockTables = (prefix: string, count: number): TableData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}_tbl_${i}`,
    name: `${prefix}_TABLE_${i + 1}`,
    isMatched: Math.random() > 0.3
  }));
};

const generateMockColumns = (prefix: string): ColumnData[] => {
  const types = ['VARCHAR(100)', 'NUMBER(10)', 'DATE', 'TIMESTAMP', 'CHAR(1)', 'CLOB'];
  return Array.from({ length: Math.floor(Math.random() * 5) + 5 }, (_, i) => ({
    id: `${prefix}_col_${i}`,
    name: `${prefix}_COL_${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    isPk: i === 0,
    isFk: i === 1 && Math.random() > 0.5,
    isMatched: Math.random() > 0.1
  }));
};

// --- Reusable UI Components ---

const Toggle = ({ enabled, onChange, disabled, label, subLabel }: { enabled: boolean, onChange: (v: boolean) => void, disabled?: boolean, label?: string, subLabel?: string }) => (
  <div className={`flex items-center gap-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
    {(label || subLabel) && (
      <div className="flex flex-col text-left">
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
          {subLabel && <span className="text-xs text-slate-500">{subLabel}</span>}
      </div>
    )}
  </div>
);

const SearchableSelect = ({ options, value, onChange, placeholder, label }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter((opt: any) => opt.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="relative" ref={wrapperRef}>
            {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
            <div 
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                    {value ? options.find((o: any) => o.value === value)?.label || value : placeholder}
                </span>
                <ChevronDown size={18} className="text-slate-400" />
            </div>
            
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2 rounded-lg">
                            <Search size={14} className="text-slate-400" />
                            <input 
                                className="w-full bg-transparent p-2 text-sm outline-none" 
                                placeholder="Search..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
                        {filtered.map((opt: any) => (
                            <div 
                                key={opt.value}
                                className={`p-2 rounded-lg text-sm cursor-pointer ${value === opt.value ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                            >
                                {opt.label}
                            </div>
                        ))}
                        {filtered.length === 0 && <div className="p-3 text-center text-xs text-slate-500">No results found</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Wizard Component ---

const PipelineWizard: React.FC<WizardProps> = ({ onClose, onSave, initialData }) => {
  const { t } = useTranslation();
  const { openEditor } = useEditor();
  const [step, setStep] = useState(1);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'SUCCESS' | 'FAIL'>('IDLE');

  // Form State
  const [pipelineName, setPipelineName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Find initial agent/db values based on Names or IDs
  const initialSourceAgent = initialData ? MOCK_AGENTS.find(a => a.name === initialData.source.agentName)?.id || '' : '';
  const initialTargetAgent = initialData ? MOCK_AGENTS.find(a => a.name === initialData.target.agentName)?.id || '' : '';
  const initialSourceDb = initialData?.source.connectionId || '';
  const initialTargetDb = initialData?.target.connectionId || '';

  const [sourceAgent, setSourceAgent] = useState(initialSourceAgent);
  const [isSourceRelay, setIsSourceRelay] = useState(false);
  const [sourceDb, setSourceDb] = useState(initialSourceDb);
  const [isSourceCluster, setIsSourceCluster] = useState(false);
  
  const [targetAgent, setTargetAgent] = useState(initialTargetAgent);
  const [isSameAsSource, setIsSameAsSource] = useState(initialSourceAgent === initialTargetAgent && initialSourceAgent !== '');
  const [isTargetRelay, setIsTargetRelay] = useState(false);
  const [targetDb, setTargetDb] = useState(initialTargetDb);
  const [isTargetCluster, setIsTargetCluster] = useState(false);

  // Step 4 State
  const [isExpertMode, setIsExpertMode] = useState(!!initialData); 
  
  // Express Mode State
  const [sourceTables] = useState(generateMockTables('SRC', 20));
  const [targetTables] = useState(generateMockTables('TGT', 20));
  const [selectedSrcTableId, setSelectedSrcTableId] = useState<string | null>(null);
  const [selectedTgtTableId, setSelectedTgtTableId] = useState<string | null>(null);
  const [srcColumns, setSrcColumns] = useState<ColumnData[]>([]);
  const [tgtColumns, setTgtColumns] = useState<ColumnData[]>([]);
  const [selectedSrcColId, setSelectedSrcColId] = useState<string | null>(null);
  const [selectedTgtColId, setSelectedTgtColId] = useState<string | null>(null);

  // Expert Mode State - Initialize from initialData if available, otherwise empty for new creation
  const [extractPairs, setExtractPairs] = useState<PairedConfig[]>(() => {
    if (initialData && initialData.topology.extract.length > 0) {
        return initialData.topology.extract.map(e => ({
            id: `pair_${e.id}`,
            config: { id: e.id, name: e.name, content: e.content, category: 'EXTRACT' },
            map: { id: `map_${e.id}`, name: `${e.name.replace('.conf', '')}_map.json`, content: e.mapContent || '', category: 'EXTRACT' }
        }));
    }
    return []; // Empty for new pipelines
  });

  const [sendFiles, setSendFiles] = useState<ConfigFile[]>(() => {
      if (initialData && initialData.topology.send.length > 0) {
          return initialData.topology.send.map(s => ({
              id: s.id,
              name: s.name,
              content: s.content,
              category: 'SEND'
          }));
      }
      return []; // Empty for new pipelines
  });

  const [postPairs, setPostPairs] = useState<PairedConfig[]>(() => {
      if (initialData && initialData.topology.post.length > 0) {
          return initialData.topology.post.map(p => ({
              id: `pair_${p.id}`,
              config: { id: p.id, name: p.name, content: p.content, category: 'POST' },
              map: { id: `map_${p.id}`, name: `${p.name.replace('.conf', '')}_map.json`, content: p.mapContent || '', category: 'POST' }
          }));
      }
      return []; // Empty for new pipelines
  });

  const [activeDeleteId, setActiveDeleteId] = useState<{type: 'PAIR_EXT' | 'PAIR_POST' | 'FILE_SEND', id: string, name: string} | null>(null);

  // --- Logic ---
  
  useEffect(() => {
      if (isSameAsSource) {
          setTargetAgent(sourceAgent);
          setIsTargetRelay(false);
      }
  }, [isSameAsSource, sourceAgent]);

  // Express Mode Logic
  useEffect(() => {
      if (selectedSrcTableId) {
          const index = parseInt(selectedSrcTableId.split('_').pop() || '0');
          const matchingTarget = targetTables[index];
          if (matchingTarget) setSelectedTgtTableId(matchingTarget.id);
          setSrcColumns(generateMockColumns('SRC'));
          setTgtColumns(generateMockColumns('TGT'));
      }
  }, [selectedSrcTableId, targetTables]);

  const handleSrcColClick = (id: string) => {
      setSelectedSrcColId(id);
      const index = parseInt(id.split('_').pop() || '0');
      const targetCol = tgtColumns[index];
      if (targetCol) setSelectedTgtColId(targetCol.id);
  }

  const handleTgtColClick = (id: string) => {
      setSelectedTgtColId(id);
      const index = parseInt(id.split('_').pop() || '0');
      const sourceCol = srcColumns[index];
      if (sourceCol) setSelectedSrcColId(sourceCol.id);
  }

  // Expert Mode Handlers

  // Use the global editor hook
  const handleOpenEditor = (files: ConfigFile[]) => {
      openEditor(files, (updatedFiles) => {
          // Callback after save from global editor
          handleSaveFiles(updatedFiles);
      });
  };

  const handleSaveFiles = (updatedFiles: ConfigFile[]) => {
      // Helper to update a file list
      const updateList = (list: ConfigFile[]) => list.map(f => {
          const updated = updatedFiles.find(uf => uf.id === f.id);
          return updated ? updated : f;
      });
      
      // Update Single Lists
      setSendFiles(prev => updateList(prev));
      
      // Update Paired Lists (Extract)
      setExtractPairs(prev => prev.map(p => {
          const updatedConfig = updatedFiles.find(uf => uf.id === p.config.id);
          const updatedMap = updatedFiles.find(uf => uf.id === p.map.id);
          return {
              ...p,
              config: updatedConfig || p.config,
              map: updatedMap || p.map
          };
      }));

      // Update Paired Lists (Post)
      setPostPairs(prev => prev.map(p => {
          const updatedConfig = updatedFiles.find(uf => uf.id === p.config.id);
          const updatedMap = updatedFiles.find(uf => uf.id === p.map.id);
          return {
              ...p,
              config: updatedConfig || p.config,
              map: updatedMap || p.map
          };
      }));
  };

  const handleDelete = () => {
      if (!activeDeleteId) return;
      const { type, id } = activeDeleteId;

      if (type === 'PAIR_EXT') {
          setExtractPairs(prev => prev.filter(p => p.id !== id));
      } else if (type === 'PAIR_POST') {
          setPostPairs(prev => prev.filter(p => p.id !== id));
      } else if (type === 'FILE_SEND') {
          setSendFiles(prev => prev.filter(f => f.id !== id));
      }
      
      setActiveDeleteId(null);
  };

  const handleAddPair = (type: 'EXTRACT' | 'POST') => {
      const isExtract = type === 'EXTRACT';
      const newPair: PairedConfig = {
          id: `${type}_${Date.now()}`,
          config: { 
              id: `${type}_conf_${Date.now()}`, 
              name: isExtract ? 'extract.conf' : 'post.conf', 
              content: isExtract ? TEMPLATE_EXTRACT_CONF : TEMPLATE_POST_CONF, 
              category: type 
          },
          map: { 
              id: `${type}_map_${Date.now()}`, 
              name: isExtract ? 'extract.map' : 'post.map', 
              content: isExtract ? TEMPLATE_EXTRACT_MAP : TEMPLATE_POST_MAP, 
              category: type 
          }
      };
      
      if (isExtract) {
          setExtractPairs([...extractPairs, newPair]);
      } else {
          setPostPairs([...postPairs, newPair]);
      }
      handleOpenEditor([newPair.config, newPair.map]);
  };

  const handleAddFile = (category: 'SEND') => {
      const newFile: ConfigFile = {
          id: `${category}_${Date.now()}`,
          name: 'send.conf',
          content: TEMPLATE_SEND_CONF,
          category
      };
      setSendFiles([...sendFiles, newFile]);
      handleOpenEditor([newFile]);
  };

  const handleWizardFinish = () => {
    // Construct the Pipeline object
    const sAgent = getAgentName(sourceAgent);
    const sDb = getDbName(sourceDb, true);
    const tAgent = getAgentName(targetAgent);
    const tDb = getDbName(targetDb, false);

    const newPipeline: Pipeline = {
        id: initialData?.id || `p_new_${Date.now()}`,
        name: pipelineName || 'New Pipeline',
        description: description || 'Created via Wizard',
        status: initialData?.status || PipelineStatus.STOPPED,
        source: {
            connectionId: sourceDb || 's_new',
            agentName: sAgent?.name || 'Source Agent',
            agentIp: sAgent?.ip || '0.0.0.0',
            dbName: sDb?.name || 'SOURCE_DB',
            dbType: (sDb?.type as DbType) || DbType.ORACLE,
            ip: sDb?.ip || '0.0.0.0',
            user: sDb?.user || 'user',
            configContent: '# Source Config',
            agentConfigContent: '# Agent Config',
            globalConfigContent: '# Global Config'
        },
        target: {
            connectionId: targetDb || 't_new',
            agentName: tAgent?.name || 'Target Agent',
            agentIp: tAgent?.ip || '0.0.0.0',
            dbName: tDb?.name || 'TARGET_DB',
            dbType: (tDb?.type as DbType) || DbType.POSTGRESQL,
            ip: tDb?.ip || '0.0.0.0',
            user: tDb?.user || 'user',
            configContent: '# Target Config',
            agentConfigContent: '# Agent Config',
            globalConfigContent: '# Global Config'
        },
        topology: {
            extract: extractPairs.map(p => ({ ...p.config, hasMap: true, mapContent: p.map.content })),
            send: sendFiles,
            post: postPairs.map(p => ({ ...p.config, hasMap: true, mapContent: p.map.content }))
        },
        metrics: initialData?.metrics || {
            epsExtract: 0,
            epsPost: 0,
            bpsSend: 0,
            lagExtract: 0,
            lagSend: 0,
            lagApply: 0,
            flowHistory: []
        },
        updatedAt: new Date().toISOString().split('T')[0],
        updatedBy: 'Admin'
    };

    onSave(newPipeline);
  };

  const steps = [
    { num: 1, label: t('pipeline.wizard.step1'), icon: Layers, desc: t('pipeline.wizard.desc1') },
    { num: 2, label: t('pipeline.wizard.step2'), icon: Database, desc: t('pipeline.wizard.desc2') },
    { num: 3, label: t('pipeline.wizard.step3'), icon: Database, desc: t('pipeline.wizard.desc3') },
    { num: 4, label: t('pipeline.wizard.step4'), icon: GitBranch, desc: isExpertMode ? t('pipeline.wizard.desc4_expert') : t('pipeline.wizard.desc4_express') },
    { num: 5, label: t('pipeline.wizard.step5'), icon: Settings, desc: t('pipeline.wizard.desc5') },
    { num: 6, label: t('pipeline.wizard.step6'), icon: Play, desc: t('pipeline.wizard.desc6') },
  ];

  const agentOptions = MOCK_AGENTS.map(a => ({ value: a.id, label: `${a.name} (${a.ip})` }));
  const sourceDbOptions = MOCK_SOURCES.map(d => ({ value: d.id, label: `${d.name} (${d.type})` }));
  const targetDbOptions = MOCK_TARGETS.map(d => ({ value: d.id, label: `${d.name} (${d.type})` }));

  // Helper to get selected names
  const getAgentName = (id: string) => MOCK_AGENTS.find(a => a.id === id);
  const getDbName = (id: string, isSource: boolean) => (isSource ? MOCK_SOURCES : MOCK_TARGETS).find(d => d.id === id);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('pipeline.name')}</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder={t('pipeline.wizard.namePlaceholder')} 
                value={pipelineName}
                onChange={e => setPipelineName(e.target.value)}
                autoFocus 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('pipeline.description')}</label>
              <textarea 
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none h-32 resize-none transition-all" 
                placeholder={t('pipeline.wizard.descPlaceholder')} 
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
        );
      case 2:
        return (
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="col-span-2 space-y-4">
                    <SearchableSelect 
                        label={t('pipeline.wizard.sourceAgent')} 
                        options={agentOptions} 
                        value={sourceAgent} 
                        onChange={setSourceAgent} 
                        placeholder={t('pipeline.wizard.sourceAgent')} 
                    />
                    <div className="flex justify-end">
                        <Toggle 
                            label={t('pipeline.wizard.relayRole')} 
                            enabled={isSourceRelay} 
                            onChange={setIsSourceRelay} 
                        />
                    </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <SearchableSelect 
                        label={t('pipeline.wizard.sourceDB')} 
                        options={sourceDbOptions} 
                        value={sourceDb} 
                        onChange={setSourceDb} 
                        placeholder={t('pipeline.wizard.sourceDB')} 
                    />
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="srcCluster"
                            checked={isSourceCluster} 
                            onChange={e => setIsSourceCluster(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="srcCluster" className="text-sm text-slate-700 dark:text-slate-300">{t('pipeline.wizard.dbCluster')}</label>
                    </div>
                </div>
            </div>
        );
      case 3:
        return (
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="col-span-2 space-y-4">
                     <SearchableSelect 
                        label={t('pipeline.wizard.targetAgent')} 
                        options={agentOptions} 
                        value={targetAgent} 
                        onChange={setTargetAgent} 
                        placeholder={t('pipeline.wizard.targetAgent')} 
                    />
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <Toggle 
                            label={t('pipeline.wizard.sameAsSource')} 
                            enabled={isSameAsSource} 
                            onChange={setIsSameAsSource} 
                        />
                        <Toggle 
                            label={t('pipeline.wizard.relayRole')} 
                            enabled={isTargetRelay} 
                            onChange={setIsTargetRelay} 
                            disabled={isSourceRelay || isSameAsSource}
                        />
                    </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <SearchableSelect 
                        label={t('pipeline.wizard.targetDB')} 
                        options={targetDbOptions} 
                        value={targetDb} 
                        onChange={setTargetDb} 
                        placeholder={t('pipeline.wizard.targetDB')} 
                    />
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="tgtCluster"
                            checked={isTargetCluster} 
                            onChange={e => setIsTargetCluster(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="tgtCluster" className="text-sm text-slate-700 dark:text-slate-300">{t('pipeline.wizard.dbCluster')}</label>
                    </div>
                </div>
            </div>
        );
      case 4:
         // Data helpers for Expert Mode view
         const sAgent = getAgentName(sourceAgent);
         const sDb = getDbName(sourceDb, true);
         const tAgent = getAgentName(targetAgent);
         const tDb = getDbName(targetDb, false);

         return (
             <div className="h-full flex flex-col gap-4">
                 {/* Mode Toggle */}
                 <div className="flex justify-start items-center mb-2">
                     <Toggle 
                        enabled={isExpertMode}
                        onChange={setIsExpertMode}
                        label={t('pipeline.wizard.expertMode')}
                        subLabel={isExpertMode ? t('pipeline.wizard.desc4_expert') : t('pipeline.wizard.desc4_express')}
                     />
                 </div>

                 {!isExpertMode ? (
                     // EXPRESS MODE
                     <div className="flex-1 grid grid-rows-2 grid-cols-2 gap-x-6 gap-y-6 min-h-0">
                        {/* Express Mode content remains the same */}
                        {/* Row 1 Left: Source Tables */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                                    <Database size={16} />
                                    <span>SOURCE DB: {sDb?.name || 'SALES_DB'}</span>
                                </div>
                                <div className="text-xs font-mono space-x-2">
                                    <span className="text-slate-500">Total: {sourceTables.length}</span>
                                    <span className="text-emerald-500">Match: {sourceTables.filter(t=>t.isMatched).length}</span>
                                    <span className="text-rose-500">Diff: {sourceTables.filter(t=>!t.isMatched).length}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 bg-slate-100 dark:bg-slate-800/50 p-2 text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                <div className="col-span-10">Table Name</div>
                                <div className="col-span-2 text-center">Match</div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                                {sourceTables.map(tbl => (
                                    <div 
                                        key={tbl.id} 
                                        onClick={() => setSelectedSrcTableId(tbl.id)}
                                        className={`grid grid-cols-12 p-2 items-center cursor-pointer border-l-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedSrcTableId === tbl.id ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500' : 'border-transparent'}`}
                                    >
                                        <div className="col-span-10 flex items-center gap-2">
                                            <Sheet size={14} className={selectedSrcTableId === tbl.id ? 'text-blue-500' : 'text-slate-400'} />
                                            <span className={`text-sm ${selectedSrcTableId === tbl.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{tbl.name}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            {tbl.isMatched ? <CircleCheck size={14} className="text-emerald-500"/> : <CircleAlert size={14} className="text-rose-500"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Row 1 Right: Target Tables */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                                    <Database size={16} />
                                    <span>TARGET DB: {tDb?.name || 'DW_DB'}</span>
                                </div>
                                <div className="text-xs font-mono space-x-2">
                                    <span className="text-slate-500">Total: {targetTables.length}</span>
                                    <span className="text-emerald-500">Match: {targetTables.filter(t=>t.isMatched).length}</span>
                                    <span className="text-rose-500">Diff: {targetTables.filter(t=>!t.isMatched).length}</span>
                                </div>
                            </div>
                             <div className="grid grid-cols-12 bg-slate-100 dark:bg-slate-800/50 p-2 text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                <div className="col-span-10">Table Name</div>
                                <div className="col-span-2 text-center">Match</div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                                {targetTables.map(tbl => (
                                    <div 
                                        key={tbl.id} 
                                        onClick={() => setSelectedTgtTableId(tbl.id)}
                                        className={`grid grid-cols-12 p-2 items-center cursor-pointer border-l-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedTgtTableId === tbl.id ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500' : 'border-transparent'}`}
                                    >
                                        <div className="col-span-10 flex items-center gap-2">
                                            <Sheet size={14} className={selectedTgtTableId === tbl.id ? 'text-blue-500' : 'text-slate-400'} />
                                            <span className={`text-sm ${selectedTgtTableId === tbl.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{tbl.name}</span>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            {tbl.isMatched ? <CircleCheck size={14} className="text-emerald-500"/> : <CircleAlert size={14} className="text-rose-500"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Row 2 Left: Source Columns */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                             <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                                    <Sheet size={16} />
                                    <span>{selectedSrcTableId ? sourceTables.find(t=>t.id===selectedSrcTableId)?.name : 'Select a Table'}</span>
                                </div>
                                <div className="text-xs font-mono text-slate-400">
                                    Columns: {srcColumns.length}
                                </div>
                            </div>
                            <div className="grid grid-cols-12 bg-slate-100 dark:bg-slate-800/50 p-2 text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                <div className="col-span-6">Column Name</div>
                                <div className="col-span-4">Type</div>
                                <div className="col-span-2 text-center">Match</div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                                {srcColumns.map(col => (
                                     <div 
                                        key={col.id} 
                                        onClick={() => handleSrcColClick(col.id)}
                                        className={`grid grid-cols-12 p-2 items-center cursor-pointer border-l-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedSrcColId === col.id ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500' : 'border-transparent'}`}
                                    >
                                        <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                                            <Columns2 size={14} className="text-slate-400 shrink-0" />
                                            <span className={`text-sm truncate ${selectedSrcColId === col.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>{col.name}</span>
                                            {col.isPk && <span className="text-[9px] bg-amber-100 text-amber-600 px-1 rounded font-bold">PK</span>}
                                            {col.isFk && <span className="text-[9px] bg-sky-100 text-sky-600 px-1 rounded font-bold">FK</span>}
                                        </div>
                                        <div className="col-span-4 text-xs text-slate-500">{col.type}</div>
                                        <div className="col-span-2 flex justify-center">
                                            {col.isMatched ? <CircleCheck size={14} className="text-emerald-500"/> : <CircleAlert size={14} className="text-rose-500"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Row 2 Right: Target Columns */}
                         <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                             <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                                    <Sheet size={16} />
                                    <span>{selectedTgtTableId ? targetTables.find(t=>t.id===selectedTgtTableId)?.name : 'Select a Table'}</span>
                                </div>
                                <div className="text-xs font-mono text-slate-400">
                                    Columns: {tgtColumns.length}
                                </div>
                            </div>
                            <div className="grid grid-cols-12 bg-slate-100 dark:bg-slate-800/50 p-2 text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                <div className="col-span-6">Column Name</div>
                                <div className="col-span-4">Type</div>
                                <div className="col-span-2 text-center">Match</div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                                {tgtColumns.map(col => (
                                     <div 
                                        key={col.id} 
                                        onClick={() => handleTgtColClick(col.id)}
                                        className={`grid grid-cols-12 p-2 items-center cursor-pointer border-l-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedTgtColId === col.id ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500' : 'border-transparent'}`}
                                    >
                                        <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                                            <Columns2 size={14} className="text-slate-400 shrink-0" />
                                            <span className={`text-sm truncate ${selectedTgtColId === col.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>{col.name}</span>
                                            {col.isPk && <span className="text-[9px] bg-amber-100 text-amber-600 px-1 rounded font-bold">PK</span>}
                                            {col.isFk && <span className="text-[9px] bg-sky-100 text-sky-600 px-1 rounded font-bold">FK</span>}
                                        </div>
                                        <div className="col-span-4 text-xs text-slate-500">{col.type}</div>
                                        <div className="col-span-2 flex justify-center">
                                            {col.isMatched ? <CircleCheck size={14} className="text-emerald-500"/> : <CircleAlert size={14} className="text-rose-500"/>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                     </div>
                 ) : (
                     // EXPERT MODE - Refactored to remove inline editor
                     <div className="flex-1 flex flex-col min-h-0">
                         {/* Config Panel - 5 Columns with specific widths */}
                         <div className="h-full flex border border-slate-700 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                             
                             {/* Column 1: Source DB (16%) */}
                             <div className="w-[16%] border-r border-slate-700 flex flex-col">
                                 <div className="bg-slate-800 text-xs font-bold text-blue-400 text-center py-2 border-b border-slate-700">{t('pipeline.wizard.sourceDB')}</div>
                                 <div className="p-4 space-y-4 flex-1">
                                    <div className="text-left flex items-start gap-2 mb-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1">
                                            <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${sDb?.type?.toLowerCase() || 'oracle'}/${sDb?.type?.toLowerCase() || 'oracle'}-original.svg`} className="w-full h-full object-contain"/>
                                        </div>
                                        <div className="font-bold text-slate-200 mt-2 text-sm">{sDb?.type || 'ORACLE'}</div>
                                    </div>
                                    <div className="text-sm text-slate-300 text-left">
                                        <p className="font-bold text-base mb-1 truncate" title={sDb?.name}>{sDb?.name || 'KR_SALES_DB'}</p>
                                        <p className="text-xs text-slate-500 font-mono truncate">({sDb?.ip || '10.10.20.15'})</p>
                                    </div>
                                    <div className="h-px bg-slate-700 w-full" />
                                    <div className="text-sm text-slate-300 text-left">
                                        <p className="font-bold mb-1 truncate" title={sAgent?.name}>{sAgent?.name || 'Agent-Seoul-01'}</p>
                                        <p className="text-xs text-slate-500 font-mono truncate">({sAgent?.ip || '10.10.20.15'})</p>
                                    </div>
                                 </div>
                             </div>

                             {/* Column 2: Extract (26%) - Paired List */}
                             <div className="w-[26%] border-r border-slate-700 flex flex-col bg-slate-900">
                                 <div className="bg-slate-800 text-xs font-bold text-blue-400 text-center py-2 border-b border-slate-700">{t('pipeline.extract')}</div>
                                 
                                 {/* Header */}
                                 <div className="flex items-center px-2 py-1 text-[10px] text-slate-500 font-bold border-b border-slate-800">
                                    <div className="flex-1 text-left pl-2">{t('pipeline.wizard.configFile')}</div>
                                    <div className="w-6 text-center"></div>
                                    <div className="flex-1 text-left pl-2">{t('pipeline.wizard.mappingFile')}</div>
                                    <div className="w-12 text-center">{t('common.action')}</div>
                                 </div>

                                 <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                     {extractPairs.map(pair => (
                                         <div 
                                             key={pair.id}
                                             className="flex items-center text-xs p-2 rounded hover:bg-slate-800 group border-b border-slate-800/50 last:border-0"
                                         >
                                             {/* Config File */}
                                             <div 
                                                className="flex-1 flex items-center gap-1.5 truncate cursor-pointer hover:text-blue-400 group/item" 
                                                title={pair.config.name}
                                                onDoubleClick={() => handleOpenEditor([pair.config, pair.map])}
                                             >
                                                <FileCog size={12} className="text-slate-500 shrink-0 group-hover/item:text-blue-400"/>
                                                <span className="truncate text-slate-300">{pair.config.name}</span>
                                             </div>

                                             {/* Link Icon */}
                                             <div className="w-6 flex justify-center text-slate-600">
                                                 <Link2 size={12} />
                                             </div>

                                             {/* Map File */}
                                             <div 
                                                className="flex-1 flex items-center gap-1.5 truncate cursor-pointer hover:text-blue-400 group/item"
                                                title={pair.map.name}
                                                onDoubleClick={() => handleOpenEditor([pair.config, pair.map])}
                                             >
                                                <FileBraces size={12} className="text-slate-500 shrink-0 group-hover/item:text-blue-400"/>
                                                <span className="truncate text-slate-300">{pair.map.name}</span>
                                             </div>

                                             {/* Actions */}
                                             <div className="w-12 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button 
                                                    onClick={() => handleOpenEditor([pair.config, pair.map])}
                                                    className="text-slate-400 hover:text-white"
                                                 >
                                                     <SquarePen size={12} />
                                                 </button>
                                                 <button 
                                                    onClick={() => setActiveDeleteId({type: 'PAIR_EXT', id: pair.id, name: `${pair.config.name}, ${pair.map.name}`})}
                                                    className="text-slate-400 hover:text-rose-500"
                                                 >
                                                     <Trash2 size={12} />
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                     
                                     {/* Add Button */}
                                     <button 
                                        onClick={() => handleAddPair('EXTRACT')}
                                        className="w-full mt-2 flex items-center gap-2 p-2 rounded hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors text-xs font-medium"
                                     >
                                        <CirclePlus size={14} />
                                        <span>{t('common.add')}</span>
                                     </button>
                                 </div>
                             </div>

                             {/* Column 3: Send (16%) */}
                             <div className="w-[16%] border-r border-slate-700 flex flex-col">
                                 <div className="bg-slate-800 text-xs font-bold text-blue-400 text-center py-2 border-b border-slate-700">{t('pipeline.send')}</div>
                                 <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                    <div className="flex justify-between px-2 py-1 text-[10px] text-slate-500 font-bold border-b border-slate-800 mb-1">
                                        <span className="pl-2">{t('pipeline.wizard.configFile')}</span>
                                        <span>{t('common.action')}</span>
                                    </div>
                                     {sendFiles.map(file => (
                                         <div 
                                             key={file.id} 
                                             className="flex justify-between items-center p-2 rounded cursor-pointer group hover:bg-slate-800"
                                             title={file.name}
                                             onDoubleClick={() => handleOpenEditor([file])}
                                         >
                                             <div className="flex items-center gap-2 truncate flex-1 hover:text-blue-400 transition-colors">
                                                 <FileCog size={14} className="text-blue-400 shrink-0"/>
                                                 <span className="text-xs text-slate-300 truncate">{file.name}</span>
                                             </div>
                                             <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100">
                                                 <SquarePen size={12} className="text-slate-500 hover:text-white" onClick={() => handleOpenEditor([file])}/>
                                                 <Trash2 size={12} className="text-slate-500 hover:text-rose-500" onClick={() => setActiveDeleteId({type: 'FILE_SEND', id: file.id, name: file.name})}/>
                                             </div>
                                         </div>
                                     ))}
                                     <button onClick={() => handleAddFile('SEND')} className="w-full mt-2 flex items-center gap-2 p-2 rounded hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors text-xs font-medium">
                                        <CirclePlus size={14} />
                                        <span>{t('common.add')}</span>
                                     </button>
                                 </div>
                             </div>

                             {/* Column 4: Post (26%) - Paired List */}
                             <div className="w-[26%] border-r border-slate-700 flex flex-col bg-slate-900">
                                 <div className="bg-slate-800 text-xs font-bold text-emerald-400 text-center py-2 border-b border-slate-700">{t('pipeline.apply')}</div>
                                 
                                 {/* Header */}
                                 <div className="flex items-center px-2 py-1 text-[10px] text-slate-500 font-bold border-b border-slate-800">
                                    <div className="flex-1 text-left pl-2">{t('pipeline.wizard.configFile')}</div>
                                    <div className="w-6 text-center"></div>
                                    <div className="flex-1 text-left pl-2">{t('pipeline.wizard.mappingFile')}</div>
                                    <div className="w-12 text-center">{t('common.action')}</div>
                                 </div>

                                 <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                     {postPairs.map(pair => (
                                         <div 
                                             key={pair.id}
                                             className="flex items-center text-xs p-2 rounded hover:bg-slate-800 group border-b border-slate-800/50 last:border-0"
                                         >
                                             {/* Config File */}
                                             <div 
                                                className="flex-1 flex items-center gap-1.5 truncate cursor-pointer hover:text-emerald-400 group/item" 
                                                title={pair.config.name}
                                                onDoubleClick={() => handleOpenEditor([pair.config, pair.map])}
                                             >
                                                <FileCog size={12} className="text-slate-500 shrink-0 group-hover/item:text-emerald-400"/>
                                                <span className="truncate text-slate-300">{pair.config.name}</span>
                                             </div>

                                             {/* Link Icon */}
                                             <div className="w-6 flex justify-center text-slate-600">
                                                 <Link2 size={12} />
                                             </div>

                                             {/* Map File */}
                                             <div 
                                                className="flex-1 flex items-center gap-1.5 truncate cursor-pointer hover:text-emerald-400 group/item"
                                                title={pair.map.name}
                                                onDoubleClick={() => handleOpenEditor([pair.config, pair.map])}
                                             >
                                                <FileBraces size={12} className="text-slate-500 shrink-0 group-hover/item:text-emerald-400"/>
                                                <span className="truncate text-slate-300">{pair.map.name}</span>
                                             </div>

                                             {/* Actions */}
                                             <div className="w-12 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button 
                                                    onClick={() => handleOpenEditor([pair.config, pair.map])}
                                                    className="text-slate-400 hover:text-white"
                                                 >
                                                     <SquarePen size={12} />
                                                 </button>
                                                 <button 
                                                    onClick={() => setActiveDeleteId({type: 'PAIR_POST', id: pair.id, name: `${pair.config.name}, ${pair.map.name}`})}
                                                    className="text-slate-400 hover:text-rose-500"
                                                 >
                                                     <Trash2 size={12} />
                                                 </button>
                                             </div>
                                         </div>
                                     ))}
                                     
                                     {/* Add Button */}
                                     <button 
                                        onClick={() => handleAddPair('POST')}
                                        className="w-full mt-2 flex items-center gap-2 p-2 rounded hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors text-xs font-medium"
                                     >
                                        <CirclePlus size={14} />
                                        <span>{t('common.add')}</span>
                                     </button>
                                 </div>
                             </div>

                             {/* Column 5: Target DB (16%) */}
                             <div className="w-[16%] flex flex-col">
                                 <div className="bg-slate-800 text-xs font-bold text-emerald-400 text-center py-2 border-b border-slate-700">{t('pipeline.wizard.targetDB')}</div>
                                 <div className="p-4 space-y-4 flex-1">
                                    <div className="text-left flex items-start gap-2 mb-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1">
                                            <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${tDb?.type?.toLowerCase() || 'postgresql'}/${tDb?.type?.toLowerCase() || 'postgresql'}-original.svg`} className="w-full h-full object-contain"/>
                                        </div>
                                        <div className="font-bold text-slate-200 mt-2 text-sm">{tDb?.type || 'POSTGRESQL'}</div>
                                    </div>
                                    <div className="text-sm text-slate-300 text-left">
                                        <p className="font-bold text-base mb-1 truncate" title={tDb?.name}>{tDb?.name || 'GL_ANALYTICS'}</p>
                                        <p className="text-xs text-slate-500 font-mono truncate">({tDb?.ip || '172.16.5.4'})</p>
                                    </div>
                                    <div className="h-px bg-slate-700 w-full" />
                                    <div className="text-sm text-slate-300 text-left">
                                        <p className="font-bold mb-1 truncate" title={tAgent?.name}>{tAgent?.name || 'Agent-AWS-01'}</p>
                                        <p className="text-xs text-slate-500 font-mono truncate">({tAgent?.ip || '172.16.5.4'})</p>
                                    </div>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center text-sm text-slate-500">
                             Double-click any file above to open the Global Configuration Editor.
                         </div>
                     </div>
                 )}
             </div>
         );
      case 5:
         return (
             <div className="space-y-6 max-w-2xl mx-auto">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('pipeline.wizard.syncMode')}</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border-2 border-primary bg-blue-50 dark:bg-blue-900/20 cursor-pointer">
                            <span className="font-bold block text-primary">{t('pipeline.wizard.initialRealtime')}</span>
                            <span className="text-xs text-slate-500">{t('pipeline.wizard.initialRealtimeDesc')}</span>
                        </div>
                         <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 cursor-pointer">
                            <span className="font-bold block text-slate-700 dark:text-slate-200">{t('pipeline.wizard.realtimeOnly')}</span>
                            <span className="text-xs text-slate-500">{t('pipeline.wizard.realtimeOnlyDesc')}</span>
                        </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('pipeline.wizard.performance')}</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs block mb-1">{t('pipeline.wizard.threads')}</span>
                            <select className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none"><option>4</option><option>8</option></select>
                        </div>
                        <div>
                            <span className="text-xs block mb-1">{t('pipeline.wizard.batchSize')}</span>
                             <select className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none"><option>1000</option><option>5000</option></select>
                        </div>
                    </div>
                 </div>
             </div>
         );
      case 6:
          return (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{t('pipeline.wizard.readyTitle')}</h3>
                      <p className="text-slate-500">{t('pipeline.wizard.readyDesc')}</p>
                  </div>
                  
                  <div className="w-full max-w-md bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500">{t('pipeline.name')}</span>
                          <span className="font-bold">{pipelineName || 'Oracle_to_PG_Sales'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500">{t('pipeline.source')}</span>
                          <span className="font-bold">KR_SALES_DB</span>
                      </div>
                      <div className="flex justify-between py-2">
                          <span className="text-slate-500">{t('pipeline.target')}</span>
                          <span className="font-bold">GL_ANALYTICS</span>
                      </div>
                  </div>

                  <button 
                    onClick={() => {
                        setTestStatus('IDLE');
                        setTimeout(() => setTestStatus('SUCCESS'), 1500);
                    }}
                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors w-full max-w-xs flex items-center justify-center gap-2"
                  >
                     {testStatus === 'IDLE' && t('common.testConnection')} 
                     {testStatus === 'SUCCESS' && <><Check className="text-emerald-500" /> {t('pipeline.wizard.connectionVerified')}</>}
                  </button>
              </div>
          )
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-950 w-[70%] h-[85vh] rounded-[32px] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Wizard Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Edit Pipeline' : t('pipeline.wizard.title')}</h2>
            <p className="text-sm text-slate-500">{steps.find(s=>s.num===step)?.desc}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-slate-950">
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
                <button 
                    onClick={() => step < 6 ? setStep(step + 1) : handleWizardFinish()}
                    className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                    {step === 6 ? t('common.save') : t('common.next')} <ArrowRight size={18} />
                </button>
            </div>
        </div>

        {/* Global Delete Confirmation Dialog */}
        {activeDeleteId && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-96">
                    <div className="flex items-center gap-3 mb-4 text-rose-500">
                        <AlertTriangle size={24} />
                        <h3 className="text-lg font-bold">Delete Configuration?</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                        Are you sure you want to delete the following configuration?
                    </p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                        {activeDeleteId.name}
                    </p>
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => setActiveDeleteId(null)}
                            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-bold"
                        >
                            {t('common.cancel')}
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-lg text-sm bg-rose-500 text-white hover:bg-rose-600 font-bold"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default PipelineWizard;
