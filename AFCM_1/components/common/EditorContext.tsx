
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import CDCModuleConfigurator from './CDCModuleConfigurator';
import { ConfigFile } from '../../types';

interface EditorContextType {
  openEditor: (files: ConfigFile[], onSave: (updatedFiles: ConfigFile[]) => void) => void;
  closeEditor: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<ConfigFile[]>([]);
  const [onSaveCallback, setOnSaveCallback] = useState<((updatedFiles: ConfigFile[]) => void) | null>(null);

  const openEditor = useCallback((files: ConfigFile[], onSave: (updatedFiles: ConfigFile[]) => void) => {
    setFiles(files);
    setOnSaveCallback(() => onSave);
    setIsOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsOpen(false);
    setFiles([]);
    setOnSaveCallback(null);
  }, []);

  const handleSave = (updatedFiles: ConfigFile[]) => {
    if (onSaveCallback) {
      onSaveCallback(updatedFiles);
    }
  };

  return (
    <EditorContext.Provider value={{ openEditor, closeEditor }}>
      {children}
      {/* Global Config Editor Instance - Using New CDCModuleConfigurator */}
      <CDCModuleConfigurator 
        isOpen={isOpen}
        files={files}
        onClose={closeEditor}
        onSave={handleSave}
      />
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
