import React from 'react';

const ConnectionCard = ({ name, host, type, status, time, statusColor, icon, iconBg, iconColor, borderColor = 'border-transparent' }: any) => (
  <div className={`group flex flex-col p-5 rounded-xl bg-white dark:bg-card-dark border ${borderColor} dark:border-card-border-dark shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/50 transition-all cursor-pointer`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{host} ({type})</p>
        </div>
      </div>
      <div className="relative">
        <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-auto">
      <div className="flex items-center gap-2">
        <span className={`flex h-2 w-2 rounded-full ${statusColor} ${status === 'Slow Response' ? 'animate-pulse' : ''} shadow-[0_0_8px_rgba(34,197,94,0.3)]`}></span>
        <span className={`text-xs font-medium ${status === 'Disconnected' ? 'text-red-600 dark:text-red-400' : status === 'Slow Response' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
          {status}
        </span>
      </div>
      {status === 'Disconnected' ? (
        <button className="text-xs font-semibold text-primary hover:underline">Retry</button>
      ) : (
        <span className="text-xs text-slate-400">{time}</span>
      )}
    </div>
  </div>
);

const Connections = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Header & Actions */}
      <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-sm">
            <a className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" href="#">Home</a>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-900 dark:text-white font-medium">Connection Manager</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Connection Manager</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage source and target database connections for data comparison jobs.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-slate-700 dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                <span>Refresh Status</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Add Connection</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 p-4 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Connections</p>
                <span className="material-symbols-outlined text-slate-400">dns</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Healthy</p>
                <span className="material-symbols-outlined text-green-500">check_circle</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">10</p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-card-border-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Action Required</p>
                <span className="material-symbols-outlined text-red-500">error</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-[1600px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            </div>
            <input className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-white dark:bg-card-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="Search connections by name, host, or type..." type="text" />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-card-dark border border-transparent dark:border-card-border-dark text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-card-dark border border-transparent dark:border-card-border-dark text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[20px] icon-fill">play_arrow</span>
              Test All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Source Connections</h3>
                <span className="bg-slate-200 dark:bg-card-border-dark text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">6</span>
              </div>
            </div>
            <ConnectionCard
              name="PROD_Oracle_Fin"
              host="10.0.1.25 : 1521"
              type="Oracle"
              status="Connected"
              time="Checked 2m ago"
              statusColor="bg-green-500"
              icon="database"
              iconBg="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600 dark:text-orange-400"
            />
             <ConnectionCard
              name="PROD_Postgres_Inv"
              host="10.0.1.30 : 5432"
              type="PostgreSQL"
              status="Connected"
              time="Checked 5m ago"
              statusColor="bg-green-500"
              icon="storage"
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <ConnectionCard
              name="LEGACY_SQL_01"
              host="192.168.0.88 : 1433"
              type="MSSQL"
              status="Disconnected"
              time="Retry"
              statusColor="bg-red-500"
              icon="dns"
              iconBg="bg-red-100 dark:bg-red-900/20"
              iconColor="text-red-600 dark:text-red-400"
              borderColor="border-red-200 dark:border-red-900/30"
            />
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Target Connections</h3>
                <span className="bg-slate-200 dark:bg-card-border-dark text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">6</span>
              </div>
            </div>
            <ConnectionCard
              name="CLOUD_DW_Snowflake"
              host="aws.snowflake.com : 443"
              type="Snowflake"
              status="Connected"
              time="Checked 1m ago"
              statusColor="bg-green-500"
              icon="cloud"
              iconBg="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor="text-indigo-600 dark:text-indigo-400"
            />
             <ConnectionCard
              name="DR_Oracle_Fin"
              host="10.2.1.25 : 1521"
              type="Oracle"
              status="Connected"
              time="Checked 15m ago"
              statusColor="bg-green-500"
              icon="database"
              iconBg="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600 dark:text-orange-400"
            />
             <ConnectionCard
              name="UAT_MySQL_Auth"
              host="172.16.0.5 : 3306"
              type="MySQL"
              status="Slow Response"
              time="2300ms"
              statusColor="bg-amber-500"
              icon="warning"
              iconBg="bg-amber-100 dark:bg-amber-900/20"
              iconColor="text-amber-600 dark:text-amber-400"
              borderColor="border-amber-200 dark:border-amber-900/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;