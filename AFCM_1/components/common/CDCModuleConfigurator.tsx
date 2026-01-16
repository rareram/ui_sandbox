
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Editor, { useMonaco } from "@monaco-editor/react";
import { 
  X, Search, Folder, FileText, Info, ShieldCheck, Save, 
  Upload, Download, Maximize, Minimize, ChevronRight, 
  ChevronDown, FileCog, FileBraces, Database, Globe, 
  Server, HardDrive, ListTree, MoreHorizontal
} from 'lucide-react';
import { ConfigFile } from '../../types';

// --- Data Constants ---

const CONFIG_TYPES = [
  { id: 'EXTRACT_CONF', label: 'Extract Config' },
  { id: 'EXTRACT_MAP', label: 'Extract Map' },
  { id: 'SEND_CONF', label: 'Send Config' },
  { id: 'POST_CONF', label: 'Post Config' },
  { id: 'POST_MAP', label: 'Post Map' },
  { id: 'DB_CONN', label: 'DB Conn' },
  { id: 'GLOBAL_CONF', label: 'Global Config' },
  { id: 'AGENT_CONF', label: 'Agent Config' },
];

const EXTRACT_CONFIG_TREE = [
  {
    name: "DB 연결",
    children: ["DB Connection"]
  },
  {
    name: "Writer Group",
    children: [
      "Writer", "Extraction target", "Tracing files", "fetch LOB", "Mapping", 
      "Truncate", "Write", "Remote Type", "Express Mode", "extract memory size", 
      "transaction temp (Extract)", "LOB", "extract undo data", "fetch", 
      "store Oracle Wallet info to file", "include def", "exclude dml type", 
      "ignore compress", "active to active", "convert data", "Extraction log", 
      "disk usage", "db check", "checkpoint file write", "long transaction", 
      "persistence", "ASM environment", "RDS", "ADG environment", "initial copy", 
      "multi capture", "object id filtering", "capture thread progress logging", 
      "read redo log type", "archive read priority", "database log priority", 
      "set block count", "Tracing file options", "Logging"
    ]
  },
  {
    name: "Performance",
    children: ["Workset", "Queue Size", "Process Memory", "Waiting Sleep", "Workset Sleep"]
  }
];

