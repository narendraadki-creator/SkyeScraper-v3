export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_purpose: 'brochure' | 'floor_plan' | 'unit_data' | 'image' | 'document';
  file_size: number;
  public_url: string;
  uploaded_at: string;
}
