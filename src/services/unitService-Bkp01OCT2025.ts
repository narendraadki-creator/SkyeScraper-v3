import { supabase } from '../lib/supabase';
import type { 
  Unit, 
  UnitImport, 
  CreateUnitData, 
  UpdateUnitData, 
  UnitFilters, 
  UnitListResponse,
  FileUploadData,
  ImportPreview,
  ColumnMapping,
  ImportOptions,
  ImportError,
  detectDataType
} from '../types/unit';
import { STANDARD_COLUMN_MAPPINGS } from '../types/unit';

export const unitService = {
  // Get units for a project
  async getUnits(projectId: string, filters?: UnitFilters): Promise<Unit[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    let query = supabase
      .from('units')
      .select(`
        *,
        projects!inner(organization_id)
      `)
      .eq('project_id', projectId)
      .eq('projects.organization_id', employee.organization_id);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.unit_type) {
      query = query.eq('unit_type', filters.unit_type);
    }

    if (filters?.floor_number) {
      query = query.eq('floor_number', filters.floor_number);
    }

    if (filters?.price_min) {
      query = query.gte('price', filters.price_min);
    }

    if (filters?.price_max) {
      query = query.lte('price', filters.price_max);
    }

    if (filters?.search) {
      query = query.or(`unit_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('unit_number');
    if (error) throw error;
    
    console.log('Retrieved units from database:', data);
    if (data && data.length > 0) {
      console.log('First unit from database:', data[0]);
      console.log('First unit custom_fields:', data[0].custom_fields);
    }
    
    return data || [];
  },

  // Get single unit
  async getUnit(unitId: string): Promise<Unit> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        projects!inner(organization_id)
      `)
      .eq('id', unitId)
      .eq('projects.organization_id', employee.organization_id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create single unit
  async createUnit(unitData: CreateUnitData): Promise<Unit> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Verify project belongs to organization
    const { data: project } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', unitData.project_id)
      .eq('organization_id', employee.organization_id)
      .single();

    if (!project) throw new Error('Project not found or access denied');

    const { data, error } = await supabase
      .from('units')
      .insert({
        ...unitData,
        custom_fields: unitData.custom_fields || {},
        status: unitData.status || 'available'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update unit
  async updateUnit(unitId: string, unitData: UpdateUnitData): Promise<Unit> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // First verify the unit belongs to the organization
    const { data: existingUnit } = await supabase
      .from('units')
      .select(`
        id,
        projects!inner(organization_id)
      `)
      .eq('id', unitId)
      .eq('projects.organization_id', employee.organization_id)
      .single();

    if (!existingUnit) {
      throw new Error('Unit not found or access denied');
    }

    const { data, error } = await supabase
      .from('units')
      .update(unitData)
      .eq('id', unitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete unit
  async deleteUnit(unitId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // First verify the unit belongs to the organization
    const { data: existingUnit } = await supabase
      .from('units')
      .select(`
        id,
        projects!inner(organization_id)
      `)
      .eq('id', unitId)
      .eq('projects.organization_id', employee.organization_id)
      .single();

    if (!existingUnit) {
      throw new Error('Unit not found or access denied');
    }

    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId);

    if (error) throw error;
  },

  // Upload file for import
  async uploadImportFile(file: File, projectId: string): Promise<FileUploadData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `units/${employee.organization_id}/${projectId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    let fileUrl = null;
    try {
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('File upload error:', uploadError);
        console.log('Continuing without file upload...');
        // Continue without file upload
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('project-files')
          .getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }
    } catch (error) {
      console.error('Storage upload failed:', error);
      console.log('Continuing without file upload...');
    }

    return {
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: fileUrl || undefined
    };
  },

  // Process uploaded file and detect columns
  async processImportFile(file: File): Promise<ImportPreview> {
    console.log('=== PROCESS IMPORT FILE CALLED ===');
    console.log('File:', file.name);
    
    // Use the new real file processing function
    return await this.processFileWithAI(file);
  },

  // Real file processing with Excel/CSV parsing
  async processFileWithAI(file: File): Promise<ImportPreview> {
    console.log('=== PROCESSING EXCEL FILE ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.includes('.xlsx') || fileName.includes('.xls');
    const isCSV = fileName.includes('.csv');
    
    if (!isExcel && !isCSV) {
      throw new Error('Unsupported file format. Please upload Excel (.xlsx, .xls) or CSV files.');
    }

    if (isCSV) {
      // Handle CSV files
      return this.processCSVFile(file);
    } else {
      // Handle Excel files
      return this.processExcelFile(file);
    }
  },

  // Process Excel files with smart column mapping
  async processExcelFile(file: File): Promise<ImportPreview> {
    // Import XLSX library dynamically
    const XLSX = await import('xlsx');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error('Failed to read file');
          }

          // Parse Excel file
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON array of objects (not array of arrays)
          const rows = XLSX.utils.sheet_to_json(worksheet);
          
          console.log('=== SMART EXCEL PROCESSING ===');
          console.log('File name:', file.name);
          console.log('Total rows:', rows.length);
          console.log('First row:', rows[0]);

          if (rows.length === 0) {
            throw new Error('Excel file is empty');
          }

          // Get ALL columns from the first row
          const allColumns = Object.keys(rows[0] as Record<string, any>);
          console.log('All detected columns:', allColumns);

          console.log('Processing Excel columns:', allColumns);

          // Transform rows with proper custom_fields storage
          const sampleData = rows.map((row: any) => {
            const unit: any = {
              project_id: 'temp', // Will be set during import
              status: 'available',
              custom_fields: {}
            };

            // Store ALL Excel data in custom_fields first
            for (const [excelCol, value] of Object.entries(row)) {
              if (value !== undefined && value !== null && value !== '') {
                unit.custom_fields[excelCol] = value;
              }
            }

            // Now try to extract specific values to standard fields for filtering/searching
            // Extract unit_number from UNIT NO. or similar
            if (unit.custom_fields['UNIT NO.']) {
              unit.unit_number = String(unit.custom_fields['UNIT NO.']);
            } else if (unit.custom_fields['UNIT NO']) {
              unit.unit_number = String(unit.custom_fields['UNIT NO']);
            }

            // Extract floor_number from LEVEL
            if (unit.custom_fields['LEVEL']) {
              const floorValue = parseInt(String(unit.custom_fields['LEVEL']));
              if (!isNaN(floorValue)) {
                unit.floor_number = floorValue;
              }
            }

            // Extract area_sqft from AREA
            if (unit.custom_fields[' AREA ']) {
              const areaValue = parseFloat(String(unit.custom_fields[' AREA ']));
              if (!isNaN(areaValue)) {
                unit.area_sqft = areaValue;
              }
            } else if (unit.custom_fields['AREA']) {
              const areaValue = parseFloat(String(unit.custom_fields['AREA']));
              if (!isNaN(areaValue)) {
                unit.area_sqft = areaValue;
              }
            }

            // Extract price from PRICE
            if (unit.custom_fields[' PRICE ']) {
              const priceValue = parseFloat(String(unit.custom_fields[' PRICE ']));
              if (!isNaN(priceValue)) {
                unit.price = priceValue;
              }
            } else if (unit.custom_fields['PRICE']) {
              const priceValue = parseFloat(String(unit.custom_fields['PRICE']));
              if (!isNaN(priceValue)) {
                unit.price = priceValue;
              }
            }

            // Extract bedrooms from UNIT CATEGORY (e.g., "1 BEDROOM")
            if (unit.custom_fields['UNIT CATEGORY']) {
              const categoryValue = String(unit.custom_fields['UNIT CATEGORY']);
              const match = categoryValue.match(/(\d+)\s*BEDROOM/i);
              if (match) {
                unit.bedrooms = parseInt(match[1]);
              }
            }

            console.log('Processed unit:', unit);
            return unit;
          });

          // Create display configuration for UI using original Excel column names
          const displayConfig = allColumns.map(col => ({
            source: col,
            label: col.trim(), // Use original Excel column names
            type: (col.includes('AREA') || col.includes('PRICE') || col.includes('LEVEL')) ? 'number' : 'text'
          }));

          console.log('Sample processed data (first 3):', sampleData.slice(0, 3));
          console.log('Sample data length:', sampleData.length);
          console.log('Display config:', displayConfig);

          const result = {
            columns: allColumns,
            sampleData,
            totalRows: rows.length,
            validRows: rows.length,
            errors: [],
            suggestedMapping: {}, // Not used anymore
            mapping: { standard: {}, custom: {} }, // Not used anymore
            displayConfig
          };

          console.log('=== FINAL SMART RESULT ===');
          console.log('Columns:', result.columns);
          console.log('Sample data count:', result.sampleData.length);
          console.log('Mapping:', result.mapping);
          console.log('Display config:', result.displayConfig);
          console.log('=== END SMART PROCESSING ===');

          resolve(result);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Read as binary string for XLSX
      reader.readAsBinaryString(file);
    });
  },

  // Process CSV files
  async processCSVFile(file: File): Promise<ImportPreview> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          if (!csvText) {
            throw new Error('Failed to read CSV file');
          }

          // Parse CSV
          const lines = csvText.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
          }

          // Extract headers
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          console.log('CSV headers:', headers);

          // Extract data rows
          const dataRows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            return values;
          });

          console.log('CSV data rows count:', dataRows.length);

          // Convert to object format
          const sampleData = dataRows.map((row: any) => {
            const rowObj: Record<string, any> = {};
            headers.forEach((header, colIndex) => {
              if (header && header.trim()) {
                rowObj[header.trim()] = row[colIndex] || '';
              }
            });
            return rowObj;
          });

          // Generate suggested mapping
          const suggestedMapping: Record<string, string> = {};
          headers.forEach(header => {
            if (header && header.trim()) {
              const cleanHeader = header.trim();
              const standardKey = Object.keys(STANDARD_COLUMN_MAPPINGS).find(key => 
                key.toLowerCase() === cleanHeader.toLowerCase()
              );
              if (standardKey) {
                suggestedMapping[cleanHeader] = STANDARD_COLUMN_MAPPINGS[standardKey];
              } else {
                // Custom field
                suggestedMapping[cleanHeader] = `custom_fields.${cleanHeader}`;
              }
            }
          });

          const result = {
            columns: headers.filter(h => h && h.trim()),
            sampleData,
            totalRows: dataRows.length,
            validRows: dataRows.length,
            errors: [],
            suggestedMapping
          };

          console.log('CSV processing result:', result);
          resolve(result);
        } catch (error) {
          console.error('Error processing CSV file:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read CSV file'));
      };

      reader.readAsText(file);
    });
  },

  // Create import record
  async createImport(projectId: string, importData: {
    import_type: 'excel' | 'pdf' | 'csv' | 'manual' | 'api';
    import_strategy: 'replace' | 'merge' | 'append';
    source_file_name: string;
    source_file_url?: string;
    detected_columns: string[];
    column_mapping: Record<string, string>;
    custom_fields_config: string[];
    total_rows: number;
    valid_rows: number;
  }): Promise<UnitImport> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Get next version number
    const { data: lastImport } = await supabase
      .from('unit_imports')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const versionNumber = (lastImport?.version_number || 0) + 1;

    const { data, error } = await supabase
      .from('unit_imports')
      .insert({
        ...importData,
        project_id: projectId,
        imported_by: employee.id,
        version_number: versionNumber,
        is_active: true,
        processing_status: 'pending',
        units_created: 0,
        units_updated: 0,
        errors: []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Process import and create units
  async processImport(importId: string, sampleData: Record<string, any>[], options: ImportOptions): Promise<{
    unitsCreated: number;
    unitsUpdated: number;
    errors: ImportError[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Get import details
    const { data: importRecord, error: importError } = await supabase
      .from('unit_imports')
      .select('*')
      .eq('id', importId)
      .eq('imported_by', employee.id)
      .single();

    if (importError || !importRecord) throw new Error('Import record not found');

    // Update processing status
    await supabase
      .from('unit_imports')
      .update({ 
        processing_status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', importId);

    let unitsCreated = 0;
    let unitsUpdated = 0;
    const errors: ImportError[] = [];

    try {
      // Process each row
      for (let i = 0; i < sampleData.length; i++) {
        const row = sampleData[i];
        
        try {
          // Map data according to column mapping
          const unitData = this.mapRowToUnitData(row, importRecord.column_mapping);
          
          if (options.strategy === 'replace' || !unitData.unit_number) {
            // Create new unit
            const { error: createError } = await supabase
              .from('units')
              .insert({
                ...unitData,
                project_id: importRecord.project_id,
                import_version: importId,
                source_row_number: i + 1
              });

            if (createError) {
              errors.push({
                row_number: i + 1,
                field: 'general',
                error: createError.message,
                value: row
              });
            } else {
              unitsCreated++;
            }
          } else {
            // Update existing unit
            const { error: updateError } = await supabase
              .from('units')
              .update({
                ...unitData,
                import_version: importId,
                source_row_number: i + 1
              })
              .eq('project_id', importRecord.project_id)
              .eq('unit_number', unitData.unit_number);

            if (updateError) {
              errors.push({
                row_number: i + 1,
                field: 'unit_number',
                error: updateError.message,
                value: unitData.unit_number
              });
            } else {
              unitsUpdated++;
            }
          }
        } catch (rowError) {
          errors.push({
            row_number: i + 1,
            field: 'general',
            error: rowError instanceof Error ? rowError.message : 'Unknown error',
            value: row
          });
        }
      }

      // Update import record with results
      await supabase
        .from('unit_imports')
        .update({
          processing_status: 'completed',
          processing_completed_at: new Date().toISOString(),
          units_created: unitsCreated,
          units_updated: unitsUpdated,
          errors: errors
        })
        .eq('id', importId);

      return { unitsCreated, unitsUpdated, errors };
    } catch (error) {
      // Update import record with error
      await supabase
        .from('unit_imports')
        .update({
          processing_status: 'failed',
          processing_completed_at: new Date().toISOString(),
          errors: [{ row_number: 0, field: 'general', error: error instanceof Error ? error.message : 'Unknown error' }]
        })
        .eq('id', importId);

      throw error;
    }
  },

  // Map row data to unit data based on column mapping
  mapRowToUnitData(row: Record<string, any>, columnMapping: Record<string, string>): CreateUnitData {
    const unitData: CreateUnitData = {
      project_id: '', // Will be set by caller
      unit_number: '',
      custom_fields: {}
    };

    Object.entries(columnMapping).forEach(([sourceColumn, targetField]) => {
      const value = row[sourceColumn];
      
      if (targetField.startsWith('custom_fields.')) {
        const customFieldName = targetField.replace('custom_fields.', '');
        unitData.custom_fields![customFieldName] = value;
      } else {
        // Standard field
        switch (targetField) {
          case 'unit_number':
            unitData.unit_number = String(value || '');
            break;
          case 'unit_type':
            unitData.unit_type = String(value || '');
            break;
          case 'floor_number':
            unitData.floor_number = Number(value) || undefined;
            break;
          case 'area_sqft':
            unitData.area_sqft = Number(value) || undefined;
            break;
          case 'bedrooms':
            unitData.bedrooms = Number(value) || undefined;
            break;
          case 'bathrooms':
            unitData.bathrooms = Number(value) || undefined;
            break;
          case 'price':
            unitData.price = Number(value) || undefined;
            break;
          case 'status':
            unitData.status = String(value || 'available').toLowerCase() as any;
            break;
          case 'notes':
            unitData.notes = String(value || '');
            break;
        }
      }
    });

    return unitData;
  },

  // Get import history for a project
  async getImportHistory(projectId: string): Promise<UnitImport[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const { data, error } = await supabase
      .from('unit_imports')
      .select(`
        *,
        projects!inner(organization_id)
      `)
      .eq('project_id', projectId)
      .eq('projects.organization_id', employee.organization_id)
      .order('imported_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Import units from processed data
  async importUnits(
    projectId: string,
    importData: ImportPreview,
    columnMapping: Record<string, string>,
    importOptions: any,
    fileUrl: string | null
  ): Promise<UnitImport> {
    console.log('=== IMPORT UNITS DEBUG ===');
    console.log('Project ID:', projectId);
    console.log('Import Data:', importData);
    console.log('Column Mapping:', columnMapping);
    console.log('Import Options:', importOptions);
    console.log('File URL:', fileUrl);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    console.log('Employee:', employee);

    console.log('Importing units with custom_fields storage');

    // Prepare units for insertion using proper custom_fields storage
    const unitsToInsert = importData.sampleData.map((row, index) => {
      const unit: any = {
        project_id: projectId,
        status: 'available',
        custom_fields: {},
      };

      // Store ALL Excel data in custom_fields first
      for (const [excelCol, value] of Object.entries(row)) {
        if (value !== undefined && value !== null && value !== '') {
          unit.custom_fields[excelCol] = value;
        }
      }

      // Now try to extract specific values to standard fields for filtering/searching
      // Extract unit_number from UNIT NO. or similar
      if (unit.custom_fields['UNIT NO.']) {
        unit.unit_number = String(unit.custom_fields['UNIT NO.']);
      } else if (unit.custom_fields['UNIT NO']) {
        unit.unit_number = String(unit.custom_fields['UNIT NO']);
      } else {
        unit.unit_number = `UNIT-${index + 1}`;
      }

      // Extract floor_number from LEVEL
      if (unit.custom_fields['LEVEL']) {
        const floorValue = parseInt(String(unit.custom_fields['LEVEL']));
        if (!isNaN(floorValue)) {
          unit.floor_number = floorValue;
        }
      }

      // Extract area_sqft from AREA
      if (unit.custom_fields[' AREA ']) {
        const areaValue = parseFloat(String(unit.custom_fields[' AREA ']));
        if (!isNaN(areaValue)) {
          unit.area_sqft = areaValue;
        }
      } else if (unit.custom_fields['AREA']) {
        const areaValue = parseFloat(String(unit.custom_fields['AREA']));
        if (!isNaN(areaValue)) {
          unit.area_sqft = areaValue;
        }
      }

      // Extract price from PRICE
      if (unit.custom_fields[' PRICE ']) {
        const priceValue = parseFloat(String(unit.custom_fields[' PRICE ']));
        if (!isNaN(priceValue)) {
          unit.price = priceValue;
        }
      } else if (unit.custom_fields['PRICE']) {
        const priceValue = parseFloat(String(unit.custom_fields['PRICE']));
        if (!isNaN(priceValue)) {
          unit.price = priceValue;
        }
      }

      // Extract bedrooms from UNIT CATEGORY (e.g., "1 BEDROOM")
      if (unit.custom_fields['UNIT CATEGORY']) {
        const categoryValue = String(unit.custom_fields['UNIT CATEGORY']);
        const match = categoryValue.match(/(\d+)\s*BEDROOM/i);
        if (match) {
          unit.bedrooms = parseInt(match[1]);
        }
      }

      console.log(`Unit ${index + 1}:`, unit);
      console.log(`Custom fields:`, unit.custom_fields);
      return unit;
    });

    console.log('Units prepared for insertion:', unitsToInsert);
    console.log('First unit custom_fields:', unitsToInsert[0]?.custom_fields);

    // Handle import strategy
    const strategy = importOptions.strategy || 'append';
    console.log('Import strategy:', strategy);
    console.log('Import options:', importOptions);
    console.log('Strategy type:', typeof strategy);

    let insertedUnits = [];
    let unitsError = null;

    if (strategy === 'replace') {
      // Delete existing units first
      const { error: deleteError } = await supabase
        .from('units')
        .delete()
        .eq('project_id', projectId);
      
      if (deleteError) {
        console.error('Error deleting existing units:', deleteError);
        throw deleteError;
      }
      
            // Insert new units
            console.log('Inserting units to database:', unitsToInsert);
            const { data, error } = await supabase
              .from('units')
              .insert(unitsToInsert)
              .select();
            
            console.log('Database insert result:', { data, error });
            insertedUnits = data || [];
            unitsError = error;
    } else if (strategy === 'merge') {
      // Update existing units or insert new ones
      const results = [];
      for (const unit of unitsToInsert) {
        // Check if unit already exists
        const { data: existingUnit } = await supabase
          .from('units')
          .select('id')
          .eq('project_id', projectId)
          .eq('unit_number', unit.unit_number)
          .single();

        if (existingUnit) {
          // Update existing unit
          const { data, error } = await supabase
            .from('units')
            .update(unit)
            .eq('id', existingUnit.id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating unit:', error);
            throw error;
          }
          results.push(data);
        } else {
          // Insert new unit
          const { data, error } = await supabase
            .from('units')
            .insert(unit)
            .select()
            .single();
          
          if (error) {
            console.error('Error inserting unit:', error);
            throw error;
          }
          results.push(data);
        }
      }
      insertedUnits = results;
    } else {
      // Append strategy - generate unique unit numbers if conflicts exist
      const unitsWithUniqueNumbers = [];
      for (const unit of unitsToInsert) {
        let uniqueUnitNumber = unit.unit_number;
        let counter = 1;
        
        // Check if unit number already exists
        while (true) {
          const { data: existingUnit } = await supabase
            .from('units')
            .select('id')
            .eq('project_id', projectId)
            .eq('unit_number', uniqueUnitNumber)
            .single();
          
          if (!existingUnit) {
            break; // Unit number is unique
          }
          
          // Generate new unit number
          uniqueUnitNumber = `${unit.unit_number}-${counter}`;
          counter++;
        }
        
        unitsWithUniqueNumbers.push({
          ...unit,
          unit_number: uniqueUnitNumber
        });
      }
      
      // Insert units with unique numbers
      const { data, error } = await supabase
        .from('units')
        .insert(unitsWithUniqueNumbers)
        .select();
      
      insertedUnits = data || [];
      unitsError = error;
    }

    if (unitsError) {
      console.error('Error inserting units:', unitsError);
      throw unitsError;
    }

    console.log('Units inserted successfully:', insertedUnits);

    // Get the next version number for this project
    const { data: existingImports } = await supabase
      .from('unit_imports')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersionNumber = existingImports && existingImports.length > 0 
      ? existingImports[0].version_number + 1 
      : 1;

    // First, deactivate any existing active imports for this project
    // This prevents the trigger from trying to set replaced_by to a non-existent ID
    console.log('Deactivating existing imports for project:', projectId);
    const { error: deactivateError } = await supabase
      .from('unit_imports')
      .update({ is_active: false })
      .eq('project_id', projectId)
      .eq('is_active', true);
    
    if (deactivateError) {
      console.error('Error deactivating existing imports:', deactivateError);
      // Continue anyway, this is not critical
    }

    // Create unit import record with minimal required fields
    const importRecordData = {
      project_id: projectId,
      imported_by: employee.id,
      import_type: 'excel',
      import_strategy: strategy,
      source_file_name: 'imported_file.xlsx',
      source_file_url: fileUrl,
      detected_columns: importData.columns || [],
      column_mapping: {
        display_config: (importData as any).displayConfig || []
      },
      custom_fields_config: (importData as any).columns || [],
      total_rows: importData.totalRows,
      valid_rows: importData.validRows,
      units_created: insertedUnits?.length || 0,
      units_updated: 0,
      version_number: nextVersionNumber,
      processing_status: 'completed',
      processing_completed_at: new Date().toISOString(),
      is_active: true
    };

    console.log('Creating unit import record with data:', importRecordData);
    
    const { data: unitImport, error: importError } = await supabase
      .from('unit_imports')
      .insert(importRecordData)
      .select()
      .single();

    if (importError) {
      console.error('Error creating unit import record:', importError);
      throw importError;
    }

    console.log('Unit import record created:', unitImport);
    console.log('=== END IMPORT UNITS DEBUG ===');

    return unitImport;
  }
};