const EXTRACT_VARIABLES_RAW = `
카테고리: DB Connection
DBCONN | DBCONN="default"; | DBCONN설명 | true

카테고리: Writer 
TRACINGALIAS | TRACINGALIAS="ext01"; | TRACINGALIAS설명 | true
WRITE_TYPE | WRITE_TYPE="LOCAL"; | WRITE_TYPE설명 | false
WRITE_FORMAT | WRITE_FORMAT="TRC"; | WRITE_FORMAT설명 | false

카테고리: Extraction target
TABLE | TABLE="CDCTEST.*"; | TABLE설명 | true
SEQUENCE | SEQUENCE="CDCTEST.TEST_SEQ"; | SEQUENCE설명 | false
DDL | DDL="INCLUDE CDCTEST.*"; | DDL설명 | false

카테고리: Tracing files
TRACINGFILE_DEST | TRACINGFILE_DEST=""; | TRACINGFILE_DEST설명 | false
TRACINGFILE_SIZE | TRACINGFILE_SIZE="100MB"; | TRACINGFILE_SIZE설명 | false
TEMP_FILE_DEST | TEMP_FILE_DEST=""; | TEMP_FILE_DEST설명 | false
TEMP_FILE_SIZE | TEMP_FILE_SIZE="100MB"; | TEMP_FILE_SIZE설명 | false
TEMP_FILE_READ_OPTION | TEMP_FILE_READ_OPTION="DISK"; | TEMP_FILE_READ_OPTION설명 | false

카테고리: fetch LOB
FAILED_FETCH_LOB_TO_EMPTY | FAILED_FETCH_LOB_TO_EMPTY="YES"; | FAILED_FETCH_LOB_TO_EMPTY설명 | false

카테고리: Mapping
MAP | MAP=""; | MAP설명 | false

카테고리: Truncate
GET_TRUNCATE | GET_TRUNCATE="YES"; | GET_TRUNCATE설명 | false

카테고리: Write
WRITE_FLUSH_RECORD_COUNT | WRITE_FLUSH_RECORD_COUNT="1000"; | WRITE_FLUSH_RECORD_COUNT설명 | false
WRITE_FLUSH_BUFFER_SIZE | WRITE_FLUSH_BUFFER_SIZE="64KB"; | WRITE_FLUSH_BUFFER_SIZE설명 | false

카테고리: Remote Type
REMOTE_IP | REMOTE_IP=""; | REMOTE_IP설명 | false
REMOTE_PORT | REMOTE_PORT=""; | REMOTE_PORT설명 | false
TRANSMISSION_UNIT | TRANSMISSION_UNIT="1MB"; | TRANSMISSION_UNIT설명 | false
SECURITY | SECURITY="PLAIN"; | SECURITY설명 | false
TRANSFER_TIMEOUT | TRANSFER_TIMEOUT="10S"; | TRANSFER_TIMEOUT설명 | false

카테고리: Express Mode
EP_ENABLE | EP_ENABLE="NO"; | EP_ENABLE설명 | false
EP_TARGET_IP | EP_TARGET_IP=""; | EP_TARGET_IP설명 | false
EP_TARGET_PORT | EP_TARGET_PORT=""; | EP_TARGET_PORT설명 | false
EP_TRACING_GROUP | EP_TRACING_GROUP=""; | EP_TRACING_GROUP설명 | false

카테고리: extract memory size
IN_MEMORY_SIZE | IN_MEMORY_SIZE="0"; | IN_MEMORY_SIZE설명 | false

카테고리: transaction temp (Extract)
IN_MEMORY_TX_SIZE | IN_MEMORY_TX_SIZE="1GB"; | IN_MEMORY_TX_SIZE설명 | false
LARGE_TRANSACTION_SIZE | LARGE_TRANSACTION_SIZE="128MB"; | LARGE_TRANSACTION_SIZE설명 | false

카테고리: LOB
CONVERT_LOB_TO_CHAR | CONVERT_LOB_TO_CHAR=""; | CONVERT_LOB_TO_CHAR설명 | false
LOB_TO_NULL | LOB_TO_NULL=""; | LOB_TO_NULL설명 | false

카테고리: extract undo data
UNDO_DATA | UNDO_DATA="KEY"; | UNDO_DATA설명 | false

카테고리: fetch
USE_FLASHBACK_ON_FETCH | USE_FLASHBACK_ON_FETCH="0"; | USE_FLASHBACK_ON_FETCH설명 | false
FETCH_NOSUP_KEY_DATA | FETCH_NOSUP_KEY_DATA="yes"; | FETCH_NOSUP_KEY_DATA설명 | false
USE_KEY_DATA_ON_FETCH | USE_KEY_DATA_ON_FETCH=""; | USE_KEY_DATA_ON_FETCH설명 | false
h_SKIP_NOSUP_UPDATE | h_SKIP_NOSUP_UPDATE="no"; | h_SKIP_NOSUP_UPDATE설명 | false

카테고리: store Oracle Wallet info to file
ARK_TDE_FILENAME | ARK_TDE_FILENAME=""; | ARK_TDE_FILENAME설명 | false

카테고리: include def
INCLUDING_DEFINITION | INCLUDING_DEFINITION="NONE"; | INCLUDING_DEFINITION설명 | false

카테고리: exclude dml type
EXCLUDE_DML_TYPE | EXCLUDE_DML_TYPE="NONE"; | EXCLUDE_DML_TYPE설명 | false

카테고리: ignore compress
IGNORE_CAPTURE_COMPRESS | IGNORE_CAPTURE_COMPRESS="yes"; | IGNORE_CAPTURE_COMPRESS설명 | false

카테고리: active to active
EXCLUDE_TAG | EXCLUDE_TAG=""; | EXCLUDE_TAG설명 | false
EXCLUDE_TRANSACTION_NAME | EXCLUDE_TRANSACTION_NAME=""; | EXCLUDE_TRANSACTION_NAME설명 | false
EXCLUDE_USER_NAME | EXCLUDE_USER_NAME=""; | EXCLUDE_USER_NAME설명 | false
EXCLUDE_LOGIN_USER_ID | EXCLUDE_LOGIN_USER_ID=""; | EXCLUDE_LOGIN_USER_ID설명 | false

카테고리: convert data
CONVERT_TO_UTF8 | CONVERT_TO_UTF8="YES"; | CONVERT_TO_UTF8설명 | false
FAILED_CONVERT_TO_UTF8 | FAILED_CONVERT_TO_UTF8="STOP"; | FAILED_CONVERT_TO_UTF8설명 | false
FAILED_CONVERT_TO_CHAR | FAILED_CONVERT_TO_CHAR=""; | FAILED_CONVERT_TO_CHAR설명 | false

카테고리: Extraction log
ARCHIVE_ONLY | ARCHIVE_ONLY="no"; | ARCHIVE_ONLY설명 | false
ARCHIVE_DEST | ARCHIVE_DEST=""; | ARCHIVE_DEST설명 | false

카테고리: disk usage
DISK_USAGE_CAPACITY | DISK_USAGE_CAPACITY="95"; | DISK_USAGE_CAPACITY설명 | false

카테고리: db check
DB_STATUS_CHECK_INTERVAL | DB_STATUS_CHECK_INTERVAL="60S"; | DB_STATUS_CHECK_INTERVAL설명 | false
DB_KEEP_ALIVE_INTERVAL | DB_KEEP_ALIVE_INTERVAL="0"; | DB_KEEP_ALIVE_INTERVAL설명 | false

카테고리: checkpoint file write
CHECKPOINT_SECONDS | CHECKPOINT_SECONDS="10"; | CHECKPOINT_SECONDS설명 | false

카테고리: long transaction
LONG_TRANSACTION_CHECK_INTERVAL | LONG_TRANSACTION_CHECK_INTERVAL="0"; | LONG_TRANSACTION_CHECK_INTERVAL설명 | false
LONG_TRANSACTION_TIMEOUT | LONG_TRANSACTION_TIMEOUT="0"; | LONG_TRANSACTION_TIMEOUT설명 | false
LONG_TRANSACTION_REMOVE | LONG_TRANSACTION_REMOVE="NO"; | LONG_TRANSACTION_REMOVE설명 | false

카테고리: persistence
PERSISTENCE_MODE | PERSISTENCE_MODE="LOGSWITCH"; | PERSISTENCE_MODE설명 | false
PERSISTENCE_INTERVAL | PERSISTENCE_INTERVAL="6H"; | PERSISTENCE_INTERVAL설명 | false

카테고리: ASM environment
ASM_MODE | ASM_MODE="LOCAL"; | ASM_MODE설명 | false
ASM_CONN | ASM_CONN=""; | ASM_CONN설명 | false
ASM_HOME | ASM_HOME=""; | ASM_HOME설명 | false
ASM_SID | ASM_SID=""; | ASM_SID설명 | false

카테고리: RDS
RDS_MODE | RDS_MODE="NO"; | RDS_MODE설명 | false
NONE_DDL_TRIGGER_MODE | NONE_DDL_TRIGGER_MODE="NO"; | NONE_DDL_TRIGGER_MODE설명 | false
READER_TYPE | READER_TYPE="AUTO"; | READER_TYPE설명 | false
DIR_ONLINE_LOG_PATH | DIR_ONLINE_LOG_PATH=""; | DIR_ONLINE_LOG_PATH설명 | false
DIR_ARCHIVE_LOG_PATH | DIR_ARCHIVE_LOG_PATH=""; | DIR_ARCHIVE_LOG_PATH설명 | false

카테고리: ADG environment
WRITER_CONN | WRITER_CONN=""; | WRITER_CONN설명 | false

카테고리: initial copy
INITIAL_COPY_THREADS | INITIAL_COPY_THREADS="4"; | INITIAL_COPY_THREADS설명 | false
INITIAL_COPY_SPLIT_TRANSACTION | INITIAL_COPY_SPLIT_TRANSACTION="100000"; | INITIAL_COPY_SPLIT_TRANSACTION설명 | false
INITIAL_COPY_SPLIT_SIZE | INITIAL_COPY_SPLIT_SIZE=""; | INITIAL_COPY_SPLIT_SIZE설명 | false
INITIAL_COPY_PARALLELISM_DEGREE | INITIAL_COPY_PARALLELISM_DEGREE="4"; | INITIAL_COPY_PARALLELISM_DEGREE설명 | false
INITIAL_COPY_SCN_ASCENDING | INITIAL_COPY_SCN_ASCENDING="ON"; | INITIAL_COPY_SCN_ASCENDING설명 | false
INITIAL_COPY_CAST_TO_RAW | INITIAL_COPY_CAST_TO_RAW="NO"; | INITIAL_COPY_CAST_TO_RAW설명 | false
INITIAL_COPY_GET_TOTAL_ROW | INITIAL_COPY_GET_TOTAL_ROW="NO"; | INITIAL_COPY_GET_TOTAL_ROW설명 | false

카테고리: multi capture
MAIN_CAPTURE_THREAD | MAIN_CAPTURE_THREAD="2"; | MAIN_CAPTURE_THREAD설명 | false

카테고리: object id filtering
PREFILTER_IN_CAPTURE | PREFILTER_IN_CAPTURE="YES"; | PREFILTER_IN_CAPTURE설명 | false

카테고리: capture thread progress logging
CAPTURE_PROGRESS_LOGGING | CAPTURE_PROGRESS_LOGGING="60S"; | CAPTURE_PROGRESS_LOGGING설명 | false

카테고리: read redo log type
READ_REDO_TYPE | READ_REDO_TYPE="ALL"; | READ_REDO_TYPE설명 | false

카테고리: archive read priority
ARCHIVE_READ_PRIORITY | ARCHIVE_READ_PRIORITY="FILESYSTEM"; | ARCHIVE_READ_PRIORITY설명 | false

카테고리: database log priority
DB_LOG_PRIORITY | DB_LOG_PRIORITY="ONLINE"; | DB_LOG_PRIORITY설명 | false

카테고리: set block count
READ_REDOBLOCK_COUNT | READ_REDOBLOCK_COUNT="63"; | READ_REDOBLOCK_COUNT설명 | false

카테고리: Tracing file options
TRACING_WRITE_CHECK | TRACING_WRITE_CHECK="NO"; | TRACING_WRITE_CHECK설명 | false
TRACING_WRITE_RETRY_COUNT | TRACING_WRITE_RETRY_COUNT="3"; | TRACING_WRITE_RETRY_COUNT설명 | false
TRACING_SYNC | TRACING_SYNC="NO"; | TRACING_SYNC설명 | false
TRACING_SYNC_RETRY_COUNT | TRACING_SYNC_RETRY_COUNT="3"; | TRACING_SYNC_RETRY_COUNT설명 | false
TRACING_CALL_TRACE | TRACING_CALL_TRACE="NO"; | TRACING_CALL_TRACE설명 | false

카테고리: Logging
LOG_LEVEL | LOG_LEVEL="info"; | LOG_LEVEL설명 | false
LOG_BACKUP | LOG_BACKUP="all"; | LOG_BACKUP설명 | false

카테고리: Workset
WORKSET_BOUNDARY_SIZE | WORKSET_BOUNDARY_SIZE=""; | WORKSET_BOUNDARY_SIZE설명 | false
WORKSET_BOUNDARY_COUNT | WORKSET_BOUNDARY_COUNT=""; | WORKSET_BOUNDARY_COUNT설명 | false
CACHING_BOUNDARY_SIZE | CACHING_BOUNDARY_SIZE=""; | CACHING_BOUNDARY_SIZE설명 | false
CACHING_BOUNDARY_COUNT | CACHING_BOUNDARY_COUNT=""; | CACHING_BOUNDARY_COUNT설명 | false
MAX_BLOCK_READ | MAX_BLOCK_READ=""; | MAX_BLOCK_READ설명 | false

카테고리: Queue Size
CAP_TO_AN_QUEUE_SIZE_MIN | CAP_TO_AN_QUEUE_SIZE_MIN=""; | CAP_TO_AN_QUEUE_SIZE_MIN설명 | false
CAP_TO_AN_QUEUE_SIZE_MAX | CAP_TO_AN_QUEUE_SIZE_MAX=""; | CAP_TO_AN_QUEUE_SIZE_MAX설명 | false
AN_TO_HD_QUEUE_SIZE_MIN | AN_TO_HD_QUEUE_SIZE_MIN=""; | AN_TO_HD_QUEUE_SIZE_MIN설명 | false
AN_TO_HD_QUEUE_SIZE_MAX | AN_TO_HD_QUEUE_SIZE_MAX=""; | AN_TO_HD_QUEUE_SIZE_MAX설명 | false
HD_TO_MGR_QUEUE_SIZE_MIN | HD_TO_MGR_QUEUE_SIZE_MIN=""; | HD_TO_MGR_QUEUE_SIZE_MIN설명 | false
HD_TO_MGR_QUEUE_SIZE_MAX | HD_TO_MGR_QUEUE_SIZE_MAX=""; | HD_TO_MGR_QUEUE_SIZE_MAX설명 | false
HD_TO_WR_QUEUE_SIZE_MIN | HD_TO_WR_QUEUE_SIZE_MIN=""; | HD_TO_WR_QUEUE_SIZE_MIN설명 | false
HD_TO_WR_QUEUE_SIZE_MAX | HD_TO_WR_QUEUE_SIZE_MAX=""; | HD_TO_WR_QUEUE_SIZE_MAX설명 | false
AN_TO_TMP_QUEUE_SIZE_MIN | AN_TO_TMP_QUEUE_SIZE_MIN=""; | AN_TO_TMP_QUEUE_SIZE_MIN설명 | false
AN_TO_TMP_QUEUE_SIZE_MAX | AN_TO_TMP_QUEUE_SIZE_MAX=""; | AN_TO_TMP_QUEUE_SIZE_MAX설명 | false
TMP_TO_TW_QUEUE_SIZE_MIN | TMP_TO_TW_QUEUE_SIZE_MIN=""; | TMP_TO_TW_QUEUE_SIZE_MIN설명 | false
TMP_TO_TW_QUEUE_SIZE_MAX | TMP_TO_TW_QUEUE_SIZE_MAX=""; | TMP_TO_TW_QUEUE_SIZE_MAX설명 | false

카테고리: Process Memory
CHECK_ALLOC_SIZE_INTERVAL | CHECK_ALLOC_SIZE_INTERVAL=""; | CHECK_ALLOC_SIZE_INTERVAL설명 | false

카테고리: Waiting Sleep
CAP_SLEEP_ON_WAITING | CAP_SLEEP_ON_WAITING=""; | CAP_SLEEP_ON_WAITING설명 | false
CAP_SLEEP_ON_LOG_WAITING | CAP_SLEEP_ON_LOG_WAITING=""; | CAP_SLEEP_ON_LOG_WAITING설명 | false
CAP_LOG_WAITING_COUNT | CAP_LOG_WAITING_COUNT=""; | CAP_LOG_WAITING_COUNT설명 | false
AN_SLEEP_ON_WAITING | AN_SLEEP_ON_WAITING=""; | AN_SLEEP_ON_WAITING설명 | false
HD_SLEEP_ON_WAITING | HD_SLEEP_ON_WAITING=""; | HD_SLEEP_ON_WAITING설명 | false
WR_SLEEP_ON_WAITING | WR_SLEEP_ON_WAITING=""; | WR_SLEEP_ON_WAITING설명 | false
MGR_SLEEP_ON_WAITING | MGR_SLEEP_ON_WAITING=""; | MGR_SLEEP_ON_WAITING설명 | false

카테고리: Workset Sleep
CAP_SLEEP_PER_WORKSET | CAP_SLEEP_PER_WORKSET=""; | CAP_SLEEP_PER_WORKSET설명 | false
AN_SLEEP_PER_WORKSET | AN_SLEEP_PER_WORKSET=""; | AN_SLEEP_PER_WORKSET설명 | false
WR_SLEEP_PER_WORKSET | WR_SLEEP_PER_WORKSET=""; | WR_SLEEP_PER_WORKSET설명 | false
TMP_SLEEP_PER_WORKSET | TMP_SLEEP_PER_WORKSET=""; | TMP_SLEEP_PER_WORKSET설명 | false
TW_SLEEP_PER_WORKSET | TW_SLEEP_PER_WORKSET=""; | TW_SLEEP_PER_WORKSET설명 | false
`;

