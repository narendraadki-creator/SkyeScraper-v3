import React, { useEffect, useState } from 'react';
import { fileService } from '../../services/fileService';
import type { ProjectFile } from '../../types/file';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  Download, 
  Trash2, 
  Share2, 
  MessageCircle,
  Mail,
  Copy
} from 'lucide-react';

interface FileListProps {
  projectId: string;
  projectName: string;
  canDelete?: boolean;
  onUpdate?: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  projectId,
  projectName,
  canDelete = false,
  onUpdate,
}) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    console.log('🔄 Loading files for project:', projectId);
    try {
      const data = await fileService.getProjectFiles(projectId);
      console.log('📁 Files loaded:', data);
      setFiles(data);
    } catch (error) {
      console.error('❌ Load files error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      await fileService.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
      onUpdate?.();
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
      setShareMenuOpen(null);
    } catch (error) {
      alert('Failed to copy link');
    }
  };

  const groupedFiles = files.reduce((acc, file) => {
    const key = file.file_purpose;
    if (!acc[key]) acc[key] = [];
    acc[key].push(file);
    return acc;
  }, {} as Record<string, ProjectFile[]>);

  const labels = {
    brochure: 'Brochures',
    floor_plan: 'Floor Plans',
    unit_data: 'Unit Data Files',
    image: 'Images',
    document: 'Documents',
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return '📊';
    } else if (mimeType.includes('text')) {
      return '📃';
    }
    return '📎';
  };

  if (loading) return <div>Loading files...</div>;
  if (files.length === 0) return <Card><p className="text-gray-500 text-center">No files uploaded</p></Card>;

  return (
    <div className="space-y-4">
      {Object.entries(groupedFiles).map(([purpose, purposeFiles]) => (
        <Card key={purpose}>
          <h3 className="font-semibold text-gray-900 mb-3">
            {labels[purpose as keyof typeof labels]}
          </h3>

          <div className="space-y-2">
            {purposeFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-2xl flex-shrink-0">
                    {getFileIcon(file.file_name || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file_size / 1024 / 1024).toFixed(2)} MB • {file.file_purpose || 'Unknown type'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(file.public_url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <div className="relative">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShareMenuOpen(
                        shareMenuOpen === file.id ? null : file.id
                      )}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>

                    {shareMenuOpen === file.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                        <button
                          onClick={() => window.open(
                            fileService.getWhatsAppShareUrl(file.public_url, projectName),
                            '_blank'
                          )}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => window.location.href = fileService.getEmailShareUrl(file.public_url, projectName)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4 text-blue-500" />
                          Email
                        </button>
                        <button
                          onClick={() => copyLink(file.public_url)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>

                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                      className="text-error-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
