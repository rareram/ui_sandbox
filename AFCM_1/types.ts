
export enum PipelineStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  WARNING = 'WARNING'
}

export enum DbType {
  ORACLE = 'ORACLE',
  POSTGRESQL = 'POSTGRESQL',
  MYSQL = 'MYSQL',
  TIBERO = 'TIBERO',
  MSSQL = 'MSSQL',
  MARIADB = 'MARIADB'
}

export enum AgentStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED'
}

export enum AgentRole {
  SOURCE = 'SOURCE',
  TARGET = 'TARGET',
  BOTH = 'BOTH',
  RELAY = 'RELAY'
}

export enum TaskTypeEnum {
  REPLICATE = 'REPLICATE',
  COMPARE = 'COMPARE'
}

export enum TaskScheduleEnum {
  ADHOC = 'ADHOC',
  SCHEDULED = 'SCHEDULED',
  REALTIME = 'REALTIME'
}

// --- Configuration Types ---
export type FileCategory = 'EXTRACT' | 'SEND' | 'POST' | 'AGENT' | 'GLOBAL';

export interface ConfigFile {
  id: string;
  name: string;
  content: string;
  category?: FileCategory;
  isNew?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  ip: string;
  port: number;
  protocol: 'HTTP' | 'HTTPS';
  version: string;
  osType: string;
  status: AgentStatus;
  pipelineCount: number;
  registeredAt: string;
  user: string;
  updatedAt: string;
  updatedBy: string;
}

export interface DbConnection {
  id: string;
  name: string;
  type: DbType;
  ip: string;
  port: number;
  user: string;
  status: AgentStatus;
  pipelineCount: number;
  registeredAt: string;
  registeredBy: string;
}

export interface PipelineModuleConfig {
  id: string;
  name: string;
  content: string;
  hasMap?: boolean;
  mapContent?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: PipelineStatus;
  source: {
    connectionId: string;
    agentName: string;
    agentIp: string;
    dbName: string;
    dbType: DbType;
    ip: string;
    user: string;
    configContent: string;
    agentConfigContent: string;
    globalConfigContent: string;
  };
  target: {
    connectionId: string;
    agentName: string;
    agentIp: string;
    dbName: string;
    dbType: DbType;
    ip: string;
    user: string;
    configContent: string;
    agentConfigContent: string;
    globalConfigContent: string;
  };
  topology: {
    extract: PipelineModuleConfig[];
    send: PipelineModuleConfig[];
    post: PipelineModuleConfig[];
  };
  metrics: {
    epsExtract: number;
    epsPost: number;
    bpsSend: number;
    lagExtract: number;
    lagSend: number;
    lagApply: number;
    flowHistory: { time: string; eps: number }[];
  };
  updatedAt: string;
  updatedBy: string;
}

// --- Refactored Task Management Types ---

export type TaskCategory = 'DATA_OPERATION' | 'AUTOMATION';

export type TaskType = 
  | 'CDC_PIPELINE' 
  | 'INITIAL_LOAD' 
  | 'VERIFICATION' 
  | 'CORRECTION' 
  | 'DB_REPLICATE' 
  | 'REPORT_GEN' 
  | 'MONITORING_CHECK';

export type ScheduleType = 
  | 'REALTIME' 
  | 'REPEAT' 
  | 'SCHEDULED' 
  | 'EVENT_TRIGGER' 
  | 'ON_DEMAND';

export type TaskStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR' | 'COMPLETED';

// Task Detail Definitions for Strict Typing
export interface CdcPipelineDetails {
  pipelineId: string;
  operationMode: 'START' | 'STOP' | 'RESTART' | 'PAUSE';
  isForceRestart: boolean;
  isDebugMode: boolean;
}

export interface InitialLoadDetails {
  sourceDbId: string;
  targetDbId: string;
  tablePattern: string;
  parallelThreads: number;
  commitInterval: number;
  enableAutoResume: boolean;
}

export interface VerificationDetails {
  sourceDbId: string;
  targetDbId: string;
  scope: 'ALL' | 'PATTERN';
  pattern?: string;
  method: 'ROW_COUNT' | 'FULL_COMPARE';
  errorThreshold: number;
}

export interface CorrectionDetails {
  reportId?: string;
  targetDbId: string;
  strategy: 'OVERWRITE' | 'MERGE';
  isDryRun: boolean;
}

export interface ReportGenDetails {
  template: string;
  format: 'PDF' | 'EXCEL' | 'HTML';
  timeRange: string;
  recipients: string;
}

export interface MonitoringCheckDetails {
  checkLag: boolean;
  checkConn: boolean;
  checkDisk: boolean;
  criticalLagSec: number;
  warningLagSec: number;
}

export type TaskDetails = 
  | CdcPipelineDetails 
  | InitialLoadDetails 
  | VerificationDetails 
  | CorrectionDetails 
  | ReportGenDetails 
  | MonitoringCheckDetails;

export interface TaskConfig {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  scheduleType: ScheduleType;
  status: TaskStatus;
  lastRunAt?: string;
  nextRunAt?: string;
  updatedBy: string;
  updatedAt: string;
  details: TaskDetails;
  lastExecutionLog?: {
    timestamp: string;
    status: 'SUCCESS' | 'FAIL' | 'WARNING';
    message: string;
  };
}
