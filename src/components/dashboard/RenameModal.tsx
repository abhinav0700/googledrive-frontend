import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const renameSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(255, 'Name is too long')
        .refine((name) => !/[<>:"/\\|?*]/.test(name), {
            message: 'Name contains invalid characters',
        }),
});

type RenameFormData = z.infer<typeof renameSchema>;

interface RenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRename: (newName: string) => Promise<void>;
    currentName: string;
    type: 'file' | 'folder';
}

export const RenameModal = ({ isOpen, onClose, onRename, currentName, type }: RenameModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<RenameFormData>({
        resolver: zodResolver(renameSchema),
        defaultValues: { name: currentName },
    });

    useEffect(() => {
        if (isOpen) {
            setValue('name', currentName);
        }
    }, [isOpen, currentName, setValue]);

    const onSubmit = async (data: RenameFormData) => {
        setIsLoading(true);
        try {
            await onRename(data.name);
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
                        <Pencil className="h-5 w-5 text-primary" />
                        Rename {type}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder={`Enter new ${type} name`}
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
                                    Renaming...
                                </>
                            ) : (
                                'Rename'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
