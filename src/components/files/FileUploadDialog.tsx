import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { X, Upload } from 'lucide-react';
import { fileService } from '../../services/fileService';

interface FileUploadDialogProps {
  projectId: string;
  purpose: 'brochure' | 'floor_plan' | 'unit_data' | 'image' | 'document';
  onSuccess: () => void;
  onClose: () => void;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  projectId,
  purpose,
  onSuccess,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await fileService.uploadFile(file, projectId, purpose);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Upload {purpose.replace('_', ' ').toUpperCase()}</h3>
            <p className="text-sm text-gray-500">
              {purpose === 'unit_data' 
                ? 'Excel files (.xlsx, .xls, .csv)'
                : purpose === 'image'
                ? 'Image files (.jpg, .jpeg, .png, .gif, .webp)'
                : purpose === 'brochure'
                ? 'PDF and Word documents (.pdf, .doc, .docx)'
                : purpose === 'floor_plan'
                ? 'PDF and image files (.pdf, .jpg, .jpeg, .png, .gif, .webp)'
                : purpose === 'document'
                ? 'PDF, Word, and text files (.pdf, .doc, .docx, .txt)'
                : 'Supported file types'
              }
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded text-error-600 text-sm">
            {error}
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-input"
            accept={
              purpose === 'unit_data' 
                ? '.xlsx,.xls,.csv' 
                : purpose === 'image'
                ? 'image/*'
                : '.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp'
            }
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {file ? file.name : 'Click to select file'}
            </p>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            loading={uploading}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
