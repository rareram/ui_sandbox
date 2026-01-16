
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Editor from "@monaco-editor/react";
import { 
  FileCog, FileBraces, ShieldCheck, Save, Upload, Download, 
  Minimize, Maximize, X 
} from 'lucide-react';
import { ConfigFile } from '../../types';

interface ConfigEditorProps {
    isOpen: boolean;
    onClose: () => void;
    files: ConfigFile[];
    onSave: (updatedFiles: ConfigFile[]) => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ isOpen, onClose, files, onSave }) => {
    const { t } = useTranslation();
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [localFiles, setLocalFiles] = useState<ConfigFile[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const editorRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalFiles(JSON.parse(JSON.stringify(files))); // Deep copy to avoid mutating prop directly
            if (files.length > 0) {
                setActiveFileId(files[0].id);
            }
        }
    }, [isOpen, files]);

    // Layout adjustment for Monaco
    useEffect(() => {
        if (editorRef.current) {
            setTimeout(() => editorRef.current.layout(), 100);
        }
    }, [isFullScreen, isOpen]);

    if (!isOpen) return null;

    const activeFile = localFiles.find(f => f.id === activeFileId);

    const handleContentChange = (val: string | undefined) => {
        if (!activeFileId) return;
        setLocalFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: val || '' } : f));
    };

    const handleNameChange = (id: string, newName: string) => {
        setLocalFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeFileId) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            setLocalFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleDownload = () => {
        if (!activeFile) return;
        const blob = new Blob([activeFile.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleConfirmSave = () => {
        onSave(localFiles);
        setShowSaveDialog(false);
        onClose();
    };

    const modalClasses = isFullScreen 
        ? "fixed inset-0 z-[9999] bg-slate-900 flex flex-col" 
        : "fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4";

    const contentClasses = isFullScreen
        ? "flex flex-col w-full h-full bg-slate-900"
        : "bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200";

    return (
        <div className={isFullScreen ? modalClasses : modalClasses}>
            <div className={contentClasses}>
                {/* Header */}
                <div className="h-12 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
                    
                    {/* Tabs */}
                    <div className="flex items-center gap-1 h-full overflow-x-auto custom-scrollbar pt-1">
                        {localFiles.map(file => (
                            <button
                                key={file.id}
                                onClick={() => setActiveFileId(file.id)}
                                className={`flex items-center gap-2 px-4 h-full border-t border-x rounded-t-lg text-xs font-bold transition-all ${
                                    activeFileId === file.id 
                                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-primary border-b-transparent relative top-[1px]' 
                                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {file.name.includes('.json') ? <FileBraces size={14}/> : <FileCog size={14}/>}
                                {file.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pl-4">
                        <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Validate">
                            <ShieldCheck size={18} />
                        </button>
                        
                        <button onClick={() => setShowSaveDialog(true)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Save">
                            <Save size={18} />
                        </button>

                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        <button onClick={handleUploadClick} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Upload">
                            <Upload size={18} />
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        </button>

                        <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Download">
                            <Download size={18} />
                        </button>

                        <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>

                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors ml-2">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                {/* Editor Area */}
                <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-[#1e1e1e]">
                     <Editor
                        height="100%"
                        defaultLanguage="ini"
                        language={activeFile?.name.endsWith('.json') ? 'json' : 'ini'}
                        value={activeFile?.content || ''}
                        theme="vs-dark"
                        onMount={(editor) => { editorRef.current = editor; }}
                        options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            lineNumbers: 'on',
                            automaticLayout: true,
                            fontFamily: 'Menlo, Monaco, "Courier New", monospace'
                        }}
                        onChange={handleContentChange}
                    />
                </div>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-96 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{t('common.save')}</h3>
                        
                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {localFiles.map(file => (
                                <div key={file.id}>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                        {file.category} Filename
                                    </label>
                                    <input 
                                        type="text"
                                        className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                        value={file.name}
                                        onChange={(e) => handleNameChange(file.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <p className="text-sm text-slate-500 mb-6">
                            {t('messages.saveConfirm', { count: localFiles.length })}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowSaveDialog(false)}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                onClick={handleConfirmSave}
                                className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-blue-500/30 transition-colors"
                            >
                                {t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigEditor;
