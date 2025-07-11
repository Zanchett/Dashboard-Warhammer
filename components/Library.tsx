import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Trash2, X } from 'lucide-react';
import { getLibraryContent, LibraryItem, deleteLibraryItem } from '@/app/actions/library';
import { useToast } from "@/components/ui/use-toast"

const Library: React.FC = () => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<LibraryItem | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchLibraryContent = async () => {
      try {
        const content = await getLibraryContent();
        setLibrary(content);
      } catch (error) {
        console.error('Error fetching library content:', error);
        setLibrary([]);
      }
    };
    fetchLibraryContent();
  }, []);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  const closeFile = () => {
    setSelectedFile(null);
  };

  const renderTreeItem = (item: LibraryItem, depth: number = 0) => {
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders.has(item.name);
    const fullPath = [...item.path, item.name];
    const childItems = library.filter(child => 
      JSON.stringify(child.path) === JSON.stringify(fullPath)
    );

    return (
      <div key={item.id} className="tree-item">
        <div 
          className="tree-line"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div 
            className="tree-content"
            onClick={() => isFolder ? toggleFolder(item.name) : setSelectedFile(item)}
          >
            {isFolder && (
              <span className="folder-icon">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </span>
            )}
            <span className="item-icon">
              {isFolder ? <Folder className="w-4 h-4" /> : <File className="w-4 h-4" />}
            </span>
            <span className="item-name">{item.name}</span>
            {!isFolder && <span className="file-size">[4.0K]</span>}
          </div>
        </div>
        {isFolder && isExpanded && childItems.map((child) => 
          renderTreeItem(child, depth + 1)
        )}
      </div>
    );
  };

  const rootItems = library.filter(item => item.path.length === 0);

  return (
    <div className="library-container">
      <h2 className="library-title">Cogitator File System</h2>
      <div className="tree-view">
        {rootItems.map((item) => renderTreeItem(item))}
      </div>
      {selectedFile && (
        <div className="file-preview">
          <div className="file-preview-header">
            <h3>{selectedFile.name}</h3>
            <button onClick={closeFile} className="close-button">
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre>{selectedFile.content}</pre>
        </div>
      )}
    </div>
  );
};

export default Library;
