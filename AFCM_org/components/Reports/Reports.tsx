
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Calendar, Layers, BarChart3, Download, 
  Clock, CheckCircle2, AlertCircle, FileType, Mail,
  ChevronDown, Check, Plus, Trash2, Printer, 
  Settings, Database, TrendingUp, History
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import { MOCK_PIPELINES } from '../../constants';

// --- Types & Interfaces ---
type ReportType = 'Daily' | 'Weekly' | 'Monthly';
type ReportFormat = 'PDF' | 'Excel' | 'Word' | 'Email';

interface ScheduledReport {
  id: string;
  name: string;
  type: ReportType;
  schedule: string;
  format: ReportFormat;
  lastRun: string;
}

// --- Mock Data Generators ---
const generatePreviewData = (type: ReportType) => {
  const points = type === 'Daily' ? 24 : 7;
  const unit = type === 'Daily' ? 'h' : 'd';
  
  return Array.from({ length: points }, (_, i) => ({
    time: type === 'Daily' ? `${i}:00` : `Day ${i + 1}`,
    ...Object.fromEntries(MOCK_PIPELINES.slice(0, 3).map(p => [p.name, Math.floor(Math.random() * 5000) + 1000])),
    extract: Math.floor(Math.random() * 10000) + 5000,
    post: Math.floor(Math.random() * 9500) + 4500,
    errors: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0
  }));
};

const TOP_TABLES_DATA = [
  { name: 'SALES_ORDER', rows: 125000 },
  { name: 'CUSTOMER_INFO', rows: 89000 },
  { name: 'PRODUCT_LOG', rows: 65000 },
  { name: 'PAYMENT_TRAN', rows: 45000 },
  { name: 'INVENTORY_HIST', rows: 32000 },
];

const SCHEDULED_REPORTS_MOCK: ScheduledReport[] = [
  { id: '1', name: 'Sales Pipeline Daily', type: 'Daily', schedule: 'Everyday 06:00', format: 'PDF', lastRun: '2023-10-27' },
  { id: '2', name: 'Global Weekly Audit', type: 'Weekly', schedule: 'Mon 00:00', format: 'Excel', lastRun: '2023-10-23' },
];

