'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

interface BulkUploadDialogProps {
  title: string;
  description: string;
  acceptedFileTypes: string;
  columns: string[];
  onUpload: (file: File) => Promise<void>;
  triggerText: string;
}

export function BulkUploadDialog({
  title,
  description,
  acceptedFileTypes,
  columns,
  onUpload,
  triggerText,
}: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      await onUpload(file);
      setFile(null);
      setOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="file"
            accept={acceptedFileTypes}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) setFile(selectedFile);
            }}
          />
          <div className="text-sm text-muted-foreground">
            <p>El archivo debe contener las siguientes columnas:</p>
            <ul className="list-disc list-inside mt-2">
              {columns.map((column) => (
                <li key={column}>{column}</li>
              ))}
            </ul>
          </div>
          <Button className="w-full cursor-pointer" onClick={handleUpload}>
            Subir Archivo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
