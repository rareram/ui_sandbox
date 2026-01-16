import React from 'react';

const StatCard = ({ title, value, icon, iconColor, subValue }: { title: string; value: string; icon: string; iconColor: string; subValue?: React.ReactNode }) => (
  <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <span className={`material-symbols-outlined text-[64px] ${iconColor}`}>{icon}</span>
    </div>
    <div className="flex flex-col gap-1 z-10 relative">
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        {subValue}
      </div>
    </div>
  </div>
);

const ActiveJobCard = ({ title, id, source, target, progress, speed, eta, processed, status }: any) => (
  <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-6">
    <div className="flex justify-between items-start">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined">sync</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">ID: {id} • {source} → {target}</p>
        </div>
      </div>
      <div className="px-2.5 py-1 rounded bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        {status}
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm font-medium mb-1">
        <span className="text-slate-700 dark:text-gray-300">Progress</span>
        <span className="text-primary">{progress}%</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">speed</span> {speed}</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> ETA: {eta}</span>
        </div>
        <span>Processed: {processed}</span>
      </div>
    </div>
    <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
      <button className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors">
        View Details
      </button>
      <button className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[18px]">stop_circle</span>
        Stop
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="flex-1 w-full p-4 md:p-8 flex flex-col gap-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Job Dashboard</h1>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <p>System Overview: Production Environment</p>
            <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
            <p className="text-xs">Last updated: Just now</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Create New Job</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Running Jobs" 
          value="3" 
          icon="cached" 
          iconColor="text-primary"
          subValue={
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          }
        />
        <StatCard title="Queued Jobs" value="12" icon="hourglass_empty" iconColor="text-yellow-500" />
        <StatCard title="Completed Jobs" value="1,402" icon="check_circle" iconColor="text-green-500" />
        <StatCard title="Errored Jobs" value="5" icon="error" iconColor="text-red-500" />
      </div>

      {/* Active Comparisons */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Comparisons</h2>
          <button className="text-sm text-primary font-medium hover:underline">View All Active</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActiveJobCard
            title="Orders Table Sync"
            id="#1024"
            source="Oracle DB_PROD"
            target="SQLServer_DW"
            progress={45}
            speed="15,200 rows/sec"
            eta="12m 30s"
            processed="4.5M / 10M rows"
            status="Running"
          />
          <ActiveJobCard
            title="Inventory Master Check"
            id="#1025"
            source="Postgres_Main"
            target="Snowflake_Analytics"
            progress={78}
            speed="8,450 rows/sec"
            eta="04m 15s"
            processed="780k / 1M rows"
            status="Running"
          />
        </div>
      </section>

      {/* Run History */}
      <section className="flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Run History</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-surface-dark text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Job Name</th>
                  <th className="px-6 py-4">Source / Target</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4 text-right">Duration</th>
                  <th className="px-6 py-4 text-right">Diffs Found</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-slate-700 dark:text-gray-300">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Daily_Cust_Sync</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">Oracle_01 → Mongo_Atlas</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Completed
                    </span>
                  </td>
                  <td className="px-6 py-4">Oct 24, 08:00 AM</td>
                  <td className="px-6 py-4 text-right font-mono">0h 42m</td>
                  <td className="px-6 py-4 text-right font-mono text-green-600 dark:text-green-400 font-bold">0</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Legacy_Payment_Mig</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">DB2_Main → PostgreSQL</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Errored
                    </span>
                  </td>
                  <td className="px-6 py-4">Oct 24, 07:15 AM</td>
                  <td className="px-6 py-4 text-right font-mono">0h 12m</td>
                  <td className="px-6 py-4 text-right font-mono text-gray-400">-</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
                      <span className="material-symbols-outlined text-[20px]">replay</span>
                    </button>
                  </td>
                </tr>
                 <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Inventory_Audit_Q4</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">SAP_HANA → BigQuery</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Completed
                    </span>
                  </td>
                  <td className="px-6 py-4">Oct 23, 11:30 PM</td>
                  <td className="px-6 py-4 text-right font-mono">2h 15m</td>
                  <td className="px-6 py-4 text-right font-mono text-yellow-600 dark:text-yellow-400 font-bold">142</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;