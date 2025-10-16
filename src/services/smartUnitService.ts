import { supabase } from '../lib/supabase';

// Smart schema inference for unit data
export interface UnitRow {
  id?: string;
  tower?: string;
  unit_number?: string;
  floor?: string | number;
  floor_number?: number; // Support existing column name
  bedrooms_raw?: string;
  bedrooms?: number;
  area_total?: number;
  area_suite?: number;
  area_balcony?: number;
  price?: number;
  status_raw?: string;
  status?: 'available' | 'sold' | 'reserved' | 'blocked' | 'unknown';
  unit_view?: string;
  unit_type?: string;
  unit_code?: string;
  raw_data?: any;
  custom_fields?: Record<string, any>;
  [key: string]: any; // Allow additional fields
}

export interface UnitSummary {
  total: number;
  byStatus: Record<string, number>;
  byBedrooms: Record<string, number>;
  byFloor: Record<string, number>;
  byTower: Record<string, number>;
  byView?: Record<string, number>;
  confidence: {
    headerMapping: number;
    dataQuality: number;
    overall: number;
  };
}

// Header mapping patterns with fuzzy matching support
const HEADER_MAPPINGS = [
  // Tower/Project
  { pattern: /tower|building|block|project|tower\s*name|building\s*name/i, field: 'tower' },
  
  // Unit identification
  { pattern: /unit\s*(no|#|code|number|numb)|flat\s*no|apartment/i, field: 'unit_number' },
  
  // Floor/Level
  { pattern: /floor|level|storey/i, field: 'floor' },
  
  // Bedrooms/Unit type
  { pattern: /bedroom|br|bhk|unit\s*type|number\s*of\s*rooms|room|^type$|unit\s*category/i, field: 'bedrooms_raw' },
  
  // Areas
  { pattern: /total\s*area|saleable\s*area|area(\s*sq|\s*sq\.?ft\.?)?$/i, field: 'area_total' },
  { pattern: /suite\s*area|suite\/sqf|suite(\s*sq\.?ft\.?)?/i, field: 'area_suite' },
  { pattern: /balcony\s*area|terrace\s*area|balcony\/sqf|terrace\/sqf/i, field: 'area_balcony' },
  
  // Price
  { pattern: /price|unit\s*price|phpp\s*price|per\s*sq/i, field: 'price' },
  
  // Status
  { pattern: /status|availability|available|sold|reserved/i, field: 'status_raw' },
  
  // View/Location
  { pattern: /view|location|unit\s*view/i, field: 'unit_view' },
  
  // Unit code/identifier
  { pattern: /unit\s*code|code/i, field: 'unit_code' },
  
  // Unit sub type
  { pattern: /unit\s*sub\s*type|sub\s*type/i, field: 'unit_type' }
];

// Normalize bedroom count from various formats
function normalizeBedrooms(value: string): number | null {
  if (!value) return null;
  
  const normalized = value.toString().toLowerCase().trim();
  
  // Studio variations
  if (/studio|sstudio|stduio/i.test(normalized)) return 0;
  
  // Word-based numbers e.g., "onebedroom", "two bed room"
  const wordsToNum: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10
  };
  const wordMatch = normalized.match(/(one|two|three|four|five|six|seven|eight|nine|ten)\s*(bed|bedroom|br|b)/i);
  if (wordMatch) {
    const w = wordMatch[1].toLowerCase();
    return Math.min(10, Math.max(0, wordsToNum[w] ?? 0));
  }
  // Compact word forms like "onebedroom", "twobedroom"
  for (const w in wordsToNum) {
    if (normalized.includes(`${w}bed`)) return wordsToNum[w];
  }
  
  // Extract number from patterns like "1 BR", "2 BHK", "3 Bedroom", "1B-E"
  const bedroomMatch = normalized.match(/(\d+)\s*(br|bhk|bed|bedroom|b)/i);
  if (bedroomMatch) {
    const count = parseInt(bedroomMatch[1], 10);
    return Math.min(10, Math.max(0, count)); // Cap at 10 bedrooms
  }
  
  // Try to extract from unit type codes like "1B-E", "2B-F"
  const typeMatch = normalized.match(/(\d+)b/i);
  if (typeMatch) {
    return parseInt(typeMatch[1], 10);
  }
  
  return null;
}

// Normalize status from various formats
function normalizeStatus(value: string): 'available' | 'sold' | 'reserved' | 'blocked' | 'unknown' {
  if (!value) return 'unknown';
  
  const normalized = value.toString().toLowerCase().trim();
  
  if (/avail/i.test(normalized)) return 'available';
  if (/sold|sale/i.test(normalized)) return 'sold';
  if (/reserv|book/i.test(normalized)) return 'reserved';
  if (/block|hold/i.test(normalized)) return 'blocked';
  
  return 'unknown';
}

// Normalize floor number from various formats
function normalizeFloor(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const normalized = value.toString().trim();
  
  // Extract number from patterns like "L04", "Level 4", "Floor 1"
  const floorMatch = normalized.match(/(\d+)/);
  return floorMatch ? parseInt(floorMatch[1], 10) : 0;
}

// Normalize numeric values (areas, prices)
function normalizeNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Remove commas and convert to number
  const cleaned = value.toString().replace(/[,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Calculate Levenshtein distance for fuzzy string matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLength - distance) / maxLength;
}

// Map headers to canonical field names
function mapHeaders(headers: string[]): { [key: string]: string } {
  const mapping: { [key: string]: string } = {};
  const usedFields = new Set<string>();
  
  for (const header of headers) {
    const normalizedHeader = header.trim().toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    
    for (const mappingPattern of HEADER_MAPPINGS) {
      const score = calculateSimilarity(normalizedHeader, mappingPattern.pattern.source);
      
      // Also check if the pattern matches the header directly
      const directMatch = mappingPattern.pattern.test(header);
      
      const finalScore = directMatch ? 1 : score;
      
      if (finalScore > bestScore && finalScore > 0.6 && !usedFields.has(mappingPattern.field)) {
        bestMatch = mappingPattern.field;
        bestScore = finalScore;
      }
    }
    
    if (bestMatch) {
      mapping[header] = bestMatch;
      usedFields.add(bestMatch);
    }
  }
  
  return mapping;
}

// Process raw data rows into normalized UnitRow objects
function processRows(rawData: any[][], headerMapping: { [key: string]: string }, projectName?: string): UnitRow[] {
  if (rawData.length === 0) return [];
  
  const processedRows: UnitRow[] = [];
  
  for (const row of rawData) {
    const unitRow: UnitRow = {};
    
    // Map each column value to the corresponding field
    for (let i = 0; i < row.length && i < Object.keys(headerMapping).length; i++) {
      const header = Object.keys(headerMapping)[i];
      const field = headerMapping[header];
      const value = row[i];
      
      if (value !== undefined && value !== null && value !== '') {
        unitRow[field] = value;
      }
    }
    
    // Apply normalizations
    if (unitRow.bedrooms_raw) {
      unitRow.bedrooms = normalizeBedrooms(unitRow.bedrooms_raw);
    }
    
    if (unitRow.status_raw) {
      unitRow.status = normalizeStatus(unitRow.status_raw);
    }
    
    if (unitRow.floor) {
      unitRow.floor = normalizeFloor(unitRow.floor);
    }
    
    if (unitRow.area_total) {
      unitRow.area_total = normalizeNumber(unitRow.area_total);
    }
    
    if (unitRow.area_suite) {
      unitRow.area_suite = normalizeNumber(unitRow.area_suite);
    }
    
    if (unitRow.area_balcony) {
      unitRow.area_balcony = normalizeNumber(unitRow.area_balcony);
    }
    
    if (unitRow.price) {
      unitRow.price = normalizeNumber(unitRow.price);
    }
    
    // If no tower/project found in data, use the project name
    if (!unitRow.tower && projectName) {
      unitRow.tower = projectName;
    }
    
    // Only include rows that have at least a unit identifier
    if (unitRow.unit_number || unitRow.unit_code) {
      processedRows.push(unitRow);
    }
  }
  
  return processedRows;
}

// Generate summary statistics from processed unit data
function generateSummary(units: UnitRow[]): UnitSummary {
  const total = units.length;
  
  // Group by status
  const byStatus: Record<string, number> = {};
  units.forEach(unit => {
    const status = unit.status || 'unknown';
    byStatus[status] = (byStatus[status] || 0) + 1;
  });
  
  // Group by bedrooms
  const byBedrooms: Record<string, number> = {};
  units.forEach(unit => {
    const bedrooms = unit.bedrooms !== null ? unit.bedrooms : -1;
    const key = bedrooms === -1 ? 'unknown' : bedrooms.toString();
    byBedrooms[key] = (byBedrooms[key] || 0) + 1;
  });
  
  // Group by floor
  const byFloor: Record<string, number> = {};
  units.forEach(unit => {
    const floor = unit.floor || unit.floor_number || 0;
    byFloor[floor.toString()] = (byFloor[floor.toString()] || 0) + 1;
  });
  
  // Group by tower
  const byTower: Record<string, number> = {};
  units.forEach(unit => {
    const tower = unit.tower || 'Unspecified';
    byTower[tower] = (byTower[tower] || 0) + 1;
  });
  
  // Calculate confidence scores
  const hasRequiredFields = units.filter(u => u.unit_number || u.unit_code).length / total;
  const hasStatusInfo = units.filter(u => u.status && u.status !== 'unknown').length / total;
  const hasBedroomInfo = units.filter(u => u.bedrooms !== null).length / total;
  
  const dataQuality = (hasRequiredFields + hasStatusInfo + hasBedroomInfo) / 3;
  const headerMapping = Math.min(1, Object.keys(HEADER_MAPPINGS).length / 10); // Rough estimate
  
  return {
    total,
    byStatus,
    byBedrooms,
    byFloor,
    byTower,
    confidence: {
      headerMapping,
      dataQuality,
      overall: (headerMapping + dataQuality) / 2
    }
  };
}

// Main function to process unit data from Excel/CSV
export async function processUnitData(
  rawData: any[][], 
  headers: string[], 
  projectName?: string
): Promise<{ units: UnitRow[]; summary: UnitSummary }> {
  console.log('Processing unit data with headers:', headers);
  
  // Map headers to canonical fields
  const headerMapping = mapHeaders(headers);
  console.log('Header mapping:', headerMapping);
  
  // Process rows
  const units = processRows(rawData, headerMapping, projectName);
  console.log('Processed units:', units.length);
  
  // Generate summary
  const summary = generateSummary(units);
  console.log('Generated summary:', summary);
  
  return { units, summary };
}

// Save processed unit data to database
export async function saveUnitData(projectId: string, units: UnitRow[], summary: UnitSummary): Promise<void> {
  try {
    // Save units to the existing units table
    const { error: unitsError } = await supabase
      .from('units')
      .upsert(
        units.map(unit => ({
          project_id: projectId,
          unit_number: unit.unit_number || `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          unit_code: unit.unit_code,
          floor_number: unit.floor, // Map to existing column
          bedrooms: unit.bedrooms,
          area_total: unit.area_total,
          area_suite: unit.area_suite,
          area_balcony: unit.area_balcony,
          price: unit.price,
          status: unit.status || 'unknown',
          unit_view: unit.unit_view,
          unit_type: unit.unit_type,
          tower: unit.tower,
          raw_data: unit, // Store original data for reference
          custom_fields: {
            // Store additional smart processing data in custom_fields
            smart_processing: true,
            tower: unit.tower,
            unit_code: unit.unit_code,
            area_suite: unit.area_suite,
            area_balcony: unit.area_balcony,
            unit_view: unit.unit_view,
            bedrooms_raw: unit.bedrooms_raw,
            status_raw: unit.status_raw
          }
        })),
        { onConflict: 'project_id,unit_number' }
      );
    
    if (unitsError) {
      console.error('Error saving units:', unitsError);
      throw unitsError;
    }
    
    // Save summary to project metadata
    const { error: summaryError } = await supabase
      .from('projects')
      .update({ 
        unit_summary: summary,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
    
    if (summaryError) {
      console.error('Error saving summary:', summaryError);
      throw summaryError;
    }
    
    console.log('Successfully saved unit data and summary');
  } catch (error) {
    console.error('Failed to save unit data:', error);
    throw error;
  }
}

// Helper: try to find a bedroom-bearing text from custom fields (case-insensitive)
function findBedroomSource(
  customFields?: Record<string, any>,
  unitType?: string
): string | undefined {
  if (!customFields) return unitType;

  // 1) Prefer keys that obviously refer to bedrooms/rooms/type/category
  const keyPattern = /(bed|bhk|room|type|category)/i;
  for (const key of Object.keys(customFields)) {
    if (keyPattern.test(key)) {
      const v = customFields[key];
      if (typeof v === 'string' && v.trim() !== '') return v;
    }
  }

  // 2) Fallback: search values that look like "1 BHK", "2BR", etc.
  const valuePattern = /(\d+)\s*(bhk|br|bed|bedroom|b)/i;
  for (const key of Object.keys(customFields)) {
    const v = customFields[key];
    if (typeof v === 'string' && valuePattern.test(v)) return v;
  }

  return unitType;
}

// Get unit summary for a project
export async function getUnitSummary(projectId: string): Promise<UnitSummary | null> {
  try {
    // First try to get the pre-computed summary from projects table
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('unit_summary')
      .eq('id', projectId)
      .single();
    
    if (projectData?.unit_summary) {
      const cached: UnitSummary = projectData.unit_summary as UnitSummary;
      // If cached summary looks valid, return it; otherwise, fall through to recompute
      const bedroomKeys = cached.byBedrooms ? Object.keys(cached.byBedrooms) : [];
      const allUnknown = bedroomKeys.length > 0 && bedroomKeys.every(k => k === 'unknown');
      const unknownEqualsTotal = (cached.byBedrooms?.unknown || 0) === cached.total;
      if (!allUnknown && !unknownEqualsTotal) {
        console.log('Found pre-computed unit summary');
        return cached;
      }
      console.log('Cached summary has only unknown bedrooms; recomputing with improved inference...');
    }
    
    // If no pre-computed summary, or cached is stale, check existing units and generate summary
    const { data: unitsData, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .eq('project_id', projectId);
    
    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      return null;
    }
    
    if (!unitsData || unitsData.length === 0) {
      console.log('No units found for project');
      return null;
    }
    
    console.log(`Found ${unitsData.length} existing units, generating summary...`);
    
    // Transform existing units to UnitRow format with fallback inference for bedrooms
    const existingUnits: UnitRow[] = unitsData.map(unit => {
      // try to infer bedrooms if missing
      let inferredBedrooms: number | undefined = unit.bedrooms;
      if (inferredBedrooms === null || inferredBedrooms === undefined) {
        const source = findBedroomSource(unit.custom_fields, unit.unit_type);
        const n = source ? normalizeBedrooms(String(source)) : null;
        if (n !== null) inferredBedrooms = n;
      }

      return {
        id: unit.id,
        tower: unit.tower || unit.custom_fields?.tower,
        unit_number: unit.unit_number,
        unit_code: unit.unit_code || unit.custom_fields?.unit_code,
        floor: unit.floor_number,
        bedrooms: inferredBedrooms,
        bedrooms_raw: unit.custom_fields?.bedrooms_raw,
        area_total: unit.area_total,
        area_suite: unit.area_suite || unit.custom_fields?.area_suite,
        area_balcony: unit.area_balcony || unit.custom_fields?.area_balcony,
        price: unit.price,
        status: unit.status,
        status_raw: unit.custom_fields?.status_raw,
        unit_view: unit.unit_view || unit.custom_fields?.unit_view,
        unit_type: unit.unit_type,
        raw_data: unit.raw_data,
        custom_fields: unit.custom_fields
      };
    });
    
    // Generate summary from existing units
    const summary = generateSummary(existingUnits);
    
    // Save the generated summary to the projects table for future use
    try {
      await supabase
        .from('projects')
        .update({ 
          unit_summary: summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
      console.log('Saved generated unit summary to projects table');
    } catch (saveError) {
      console.warn('Could not save unit summary:', saveError);
      // Continue anyway, return the generated summary
    }
    
    return summary;
  } catch (error) {
    console.error('Failed to get unit summary:', error);
    return null;
  }
}

// Get units for a project
export async function getUnits(projectId: string): Promise<UnitRow[]> {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('project_id', projectId)
      .order('floor_number', { ascending: true })
      .order('unit_number', { ascending: true });
    
    if (error) {
      console.error('Error fetching units:', error);
      return [];
    }
    
    // Transform the data to match UnitRow interface
    return (data || []).map(unit => ({
      id: unit.id,
      tower: unit.tower || unit.custom_fields?.tower,
      unit_number: unit.unit_number,
      unit_code: unit.unit_code || unit.custom_fields?.unit_code,
      floor: unit.floor_number,
      bedrooms: unit.bedrooms,
      bedrooms_raw: unit.custom_fields?.bedrooms_raw,
      area_total: unit.area_total,
      area_suite: unit.area_suite || unit.custom_fields?.area_suite,
      area_balcony: unit.area_balcony || unit.custom_fields?.area_balcony,
      price: unit.price,
      status: unit.status,
      status_raw: unit.custom_fields?.status_raw,
      unit_view: unit.unit_view || unit.custom_fields?.unit_view,
      unit_type: unit.unit_type,
      raw_data: unit.raw_data,
      custom_fields: unit.custom_fields
    }));
  } catch (error) {
    console.error('Failed to get units:', error);
    return [];
  }
}
