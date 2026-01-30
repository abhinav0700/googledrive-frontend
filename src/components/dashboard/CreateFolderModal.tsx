import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderClosed, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const folderSchema = z.object({
  name: z.string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name is too long')
    .refine((name) => !/[<>:"/\\|?*]/.test(name), {
      message: 'Folder name contains invalid characters',
    }),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const CreateFolderModal = ({ isOpen, onClose, onCreate }: CreateFolderModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: FolderFormData) => {
    setIsLoading(true);
    try {
      await onCreate(data.name);
      reset();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <FolderClosed className="h-5 w-5 text-file-folder" />
            New folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder name</Label>
            <Input
              id="folderName"
              placeholder="Untitled folder"
              autoFocus
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
