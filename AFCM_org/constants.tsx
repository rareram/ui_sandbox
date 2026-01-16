
import { Pipeline, PipelineStatus, DbType, Agent, AgentStatus, TaskConfig, DbConnection, TaskType, TaskScheduleEnum, AgentRole } from './types';

const generateFlowHistory = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${i}m`,
    eps: Math.floor(Math.random() * 5000) + 1000
  }));
};

const MOCK_CONFIG_CONTENT = `# Configuration File
param1 = value1
param2 = value2
buffer_size = 1024
commit_interval = 500
# End of config`;

const MOCK_MAP_CONTENT = `{
  "mapping": [
    { "source": "TABLE_A", "target": "TABLE_B" },
    { "source": "COL_1", "target": "COL_1" }
  ]
}`;

export const MOCK_PIPELINES: Pipeline[] = [
  {
    id: 'p1',
    name: 'Oracle_to_PG_Sales',
    description: 'Main sales data replication pipeline.\nSyncs KR_SALES to Global Analytics.',
    status: PipelineStatus.RUNNING,
    source: {
      connectionId: 's1',
      agentName: 'Agent-Seoul-01',
      agentIp: '10.10.20.15',
      dbName: 'KR_SALES_DB',
      dbType: DbType.ORACLE,
      ip: '10.10.20.15',
      user: 'sales_reader',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    target: {
      connectionId: 't1',
      agentName: 'Agent-AWS-01',
      agentIp: '172.16.5.4',
      dbName: 'GL_ANALYTICS',
      dbType: DbType.POSTGRESQL,
      ip: '172.16.5.4',
      user: 'analytics_user',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    topology: {
      extract: [{ id: 'e1', name: 'ext_sales', content: MOCK_CONFIG_CONTENT, hasMap: true, mapContent: MOCK_MAP_CONTENT }],
      send: [{ id: 'snd1', name: 'snd_main', content: MOCK_CONFIG_CONTENT }],
      post: [{ id: 'pst1', name: 'pst_sales', content: MOCK_CONFIG_CONTENT, hasMap: true, mapContent: MOCK_MAP_CONTENT }]
    },
    metrics: {
      epsExtract: 12500,
      epsPost: 12480,
      bpsSend: 45.2,
      lagExtract: 0.1,
      lagSend: 0.2,
      lagApply: 0.5,
      flowHistory: generateFlowHistory()
    },
    updatedAt: '2023-10-27 14:30:00',
    updatedBy: 'Admin'
  },
  {
    id: 'p2',
    name: 'Tibero_to_Oracle_HR',
    description: 'HR Data synchronization for HQ.\nSupports 1:2 topology distribution.',
    status: PipelineStatus.WARNING,
    source: {
      connectionId: 's2',
      agentName: 'Agent-Busan-01',
      agentIp: '10.20.1.50',
      dbName: 'HR_CORE',
      dbType: DbType.TIBERO,
      ip: '10.20.1.50',
      user: 'hr_admin',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    target: {
      connectionId: 't2',
      agentName: 'Agent-Seoul-02',
      agentIp: '10.10.20.20',
      dbName: 'HQ_HR_MASTER',
      dbType: DbType.ORACLE,
      ip: '10.10.20.20',
      user: 'hr_writer',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    topology: {
      extract: [{ id: 'e2', name: 'ext_hr', content: MOCK_CONFIG_CONTENT }],
      send: [
          { id: 'snd2_1', name: 'snd_hr_1', content: MOCK_CONFIG_CONTENT },
          { id: 'snd2_2', name: 'snd_hr_2', content: MOCK_CONFIG_CONTENT }
      ],
      post: [{ id: 'pst2', name: 'pst_hr', content: MOCK_CONFIG_CONTENT }]
    },
    metrics: {
      epsExtract: 500,
      epsPost: 400,
      bpsSend: 2.1,
      lagExtract: 2.5,
      lagSend: 0.8,
      lagApply: 15.2,
      flowHistory: generateFlowHistory()
    },
    updatedAt: '2023-10-27 10:00:00',
    updatedBy: 'Manager_Kim'
  },
  {
    id: 'p3',
    name: 'MySQL_to_Kafka_Logs',
    description: 'Web logs to Data Lake ingestion.\nCurrently halted due to connection error.',
    status: PipelineStatus.ERROR,
    source: {
      connectionId: 's3',
      agentName: 'Agent-Web-01',
      agentIp: '192.168.1.100',
      dbName: 'WEB_LOGS',
      dbType: DbType.MYSQL,
      ip: '192.168.1.100',
      user: 'log_user',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    target: {
      connectionId: 't3',
      agentName: 'Agent-BigData-01',
      agentIp: '10.50.10.10',
      dbName: 'DATA_LAKE',
      dbType: DbType.POSTGRESQL,
      ip: '10.50.10.10',
      user: 'datalake',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    topology: {
      extract: [{ id: 'e3', name: 'ext_logs', content: MOCK_CONFIG_CONTENT }],
      send: [{ id: 'snd3', name: 'snd_logs', content: MOCK_CONFIG_CONTENT }],
      post: [{ id: 'pst3', name: 'pst_logs', content: MOCK_CONFIG_CONTENT }]
    },
    metrics: {
      epsExtract: 0,
      epsPost: 0,
      bpsSend: 0,
      lagExtract: 3600,
      lagSend: 0,
      lagApply: 0,
      flowHistory: Array.from({ length: 20 }, (_, i) => ({ time: `${i}m`, eps: 0 }))
    },
    updatedAt: '2023-10-26 18:20:00',
    updatedBy: 'DevOps_Lee'
  },
   {
    id: 'p4',
    name: 'MSSQL_Inventory_Sync',
    description: 'Real-time inventory synchronization from retail branches.',
    status: PipelineStatus.RUNNING,
    source: {
      connectionId: 's5',
      agentName: 'Agent-Store-05',
      agentIp: '192.168.0.50',
      dbName: 'STORE_INV',
      dbType: DbType.MSSQL,
      ip: '192.168.0.50',
      user: 'sa',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    target: {
      connectionId: 't5',
      agentName: 'Agent-HQ',
      agentIp: '10.10.50.50',
      dbName: 'HQ_INV',
      dbType: DbType.ORACLE,
      ip: '10.10.50.50',
      user: 'inv_master',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    topology: {
      extract: [{ id: 'e5', name: 'ext_inv', content: MOCK_CONFIG_CONTENT }],
      send: [{ id: 'snd5', name: 'snd_inv', content: MOCK_CONFIG_CONTENT }],
      post: [{ id: 'pst5', name: 'pst_inv', content: MOCK_CONFIG_CONTENT }]
    },
    metrics: {
      epsExtract: 120,
      epsPost: 120,
      bpsSend: 0.5,
      lagExtract: 0.0,
      lagSend: 0.0,
      lagApply: 0.1,
      flowHistory: generateFlowHistory()
    },
    updatedAt: '2023-10-27 11:00:00',
    updatedBy: 'Admin'
  },
  {
    id: 'p5',
    name: 'PostgreSQL_Analytics_Clone',
    description: 'Secondary analytics cluster synchronization.\nStopped for maintenance.',
    status: PipelineStatus.STOPPED,
    source: {
      connectionId: 's6',
      agentName: 'Agent-Seoul-01',
      agentIp: '10.10.20.15',
      dbName: 'ANALYTICS_V1',
      dbType: DbType.POSTGRESQL,
      ip: '10.10.20.15',
      user: 'dw_loader',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    target: {
      connectionId: 't6',
      agentName: 'Agent-BigData-01',
      agentIp: '10.50.10.10',
      dbName: 'ANALYTICS_V2',
      dbType: DbType.POSTGRESQL,
      ip: '10.50.10.10',
      user: 'dw_loader',
      configContent: MOCK_CONFIG_CONTENT,
      agentConfigContent: MOCK_CONFIG_CONTENT,
      globalConfigContent: MOCK_CONFIG_CONTENT
    },
    topology: {
      extract: [{ id: 'e6', name: 'ext_anal', content: MOCK_CONFIG_CONTENT }],
      send: [{ id: 'snd6', name: 'snd_anal', content: MOCK_CONFIG_CONTENT }],
      post: [{ id: 'pst6', name: 'pst_anal', content: MOCK_CONFIG_CONTENT }]
    },
    metrics: {
      epsExtract: 0,
      epsPost: 0,
      bpsSend: 0,
      lagExtract: 0,
      lagSend: 0,
      lagApply: 0,
      flowHistory: Array.from({ length: 20 }, (_, i) => ({ time: `${i}m`, eps: 0 }))
    },
    updatedAt: '2023-10-25 09:30:00',
    updatedBy: 'DevOps_Lee'
  }
];

export const MOCK_AGENTS: Agent[] = [
  { 
    id: 'a1', 
    name: 'Agent-Seoul-01', 
    role: AgentRole.SOURCE, 
    ip: '10.10.20.15', 
    port: 8080, 
    protocol: 'HTTPS',
    version: '2.5.1', 
    osType: 'Linux',
    status: AgentStatus.CONNECTED, 
    pipelineCount: 5, 
    registeredAt: '2023-01-10', 
    user: 'Admin',
    updatedAt: '2023-10-20 14:00:00',
    updatedBy: 'Admin'
  },
  { 
    id: 'a2', 
    name: 'Agent-Busan-01', 
    role: AgentRole.SOURCE, 
    ip: '10.20.1.50', 
    port: 8080, 
    protocol: 'HTTP',
    version: '2.5.0', 
    osType: 'AIX',
    status: AgentStatus.CONNECTED, 
    pipelineCount: 2, 
    registeredAt: '2023-02-15', 
    user: 'Admin',
    updatedAt: '2023-09-15 11:30:00',
    updatedBy: 'Manager_Kim'
  },
  { 
    id: 'a3', 
    name: 'Agent-AWS-01', 
    role: AgentRole.TARGET, 
    ip: '172.16.5.4', 
    port: 9090, 
    protocol: 'HTTPS',
    version: '2.6.0', 
    osType: 'Linux',
    status: AgentStatus.CONNECTED, 
    pipelineCount: 12, 
    registeredAt: '2023-05-20', 
    user: 'CloudOps',
    updatedAt: '2023-10-26 09:00:00',
    updatedBy: 'DevOps_Lee'
  },
  { 
    id: 'a4', 
    name: 'Agent-Web-01', 
    role: AgentRole.BOTH, 
    ip: '192.168.1.100', 
    port: 8080, 
    protocol: 'HTTP',
    version: '2.4.9', 
    osType: 'Windows',
    status: AgentStatus.DISCONNECTED, 
    pipelineCount: 1, 
    registeredAt: '2023-06-01', 
    user: 'Dev_Team',
    updatedAt: '2023-08-01 10:00:00',
    updatedBy: 'DevOps_Lee'
  },
  { 
    id: 'a5', 
    name: 'Agent-Legacy', 
    role: AgentRole.RELAY, 
    ip: '10.10.10.5', 
    port: 8000, 
    protocol: 'HTTP',
    version: '2.3.0', 
    osType: 'Solaris',
    status: AgentStatus.CONNECTED, 
    pipelineCount: 1, 
    registeredAt: '2022-11-30', 
    user: 'Admin',
    updatedAt: '2023-01-15 16:20:00',
    updatedBy: 'System'
  },
];

export const MOCK_SOURCES: DbConnection[] = [
  { id: 's1', name: 'KR_SALES_DB', type: DbType.ORACLE, ip: '10.10.20.15', port: 1521, user: 'sales_reader', status: AgentStatus.CONNECTED, pipelineCount: 3, registeredAt: '2023-01-10', registeredBy: 'Admin' },
  { id: 's2', name: 'HR_CORE', type: DbType.TIBERO, ip: '10.20.1.50', port: 8629, user: 'hr_admin', status: AgentStatus.CONNECTED, pipelineCount: 1, registeredAt: '2023-02-15', registeredBy: 'Admin' },
  { id: 's3', name: 'WEB_LOGS', type: DbType.MYSQL, ip: '192.168.1.100', port: 3306, user: 'log_user', status: AgentStatus.DISCONNECTED, pipelineCount: 1, registeredAt: '2023-06-01', registeredBy: 'DevOps' },
  { id: 's4', name: 'BILLING_V1', type: DbType.ORACLE, ip: '10.10.10.5', port: 1521, user: 'billing_ro', status: AgentStatus.CONNECTED, pipelineCount: 2, registeredAt: '2022-11-30', registeredBy: 'Admin' },
  { id: 's5', name: 'STORE_INV', type: DbType.MSSQL, ip: '192.168.0.50', port: 1433, user: 'sa', status: AgentStatus.CONNECTED, pipelineCount: 1, registeredAt: '2023-08-20', registeredBy: 'StoreOps' },
  { id: 's6', name: 'DW_STAGING', type: DbType.POSTGRESQL, ip: '10.100.100.100', port: 5432, user: 'dw_loader', status: AgentStatus.CONNECTED, pipelineCount: 2, registeredAt: '2023-09-01', registeredBy: 'Admin' }
];

export const MOCK_TARGETS: DbConnection[] = [
  { id: 't1', name: 'GL_ANALYTICS', type: DbType.POSTGRESQL, ip: '172.16.5.4', port: 5432, user: 'analytics_user', status: AgentStatus.CONNECTED, pipelineCount: 3, registeredAt: '2023-01-15', registeredBy: 'Admin' },
  { id: 't2', name: 'HQ_HR_MASTER', type: DbType.ORACLE, ip: '10.10.20.20', port: 1521, user: 'hr_writer', status: AgentStatus.CONNECTED, pipelineCount: 1, registeredAt: '2023-02-20', registeredBy: 'Admin' },
  { id: 't3', name: 'DATA_LAKE', type: DbType.POSTGRESQL, ip: '10.50.10.10', port: 5432, user: 'datalake', status: AgentStatus.CONNECTED, pipelineCount: 4, registeredAt: '2023-06-10', registeredBy: 'DataEng' },
  { id: 't4', name: 'BILLING_V2', type: DbType.POSTGRESQL, ip: '172.30.1.10', port: 5432, user: 'billing_app', status: AgentStatus.CONNECTED, pipelineCount: 1, registeredAt: '2023-01-01', registeredBy: 'Admin' },
  { id: 't5', name: 'HQ_INV', type: DbType.ORACLE, ip: '10.10.50.50', port: 1521, user: 'inv_master', status: AgentStatus.CONNECTED, pipelineCount: 1, registeredAt: '2023-08-25', registeredBy: 'StoreOps' },
  { id: 't6', name: 'DW_STAGING', type: DbType.POSTGRESQL, ip: '10.100.100.100', port: 5432, user: 'dw_loader', status: AgentStatus.CONNECTED, pipelineCount: 4, registeredAt: '2023-09-01', registeredBy: 'Admin' }
];

/* Fix: Refactored MOCK_TASKS to use TaskConfig structure and correct TaskType string values */
export const MOCK_TASKS: TaskConfig[] = [
    { 
        id: 't1', 
        name: 'Init_Load_Sales', 
        description: 'Initial data load for sales pipeline.',
        category: 'DATA_OPERATION',
        status: 'RUNNING', 
        type: 'INITIAL_LOAD', 
        scheduleType: 'ON_DEMAND', 
        updatedAt: '2023-10-27', 
        updatedBy: 'Admin',
        details: { pipelineId: 'p1' } as any
    },
    { 
        id: 't2', 
        name: 'Daily_Compare_HR', 
        description: 'Daily consistency verification.',
        category: 'DATA_OPERATION',
        status: 'IDLE', 
        type: 'VERIFICATION', 
        scheduleType: 'SCHEDULED', 
        updatedAt: '2023-10-26', 
        updatedBy: 'System',
        details: { pipelineId: 'p2' } as any
    },
    { 
        id: 't3', 
        name: 'Repair_Log_Sync', 
        description: 'Auto-correction for log sync errors.',
        category: 'DATA_OPERATION',
        status: 'ERROR', 
        type: 'CORRECTION', 
        scheduleType: 'ON_DEMAND', 
        updatedAt: '2023-10-27', 
        updatedBy: 'DevOps',
        details: { pipelineId: 'p3' } as any
    },
    { 
        id: 't4', 
        name: 'Hourly_Billing_Check', 
        description: 'Periodic monitoring check for billing.',
        category: 'AUTOMATION',
        status: 'RUNNING', 
        type: 'MONITORING_CHECK', 
        scheduleType: 'REPEAT', 
        updatedAt: '2023-10-27', 
        updatedBy: 'Admin',
        details: { pipelineId: 'p4' } as any
    },
    { 
        id: 't5', 
        name: 'Inventory_Stream', 
        description: 'Real-time CDC pipeline control.',
        category: 'DATA_OPERATION',
        status: 'RUNNING', 
        type: 'CDC_PIPELINE', 
        scheduleType: 'REALTIME', 
        updatedAt: '2023-10-25', 
        updatedBy: 'System',
        details: { pipelineId: 'p4' } as any
    }
];
