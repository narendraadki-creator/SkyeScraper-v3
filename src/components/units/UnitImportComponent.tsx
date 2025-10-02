import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Loading } from '../ui/Loading';
import type { FileUploadData, ImportPreview, ColumnMapping, ImportOptions } from '../../types/unit';
import { unitService } from '../../services/unitService';

interface UnitImportComponentProps {
  projectId: string;
  onImportComplete: () => void;
}

export const UnitImportComponent: React.FC<UnitImportComponentProps> = ({
  projectId,
  onImportComplete
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileUploadData | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    strategy: 'replace',
    updateExisting: true,
    skipErrors: false,
    validateData: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      // Validate file type
      const fileName = file.name.toLowerCase();
      const isValidType = fileName.includes('.xlsx') || 
                         fileName.includes('.xls') || 
                         fileName.includes('.csv');
      
      if (!isValidType) {
        throw new Error('Please upload Excel (.xlsx, .xls) or CSV files only.');
      }

      // Upload file
      try {
        const fileData = await unitService.uploadImportFile(file, projectId);
        setUploadedFile(fileData);
        console.log('File uploaded successfully:', fileData);
      } catch (error) {
        console.error('File upload failed:', error);
        // Continue with local file processing even if upload fails
        setUploadedFile({
          file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: null
        });
      }

      // Process file to detect columns
      const preview = await unitService.processImportFile(file);
      setImportPreview(preview);

      // Auto-generate column mappings using suggested mapping
      const mappings: ColumnMapping[] = preview.columns.map(column => ({
        sourceColumn: column,
        targetField: preview.suggestedMapping[column] || `custom_fields.${column}`,
        dataType: detectDataType(preview.sampleData[0]?.[column]),
        isRequired: ['unit_number'].includes(column.toLowerCase()),
        defaultValue: undefined
      }));

      setColumnMappings(mappings);
      
      // Skip mapping step - go directly to preview with auto-mapping
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const detectDataType = (value: any): 'string' | 'number' | 'boolean' | 'date' => {
    if (value === null || value === undefined || value === '') return 'string';
    
    if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) {
      return 'number';
    }
    
    if (typeof value === 'boolean' || 
        (typeof value === 'string' && ['true', 'false', 'yes', 'no', '1', '0'].includes(value.toLowerCase()))) {
      return 'boolean';
    }
    
    if (value instanceof Date || !isNaN(Date.parse(value))) {
      return 'date';
    }
    
    return 'string';
  };

  const handleMappingChange = (index: number, field: keyof ColumnMapping, value: any) => {
    const newMappings = [...columnMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setColumnMappings(newMappings);
  };

  const proceedToPreview = () => {
    setStep('preview');
  };

  const startImport = async () => {
    if (!importPreview || !uploadedFile) return;

    setLoading(true);
    setStep('importing');

    try {
      console.log('=== STARTING IMPORT ===');
      console.log('Project ID:', projectId);
      console.log('Import Preview:', importPreview);
      console.log('Uploaded File:', uploadedFile);
      console.log('Column Mappings:', columnMappings);
      console.log('Import Options:', importOptions);

      // Use smart mapping from the processed data
      const smartMapping = (importPreview as any).mapping || { standard: {}, custom: {} };
      const columnMapping = { ...smartMapping.standard, ...smartMapping.custom };

      console.log('Smart Mapping:', smartMapping);
      console.log('Column Mapping Object:', columnMapping);

      // Call the importUnits function
      const result = await unitService.importUnits(
        projectId,
        importPreview,
        columnMapping,
        importOptions,
        uploadedFile.fileUrl
      );

      console.log('Import result:', result);

      setStep('complete');
      onImportComplete();
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setUploadedFile(null);
    setImportPreview(null);
    setColumnMappings([]);
    setError(null);
    setStep('upload');
  };

  if (loading && step === 'upload') {
    return (
      <Card>
        <CardContent className="p-6">
          <Loading />
          <p className="text-center mt-4">Processing file...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Step */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Import Units from File</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop your file here, or click to browse
              </h3>
              <p className="text-gray-500 mb-4">
                Supports Excel (.xlsx, .xls) and CSV files
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Column Mapping Step */}
      {step === 'mapping' && importPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Map Columns</CardTitle>
            <p className="text-sm text-gray-600">
              Map your file columns to unit fields. Custom fields will be stored in the custom_fields JSONB column.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {mapping.sourceColumn}
                    </label>
                    <p className="text-xs text-gray-500">
                      Sample: {importPreview.sampleData[0]?.[mapping.sourceColumn] || 'N/A'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <select
                      value={mapping.targetField}
                      onChange={(e) => handleMappingChange(index, 'targetField', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unit_number">Unit Number</option>
                      <option value="unit_type">Unit Type</option>
                      <option value="floor_number">Floor Number</option>
                      <option value="area_sqft">Area (sqft)</option>
                      <option value="bedrooms">Bedrooms</option>
                      <option value="bathrooms">Bathrooms</option>
                      <option value="price">Price</option>
                      <option value="status">Status</option>
                      <option value="notes">Notes</option>
                      <optgroup label="Custom Fields">
                        {importPreview.columns.map(col => (
                          <option key={col} value={`custom_fields.${col}`}>
                            Custom: {col}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="w-24">
                    <select
                      value={mapping.dataType}
                      onChange={(e) => handleMappingChange(index, 'dataType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <div className="w-16">
                    <input
                      type="checkbox"
                      checked={mapping.isRequired}
                      onChange={(e) => handleMappingChange(index, 'isRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={resetImport}>
                Cancel
              </Button>
              <Button onClick={proceedToPreview}>
                Preview Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {step === 'preview' && importPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Import</CardTitle>
            <p className="text-sm text-gray-600">
              Review the data that will be imported. {importPreview.totalRows} rows found, {importPreview.validRows} valid.
              {importPreview.totalRows > 20 && (
                <span className="block mt-1 text-blue-600">
                  Showing first 20 rows as preview. All {importPreview.totalRows} rows will be imported.
                </span>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Auto-mapping notification */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Automatic Column Mapping Applied
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Columns have been automatically mapped to database fields. Standard fields are mapped directly, while custom fields will be stored in the custom_fields JSONB column.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import Strategy
                  </label>
                  <select
                    value={importOptions.strategy}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, strategy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="replace">Replace All</option>
                    <option value="merge">Merge with Existing</option>
                    <option value="append">Append Only</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={importOptions.updateExisting}
                      onChange={(e) => setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Update existing units</span>
                  </label>
                </div>
              </div>

              {/* Sample Data Preview */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {(importPreview as any).displayConfig?.map((col: any, index: number) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col.label}
                        </th>
                      )) || importPreview.columns?.map((col: string, index: number) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importPreview.sampleData.slice(0, 20).map((row: any, rowIndex: number) => (
                      <tr key={rowIndex}>
                        {(importPreview as any).displayConfig?.map((col: any, colIndex: number) => {
                          // Check both row object and custom_fields for the value
                          const value = row[col.source] || row.custom_fields?.[col.source];
                          return (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {value}
                            </td>
                          );
                        }) || importPreview.columns?.map((col: string, colIndex: number) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importPreview.errors.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        {importPreview.errors.length} rows have errors and will be skipped.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Upload Different File
              </Button>
              <Button onClick={startImport} disabled={loading}>
                {loading ? 'Importing...' : 'Import Units'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Importing Step */}
      {step === 'importing' && (
        <Card>
          <CardContent className="p-6">
            <Loading />
            <p className="text-center mt-4">Importing units...</p>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Import Complete!
            </h3>
            <p className="text-gray-600 mb-4">
              Your units have been successfully imported.
            </p>
            <Button onClick={resetImport}>
              Import Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
