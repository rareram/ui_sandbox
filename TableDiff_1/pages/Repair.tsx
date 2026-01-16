import React from 'react';

const RepairRow = ({ type, id, col, source, target, checked = false }: any) => {
    let typeBadge;
    if (type === 'Diff') {
        typeBadge = (
             <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning border border-warning/20">
                <span className="material-symbols-outlined text-[14px]">difference</span> Diff
             </span>
        );
    } else if (type === 'Target') {
        typeBadge = (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger border border-danger/20">
                <span className="material-symbols-outlined text-[14px]">remove_circle</span> Target
             </span>
        );
    } else {
         typeBadge = (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success border border-success/20">
                <span className="material-symbols-outlined text-[14px]">add_circle</span> Source
             </span>
        );
    }

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-surface-dark/50 transition-colors group">
            <td className="p-4">
                <input type="checkbox" defaultChecked={checked} className="rounded border-gray-300 dark:border-surface-border bg-white dark:bg-background-dark text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" />
            </td>
            <td className="p-4">{typeBadge}</td>
            <td className="p-4 text-slate-700 dark:text-white font-mono">{id}</td>
            <td className="p-4 text-slate-500 dark:text-text-secondary italic">{col}</td>
            <td className={`p-4 font-mono ${type === 'Source' ? 'bg-success/5 text-success italic' : type === 'Diff' ? 'text-slate-900 dark:text-white bg-warning/5' : 'text-slate-900 dark:text-white'}`}>
                {type === 'Source' ? 'NULL' : <span className={type === 'Diff' ? 'text-warning' : ''}>{source}</span>}
            </td>
            <td className={`p-4 font-mono ${type === 'Target' ? 'bg-danger/5 text-danger italic' : type === 'Diff' ? 'text-slate-900 dark:text-white bg-warning/5' : 'text-slate-900 dark:text-white'}`}>
                {type === 'Target' ? 'NULL' : type === 'Diff' ? <span className="text-slate-500 dark:text-text-secondary line-through opacity-70">{target}</span> : target}
            </td>
            <td className="p-4 text-center">
                <button className="text-primary hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-gray-100 dark:hover:bg-surface-border">
                    <span className="material-symbols-outlined text-[18px]">{type === 'Diff' ? 'build' : type === 'Target' ? 'add_circle' : 'delete'}</span>
                </button>
            </td>
        </tr>
    );
};

