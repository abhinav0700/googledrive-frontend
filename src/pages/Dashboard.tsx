import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  List,
  ChevronRight,
  Home,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FileCard } from '@/components/dashboard/FileCard';
import { FileList } from '@/components/dashboard/FileList';
import { UploadModal } from '@/components/dashboard/UploadModal';
import { CreateFolderModal } from '@/components/dashboard/CreateFolderModal';
import { RenameModal } from '@/components/dashboard/RenameModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileItem, Folder, BreadcrumbItem } from '@/types';
import api from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Data State
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive', path: '/' }
  ]);

  // Operation State
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [renameItem, setRenameItem] = useState<{ item: FileItem | Folder, type: 'file' | 'folder' } | null>(null);

  // Fetch data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const parentId = currentPath[currentPath.length - 1].id === 'root'
        ? undefined
        : currentPath[currentPath.length - 1].id;

      const [fetchedFolders, fetchedFiles] = await Promise.all([
        api.getFolders(parentId),
        api.getFiles(parentId)
      ]);

      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [currentPath]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleUpload = useCallback(async (filesToUpload: File[]) => {
    const parentId = currentPath[currentPath.length - 1].id === 'root'
      ? undefined
      : currentPath[currentPath.length - 1].id;

    for (const file of filesToUpload) {
      setUploadingFiles(prev => new Map(prev).set(file.name, 0));

      try {
        await api.uploadFile(file, parentId, (progress) => {
          setUploadingFiles(prev => new Map(prev).set(file.name, progress));
        });
        toast.success(`${file.name} uploaded successfully`);
      } catch (error: any) {
        console.error('Upload failed:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      } finally {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(file.name);
          return newMap;
        });
      }
    }
    setIsUploadModalOpen(false);
    loadData();
  }, [currentPath, loadData]);

  const handleCreateFolder = async (name: string) => {
    try {
      const parentId = currentPath[currentPath.length - 1].id === 'root'
        ? undefined
        : currentPath[currentPath.length - 1].id;

      await api.createFolder(name, parentId);
      toast.success('Folder created');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create folder');
      throw error;
    }
  };

  const handleRenameClick = (item: FileItem | Folder, type: 'file' | 'folder') => {
    setRenameItem({ item, type });
  };

  const handleRename = async (newName: string) => {
    if (!renameItem) return;

    try {
      if (renameItem.type === 'folder') {
        await api.renameFolder(renameItem.item._id, newName);
      } else {
        await api.renameFile(renameItem.item._id, newName);
      }
      toast.success('Renamed successfully');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to rename item');
    }
  };

  const handleOpenFolder = (folder: Folder) => {
    setCurrentPath(prev => [...prev, { id: folder._id, name: folder.name, path: folder.path }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
  };

  const handleDownload = async (file: FileItem) => {
    try {
      toast.info(`Downloading ${file.name}...`);
      const { url } = await api.getDownloadUrl(file._id);

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download file');
    }
  };

  const handleOpenFile = async (file: FileItem) => {
    try {
      const { url } = await api.getDownloadUrl(file._id);
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      toast.error('Failed to open file');
    }
  };

  const handleDelete = async (item: FileItem | Folder, type: 'file' | 'folder') => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      if (type === 'folder') {
        await api.deleteFolder(item._id);
      } else {
        await api.deleteFile(item._id);
      }
      toast.success(`${item.name} deleted`);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${item.name}`);
    }
  };

  return (
    <DashboardLayout
      onNewFolder={() => setIsFolderModalOpen(true)}
      onUpload={() => setIsUploadModalOpen(true)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm">
          {currentPath.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                  index === currentPath.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {index === 0 && <Home className="h-4 w-4" />}
                {index > 0 && <FolderOpen className="h-4 w-4" />}
                {item.name}
              </button>
            </div>
          ))}
        </nav>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              viewMode === 'grid' && "bg-background shadow-sm"
            )}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              viewMode === 'list' && "bg-background shadow-sm"
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="file-grid"
          >
            {folders.map((folder) => (
              <FileCard
                key={folder._id}
                item={folder}
                type="folder"
                onOpen={() => handleOpenFolder(folder)}
                onDelete={() => handleDelete(folder, 'folder')}
                onRename={() => handleRenameClick(folder, 'folder')}
              />
            ))}
            {files.map((file) => (
              <FileCard
                key={file._id}
                item={file}
                type="file"
                onOpen={() => handleOpenFile(file)}
                onDownload={() => handleDownload(file)}
                onDelete={() => handleDelete(file, 'file')}
                onRename={() => handleRenameClick(file, 'file')}
              />
            ))}

            {/* Empty state */}
            {folders.length === 0 && files.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-20"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No files yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Drop files here or use the New button
                </p>
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  Upload files
                </Button>
              </motion.div>
            )}

            {/* Loading state */}
            {isLoading && folders.length === 0 && files.length === 0 && (
              <div className="col-span-full flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FileList
              files={files}
              folders={folders}
              onOpenFolder={handleOpenFolder}
              onOpenFile={handleOpenFile}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onRename={handleRenameClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        uploadingFiles={uploadingFiles}
      />

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreate={handleCreateFolder}
      />

      {renameItem && (
        <RenameModal
          isOpen={!!renameItem}
          onClose={() => setRenameItem(null)}
          onRename={handleRename}
          currentName={renameItem.item.name}
          type={renameItem.type}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
