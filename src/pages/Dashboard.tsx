import { useState, useCallback } from 'react';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileItem, Folder, BreadcrumbItem } from '@/types';
import api from '@/services/api';

// Demo data for showcase
const demoFolders: Folder[] = [
  { _id: '1', userId: 'demo', name: 'Documents', parentFolder: null, path: '/Documents', createdAt: '2024-01-15T10:30:00Z' },
  { _id: '2', userId: 'demo', name: 'Images', parentFolder: null, path: '/Images', createdAt: '2024-01-14T09:20:00Z' },
  { _id: '3', userId: 'demo', name: 'Projects', parentFolder: null, path: '/Projects', createdAt: '2024-01-10T14:45:00Z' },
];

const demoFiles: FileItem[] = [
  { _id: 'f1', userId: 'demo', name: 'Annual Report 2024.pdf', s3Key: 'demo/report.pdf', folderPath: '/', size: 2456789, mimeType: 'application/pdf', createdAt: '2024-01-20T11:30:00Z' },
  { _id: 'f2', userId: 'demo', name: 'Presentation.pptx', s3Key: 'demo/pres.pptx', folderPath: '/', size: 5678901, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', createdAt: '2024-01-19T16:45:00Z' },
  { _id: 'f3', userId: 'demo', name: 'Team Photo.jpg', s3Key: 'demo/team.jpg', folderPath: '/', size: 1234567, mimeType: 'image/jpeg', createdAt: '2024-01-18T09:15:00Z' },
  { _id: 'f4', userId: 'demo', name: 'Meeting Notes.docx', s3Key: 'demo/notes.docx', folderPath: '/', size: 345678, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: '2024-01-17T14:20:00Z' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive', path: '/' }
  ]);
  
  // In a real app, these would come from API calls
  const [folders, setFolders] = useState<Folder[]>(demoFolders);
  const [files, setFiles] = useState<FileItem[]>(demoFiles);

  const handleUpload = useCallback(async (filesToUpload: File[]) => {
    for (const file of filesToUpload) {
      setUploadingFiles(prev => new Map(prev).set(file.name, 0));
      
      try {
        // Simulate upload progress for demo
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadingFiles(prev => new Map(prev).set(file.name, i));
        }
        
        // In real app: await api.uploadFile(file, currentFolderId, (progress) => {...})
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(file.name);
          return newMap;
        });
      }
    }
    setIsUploadModalOpen(false);
  }, []);

  const handleCreateFolder = async (name: string) => {
    try {
      // In real app: await api.createFolder(name, currentFolderId)
      const newFolder: Folder = {
        _id: Date.now().toString(),
        userId: 'demo',
        name,
        parentFolder: null,
        path: `/${name}`,
        createdAt: new Date().toISOString(),
      };
      setFolders(prev => [...prev, newFolder]);
      toast.success('Folder created');
    } catch (error) {
      toast.error('Failed to create folder');
      throw error;
    }
  };

  const handleOpenFolder = (folder: Folder) => {
    setCurrentPath(prev => [...prev, { id: folder._id, name: folder.name, path: folder.path }]);
    // In real app: fetch folder contents
    setFolders([]);
    setFiles([]);
    toast.info(`Opened ${folder.name}`);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
    // In real app: fetch folder contents for that path
    if (index === 0) {
      setFolders(demoFolders);
      setFiles(demoFiles);
    }
  };

  const handleDownload = async (file: FileItem) => {
    toast.info(`Downloading ${file.name}...`);
    // In real app: const blob = await api.downloadFile(file._id)
  };

  const handleDelete = async (item: FileItem | Folder, type: 'file' | 'folder') => {
    try {
      if (type === 'folder') {
        setFolders(prev => prev.filter(f => f._id !== item._id));
      } else {
        setFiles(prev => prev.filter(f => f._id !== item._id));
      }
      toast.success(`${item.name} deleted`);
    } catch (error) {
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
              />
            ))}
            {files.map((file) => (
              <FileCard
                key={file._id}
                item={file}
                type="file"
                onDownload={() => handleDownload(file)}
                onDelete={() => handleDelete(file, 'file')}
              />
            ))}
            
            {/* Empty state */}
            {folders.length === 0 && files.length === 0 && (
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
              onDownload={handleDownload}
              onDelete={handleDelete}
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
    </DashboardLayout>
  );
};

export default Dashboard;
