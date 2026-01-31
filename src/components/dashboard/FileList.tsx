import { motion } from 'framer-motion';
import {
  FolderClosed,
  FileText,
  FileSpreadsheet,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FileListProps {
  files: FileItem[];
  folders: Folder[];
  onOpenFile?: (file: FileItem) => void;
  onOpenFolder?: (folder: Folder) => void;
  onDownload?: (file: FileItem) => void;
  onDelete?: (item: FileItem | Folder, type: 'file' | 'folder') => void;
  onRename?: (item: FileItem | Folder, type: 'file' | 'folder') => void;
}

const iconMap: Record<FileType, typeof File> = {
  folder: FolderClosed,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  image: Image,
  video: Video,
  audio: Music,
  other: File,
};

const colorMap: Record<FileType, string> = {
  folder: 'text-file-folder',
  document: 'text-file-doc',
  spreadsheet: 'text-green-600',
  image: 'text-file-image',
  video: 'text-file-video',
  audio: 'text-file-audio',
  other: 'text-file-default',
};

export const FileList = ({
  files,
  folders,
  onOpenFile,
  onOpenFolder,
  onDownload,
  onDelete,
  onRename
}: FileListProps) => {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50%]">Name</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="w-[48px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Folders first */}
          {folders.map((folder, index) => {
            const Icon = FolderClosed;
            return (
              <motion.tr
                key={folder._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => onOpenFolder?.(folder)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", colorMap.folder)} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(folder.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell>
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
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onRename?.(folder, 'folder'); }}
                        className="gap-3"
                      >
                        <Pencil className="h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onDelete?.(folder, 'folder'); }}
                        className="gap-3 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            );
          })}

          {/* Files */}
          {files.map((file, index) => {
            const fileType = getFileType(file.mimeType);
            const Icon = iconMap[fileType];
            return (
              <motion.tr
                key={file._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (folders.length + index) * 0.02 }}
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => onOpenFile?.(file)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", colorMap[fileType])} />
                    <span className="truncate">{file.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(file.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatFileSize(file.size)}
                </TableCell>
                <TableCell>
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
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onDownload?.(file); }}
                        className="gap-3"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onRename?.(file, 'file'); }}
                        className="gap-3"
                      >
                        <Pencil className="h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onDelete?.(file, 'file'); }}
                        className="gap-3 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            );
          })}

          {/* Empty state */}
          {folders.length === 0 && files.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                No files or folders yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
