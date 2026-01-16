import React from 'react';

const ColumnItem = ({ name, type, icon, active = false }: any) => (
  <div className={`group flex items-center justify-between p-2 rounded hover:bg-white dark:hover:bg-[#21262d] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-grab active:cursor-grabbing transition-colors ${active ? 'opacity-50' : ''}`}>
    <div className="flex items-center gap-2 overflow-hidden">
      <span className={`material-symbols-outlined text-[16px] ${active ? 'text-primary' : 'text-slate-400'}`}>
        {active ? 'check' : icon}
      </span>
      <div className="flex flex-col truncate">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{name}</span>
        <span className="text-[10px] text-slate-400 font-mono">{type}</span>
      </div>
    </div>
    {!active && <span className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 text-[16px]">drag_indicator</span>}
    {active && <span className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 text-[16px]">input</span>}
  </div>
);

const MappingRow = ({ source, target, status }: any) => {
    let statusIcon = 'link';
    let statusColor = 'text-primary';
    let bg = 'hover:bg-slate-50 dark:hover:bg-[#2a303c]';
    
    if (status === 'warning') {
        statusIcon = 'warning';
        statusColor = 'text-amber-500';
    } else if (status === 'active') {
        bg = 'bg-blue-50 dark:bg-blue-900/20';
        statusIcon = 'link';
        statusColor = 'text-blue-700 dark:text-blue-300';
    }

    return (
        <div className={`flex justify-between items-center px-2 py-1.5 rounded text-sm ${bg} transition-colors cursor-pointer`}>
            {source && <span className={status === 'active' ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-slate-600 dark:text-slate-300'}>{source}</span>}
             <span className={`material-symbols-outlined text-[14px] ${statusColor}`}>{statusIcon}</span>
             {target && <span className={status === 'active' ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-slate-600 dark:text-slate-300'}>{target}</span>}
        </div>
    )
}


const Wizard = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        {/* Header */}
      <div className="flex-none bg-white dark:bg-[#111318] border-b border-slate-200 dark:border-border-dark px-6 py-4">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a className="text-slate-500 dark:text-[#9da6b8] hover:text-primary transition-colors flex items-center gap-1" href="#">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              1. Select Source & Target
            </a>
            <span className="text-slate-400 dark:text-[#585f6e] material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] filled">radio_button_checked</span>
              2. Table & Column Mapping
            </span>
            <span className="text-slate-400 dark:text-[#585f6e] material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-slate-400 dark:text-[#585f6e] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">radio_button_unchecked</span>
              3. Key Configuration
            </span>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-black leading-tight tracking-tight">New Comparison Job: Finance_Q3_Migration</h1>
            <p className="text-slate-500 dark:text-[#9da6b8] text-sm mt-1">Map source columns to target columns and define comparison keys.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-slate-100 dark:bg-[#292e38] hover:bg-slate-200 dark:hover:bg-[#363b47] text-slate-700 dark:text-white gap-2 text-sm font-bold transition-all border border-slate-200 dark:border-transparent">
              <span className="material-symbols-outlined text-[18px]">magic_button</span>
              <span>Auto-Map Columns</span>
            </button>
            <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-slate-100 dark:bg-[#292e38] hover:bg-slate-200 dark:hover:bg-[#363b47] text-slate-700 dark:text-white gap-2 text-sm font-bold transition-all border border-slate-200 dark:border-transparent">
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside className="w-72 flex-none flex flex-col bg-slate-50 dark:bg-[#161b22] border-r border-slate-200 dark:border-border-dark">
          <div className="p-4 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-[#161b22]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-500">database</span>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Source</h3>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white truncate">Orders_West_DB</div>
            <div className="text-xs text-slate-500 mt-1">Schema: SALES_PROD</div>
          </div>
          <div className="p-3 border-b border-slate-200 dark:border-border-dark">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
              <input className="w-full bg-slate-100 dark:bg-[#0d1117] text-slate-900 dark:text-white text-sm rounded-md pl-9 pr-3 py-1.5 border-none focus:ring-1 focus:ring-primary placeholder-slate-400" placeholder="Search columns..." type="text" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <ColumnItem name="ORDER_ID" type="NUMBER(10)" icon="key" />
            <ColumnItem name="ORDER_DATE" type="TIMESTAMP" icon="calendar_today" />
            <ColumnItem name="CUSTOMER_NAME" type="VARCHAR2(100)" icon="person" />
            <ColumnItem name="TOTAL_AMOUNT" type="NUMBER(12,2)" icon="attach_money" />
          </div>
        </aside>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#0d1117] relative overflow-hidden">
           <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#1e232e] rounded-full shadow-lg border border-slate-200 dark:border-border-dark px-4 py-1.5 flex items-center gap-4 z-20">
            <span className="text-xs font-semibold text-slate-500 uppercase">View Mode:</span>
            <button className="text-primary hover:text-blue-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </button>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <span className="material-symbols-outlined text-[20px]">table_rows</span>
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">3 Mappings Active</span>
          </div>

          <div className="flex-1 relative overflow-auto p-8 flex justify-between items-start" style={{ backgroundImage: "radial-gradient(rgba(100, 116, 139, 0.2) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
             {/* SVG Layer */}
             <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <path d="M 320 120 C 500 120, 500 120, 680 120" fill="none" stroke="#195de6" strokeWidth="2"></path>
                <circle cx="320" cy="120" fill="#195de6" r="4"></circle>
                <circle cx="680" cy="120" fill="#195de6" r="4"></circle>

                <path d="M 320 180 C 500 180, 500 240, 680 240" fill="none" stroke="#195de6" strokeDasharray="5,5" strokeWidth="2"></path>
                <circle cx="320" cy="180" fill="#195de6" r="4"></circle>
                <circle cx="680" cy="240" fill="#195de6" r="4"></circle>

                <path d="M 320 240 C 500 240, 500 180, 680 180" fill="none" stroke="#f59e0b" strokeWidth="2"></path>
                <circle cx="320" cy="240" fill="#f59e0b" r="4"></circle>
                <circle cx="680" cy="180" fill="#f59e0b" r="4"></circle>
             </svg>

             {/* Source Card */}
             <div className="w-72 bg-white dark:bg-[#1e232e] rounded-lg shadow-xl border border-slate-200 dark:border-border-dark z-10 ml-4 mt-8">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#252b36] rounded-t-lg flex justify-between items-center">
                    <span className="font-bold text-sm dark:text-white">Orders_West_DB</span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">more_vert</span>
                </div>
                <div className="p-2 space-y-2">
                    <MappingRow source="ORDER_ID" status="active" />
                    <MappingRow source="ORDER_DATE" status="link" />
                    <MappingRow source="CUSTOMER_NAME" status="warning" />
                    <div className="flex justify-between items-center px-2 py-1.5 rounded text-slate-600 dark:text-slate-300 text-sm opacity-50">
                        <span>TOTAL_AMOUNT</span>
                    </div>
                </div>
             </div>

             {/* Target Card */}
             <div className="w-72 bg-white dark:bg-[#1e232e] rounded-lg shadow-xl border border-slate-200 dark:border-border-dark z-10 mr-4 mt-8">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#252b36] rounded-t-lg flex justify-between items-center">
                    <span className="font-bold text-sm dark:text-white">All_Orders_Data_Whse</span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">more_vert</span>
                </div>
                <div className="p-2 space-y-2">
                    <MappingRow target="O_ID" status="active" />
                    <MappingRow target="CUST_FULL_NAME" status="warning" />
                    <MappingRow target="O_TIMESTAMP" status="link" />
                    <div className="flex justify-between items-center px-2 py-1.5 rounded text-slate-600 dark:text-slate-300 text-sm border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-transparent">
                        <span className="text-xs text-slate-400 italic">Drop here to map...</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Bottom Key Config */}
          <div className="h-64 border-t border-slate-200 dark:border-border-dark bg-white dark:bg-[#111318] flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
            <div className="px-6 py-3 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-[#161b22]">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">vpn_key</span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Key Selection & Configuration</h3>
                </div>
                 <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">1 Warning</span>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Comparison Key Type</label>
                        <select className="w-full bg-white dark:bg-[#1e232e] border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 mb-4">
                            <option>Primary Key (PK_Orders)</option>
                            <option>Unique Index (UIX_Order_Date)</option>
                            <option>Custom Key Definition</option>
                        </select>
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-md p-3 flex gap-3 items-start">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] mt-0.5">info</span>
                            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                                The primary key <span className="font-mono font-bold">PK_Orders</span> consists of <span className="font-bold">ORDER_ID</span>. Ensure this column is mapped correctly to a unique column in the target table to avoid comparison errors.
                            </p>
                        </div>
                     </div>
                     <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-[#1e232e] dark:text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">Key Column</th>
                                    <th className="px-4 py-3">Mapped Target</th>
                                    <th className="px-4 py-3 text-center">Use for Comparison</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-[#161b22]">
                                <tr className="hover:bg-slate-50 dark:hover:bg-[#1e232e]">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-amber-500">key</span> ORDER_ID
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">O_ID</td>
                                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary dark:bg-gray-700 dark:border-gray-600" /></td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-[#1e232e]">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-transparent">key</span> ORDER_DATE
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">O_TIMESTAMP</td>
                                    <td className="px-4 py-3 text-center"><input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary dark:bg-gray-700 dark:border-gray-600" /></td>
                                </tr>
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <aside className="w-72 flex-none flex flex-col bg-slate-50 dark:bg-[#161b22] border-l border-slate-200 dark:border-border-dark">
            <div className="p-4 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-[#161b22]">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-purple-500">storage</span>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Target</h3>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white truncate">All_Orders_Data_Whse</div>
                <div className="text-xs text-slate-500 mt-1">Schema: DWH_CORE</div>
            </div>
             <div className="p-3 border-b border-slate-200 dark:border-border-dark">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
                    <input className="w-full bg-slate-100 dark:bg-[#0d1117] text-slate-900 dark:text-white text-sm rounded-md pl-9 pr-3 py-1.5 border-none focus:ring-1 focus:ring-primary placeholder-slate-400" placeholder="Search columns..." type="text" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 <ColumnItem name="O_ID" type="INT" active />
                 <ColumnItem name="O_TIMESTAMP" type="DATETIME" active />
                 <ColumnItem name="CUST_FULL_NAME" type="VARCHAR(255)" active />
                 <ColumnItem name="TOTAL_AMT" type="DECIMAL(14,2)" icon="numbers" />
                 <ColumnItem name="REGION_CODE" type="CHAR(3)" icon="flag" />
            </div>
        </aside>
      </div>

       <footer className="flex-none border-t border-slate-200 dark:border-border-dark bg-white dark:bg-[#111318] p-4 z-50">
            <div className="max-w-[1920px] mx-auto flex justify-between items-center">
                <button className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">Cancel</button>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#292e38] transition-colors">Back</button>
                    <button className="px-5 py-2.5 rounded-md bg-primary hover:bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        Next: Review
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </div>
            </div>
       </footer>
    </div>
  );
};

export default Wizard;