const Reports: React.FC = () => {
  const { t } = useTranslation();
  
  // --- State ---
  const [reportType, setReportType] = useState<ReportType>('Daily');
  const [selectedPipelines, setSelectedPipelines] = useState<string[]>(MOCK_PIPELINES.map(p => p.id));
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [metrics, setMetrics] = useState({
    status: true,
    throughput: true,
    lag: true,
    errors: true,
    resources: false,
    dml: true,
    ddl: false
  });
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPipelineDropdownOpen, setIsPipelineDropdownOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const now = new Date();
    if (reportType === 'Daily') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      setDateRange({ start: yesterday.toISOString().split('T')[0], end: yesterday.toISOString().split('T')[0] });
    } else if (reportType === 'Weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      setDateRange({ start: weekAgo.toISOString().split('T')[0], end: now.toISOString().split('T')[0] });
    } else {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      setDateRange({ start: monthAgo.toISOString().split('T')[0], end: now.toISOString().split('T')[0] });
    }
  }, [reportType]);

  const previewData = useMemo(() => generatePreviewData(reportType), [reportType]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`${format} 리포트가 생성되어 다운로드가 시작됩니다.`);
    }, 2000);
  };

  const togglePipeline = (id: string) => {
    setSelectedPipelines(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex h-full p-6 gap-6 overflow-hidden bg-slate-900">
      
      {/* 1. Left Pane: Configuration */}
      <div className="w-[400px] flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-2">
        
        {/* Config Card */}
        <div className="bg-slate-850 border border-slate-700 rounded-md p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
            <Settings size={20} className="text-primary" />
            <h3 className="font-black text-white uppercase tracking-tight">Report Configuration</h3>
          </div>

          {/* Report Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Type</label>
            <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-700">
              {(['Daily', 'Weekly', 'Monthly'] as ReportType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                    reportType === type ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Target Pipelines */}
          <div className="space-y-3 relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Pipelines</label>
            <button 
              onClick={() => setIsPipelineDropdownOpen(!isPipelineDropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-300 hover:border-primary transition-all"
            >
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-slate-500" />
                <span>{selectedPipelines.length === MOCK_PIPELINES.length ? 'All Pipelines' : `${selectedPipelines.length} Selected`}</span>
              </div>
              <ChevronDown size={16} />
            </button>
            {isPipelineDropdownOpen && (
              <div className="absolute z-50 top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-md shadow-2xl p-2 max-h-60 overflow-y-auto custom-scrollbar">
                {MOCK_PIPELINES.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => togglePipeline(p.id)}
                    className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedPipelines.includes(p.id) ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                      {selectedPipelines.includes(p.id) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-xs text-slate-300">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Period</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300 focus:border-primary outline-none" 
                />
              </div>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300 focus:border-primary outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Included Metrics */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Included Metrics</label>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 p-4 bg-slate-900/50 rounded-md border border-slate-800">
              {[
                { id: 'status', label: 'Pipeline 현황' },
                { id: 'throughput', label: 'Throughput Trend' },
                { id: 'lag', label: 'Peak Lag' },
                { id: 'errors', label: 'Error Logs' },
                { id: 'resources', label: 'Resource Usage' },
                { id: 'dml', label: 'DML Datagrid' },
                { id: 'ddl', label: 'DDL Datagrid' },
              ].map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setMetrics(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof metrics] }))}
                >
                  <div className={`w-4 h-4 rounded border transition-all ${metrics[item.id as keyof typeof metrics] ? 'bg-primary border-primary' : 'border-slate-700 group-hover:border-slate-500'}`}>
                    {metrics[item.id as keyof typeof metrics] && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Output Format</label>
            <div className="flex flex-wrap gap-4 px-4 py-3 bg-slate-900/50 rounded-md border border-slate-800">
              {(['PDF', 'Excel', 'Word', 'Email'] as ReportFormat[]).map(f => (
                <div 
                  key={f} 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setFormat(f)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${format === f ? 'border-primary' : 'border-slate-700 group-hover:border-slate-500'}`}>
                    {format === f && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">{f === 'Email' ? 'Email Preview' : f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-md font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? <TrendingUp size={16} className="animate-spin" /> : <Download size={16} />}
              Generate Report
            </button>
            <button className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-all active:scale-95" title="Schedule">
              <Clock size={18} />
            </button>
          </div>
        </div>

        {/* Scheduled List Card */}
        <div className="bg-slate-850 border border-slate-700 rounded-md p-6 shadow-xl flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
             <div className="flex items-center gap-2">
                <History size={20} className="text-amber-500" />
                <h3 className="font-black text-white uppercase tracking-tight">Scheduled Jobs</h3>
             </div>
             <button className="p-1 hover:text-primary text-slate-500 transition-colors"><Plus size={18}/></button>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {SCHEDULED_REPORTS_MOCK.map(job => (
              <div key={job.id} className="p-3 bg-slate-900 border border-slate-800 rounded-md flex justify-between items-center group">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{job.name}</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-black border border-slate-700 uppercase">{job.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                    <Clock size={10} />
                    <span>{job.schedule}</span>
                    <span className="mx-1">•</span>
                    <FileType size={10} />
                    <span>{job.format}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-1.5 hover:text-primary text-slate-600 transition-colors"><Settings size={14}/></button>
                   <button className="p-1.5 hover:text-rose-500 text-slate-600 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Right Pane: Live Preview */}
      <div className="flex-1 bg-slate-800/50 rounded-md border border-slate-800 overflow-y-auto custom-scrollbar p-10 flex flex-col items-center gap-10">
        
        {/* Page 1 */}
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl p-[20mm] flex flex-col shrink-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg text-white"><FileText size={24}/></div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">{reportType} Stability Report</h1>
                <p className="text-xs text-slate-500 font-bold font-mono">Date: {dateRange.start} ~ {dateRange.end}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AFCM Enterprise</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Management</p>
            </div>
          </div>

          {/* Summary Cards (Only if Metrics.status is true) */}
          {metrics.status && (
            <div className="grid grid-cols-3 gap-6 mb-10">
              {[
                { label: 'System Uptime', value: '99.98%', icon: CheckCircle2, color: 'text-emerald-600' },
                { label: 'Processed Rows', value: '1,284,502', icon: Database, color: 'text-blue-600' },
                { label: 'Critical Errors', value: '0', icon: AlertCircle, color: 'text-slate-400' },
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{stat.label}</p>
                    <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon size={24} className={stat.color} />
                </div>
              ))}
            </div>
          )}

          {/* Chart Section 1: Throughput Trend */}
          <div className="mb-10">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
              <TrendingUp size={14} /> Throughput (Rows/s) Trend
            </h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis dataKey="time" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="extract" stroke="#2563eb" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="post" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Section 2: Top 5 Tables */}
          <div className="mb-10">
             <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
              <Layers size={14} /> Top 5 Replication Targets
            </h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOP_TABLES_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 9, fontWeight: 'bold'}} width={100} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="rows" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            <span>Generated at 2023-10-27 15:30:00</span>
            <span>Page 1 of 2</span>
          </div>
        </div>

        {/* Page 2 */}
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl p-[20mm] flex flex-col shrink-0">
          {/* Header (Simplified for Page 2+) */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-8">
            <span className="text-[10px] font-black uppercase text-slate-400">{reportType} Report - Detailed Metrics</span>
            <span className="text-[10px] font-mono text-slate-300">REF: AFCM-20231027-01</span>
          </div>

          {/* Stacked Bar: Pipeline Load */}
          <div className="mb-12">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
              <BarChart3 size={14} /> Pipeline Workload Distribution
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis dataKey="time" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: 10, fontWeight: 'bold'}} />
                  {MOCK_PIPELINES.slice(0, 3).map((p, i) => (
                    <Bar key={p.id} dataKey={p.name} stackId="a" fill={['#3b82f6', '#10b981', '#f59e0b'][i]} radius={i === 2 ? [4,4,0,0] : [0,0,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Datagrid Detail */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
              <Database size={14} /> Transaction Log Matrix
            </h4>
            <div className="flex-1 overflow-hidden border border-slate-100 rounded-lg">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-slate-400 font-black uppercase">
                    <th className="p-3">Interval / Pipeline</th>
                    <th className="p-3 text-right">Extract Rows</th>
                    <th className="p-3 text-right">Post Rows</th>
                    <th className="p-3 text-right">Error Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {previewData.slice(0, 15).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-slate-700">{row.time}</td>
                      <td className="p-3 text-right font-mono text-blue-600">{row.extract.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">{row.post.toLocaleString()}</td>
                      <td className={`p-3 text-right font-mono ${row.errors > 0 ? 'text-rose-500 font-black' : 'text-slate-300'}`}>{row.errors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-slate-50/50 text-center text-[9px] text-slate-400 italic">
                (Only showing first 15 records. Complete data available in full report.)
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            <span>Official System Log Artifact</span>
            <span>Page 2 of 2</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