const Repair = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
         <div className="shrink-0 px-6 pt-4 pb-2 border-b border-gray-200 dark:border-surface-border bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm z-10">
            <div className="flex flex-wrap gap-2 mb-3 items-center">
                 <a className="text-slate-500 dark:text-text-secondary hover:text-primary text-xs font-medium" href="#">Home</a>
                 <span className="text-slate-400 dark:text-text-secondary text-xs">/</span>
                 <a className="text-slate-500 dark:text-text-secondary hover:text-primary text-xs font-medium" href="#">Comparisons</a>
                 <span className="text-slate-400 dark:text-text-secondary text-xs">/</span>
                 <span className="text-slate-900 dark:text-white text-xs font-medium">Job #1204</span>
            </div>
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                     <h1 className="text-slate-900 dark:text-white text-2xl font-black leading-tight tracking-[-0.033em] mb-1">Table Comparison: USERS vs USERS_BKP</h1>
                     <p className="text-slate-500 dark:text-text-secondary text-sm font-normal">Review discrepancies and apply repairs to synchronize tables.</p>
                </div>
                <div className="flex gap-4">
                     <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 dark:text-text-secondary uppercase font-semibold tracking-wider">Total Rows</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">1,402,933</span>
                    </div>
                    <div className="w-px h-10 bg-gray-200 dark:bg-surface-border"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 dark:text-text-secondary uppercase font-semibold tracking-wider">Discrepancies</span>
                        <span className="text-lg font-bold text-warning">23</span>
                    </div>
                </div>
            </div>
         </div>

         <div className="shrink-0 px-6 py-3 flex flex-wrap gap-4 items-center bg-white dark:bg-background-dark border-b border-gray-200 dark:border-surface-border justify-between">
            <div className="flex gap-3 items-center flex-1 min-w-[300px]">
                <div className="relative flex h-10 w-full max-w-md items-center">
                    <div className="absolute left-3 text-slate-400 dark:text-text-secondary flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input className="flex h-full w-full rounded-lg bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-surface-border pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Filter by PK or Column Name..." />
                </div>
            </div>
             <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button className="flex h-8 items-center gap-2 rounded-lg bg-primary text-white px-3 hover:bg-primary-hover transition-colors whitespace-nowrap">
                    <span className="text-xs font-semibold">Show All</span>
                </button>
                <button className="flex h-8 items-center gap-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border px-3 hover:bg-gray-100 dark:hover:bg-surface-border transition-colors whitespace-nowrap group">
                    <span className="w-2 h-2 rounded-full bg-warning"></span>
                    <span className="text-slate-600 dark:text-text-secondary group-hover:text-slate-900 dark:group-hover:text-white text-xs font-medium">Value Mismatches</span>
                    <span className="bg-gray-200 dark:bg-surface-border text-slate-700 dark:text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">12</span>
                </button>
                <button className="flex h-8 items-center gap-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border px-3 hover:bg-gray-100 dark:hover:bg-surface-border transition-colors whitespace-nowrap group">
                    <span className="w-2 h-2 rounded-full bg-danger"></span>
                    <span className="text-slate-600 dark:text-text-secondary group-hover:text-slate-900 dark:group-hover:text-white text-xs font-medium">Missing in Target</span>
                    <span className="bg-gray-200 dark:bg-surface-border text-slate-700 dark:text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">8</span>
                </button>
             </div>
         </div>

         <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-surface-dark/30">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 border-b border-gray-200 dark:border-surface-border w-10">
                                <input type="checkbox" className="rounded border-gray-300 dark:border-surface-border bg-white dark:bg-background-dark text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                            </th>
                            <th className="p-4 border-b border-gray-200 dark:border-surface-border text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider w-24">Type</th>
                            <th className="p-4 border-b border-gray-200 dark:border-surface-border text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Primary Key (ID)</th>
                            <th className="p-4 border-b border-gray-200 dark:border-surface-border text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Column</th>
                            <th className="p-4 border-b border-gray-200 dark:border-surface-border text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Source Value</th>
                            <th className="p-4 border-b border-gray-200 dark:border-surface-border text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Target Value</th>
                            <th className="p-4 border-b border-gray-200 dark:border-surface-border text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider w-20 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-surface-border text-sm">
                        <RepairRow type="Diff" id="10249" col="email" source="sarah.j@example.com" target="s.jones@example.com" checked />
                        <RepairRow type="Target" id="10255" col="Whole Row" source='{"id": 10255, "name": "Mark..."}' />
                        <RepairRow type="Source" id="10301" col="Whole Row" target='{"id": 10301, "name": "Ghost..."}' />
                         <RepairRow type="Diff" id="10442" col="status" source="ACTIVE" target="PENDING" />
                    </tbody>
                </table>
            </div>

            <div className="h-80 shrink-0 border-t border-gray-200 dark:border-surface-border flex flex-col md:flex-row bg-white dark:bg-background-dark">
                <div className="flex-1 border-r border-gray-200 dark:border-surface-border flex flex-col min-w-0">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-surface-dark">
                        <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-slate-500 dark:text-text-secondary text-[18px]">code</span>
                             <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SQL Preview Window</h3>
                        </div>
                         <div className="flex items-center gap-2">
                             <button className="text-xs text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-surface-border transition-colors">
                                <span className="material-symbols-outlined text-[14px]">content_copy</span> Copy
                             </button>
                         </div>
                    </div>
                     <div className="flex-1 overflow-auto bg-[#0d0f14] p-4 font-mono text-sm leading-relaxed">
                        <div className="flex">
                            <div className="flex flex-col text-text-secondary opacity-50 text-right pr-4 select-none border-r border-surface-border/50 mr-4">
                                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                            </div>
                            <div className="text-blue-300">
                                <span className="text-purple-400">UPDATE</span> USERS <span className="text-purple-400">SET</span> email = <span className="text-green-400">'sarah.j@example.com'</span> <span className="text-purple-400">WHERE</span> id = <span className="text-orange-300">10249</span>;<br/>
                                <span className="text-purple-400">INSERT INTO</span> USERS (id, name, email, status, created_at) <span class="text-purple-400">VALUES</span> (<span className="text-orange-300">10255</span>, <span className="text-green-400">'Mark...'</span>, ...);<br/>
                                <span className="text-text-secondary italic">-- Repairing missing target row</span><br/>
                                <span className="text-purple-400">UPDATE</span> USERS <span className="text-purple-400">SET</span> status = <span className="text-green-400">'ACTIVE'</span> <span className="text-purple-400">WHERE</span> id = <span className="text-orange-300">10442</span>;
                            </div>
                        </div>
                     </div>
                </div>
                 <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-surface-dark p-6 gap-6">
                    <div className="bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-surface-border rounded-lg p-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase mb-3">Post-Repair Validation</p>
                         <div className="flex items-center gap-3">
                            <div className="size-3 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                            <span className="text-slate-900 dark:text-white text-sm font-medium">Simulation Ready</span>
                        </div>
                         <p className="text-slate-500 dark:text-text-secondary text-xs mt-2">
                             3 queries generated. Click 'Repair' to execute and re-verify data integrity.
                         </p>
                    </div>
                     <div className="flex flex-col gap-3 mt-auto">
                        <button className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[18px]">build_circle</span>
                            Repair Selected Rows (3)
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-200 dark:border-surface-border bg-transparent hover:bg-gray-100 dark:hover:bg-surface-border text-slate-700 dark:text-white text-sm font-medium transition-colors">
                                <span className="material-symbols-outlined text-[18px]">playlist_play</span>
                                Repair All
                            </button>
                            <button className="flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-200 dark:border-surface-border bg-transparent hover:bg-gray-100 dark:hover:bg-surface-border text-slate-700 dark:text-white text-sm font-medium transition-colors">
                                <span className="material-symbols-outlined text-[18px]">terminal</span>
                                Extract Script
                            </button>
                        </div>
                     </div>
                 </div>
            </div>
         </div>
    </div>
  );
};

export default Repair;