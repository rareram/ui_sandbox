
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Check, Activity, Save, Server, Database, Globe, 
  Network, User, Key, FileText, Search, ChevronDown
} from 'lucide-react';
import { DbType } from '../../types';
import { MOCK_AGENTS } from '../../constants';

// 폼 데이터를 위한 인터페이스 확장
export interface EndpointFormData {
    id?: string;
    name: string;
    description: string;
    role: 'Source' | 'Target' | 'Both';
    agentId: string; // 추가된 필드
    type: DbType | string;
    dbName: string;
    ip: string;
    port: string;
    user: string;
    password?: string;
}

interface EndpointWizardProps {
  onClose: () => void;
  onSave: (data: EndpointFormData) => void;
  initialData?: EndpointFormData;
}

// 에이전트 선택을 위한 커스텀 검색 가능 셀렉트 컴포넌트
const SearchableAgentSelect = ({ value, onChange, label }: { value: string, onChange: (id: string) => void, label: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 에이전트 목록 옵션 생성
    const options = MOCK_AGENTS.map(agent => ({
        value: agent.id,
        label: agent.name,
        displayText: `${agent.name} (${agent.role}, ${agent.ip})`
    }));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter(opt => 
        opt.displayText.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {label} <span className="text-rose-500">*</span>
            </label>
            <div 
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-primary transition-all shadow-sm group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Server size={16} className="text-blue-500 shrink-0" />
                    <span className={`truncate text-sm ${value ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-400'}`}>
                        {selectedOption ? selectedOption.displayText : "에이전트를 선택하세요..."}
                    </span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-64 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                            <Search size={14} className="text-slate-400" />
                            <input 
                                className="w-full bg-transparent text-sm outline-none border-none p-0 focus:ring-0" 
                                placeholder="에이전트 명 또는 IP 검색..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                        {filtered.map((opt) => (
                            <div 
                                key={opt.value}
                                className={`p-3 rounded-xl text-sm cursor-pointer transition-colors mb-1 ${
                                    value === opt.value 
                                    ? 'bg-primary/10 text-primary font-bold border border-primary/20' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                            >
                                {opt.displayText}
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="p-6 text-center text-xs text-slate-500 italic">검색 결과가 없습니다.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const EndpointWizard: React.FC<EndpointWizardProps> = ({ onClose, onSave, initialData }) => {
  const { t } = useTranslation();
  const [connectionStatus, setConnectionStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'FAIL'>('IDLE');

  // Form State
  const [formData, setFormData] = useState<EndpointFormData>({
    name: '',
    description: '',
    role: 'Source',
    agentId: '', 
    type: 'ORACLE',
    dbName: '',
    ip: '',
    port: '',
    user: '',
    password: '',
    ...initialData
  });

  const handleChange = (field: keyof EndpointFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (connectionStatus !== 'IDLE') setConnectionStatus('IDLE'); 
  };

  const handleTestConnection = () => {
    if (!formData.ip || !formData.port || !formData.user || !formData.password || !formData.agentId) {
        alert("에이전트 및 DB 접속 정보를 모두 입력해야 테스트가 가능합니다.");
        return;
    }
    setConnectionStatus('TESTING');
    
    // 시뮬레이션 연결 테스트
    setTimeout(() => {
        setConnectionStatus('SUCCESS');
    }, 1500);
  };

  const handleSave = () => {
      if (!formData.name || !formData.dbName || !formData.ip || !formData.agentId) {
          alert("필수 항목(*)을 모두 입력해 주세요.");
          return;
      }
      onSave(formData);
  };

  const dbOptions = ['ORACLE', 'POSTGRESQL', 'MYSQL', 'MARIADB', 'MSSQL', 'TIBERO'];
  const roleOptions = ['Source', 'Target', 'Both'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* 너비 60% 설정 */}
      <div className="bg-white dark:bg-slate-950 w-[60%] max-h-[92vh] rounded-[40px] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 z-20">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                {initialData ? 'Edit Endpoint' : 'Create Endpoint'}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">파이프라인의 Source와 Target으로 사용할 Endpoint를 설정합니다.</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white dark:bg-slate-950">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6 max-w-5xl mx-auto">
                
                {/* 1. Basic Info Section */}
                <div className="col-span-2 flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                        <FileText size={18} />
                    </div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">기본 정보</h3>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Endpoint Name <span className="text-rose-500">*</span></label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                        placeholder="엔드포인트 명을 입력하세요"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Role <span className="text-rose-500">*</span></label>
                    <div className="relative">
                        <select 
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer font-bold"
                            value={formData.role}
                            onChange={(e) => handleChange('role', e.target.value as any)}
                        >
                            {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Endpoint 설명</label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                        placeholder="설명을 입력하세요"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                </div>

                {/* 2. Agent Selection Section */}
                <div className="col-span-2 flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800 mt-6 mb-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                        <Server size={18} />
                    </div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">에이전트 설정</h3>
                </div>

                <div className="col-span-2">
                    <SearchableAgentSelect 
                        label="대상 Agent"
                        value={formData.agentId}
                        onChange={(val: string) => handleChange('agentId', val)}
                    />
                </div>

                {/* 3. Database Connection Section */}
                <div className="col-span-2 flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800 mt-6 mb-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                        <Database size={18} />
                    </div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">데이터베이스 접속 정보</h3>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Database Type <span className="text-rose-500">*</span></label>
                    <div className="relative">
                        <select 
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer font-bold"
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                        >
                            {dbOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">DB Name (SID/Service) <span className="text-rose-500">*</span></label>
                    <input 
                        type="text" 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none transition-all font-mono" 
                        placeholder="e.g., ORCL"
                        value={formData.dbName}
                        onChange={(e) => handleChange('dbName', e.target.value)}
                    />
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">DB IP Address <span className="text-rose-500">*</span></label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none font-mono" 
                            placeholder="192.168.1.100"
                            value={formData.ip}
                            onChange={(e) => handleChange('ip', e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">DB Port <span className="text-rose-500">*</span></label>
                    <div className="relative">
                        <Network className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none font-mono" 
                            placeholder={formData.type === 'ORACLE' ? '1521' : '5432'}
                            value={formData.port}
                            onChange={(e) => handleChange('port', e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">DB User <span className="text-rose-500">*</span></label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="db_user"
                            value={formData.user}
                            onChange={(e) => handleChange('user', e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">DB Password <span className="text-rose-500">*</span></label>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
             <div className="flex items-center gap-4">
                 <button 
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'TESTING'}
                    className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-sm ${
                        connectionStatus === 'SUCCESS' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 active:scale-95'
                    }`}
                >
                    {connectionStatus === 'TESTING' ? (
                        <Activity size={18} className="animate-spin" />
                    ) : connectionStatus === 'SUCCESS' ? (
                        <Check size={18} />
                    ) : (
                        <Activity size={18} />
                    )}
                    {connectionStatus === 'TESTING' ? '연결 테스트 중...' : 
                     connectionStatus === 'SUCCESS' ? '연결 성공' : '연결 테스트'}
                </button>
             </div>

             <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button 
                    onClick={handleSave}
                    disabled={connectionStatus === 'TESTING'}
                    className="px-12 py-3.5 rounded-2xl font-black text-white bg-primary hover:bg-primary-hover shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                    {t('common.save')} <Save size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EndpointWizard;
