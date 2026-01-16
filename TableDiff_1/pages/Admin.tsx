import React from 'react';

const Admin = () => {
  return (
    <div className="flex-1 p-6 lg:p-10 w-full max-w-[1400px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <a className="hover:text-primary transition-colors" href="#">Home</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Admin & Logs</span>
        </div>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin & Logs</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Manage system thresholds, reporting configurations, and monitor agent status.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm">
              <span className="material-symbols-outlined text-[20px]">download</span>
              System Logs
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors text-sm font-medium shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-[20px]">save</span>
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="xl:col-span-4 flex flex-col gap-6 lg:gap-8">
          <section className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                Threshold Settings
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Error Rate Interruption (%)</label>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">12%</span>
                </div>
                <input className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" max="100" min="0" type="range" defaultValue="12" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span>Strict</span>
                  <span>100%</span>
                </div>
              </div>
               <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Row Count Discrepancy</label>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">500</span>
                </div>
                <input className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" max="5000" min="0" step="100" type="range" defaultValue="500" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Trigger alert if discrepancy exceeds value.</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-border-dark">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Auto-Pause Jobs</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Pause if error rate exceeded</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

           <section className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">ios_share</span>
                Export Options
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Default Report Format</label>
                 <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                        <input type="radio" name="format" className="peer sr-only" defaultChecked />
                        <div className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-border-dark rounded-lg bg-slate-50 dark:bg-slate-800/30 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                             <span className="material-symbols-outlined mb-1">picture_as_pdf</span>
                             <span className="text-xs font-medium">PDF</span>
                        </div>
                    </label>
                     <label className="cursor-pointer">
                        <input type="radio" name="format" className="peer sr-only" />
                        <div className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-border-dark rounded-lg bg-slate-50 dark:bg-slate-800/30 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                             <span className="material-symbols-outlined mb-1">table_view</span>
                             <span className="text-xs font-medium">Excel</span>
                        </div>
                    </label>
                     <label className="cursor-pointer">
                        <input type="radio" name="format" className="peer sr-only" />
                        <div className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-border-dark rounded-lg bg-slate-50 dark:bg-slate-800/30 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                             <span className="material-symbols-outlined mb-1">description</span>
                             <span className="text-xs font-medium">CSV</span>
                        </div>
                    </label>
                 </div>
              </div>
              <div className="space-y-3">
                 <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Export Path</label>
                     <div className="relative">
                         <input type="text" defaultValue="/mnt/reports/daily" className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-border-dark text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 font-mono" />
                         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                             <span className="material-symbols-outlined text-slate-400 text-[18px]">folder_open</span>
                         </div>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <input id="email-checkbox" type="checkbox" className="w-4 h-4 text-primary bg-slate-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="email-checkbox" className="ml-2 text-sm font-medium text-slate-900 dark:text-slate-300">Email reports on completion</label>
                 </div>
              </div>
            </div>
           </section>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-8 flex flex-col gap-6 lg:gap-8">
            <section className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">dns</span> Agent Status Monitor
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Real-time status of connected database agents</p>
                    </div>
                    <button className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors font-medium">
                        <span className="material-symbols-outlined text-[16px]">refresh</span> Refresh
                    </button>
                </div>
                <div className="overflow-x-auto w-full">
                     <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400 border-b border-gray-200 dark:border-border-dark">
                            <tr>
                                <th className="px-6 py-3">Agent Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Hostname / IP</th>
                                <th className="px-6 py-3">Load</th>
                                <th className="px-6 py-3 text-right">Last Heartbeat</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-border-dark">
                            <tr className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                             <span className="material-symbols-outlined text-[18px]">database</span>
                                        </div>
                                        Oracle-Prod-DB01
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        <span className="size-1.5 rounded-full bg-green-500"></span> Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">192.168.1.104</td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 w-16">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{width: '25%'}}></div>
                                    </div>
                                    <span className="text-xs mt-1 block">0.45</span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs">2s ago</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">description</span></button>
                                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">restart_alt</span></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                             <span className="material-symbols-outlined text-[18px]">storage</span>
                                        </div>
                                        SQLServer-Analytics-02
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span> High Latency
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">10.0.4.22</td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 w-16">
                                        <div className="bg-amber-500 h-1.5 rounded-full" style={{width: '85%'}}></div>
                                    </div>
                                    <span className="text-xs mt-1 block">3.21</span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs">450ms</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">description</span></button>
                                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><span className="material-symbols-outlined text-[20px]">restart_alt</span></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                     </table>
                </div>
            </section>

             <div className="bg-black/90 rounded-xl border border-gray-200 dark:border-border-dark overflow-hidden flex flex-col mt-2">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                         <span className="material-symbols-outlined text-[14px]">terminal</span> System Console
                    </span>
                    <div className="flex gap-1.5">
                        <div className="size-2.5 rounded-full bg-red-500/50"></div>
                        <div className="size-2.5 rounded-full bg-amber-500/50"></div>
                        <div className="size-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                </div>
                <div className="p-4 font-mono text-xs leading-relaxed h-48 overflow-y-auto custom-scrollbar">
                     <div className="text-green-400 mb-1"><span className="text-slate-500">[2023-10-27 10:42:01]</span> Service "Oracle-Prod-DB01" health check passed (4ms).</div>
                     <div className="text-slate-300 mb-1"><span className="text-slate-500">[2023-10-27 10:42:05]</span> Starting routine comparison job #8841...</div>
                     <div className="text-amber-400 mb-1"><span className="text-slate-500">[2023-10-27 10:43:12]</span> WARN: SQLServer-Analytics-02 response time &gt; 300ms. Latency spike detected.</div>
                     <div className="text-slate-300 mb-1"><span className="text-slate-500">[2023-10-27 10:44:00]</span> Job #8841 progress: 25% complete. Rows processed: 1,450,200.</div>
                     <div className="text-red-400 mb-1"><span className="text-slate-500">[2023-10-27 10:45:22]</span> ERROR: Connection lost to Postgres-Replica-EU (172.16.0.55). Retrying in 30s...</div>
                     <div className="text-slate-300 mb-1"><span className="text-slate-500">[2023-10-27 10:46:01]</span> Admin user updated threshold settings for 'Error Rate'.</div>
                     <div className="text-green-400 animate-pulse"><span className="text-slate-500">[2023-10-27 10:46:10]</span> System ready. Listening for new jobs... <span className="animate-pulse">_</span></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;