// --- Types ---

interface Variable {
  name: string;
  defaultValue: string;
  description: string;
  category: string;
  required: boolean;
}

interface ConfigEditorProps {
  isOpen: boolean;
  onClose: () => void;
  files: ConfigFile[];
  onSave: (updatedFiles: ConfigFile[]) => void;
}

// --- Helper Parser ---

const parseVariables = (raw: string): Variable[] => {
  const lines = raw.trim().split('\n');
  const vars: Variable[] = [];
  let currentCategory = '';

  lines.forEach(line => {
    if (line.startsWith('카테고리:')) {
      currentCategory = line.replace('카테고리:', '').trim();
    } else if (line.includes('|')) {
      const [name, defaultValue, description, required] = line.split('|').map(s => s.trim());
      vars.push({
        name,
        defaultValue,
        description,
        category: currentCategory,
        required: required === 'true'
      });
    }
  });
  return vars;
};

// --- Sub-components ---

const UsagePopup = ({ variable, onClose }: { variable: Variable, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary rounded-lg text-white"><Info size={20}/></div>
             <h3 className="text-lg font-black text-white uppercase tracking-tight">환경 변수 사용법</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[70vh] space-y-6 text-slate-300">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">카테고리</label>
              <p className="text-sm font-bold text-white">{variable.category}</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">개요</label>
              <p className="text-sm">{variable.description}</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">문법</label>
              <code className="block bg-black/40 p-3 rounded-xl border border-slate-800 text-primary font-mono text-xs">{variable.name}=값;</code>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">설명</label>
              <p className="text-sm leading-relaxed">{variable.name} 변수는 {variable.category} 그룹에 속하며, 시스템의 특정 동작 방식을 정의합니다. 기본값은 '{variable.defaultValue}' 입니다.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">사용 예시</label>
              <code className="block bg-black/40 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs">{variable.defaultValue}</code>
            </div>
        </div>
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-right">
          <button onClick={onClose} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all">닫기</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const CDCModuleConfigurator: React.FC<ConfigEditorProps> = ({ isOpen, onClose, files, onSave }) => {
  const [activeConfigType, setActiveConfigType] = useState('EXTRACT_CONF');
  const [categorySearch, setCategorySearch] = useState('');
  const [variableSearch, setVariableSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["DB 연결", "Writer Group"]));
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<ConfigFile[]>([]);
  const [usagePopupVar, setUsagePopupVar] = useState<Variable | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const monaco = useMonaco();

  const allVariables = useMemo(() => parseVariables(EXTRACT_VARIABLES_RAW), []);

  useEffect(() => {
    if (isOpen) {
      setLocalFiles(JSON.parse(JSON.stringify(files)));
      if (files.length > 0) setActiveFileId(files[0].id);
    }
  }, [isOpen, files]);

  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.layout();
    }
  }, [isFullScreen, isOpen, activeFileId]);

  if (!isOpen) return null;

  const activeFile = localFiles.find(f => f.id === activeFileId);

  const handleEditorChange = (val: string | undefined) => {
    if (!activeFileId) return;
    setLocalFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: val || '' } : f));
  };

  const handleVariableDoubleClick = (variable: Variable) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    const content = model.getValue();
    
    // Check if variable name exists
    const regex = new RegExp(`^${variable.name}\\s*=`, 'm');
    const match = regex.exec(content);

    if (match) {
        // Find line number
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        
        // Highlight line
        editor.revealLineInCenter(lineNumber);
        editor.setPosition({ lineNumber, column: 1 });
        editor.focus();
        
        // Visual cue: temporary selection or decoration could be added here
        editor.setSelection({
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: model.getLineMaxColumn(lineNumber)
        });
    } else {
        // Append to end
        const lastLineNumber = model.getLineCount();
        const lastColumn = model.getLineMaxColumn(lastLineNumber);
        const textToInsert = `\n${variable.defaultValue}`;
        
        editor.executeEdits('sidebar', [{
            range: new monaco!.Range(lastLineNumber, lastColumn, lastLineNumber, lastColumn),
            text: textToInsert,
            forceMoveMarkers: true
        }]);
        
        editor.setPosition({ lineNumber: lastLineNumber + 1, column: 1 });
        editor.revealLine(lastLineNumber + 1);
        editor.focus();
    }
  };

  const filteredCategories = EXTRACT_CONFIG_TREE.filter(group => 
    group.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    group.children.some(child => child.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  const displayedVariables = allVariables.filter(v => {
    if (variableSearch) {
        return v.name.toLowerCase().includes(variableSearch.toLowerCase());
    }
    return selectedCategory ? v.category === selectedCategory : true;
  });

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
  };

  const toggleGroup = (name: string) => {
    const next = new Set(expandedGroups);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedGroups(next);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleUpload = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFileId) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleEditorChange(ev.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 ${isFullScreen ? 'p-0' : ''}`}>
      <div className={`bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isFullScreen ? 'w-full h-full rounded-none' : 'w-[90%] h-[90%] rounded-[32px]'}`}>
        
        {/* Header Section */}
        <div className="h-16 shrink-0 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-xl text-primary"><FileCog size={24}/></div>
                <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">CDC Module Configurator</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Configuration Interface</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT SECTION (30%) */}
            <div className="w-[30%] border-r border-slate-800 flex flex-col bg-slate-900/30">
                {/* File Selector Dropdown */}
                <div className="p-4 border-b border-slate-800">
                    <select 
                        value={activeConfigType}
                        onChange={e => setActiveConfigType(e.target.value)}
                        className="w-full bg-slate-800 text-white font-bold text-sm p-3 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                    >
                        {CONFIG_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Category Tree (Col 1) */}
                    <div className="w-1/2 border-r border-slate-800 flex flex-col">
                        <div className="p-3 border-b border-slate-800 bg-slate-900/50">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
                                <input 
                                    className="w-full pl-8 pr-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary text-slate-300"
                                    placeholder="카테고리 검색..."
                                    value={categorySearch}
                                    onChange={e => setCategorySearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            {filteredCategories.map(group => (
                                <div key={group.name} className="mb-1">
                                    <button 
                                        onClick={() => toggleGroup(group.name)}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-left"
                                    >
                                        <div className="text-slate-500">
                                            {expandedGroups.has(group.name) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                        </div>
                                        <Folder size={14} className="text-amber-500 shrink-0"/>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter truncate">{group.name}</span>
                                    </button>
                                    {expandedGroups.has(group.name) && (
                                        <div className="ml-4 pl-2 border-l border-slate-800 space-y-1 mt-1">
                                            {group.children.map(child => (
                                                <button 
                                                    key={child}
                                                    onDoubleClick={() => handleCategoryClick(child)}
                                                    onClick={() => setSelectedCategory(child)}
                                                    className={`w-full flex items-center gap-2 p-1.5 rounded-md transition-colors text-left ${selectedCategory === child ? 'bg-primary/20 text-primary' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    <FileText size={12} className="shrink-0 opacity-70"/>
                                                    <span className="text-[11px] font-bold truncate leading-tight">{child}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Variable List (Col 2) */}
                    <div className="w-1/2 flex flex-col">
                         <div className="p-3 border-b border-slate-800 bg-slate-900/50">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
                                <input 
                                    className="w-full pl-8 pr-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary text-slate-300"
                                    placeholder="변수명 검색..."
                                    value={variableSearch}
                                    onChange={e => setVariableSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {displayedVariables.map(v => (
                                <div 
                                    key={v.name}
                                    onDoubleClick={() => handleVariableDoubleClick(v)}
                                    className="px-3 py-2 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1 overflow-hidden">
                                            <span className={`text-[11px] font-mono font-bold truncate ${v.required ? 'text-white' : 'text-slate-400'}`}>
                                                {v.name}
                                                {v.required && <span className="text-blue-500 ml-0.5">*</span>}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100">
                                            <div 
                                                className="p-1 hover:text-primary transition-colors cursor-help"
                                                title={v.description}
                                                onClick={(e) => { e.stopPropagation(); setUsagePopupVar(v); }}
                                            >
                                                <Info size={12}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {displayedVariables.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                                    <ListTree size={24} className="text-slate-800 mb-2"/>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No variables found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION (70%) */}
            <div className="flex-1 flex flex-col bg-slate-900 relative">
                {/* Editor Tabs & Actions */}
                <div className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center h-full overflow-x-auto no-scrollbar pt-2 gap-1">
                        {localFiles.map(file => (
                            <button 
                                key={file.id}
                                onClick={() => setActiveFileId(file.id)}
                                className={`px-4 py-2 text-[11px] font-black uppercase tracking-tight rounded-t-xl transition-all border-x border-t ${activeFileId === file.id ? 'bg-slate-900 border-slate-800 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {file.name.endsWith('.map') || file.name.endsWith('.json') ? <FileBraces size={12}/> : <FileCog size={12}/>}
                                    {file.name}
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition-all" title="Validate Syntax">
                            <ShieldCheck size={18}/>
                        </button>
                        <button 
                            onClick={() => setShowSaveConfirm(true)}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 transition-all" 
                            title="Save All"
                        >
                            <Save size={18}/>
                        </button>
                        <div className="w-px h-4 bg-slate-800 mx-1"/>
                        <button onClick={handleUpload} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all" title="Upload File">
                            <Upload size={18}/>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange}/>
                        </button>
                        <button onClick={handleDownload} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all" title="Download File">
                            <Download size={18}/>
                        </button>
                        <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">
                            {isFullScreen ? <Minimize size={18}/> : <Maximize size={18}/>}
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 bg-[#1e1e1e]">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={activeFile?.name.endsWith('.map') || activeFile?.name.endsWith('.json') ? 'json' : 'ini'}
                        value={activeFile?.content || ''}
                        onMount={editor => { editorRef.current = editor; }}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            automaticLayout: true,
                            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                            scrollBeyondLastLine: false,
                            padding: { top: 10 }
                        }}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Usage Instruction Popup */}
      {usagePopupVar && (
          <UsagePopup 
            variable={usagePopupVar} 
            onClose={() => setUsagePopupVar(null)} 
          />
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
          <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                      <Save size={32}/>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Save Configuration</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">변경된 모든 설정 내용을 저장하시겠습니까?<br/>저장 전 파일 이름과 내용을 다시 확인하세요.</p>
                  <div className="flex gap-4">
                      <button onClick={() => setShowSaveConfirm(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-800 rounded-xl transition-colors">취소</button>
                      <button onClick={() => { onSave(localFiles); setShowSaveConfirm(false); onClose(); }} className="flex-1 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">확인</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CDCModuleConfigurator;
