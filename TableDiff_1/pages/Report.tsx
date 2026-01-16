import React from 'react';

const Report = () => {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-[1600px] w-full mx-auto space-y-6 overflow-y-auto">
      {/* Breadcrumbs & Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-[#9da6b8]">
          <a className="hover:text-primary transition-colors" href="#">Home</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <a className="hover:text-primary transition-colors" href="#">Jobs</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Report #8823-A</span>
        </div>
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 dark:border-border-dark pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Comparison Report: Financial_Trans_2023</h1>
            <p className="text-slate-500 dark:text-[#9da6b8] text-base font-normal">Job ID: 8823-A • Run Date: Oct 24, 2023 • Duration: 14m 23s</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark text-slate-700 dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-border-dark transition-colors">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              <span>Re-Run</span>
            </button>
            <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20">
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stats */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-[#9da6b8] text-sm font-medium uppercase tracking-wider">Total Rows</p>
              <span className="material-symbols-outlined text-slate-400 dark:text-[#9da6b8]">table_rows</span>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">1,240,500</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-status-red text-sm font-medium uppercase tracking-wider">Discrepancies</p>
              <span className="material-symbols-outlined text-status-red">warning</span>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">5,432</p>
            <p className="text-xs text-status-red font-medium">+12% from last run</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-status-green text-sm font-medium uppercase tracking-wider">Match Rate</p>
              <span className="material-symbols-outlined text-status-green">verified</span>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">99.56%</p>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark p-6 flex flex-col shadow-sm">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold">Data Distribution Status</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-status-green"></div><span className="text-slate-500 dark:text-[#9da6b8]">Equal</span></div>
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-status-red"></div><span className="text-slate-500 dark:text-[#9da6b8]">Out-of-Sync</span></div>
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-status-yellow"></div><span className="text-slate-500 dark:text-[#9da6b8]">Source Only</span></div>
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-status-blue"></div><span className="text-slate-500 dark:text-[#9da6b8]">Target Only</span></div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-4">
             <div className="grid grid-cols-4 gap-8 h-40 items-end px-4">
                <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                    <span className="text-slate-700 dark:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">98.5%</span>
                    <div className="w-full bg-gray-100 dark:bg-border-dark rounded-t-lg relative h-full overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-status-green transition-all hover:bg-green-400" style={{height: '98%'}}></div>
                    </div>
                    <span className="text-slate-500 dark:text-[#9da6b8] text-xs font-bold uppercase tracking-wider mt-2">Equal</span>
                </div>
                 <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                    <span className="text-slate-700 dark:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">1.2%</span>
                    <div className="w-full bg-gray-100 dark:bg-border-dark rounded-t-lg relative h-full overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-status-red transition-all hover:bg-red-400" style={{height: '35%'}}></div>
                    </div>
                    <span className="text-slate-500 dark:text-[#9da6b8] text-xs font-bold uppercase tracking-wider mt-2">Out-of-Sync</span>
                </div>
                 <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                    <span className="text-slate-700 dark:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">0.2%</span>
                    <div className="w-full bg-gray-100 dark:bg-border-dark rounded-t-lg relative h-full overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-status-yellow transition-all hover:bg-yellow-400" style={{height: '15%'}}></div>
                    </div>
                    <span className="text-slate-500 dark:text-[#9da6b8] text-xs font-bold uppercase tracking-wider mt-2">Source Only</span>
                </div>
                 <div className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                    <span className="text-slate-700 dark:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">0.1%</span>
                    <div className="w-full bg-gray-100 dark:bg-border-dark rounded-t-lg relative h-full overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-status-blue transition-all hover:bg-blue-400" style={{height: '10%'}}></div>
                    </div>
                    <span className="text-slate-500 dark:text-[#9da6b8] text-xs font-bold uppercase tracking-wider mt-2">Target Only</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-1 gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="relative min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da6b8] text-[20px]">search</span>
                <input className="w-full pl-10 pr-4 h-10 bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-border-dark rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-400" placeholder="Search by Table or Key..." type="text" />
            </div>
            <div className="relative min-w-[160px]">
                <select className="w-full pl-3 pr-10 h-10 bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-border-dark rounded-lg text-slate-900 dark:text-white text-sm appearance-none focus:outline-none focus:border-primary cursor-pointer">
                    <option>All Statuses</option>
                    <option>Out-of-Sync</option>
                    <option>Source Only</option>
                    <option>Target Only</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da6b8] text-[20px] pointer-events-none">expand_more</span>
            </div>
            <div className="relative min-w-[160px]">
                <select className="w-full pl-3 pr-10 h-10 bg-gray-50 dark:bg-[#111621] border border-gray-200 dark:border-border-dark rounded-lg text-slate-900 dark:text-white text-sm appearance-none focus:outline-none focus:border-primary cursor-pointer">
                    <option>All Tables</option>
                    <option>TRANSACTIONS</option>
                    <option>USERS</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da6b8] text-[20px] pointer-events-none">expand_more</span>
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9da6b8] border-l border-gray-200 dark:border-border-dark pl-4">
            <span>Showing 1-10 of 5,432</span>
             <div className="flex gap-1 ml-2">
                <button className="p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-border-dark"><span className="material-symbols-outlined">chevron_left</span></button>
                <button className="p-1 hover:text-primary rounded hover:bg-gray-100 dark:hover:bg-border-dark"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[600px]">
         {/* Discrepancy List */}
         <div className="flex-1 xl:flex-[3] bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-[#1e2330]">
                <h3 className="text-slate-900 dark:text-white font-bold">Discrepancy List</h3>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white dark:bg-[#111621] z-10 text-xs uppercase text-slate-500 dark:text-[#9da6b8] font-semibold tracking-wider">
                         <tr>
                            <th className="p-4 border-b border-gray-200 dark:border-border-dark w-10">
                                <input type="checkbox" className="rounded bg-gray-100 dark:bg-[#292e38] border-gray-300 dark:border-border-dark text-primary focus:ring-0 focus:ring-offset-0" />
                            </th>
                            <th className="p-4 border-b border-gray-200 dark:border-border-dark">Primary Key</th>
                            <th className="p-4 border-b border-gray-200 dark:border-border-dark">Table</th>
                            <th className="p-4 border-b border-gray-200 dark:border-border-dark">Status</th>
                            <th className="p-4 border-b border-gray-200 dark:border-border-dark">Discrepancy Col</th>
                            <th className="p-4 border-b border-gray-200 dark:border-border-dark text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 dark:text-white divide-y divide-gray-200 dark:divide-border-dark">
                         <tr className="bg-primary/5 border-l-4 border-l-primary cursor-pointer hover:bg-primary/10 transition-colors">
                            <td className="p-4"><input type="checkbox" defaultChecked className="rounded bg-gray-100 dark:bg-[#292e38] border-gray-300 dark:border-border-dark text-primary focus:ring-0 focus:ring-offset-0" /></td>
                            <td className="p-4 font-mono text-blue-600 dark:text-blue-300">TRX-102938</td>
                            <td className="p-4">TRANSACTIONS</td>
                            <td className="p-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-status-red/10 text-status-red border border-status-red/20">
                                    <span className="size-1.5 rounded-full bg-status-red"></span> Out-of-Sync
                                </span>
                            </td>
                            <td className="p-4 text-slate-500 dark:text-[#9da6b8]">amount, currency</td>
                            <td className="p-4 text-right">
                                <button className="text-slate-600 dark:text-white hover:text-primary"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                            </td>
                         </tr>
                         <tr className="hover:bg-gray-50 dark:hover:bg-[#111621] transition-colors cursor-pointer border-l-4 border-l-transparent">
                            <td className="p-4"><input type="checkbox" className="rounded bg-gray-100 dark:bg-[#292e38] border-gray-300 dark:border-border-dark text-primary focus:ring-0 focus:ring-offset-0" /></td>
                            <td className="p-4 font-mono text-slate-600 dark:text-gray-300">TRX-102939</td>
                            <td className="p-4">TRANSACTIONS</td>
                            <td className="p-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-status-yellow/10 text-status-yellow border border-status-yellow/20">
                                    <span className="size-1.5 rounded-full bg-status-yellow"></span> Source Only
                                </span>
                            </td>
                            <td className="p-4 text-slate-500 dark:text-[#9da6b8]">-</td>
                            <td className="p-4 text-right">
                                <button className="text-slate-400 dark:text-[#9da6b8] hover:text-primary dark:hover:text-white"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                            </td>
                         </tr>
                    </tbody>
                </table>
            </div>
         </div>

         {/* Detail View */}
         <div className="flex-1 xl:flex-[2] bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-xl flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-[#1e2330]">
                <div>
                    <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">compare_arrows</span> Row Comparison
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#9da6b8] mt-1 font-mono">PK: TRX-102938</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg bg-gray-200 dark:bg-[#292e38] hover:bg-gray-300 dark:hover:bg-[#3c4453] text-slate-600 dark:text-white"><span className="material-symbols-outlined text-[18px]">open_in_full</span></button>
                    <button className="p-1.5 rounded-lg bg-gray-200 dark:bg-[#292e38] hover:bg-gray-300 dark:hover:bg-[#3c4453] text-slate-600 dark:text-white"><span className="material-symbols-outlined text-[18px]">close</span></button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-0">
                <div className="grid grid-cols-2 text-xs font-semibold text-slate-500 dark:text-[#9da6b8] uppercase tracking-wider sticky top-0 bg-white dark:bg-card-dark z-10 border-b border-gray-200 dark:border-border-dark">
                    <div className="p-3 border-r border-gray-200 dark:border-border-dark flex items-center gap-2">
                         <span className="size-2 rounded-full bg-blue-500"></span> Source (Oracle)
                    </div>
                     <div className="p-3 flex items-center gap-2">
                         <span className="size-2 rounded-full bg-purple-500"></span> Target (Postgres)
                    </div>
                </div>
                <div className="flex flex-col text-sm font-mono divide-y divide-gray-200 dark:divide-border-dark">
                    <div className="grid grid-cols-2 group hover:bg-gray-50 dark:hover:bg-[#111621]">
                        <div className="p-3 text-slate-400 dark:text-[#9da6b8] border-r border-gray-200 dark:border-border-dark break-all">
                             <span className="text-xs select-none block text-gray-500 dark:text-gray-600 mb-1">transaction_id</span>
                             TRX-102938
                        </div>
                        <div className="p-3 text-slate-400 dark:text-[#9da6b8] break-all">
                             <span className="text-xs select-none block text-gray-500 dark:text-gray-600 mb-1">transaction_id</span>
                             TRX-102938
                        </div>
                    </div>
                    <div className="grid grid-cols-2 bg-status-red/10 group">
                        <div className="p-3 text-slate-900 dark:text-white font-medium border-r border-red-200 dark:border-red-900/50 break-all relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-red"></div>
                             <span className="text-xs select-none block text-red-700 dark:text-red-300/70 mb-1">amount</span>
                             4,500.00
                        </div>
                         <div className="p-3 text-slate-900 dark:text-white font-medium break-all bg-status-red/20">
                             <span className="text-xs select-none block text-red-700 dark:text-red-300/70 mb-1">amount</span>
                             4,500.50
                        </div>
                    </div>
                </div>
            </div>
             <div className="p-4 border-t border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-[#1e2330] flex justify-end gap-2">
                <button className="px-3 py-1.5 rounded text-sm text-slate-600 dark:text-[#9da6b8] hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#292e38] transition-colors">Ignore Discrepancy</button>
                <button className="px-3 py-1.5 rounded text-sm bg-primary text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20 font-medium">Repair Row</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Report;