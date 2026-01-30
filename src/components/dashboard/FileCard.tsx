import { motion } from 'framer-motion';
import { 
  FolderClosed, 
  FileText, 
  Image, 
  Video, 
  Music, 
  File,
  MoreVertical,
  Download,
  Trash2,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileItem, Folder, FileType } from '@/types';
import { formatFileSize, formatDate, getFileType } from '@/lib/file-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileCardProps {
  item: FileItem | Folder;
  type: 'file' | 'folder';
  onOpen?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
}

const iconMap: Record<FileType, typeof File> = {
  folder: FolderClosed,
  document: FileText,
  image: Image,
  video: Video,
  audio: Music,
  other: File,
};

const colorMap: Record<FileType, string> = {
  folder: 'text-file-folder',
  document: 'text-file-doc',
  image: 'text-file-image',
  video: 'text-file-video',
  audio: 'text-file-audio',
  other: 'text-file-default',
};

export const FileCard = ({ item, type, onOpen, onDownload, onDelete, onRename }: FileCardProps) => {
  const isFolder = type === 'folder';
  const fileType: FileType = isFolder ? 'folder' : getFileType((item as FileItem).mimeType);
  const Icon = iconMap[fileType];
  const iconColor = colorMap[fileType];

  const name = item.name;
  const date = formatDate(item.createdAt);
  const size = isFolder ? null : formatFileSize((item as FileItem).size);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="drive-card group cursor-pointer"
      onClick={onOpen}
    >
      {/* Preview area */}
      <div className="aspect-[4/3] flex items-center justify-center bg-muted/50 rounded-t-lg border-b border-border">
        <Icon className={cn("h-16 w-16", iconColor)} />
      </div>

      {/* Info area */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate text-foreground" title={name}>
              {name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {date}
              {size && ` · ${size}`}
            </p>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isFolder && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload?.(); }} className="gap-3">
                  <Download className="h-4 w-4" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename?.(); }} className="gap-3">
                <Pencil className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }} 
                className="gap-3 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};
