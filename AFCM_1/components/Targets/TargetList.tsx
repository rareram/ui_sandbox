import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_TARGETS } from '../../constants';
import { Database, Edit, Trash2, Search, Plus, ArrowRight } from 'lucide-react';

const TargetList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = MOCK_TARGETS.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.ip.includes(searchTerm)
  );

  return (
    <div className="p-6 h-full flex flex-col">
       {/* Actions Bar */}
       <div className="flex justify-end items-center mb-6">
        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder={t('common.search')}
                    className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                <Plus size={18} />
                {t('common.add')}
             </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">{t('common.dbName')} / {t('common.ip')}</div>
            <div className="col-span-2">{t('common.dbType')}</div>
            <div className="col-span-1">{t('common.port')}</div>
            <div className="col-span-2">{t('common.user')}</div>
            <div className="col-span-1">{t('common.status')}</div>
            <div className="col-span-1 text-center">{t('common.pipelineCount')}</div>
            <div className="col-span-2 text-right">{t('common.action')}</div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
            {filtered.map((target) => (
                <div key={target.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="col-span-3 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <ArrowRight size={18} className="text-blue-500 mr-1" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{target.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{target.ip}</p>
                        </div>
                    </div>
                    <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold">{target.type}</span>
                    </div>
                    <div className="col-span-1 font-mono text-sm text-slate-600 dark:text-slate-400">
                        {target.port}
                    </div>
                    <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
                        {target.user}
                    </div>
                    <div className="col-span-1">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                            target.status === 'CONNECTED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                            'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                            {target.status}
                        </span>
                    </div>
                    <div className="col-span-1 text-center font-bold text-slate-700 dark:text-slate-300">
                        {target.pipelineCount}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 opacity-100">
                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Edit size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>

         {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
            <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm outline-none">
                <option>10 rows</option>
                <option>20 rows</option>
                <option>50 rows</option>
            </select>
            <div className="flex gap-4 text-sm text-slate-500">
                <button className="hover:text-primary">{t('common.prev')}</button>
                <span>1 / 1</span>
                <button className="hover:text-primary">{t('common.next')}</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TargetList;