import { supabase } from '../lib/supabase';
import type { UserRole } from '../contexts/AuthContext';
import type { 
  Unit, 
  UnitImport, 
  CreateUnitData, 
  UpdateUnitData, 
  UnitFilters, 
  FileUploadData,
  ImportPreview,
  ImportOptions
} from '../types/unit';
import { STANDARD_COLUMN_MAPPINGS } from '../types/unit';

// Helper function to get user role with three-role system
const getUserRole = (employee: { role: string }): string => {
  // Use the role from the database
  const role = employee.role;
  
  // Validate and return typed role
  if (role === 'admin' || role === 'developer' || role === 'agent') {
    return role as UserRole;
  }
  
  // Legacy role mapping for backward compatibility
  if (role === 'manager' || role === 'staff') {
    return 'developer'; // Legacy roles become developers
  }
  
  console.warn('Unknown role:', role, 'defaulting to developer');
  return 'developer'; // Safe fallback
};

export const unitService = {
  // Get units for a project
  async getUnits(projectId: string, filters?: UnitFilters): Promise<Unit[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);

    let query = supabase
      .from('units')
      .select(`
        *,
        projects!inner(organization_id, status)
      `)
      .eq('project_id', projectId);

    // Filter based on NEW three-role system:
    // - Agents: can see units from published projects from any organization
    // - Developers: can only see units from their own organization's projects
    // - Admins: can see units from all projects system-wide
    if (userRole === 'agent') {
      query = query.eq('projects.status', 'published');
    } else if (userRole === 'admin') {
      // System admin can see all units - no filter needed
    } else { // userRole === 'developer'
      query = query.eq('projects.organization_id', employee.organization_id);
    }

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
      query = query.or('unit_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%');
    }

    const { data, error } = await query.order('unit_number');
    if (error) throw error;
    
    // Cleaned debug logs
    
    return data || [];
  },

  // Get single unit
  async getUnit(unitId: string): Promise<Unit> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);

    let query = supabase
      .from('units')
      .select(`
        *,
        projects!inner(organization_id, status)
      `)
      .eq('id', unitId);

    // Filter based on NEW three-role system:
    // - Agents: can see units from published projects from any organization
    // - Developers: can only see units from their own organization's projects
    // - Admins: can see units from all projects system-wide
    if (userRole === 'agent') {
      query = query.eq('projects.status', 'published');
    } else if (userRole === 'admin') {
      // System admin can see all units - no filter needed
    } else { // userRole === 'developer'
      query = query.eq('projects.organization_id', employee.organization_id);
    }

    const { data, error } = await query.single();

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

  // Smart header detection algorithm
  detectHeadersAndData(rawData: any[][]): { headerRowIndex: number; dataStartIndex: number; columnHeaders: string[] } {
    console.log('🔍 Starting smart header detection...');
    
    // Look for the transition from header-like content to data-like content
    let headerRowIndex = 0;
    let dataStartIndex = 1;
    
    // Check each row to determine if it's a header or data
    for (let i = 0; i < Math.min(rawData.length, 10); i++) { // Check first 10 rows max
      const row = rawData[i];
      if (!row || row.length === 0) continue;
      
      const isHeaderRow = this.isHeaderRow(row, i);
      const isDataRow = this.isDataRow(row, i);
      
      console.log(`Row ${i}:`, { 
        isHeaderRow, 
        isDataRow, 
        content: row.slice(0, 5),
        fullRow: row 
      });
      
      if (isDataRow && !isHeaderRow) {
        // Found first data row, previous row was likely the header
        dataStartIndex = i;
        headerRowIndex = Math.max(0, i - 1);
        console.log(`🎯 Found data row at ${i}, setting header to row ${headerRowIndex}`);
        break;
      } else if (isHeaderRow) {
        // This is a header row, continue looking
        headerRowIndex = i;
        dataStartIndex = i + 1;
        console.log(`🎯 Found header row at ${i}, data starts at ${dataStartIndex}`);
      }
    }
    
    // Get column headers from the detected header row
    const headerRow = rawData[headerRowIndex] || [];
    const columnHeaders = headerRow.map((cell, index) => {
      if (cell && typeof cell === 'string' && cell.trim()) {
        return cell.trim();
      } else {
        return `Column_${index + 1}`;
      }
    });
    
    console.log('🎯 Header detection complete:', {
      headerRowIndex,
      dataStartIndex,
      columnHeaders: columnHeaders.slice(0, 5) // Show first 5 columns
    });
    
    return { headerRowIndex, dataStartIndex, columnHeaders };
  },

  // Check if a row looks like a header row
  isHeaderRow(row: any[], rowIndex: number): boolean {
    if (!row || row.length === 0) return false;
    
    // Count non-empty cells
    const nonEmptyCells = row.filter(cell => cell !== null && cell !== undefined && cell !== '');
    if (nonEmptyCells.length === 0) return false;
    
    // Check for common header patterns - be VERY specific
    const textCells = nonEmptyCells.filter(cell => typeof cell === 'string');
    const hasHeaderKeywords = textCells.some(cell => {
      const lower = cell.toLowerCase();
      // Only match exact header words, not data values
      return lower === 'unit' || 
             lower === 'unit no' ||
             lower === 'unit no.' ||
             lower === 'unit number' ||
             lower === 'unit code' ||
             lower === 'tower' ||
             lower === 'level' ||
             lower === 'unit category' ||
             lower === 'unit sub type' ||
             lower === 'unit view' ||
             lower === 'area' ||
             lower === 'price' ||
             lower === 'project' ||
             lower === 'product' ||
             lower === 'floor' ||
             lower === 'floor nu' ||
             lower === 'flat' ||
             lower === 'number of room' ||
             lower === 'saleable area' ||
             lower === 'plot s' ||
             lower === 'price per' ||
             lower === 'location/view' ||
             lower === 'suite area' ||
             lower === 'terrace/balcony are' ||
             lower === 'unit st' ||
             lower === 'status' ||
             lower === 'availability';
    });
    
    // Check if most cells are text (typical for headers)
    const textRatio = textCells.length / nonEmptyCells.length;
    
    // For normal Excel sheets, if it's the first row and has mostly text, it's likely a header
    if (rowIndex === 0 && textRatio > 0.8) {
      console.log(`Row ${rowIndex} identified as header: first row with ${textRatio} text ratio`);
      return true;
    }
    
    // Only consider it a header if it has specific header keywords AND is early in the file
    const isEarlyRow = rowIndex < 3;
    const isHeader = hasHeaderKeywords && textRatio > 0.7 && isEarlyRow;
    
    if (isHeader) {
      console.log(`Row ${rowIndex} identified as header: has keywords and ${textRatio} text ratio`);
    }
    
    return isHeader;
  },

  // Check if a row looks like a data row
  isDataRow(row: any[], rowIndex: number): boolean {
    if (!row || row.length === 0) return false;
    
    // Count non-empty cells
    const nonEmptyCells = row.filter(cell => cell !== null && cell !== undefined && cell !== '');
    if (nonEmptyCells.length === 0) return false;
    
    // Check for numeric data patterns
    const numericCells = nonEmptyCells.filter(cell => {
      if (typeof cell === 'number') return true;
      if (typeof cell === 'string') {
        // Check if it's a number (including with commas)
        const cleaned = cell.replace(/,/g, '');
        return !isNaN(parseFloat(cleaned)) && isFinite(parseFloat(cleaned));
      }
      return false;
    });
    
    // Check for unit number patterns (like 101, 102, 105, etc.)
    const hasUnitNumbers = nonEmptyCells.some(cell => {
      if (typeof cell === 'number') {
        return cell >= 100 && cell <= 9999; // Typical unit number range
      }
      if (typeof cell === 'string') {
        // Check for unit number patterns like "WG4-103", "TH-13", etc.
        return /^[A-Z]{2,4}-\d+/.test(cell) || /^\d{3,4}$/.test(cell);
      }
      return false;
    });
    
    // Check for project names (like "Weybridge Gardens", "Knightsbridge Park")
    const hasProjectNames = nonEmptyCells.some(cell => {
      if (typeof cell === 'string') {
        const lower = cell.toLowerCase();
        return lower.includes('gardens') || 
               lower.includes('park') || 
               lower.includes('residence') ||
               lower.includes('tower') ||
               lower.includes('villa') ||
               lower.includes('apartment') ||
               lower.includes('downtown');
      }
      return false;
    });
    
    // Data rows typically have more numbers and unit numbers
    const numericRatio = numericCells.length / nonEmptyCells.length;
    
    // A row is data if it has:
    // 1. Some numeric content (prices, areas, etc.) OR
    // 2. Unit numbers OR
    // 3. Project names (but not if it's clearly a header)
    const isData = (numericRatio > 0.2 || hasUnitNumbers || hasProjectNames) && rowIndex > 0;
    
    // But exclude rows that are clearly headers (all text, no numbers)
    const isAllText = numericRatio === 0 && !hasUnitNumbers;
    
    if (isData && !isAllText) {
      console.log(`Row ${rowIndex} identified as data: numericRatio=${numericRatio}, hasUnitNumbers=${hasUnitNumbers}, hasProjectNames=${hasProjectNames}`);
    }
    
    return isData && !isAllText;
  },

  // Smart data end detection - find where unit data ends and additional info begins
  detectDataEnd(rawData: any[][], dataStartIndex: number): number {
    console.log('🔍 Starting smart data end detection...');
    
    // For normal Excel sheets, be more conservative - only stop on clear indicators
    let consecutiveEmptyRows = 0;
    let footerKeywordCount = 0;
    
    for (let i = dataStartIndex; i < rawData.length; i++) {
      const row = rawData[i];
      
      console.log(`Checking row ${i + 1}:`, row.slice(0, 5));
      
      // 1. Empty row detection - require 2+ consecutive empty rows for normal sheets
      if (this.isEmptyRow(row)) {
        consecutiveEmptyRows++;
        console.log(`Found empty row ${consecutiveEmptyRows} at ${i + 1}`);
        
        // Only stop if we have 2+ consecutive empty rows (stronger indicator)
        if (consecutiveEmptyRows >= 2) {
          console.log(`✅ Found ${consecutiveEmptyRows} consecutive empty rows at ${i + 1} - data ends here`);
          return i - consecutiveEmptyRows + 1; // Go back to first empty row
        }
      } else {
        consecutiveEmptyRows = 0; // Reset counter
      }
      
      // 2. Footer keywords - require multiple occurrences for normal sheets
      if (this.containsFooterKeywords(row)) {
        footerKeywordCount++;
        console.log(`Found footer keywords (count: ${footerKeywordCount}) at row ${i + 1}`);
        
        // Only stop if we find multiple footer keyword rows (stronger indicator)
        if (footerKeywordCount >= 2) {
          console.log(`✅ Found ${footerKeywordCount} footer keyword rows at ${i + 1} - data ends here`);
          return i - footerKeywordCount + 1; // Go back to first footer row
        }
      } else {
        footerKeywordCount = 0; // Reset counter
      }
      
      // 3. Content pattern change - be more conservative
      if (i > dataStartIndex + 5) { // Only check after we have some data rows
        if (this.isContentPatternChange(row, rawData.slice(dataStartIndex, i))) {
          console.log(`✅ Found content pattern change at row ${i + 1} - data ends here`);
          return i;
        }
      }
    }
    
    console.log('✅ No data end detected - using all rows');
    return rawData.length;
  },

  // Check if a row is empty or mostly empty
  isEmptyRow(row: any[]): boolean {
    if (!row || row.length === 0) return true;
    
    const nonEmptyCells = row.filter(cell => 
      cell !== null && cell !== undefined && cell !== '' && String(cell).trim() !== ''
    );
    
    // Consider row empty if less than 2 cells have content
    return nonEmptyCells.length < 2;
  },

  // Check if row contains footer/additional info keywords
  containsFooterKeywords(row: any[]): boolean {
    if (!row || row.length === 0) return false;
    
    const allText = row.join(' ').toLowerCase();
    const footerKeywords = [
      'option', 'discount', 'payment plan', 'commission', 'handover', 
      'down payment', 'construction', 'post payment', 'cash payment',
      'summary', 'total', 'terms', 'conditions', 'note', 'description',
      'full cash payment', 'phpp', 'registration fees'
    ];
    
    return footerKeywords.some(keyword => allText.includes(keyword));
  },

  // Check if row represents a content pattern change (from data to descriptive text)
  isContentPatternChange(row: any[], previousDataRows: any[][]): boolean {
    if (!row || row.length === 0 || previousDataRows.length === 0) return false;
    
    // Get sample of previous data rows to compare patterns
    const sampleSize = Math.min(10, previousDataRows.length); // Increased sample size
    const sampleRows = previousDataRows.slice(-sampleSize);
    
    // Check if current row has significantly different structure
    const currentRowText = row.join(' ').toLowerCase();
    const currentRowLength = currentRowText.length;
    
    // If current row is much longer than typical data rows, it's likely descriptive text
    const avgDataRowLength = sampleRows.reduce((sum, dataRow) => {
      return sum + dataRow.join(' ').toLowerCase().length;
    }, 0) / sampleRows.length;
    
    // Be more conservative - require 5x longer than average (was 3x)
    if (currentRowLength > avgDataRowLength * 5) {
      console.log(`Content pattern change: row length ${currentRowLength} vs avg ${avgDataRowLength}`);
      return true;
    }
    
    // Check for bullet points or descriptive formatting - be more specific
    const hasBulletPoints = row.some(cell => {
      const cellStr = String(cell);
      return cellStr.includes('•') || 
             (cellStr.includes('-') && cellStr.length > 20) || // Only long dashes
             (cellStr.includes('*') && cellStr.length > 20);   // Only long asterisks
    });
    
    if (hasBulletPoints) {
      console.log('Content pattern change: bullet points detected');
      return true;
    }
    
    return false;
  },

  // Process Excel files with smart column mapping
  async processExcelFile(file: File): Promise<ImportPreview> {
    try {
      // Dynamic import of XLSX
      const XLSX = await import('xlsx');
      
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Get raw data as array of arrays to preserve row structure
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
      
      console.log('=== SMART EXCEL PROCESSING ===');
      console.log('File name:', file.name);
      console.log('Total raw rows:', rawData.length);
      console.log('First few raw rows:', rawData.slice(0, 5));

      if (rawData.length === 0) {
        throw new Error('Excel file is empty');
      }

      // Smart header detection
      const { headerRowIndex, dataStartIndex, columnHeaders } = this.detectHeadersAndData(rawData);
      
      console.log('🎯 Smart Detection Results:');
      console.log('- Header row index:', headerRowIndex);
      console.log('- Data starts at row:', dataStartIndex);
      console.log('- Column headers:', columnHeaders);
      console.log('- Raw data first 5 rows:', rawData.slice(0, 5));
      console.log('- Header row content:', rawData[headerRowIndex]);

      // Smart data end detection - find where unit data ends
      const dataEndIndex = this.detectDataEnd(rawData, dataStartIndex);
      console.log(`🎯 Data end detected at row ${dataEndIndex + 1}`);
      
      // Extract only the unit data rows (between dataStartIndex and dataEndIndex)
      const unitDataRows = rawData.slice(dataStartIndex, dataEndIndex);
      console.log('📊 Unit data rows count:', unitDataRows.length);
      console.log('First unit data row:', unitDataRows[0]);
      console.log('Last unit data row:', unitDataRows[unitDataRows.length - 1]);

      if (unitDataRows.length === 0) {
        throw new Error('No unit data rows found after smart detection');
      }

      // Convert unit data rows to objects using detected headers
      const units = unitDataRows.map((row, index) => {
        const unit: any = {
          unit_number: null,
          status: 'available',
          custom_fields: {}
        };

        // STEP 1: Store ALL columns in custom_fields using proper header names
        columnHeaders.forEach((header, colIndex) => {
          const value = row[colIndex];
          if (value !== null && value !== undefined && value !== '') {
            unit.custom_fields[header] = typeof value === 'string' 
              ? value.trim() 
              : value;
          }
        });

      // STEP 2: Extract standard fields if possible

        // Find unit_number (required)
        const unitNumCol = columnHeaders.find(c => {
          const lower = c.toLowerCase().replace(/\s+/g, '');
          return lower.includes('unitnumber') || 
                 lower.includes('unit') ||
                 lower.includes('propertynumber') ||
                 lower.includes('number');
        });
        
        unit.unit_number = unitNumCol && unit.custom_fields[unitNumCol]
          ? String(unit.custom_fields[unitNumCol]).trim()
          : `UNIT-${index + 1}`;

        // Extract floor
        const floorCol = columnHeaders.find(c => 
          c.toLowerCase().includes('floor')
        );
        if (floorCol && unit.custom_fields[floorCol]) {
          const floorVal = parseInt(String(unit.custom_fields[floorCol]));
          if (!isNaN(floorVal)) unit.floor_number = floorVal;
        }

        // Extract area (prefer Sq.Ft)
        const areaCol = columnHeaders.find(c => {
          const lower = c.toLowerCase();
          return lower.includes('sq.ft') || 
                 lower.includes('sqft') ||
                 lower.includes('total') && lower.includes('size');
        });
        if (areaCol && unit.custom_fields[areaCol]) {
          const areaVal = parseFloat(String(unit.custom_fields[areaCol]));
          if (!isNaN(areaVal) && areaVal > 0) {
            unit.area_sqft = areaVal;
          }
        }

        // Extract price (base price, not discounted)
        const priceCol = columnHeaders.find(c => {
          const lower = c.toLowerCase();
          return (lower.includes('price') && !lower.includes('discount')) ||
                 lower.includes('phpp');
        });
        if (priceCol && unit.custom_fields[priceCol]) {
          const priceVal = parseFloat(String(unit.custom_fields[priceCol]).replace(/,/g, ''));
          if (!isNaN(priceVal) && priceVal > 0) {
            unit.price = priceVal;
          }
        }

        // Extract unit type and bedrooms
        const typeCol = columnHeaders.find(c => 
          c.toLowerCase().includes('type') || 
          c.toLowerCase().includes('br')
        );
        if (typeCol && unit.custom_fields[typeCol]) {
          unit.unit_type = String(unit.custom_fields[typeCol]).trim();
          
          // Extract bedroom count
          const typeStr = String(unit.custom_fields[typeCol]);
          const bedroomMatch = typeStr.match(/(\d+)\s*(bed|br)/i);
          if (bedroomMatch) {
            unit.bedrooms = parseInt(bedroomMatch[1]);
          } else if (typeStr.toLowerCase().includes('studio')) {
            unit.bedrooms = 0;
          }
        }

      return unit;
    });

      // Create column mapping for display
      const columnMapping: Record<string, string> = {};
      const customFieldsConfig = columnHeaders.map(col => {
        const lower = col.toLowerCase();
        
        // Determine display type
        let type = 'text';
        if (lower.includes('price') || lower.includes('discount')) {
          type = 'currency';
        } else if (lower.includes('area') || lower.includes('size')) {
          type = 'number';
        }

        return {
          source: col,
          label: col,
          type: type
        };
      });

    console.log('✅ Processed units:', units.length);
    console.log('📋 Sample unit:', units[0]);

      return {
        columns: columnHeaders,
        sampleData: units,
        totalRows: unitDataRows.length,
        validRows: units.length,
        errors: [],
        suggestedMapping: columnMapping,
        displayConfig: customFieldsConfig
      };

  } catch (error) {
    console.error('❌ Excel processing error:', error);
    throw new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
                suggestedMapping[cleanHeader] = 'custom_fields.${cleanHeader}';
              }
            }
          });

          const result = {
            columns: headers.filter(h => h && h.trim()),
            sampleData,
            totalRows: dataRows.length,
            validRows: dataRows.length,
            errors: [],
            suggestedMapping,
            mapping: { standard: suggestedMapping, custom: {} },
            displayConfig: headers.filter(h => h && h.trim()).map(col => ({
              source: col,
              label: col,
              type: 'text'
            }))
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

    // The sampleData now contains processed unit objects, so we can use them directly
    const unitsToInsert = importData.sampleData.map((unit, index) => {
      // Extract actual unit number from custom_fields
      let actualUnitNumber = null;
      
      // Look for unit number in various possible fields
      if (unit.custom_fields) {
        // Check common unit number field names
        actualUnitNumber = unit.custom_fields['__EMPTY'] || 
                          unit.custom_fields['Unit #'] || 
                          unit.custom_fields['UNIT NO.'] || 
                          unit.custom_fields['UNIT NO'] ||
                          unit.custom_fields['Unit Number'] ||
                          unit.custom_fields['unit_number'];
      }
      
      // Ensure each unit has the required fields
      const processedUnit = {
        ...unit,
        project_id: projectId,
        status: unit.status || 'available',
        // Use actual unit number from Excel or generate unique one
        unit_number: actualUnitNumber || `UNIT-${projectId.slice(-8)}-${index + 1}`,
        custom_fields: unit.custom_fields || {}
      };

      console.log(`Unit ${index + 1}:`, processedUnit);
      console.log(`Custom fields:`, processedUnit.custom_fields);
      console.log(`Extracted unit number:`, actualUnitNumber);
      return processedUnit;
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
      // First, check what units exist for this project
      console.log('Checking existing units for project:', projectId);
      const { data: existingUnits, error: checkError } = await supabase
        .from('units')
        .select('id, unit_number')
        .eq('project_id', projectId);
      
      console.log('Existing units:', existingUnits);
      console.log('Check error:', checkError);
      
      // Delete existing units first
      console.log('Deleting existing units for project:', projectId);
      const { data: deleteData, error: deleteError } = await supabase
        .from('units')
        .delete()
        .eq('project_id', projectId)
        .select();
      
      console.log('Delete result:', { deleteData, deleteError });
      
      if (deleteError) {
        console.error('Error deleting existing units:', deleteError);
        throw deleteError;
      }
      
      console.log('Successfully deleted existing units');
      
      // Add a small delay to ensure deletion is processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
          uniqueUnitNumber = '${unit.unit_number}-${counter}';
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
