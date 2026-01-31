import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, X, FileIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatFileSize } from '@/lib/file-utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  uploadingFiles: Map<string, number>;
}

export const UploadModal = ({ isOpen, onClose, onUpload, uploadingFiles }: UploadModalProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // files are handled by useDropzone state
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    multiple: true,
  });

  const pendingFiles = acceptedFiles.filter(f => !uploadingFiles.has(f.name));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Upload files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                isDragActive ? "bg-primary/10" : "bg-muted"
              )}>
                <Cloud className={cn(
                  "h-7 w-7 transition-colors",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="text-foreground font-medium">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          </div>

          {/* Uploading files list */}
          <AnimatePresence>
            {uploadingFiles.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <p className="text-sm font-medium text-foreground">Uploading...</p>
                {Array.from(uploadingFiles.entries()).map(([name, progress]) => (
                  <div key={name} className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <div className="mt-1.5 h-1.5 bg-background rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected files (not yet uploading) */}
          <AnimatePresence>
            {pendingFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <p className="text-sm font-medium text-foreground">Selected files</p>
                {pendingFiles.map((file) => (
                  <div key={file.name} className="bg-muted rounded-lg p-3 flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => onUpload([...acceptedFiles])}
              disabled={acceptedFiles.length === 0 || uploadingFiles.size > 0}
            >
              {uploadingFiles.size > 0 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${acceptedFiles.length > 0 ? `(${acceptedFiles.length})` : ''}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
