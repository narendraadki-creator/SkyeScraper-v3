// Unit Management Types - Dynamic Schema Support

export interface Unit {
  id: string;
  project_id: string;
  unit_number: string;
  unit_type?: string;
  floor_number?: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  status: 'available' | 'held' | 'sold' | 'reserved';
  custom_fields: Record<string, any>; // JSONB for dynamic fields
  import_version?: string;
  source_file_id?: string;
  source_row_number?: number;
  column_mapping?: Record<string, string>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UnitImport {
  id: string;
  project_id: string;
  import_type: 'excel' | 'pdf' | 'csv' | 'manual' | 'api';
  import_strategy: 'replace' | 'merge' | 'append';
  source_file_name: string;
  source_file_url?: string;
  source_file_id?: string;
  detected_columns: string[];
  column_mapping: Record<string, string>;
  custom_fields_config: string[];
  total_rows: number;
  valid_rows: number;
  units_created: number;
  units_updated: number;
  errors: ImportError[];
  version_number: number;
  is_active: boolean;
  replaced_by?: string;
  imported_by: string;
  imported_at: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_started_at?: string;
  processing_completed_at?: string;
}

export interface ImportError {
  row_number: number;
  field: string;
  error: string;
  value?: any;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  isRequired: boolean;
  defaultValue?: any;
}

export interface FileUploadData {
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl?: string;
}

export interface ImportPreview {
  columns: string[];
  sampleData: Record<string, any>[];
  totalRows: number;
  validRows: number;
  errors: ImportError[];
  suggestedMapping: Record<string, string>;
  displayConfig?: Array<{
    source: string;
    label: string;
    type: string;
  }>;
}

// Standard column mappings for auto-detection
export const STANDARD_COLUMN_MAPPINGS: Record<string, string> = {
  // Unit Number variations
  'unit_number': 'unit_number',
  'unit number': 'unit_number',
  'unit_no': 'unit_number',
  'unit no': 'unit_number',
  'unit no.': 'unit_number',
  'unit': 'unit_number',
  'apartment': 'unit_number',
  'apartment_no': 'unit_number',
  'apartment no': 'unit_number',
  'apartment no.': 'unit_number',
  
  // Unit Type variations
  'unit_type': 'unit_type',
  'type': 'unit_type',
  'unit type': 'unit_type',
  'unit category': 'unit_type',
  'category': 'unit_type',
  'unit_category': 'unit_type',
  
  // Floor variations
  'floor_number': 'floor_number',
  'floor': 'floor_number',
  'floor no': 'floor_number',
  'floor no.': 'floor_number',
  'level': 'floor_number',
  'storey': 'floor_number',
  'story': 'floor_number',
  
  // Area variations
  'area_sqft': 'area_sqft',
  'area': 'area_sqft',
  'sqft': 'area_sqft',
  'sq ft': 'area_sqft',
  'size': 'area_sqft',
  'built_up_area': 'area_sqft',
  'built up area': 'area_sqft',
  'carpet_area': 'area_sqft',
  'carpet area': 'area_sqft',
  
  // Bedrooms variations
  'bedrooms': 'bedrooms',
  'beds': 'bedrooms',
  'bed': 'bedrooms',
  'br': 'bedrooms',
  'bedroom': 'bedrooms',
  
  // Bathrooms variations
  'bathrooms': 'bathrooms',
  'baths': 'bathrooms',
  'bath': 'bathrooms',
  'ba': 'bathrooms',
  'bathroom': 'bathrooms',
  
  // Price variations
  'price': 'price',
  'cost': 'price',
  'amount': 'price',
  'value': 'price',
  'total_price': 'price',
  'total price': 'price',
  'selling_price': 'price',
  'selling price': 'price',
  
  // Status variations
  'status': 'status',
  'availability': 'status',
  'available': 'status',
  'unit_status': 'status',
  'unit status': 'status',
  
  // Parking variations
  'parking_spaces': 'parking_spaces',
  'parking': 'parking_spaces',
  'car_parking': 'parking_spaces',
  'garage': 'parking_spaces',
  'parking_spots': 'parking_spaces',
  'parking spots': 'parking_spaces'
};

export interface CreateUnitData {
  project_id: string;
  unit_number: string;
  unit_type?: string;
  floor_number?: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  status?: 'available' | 'held' | 'sold' | 'reserved';
  custom_fields?: Record<string, any>;
  notes?: string;
}

export interface UpdateUnitData {
  unit_type?: string;
  floor_number?: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  status?: 'available' | 'held' | 'sold' | 'reserved';
  custom_fields?: Record<string, any>;
  notes?: string;
}

export interface UnitFilters {
  project_id?: string;
  status?: string;
  unit_type?: string;
  floor_number?: number;
  price_min?: number;
  price_max?: number;
  search?: string;
}

export interface UnitListResponse {
  units: Unit[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UnitServiceResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}


// Data type detection helpers
export const detectDataType = (value: any): 'string' | 'number' | 'boolean' | 'date' => {
  if (value === null || value === undefined || value === '') return 'string';
  
  // Check for number
  if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) {
    return 'number';
  }
  
  // Check for boolean
  if (typeof value === 'boolean' || 
      (typeof value === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(value.toLowerCase()))) {
    return 'boolean';
  }
  
  // Check for date
  if (value instanceof Date || !isNaN(Date.parse(value))) {
    return 'date';
  }
  
  return 'string';
};

// Import strategy types
export type ImportStrategy = 'replace' | 'merge' | 'append';

export interface ImportOptions {
  strategy: ImportStrategy;
  updateExisting: boolean;
  skipErrors: boolean;
  validateData: boolean;
}
