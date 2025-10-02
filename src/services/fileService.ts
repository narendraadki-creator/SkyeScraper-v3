import { supabase } from '../lib/supabase';
import type { ProjectFile } from '../types/file';

// Supported file types
const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'PDF Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
  'application/vnd.ms-excel': 'Excel Spreadsheet',
  'text/csv': 'CSV File',
  'text/plain': 'Text File',
  'image/jpeg': 'JPEG Image',
  'image/jpg': 'JPG Image',
  'image/png': 'PNG Image',
  'image/gif': 'GIF Image',
  'image/webp': 'WebP Image',
};

export const fileService = {
  // Validate file type
  validateFileType(file: File, purpose: string): boolean {
    const allowedTypes = {
      unit_data: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'],
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      brochure: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
      floor_plan: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'],
    };

    const purposeTypes = allowedTypes[purpose as keyof typeof allowedTypes] || Object.keys(SUPPORTED_FILE_TYPES);
    return purposeTypes.includes(file.type);
  },

  // Get file type description
  getFileTypeDescription(mimeType: string): string {
    return SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES] || 'Unknown File Type';
  },

  async uploadFile(
    file: File,
    projectId: string,
    purpose: 'brochure' | 'floor_plan' | 'unit_data' | 'image' | 'document'
  ): Promise<ProjectFile> {
    // Validate file type
    if (!this.validateFileType(file, purpose)) {
      const allowedTypes = {
        unit_data: 'Excel files (.xlsx, .xls, .csv)',
        image: 'Image files (.jpg, .jpeg, .png, .gif, .webp)',
        brochure: 'PDF and Word documents (.pdf, .doc, .docx)',
        floor_plan: 'PDF and image files (.pdf, .jpg, .jpeg, .png, .gif, .webp)',
        document: 'PDF, Word, and text files (.pdf, .doc, .docx, .txt)',
      };
      throw new Error(`Invalid file type. Please select ${allowedTypes[purpose as keyof typeof allowedTypes] || 'a supported file type'}.`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Generate file path
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${employee.organization_id}/${projectId}/${purpose}/${timestamp}_${sanitized}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(path, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(path);

    // Save reference in database
    console.log('💾 Saving file record to database:', {
      project_id: projectId,
      organization_id: employee.organization_id,
      file_name: file.name,
      file_path: path,
      file_purpose: purpose,
      file_size: file.size,
      mime_type: file.type,
      storage_bucket: 'project-files',
      storage_path: path,
      public_url: publicUrl,
      uploaded_by: employee.id,
    });

    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        organization_id: employee.organization_id,
        file_name: file.name,
        file_path: path,
        file_purpose: purpose,
        file_size: file.size,
        mime_type: file.type,
        storage_bucket: 'project-files',
        storage_path: path,
        public_url: publicUrl,
        uploaded_by: employee.id,
      })
      .select()
      .single();

    console.log('💾 Database insert result:', { fileRecord, dbError });
    if (dbError) throw dbError;
    return fileRecord;
  },

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    console.log('🔍 Getting files for project:', projectId);
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });

    console.log('📊 Database response:', { data, error });
    if (error) throw error;
    return data || [];
  },

  async deleteFile(fileId: string): Promise<void> {
    const { data: file } = await supabase
      .from('project_files')
      .select('storage_path')
      .eq('id', fileId)
      .single();

    if (file) {
      await supabase.storage.from('project-files').remove([file.storage_path]);
    }

    await supabase.from('project_files').delete().eq('id', fileId);
  },

  getWhatsAppShareUrl(url: string, projectName: string): string {
    const msg = `Check out ${projectName}: ${url}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  },

  getEmailShareUrl(url: string, projectName: string): string {
    const subject = `${projectName} - Project Details`;
    const body = `Please find the project details here:\n${url}`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },
};
