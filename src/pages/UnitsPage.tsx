import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { UnitsTable } from '../components/units/UnitsTable';
import { UnitImportComponent } from '../components/units/UnitImportComponent';
import { unitService } from '../services/unitService';
import { useAuth } from '../contexts/AuthContext';
import type { Unit, UnitImport } from '../types/unit';

interface UnitsPageProps { variant?: 'desktop' | 'mobile'; initialShowImport?: boolean }
export const UnitsPage: React.FC<UnitsPageProps> = ({ variant = 'desktop', initialShowImport = false }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [importHistory, setImportHistory] = useState<UnitImport[]>([]);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [displayConfig, setDisplayConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadUnits();
      loadImportHistory();
    }
  }, [projectId]);

  // Allow external pages to open the import dialog on load (mobile deep link)
  useEffect(() => {
    if (initialShowImport) {
      setShowImport(true);
    }
  }, [initialShowImport]);

  const loadUnits = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      console.log('Loading units for project:', projectId);
      const unitsData = await unitService.getUnits(projectId);
      console.log('Loaded units data:', unitsData);
      setUnits(unitsData);
      
      // Extract custom columns from units
      const customCols = new Set<string>();
      unitsData.forEach(unit => {
        if (unit.custom_fields) {
          Object.keys(unit.custom_fields).forEach(key => {
            customCols.add(key);
          });
        }
      });
      console.log('Extracted custom columns:', Array.from(customCols));
      setCustomColumns(Array.from(customCols));
      
      // Generate default display config if no import history exists
      if (unitsData.length > 0 && customCols.size > 0) {
        const defaultDisplayConfig = Array.from(customCols).map(col => ({
          source: col,
          label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: 'text' as const
        }));
        console.log('Generated default display config:', defaultDisplayConfig);
        setDisplayConfig(defaultDisplayConfig);
      }
    } catch (err) {
      console.error('Error loading units:', err);
      setError(err instanceof Error ? err.message : 'Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  const loadImportHistory = async () => {
    if (!projectId) return;
    
    try {
      console.log('Loading import history for project:', projectId);
      const history = await unitService.getImportHistory(projectId);
      console.log('Loaded import history:', history);
      setImportHistory(history);
      
      // Get display config from the latest import
      if (history.length > 0) {
        const latestImport = history[0];
        console.log('Latest import:', latestImport);
        if (latestImport.column_mapping && latestImport.column_mapping.display_config) {
          console.log('Setting display config:', latestImport.column_mapping.display_config);
          setDisplayConfig(latestImport.column_mapping.display_config);
        }
      }
    } catch (err) {
      console.error('Failed to load import history:', err);
    }
  };

  const handleImportComplete = () => {
    console.log('Import completed, refreshing data...');
    setShowImport(false);
    // Add a small delay to ensure the database has been updated
    setTimeout(() => {
      loadUnits();
      loadImportHistory();
    }, 1000);
  };

  const handleEditUnit = (unit: Unit) => {
    // Navigate to edit unit page
    navigate(`/projects/${projectId}/units/${unit.id}/edit`);
  };

  const handleDeleteUnit = async (unit: Unit) => {
    if (!confirm(`Are you sure you want to delete unit ${unit.unit_number}?`)) {
      return;
    }

    try {
      await unitService.deleteUnit(unit.id);
      loadUnits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete unit');
    }
  };

  const handleViewUnit = (unit: Unit) => {
    // Navigate to unit details page
    navigate(`/projects/${projectId}/units/${unit.id}`);
  };

  const handleExport = () => {
    try {
      console.log('Exporting units:', units);
      
      if (units.length === 0) {
        alert('No units to export');
        return;
      }

      // Create CSV headers
      const standardHeaders = ['Unit Number', 'Unit Type', 'Floor Number', 'Price', 'Status', 'Notes'];
      const customHeaders = customColumns.map(col => col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      const headers = [...standardHeaders, ...customHeaders];

      // Create CSV rows
      const csvRows = units.map(unit => {
        const standardData = [
          unit.unit_number || '',
          unit.unit_type || '',
          unit.floor_number || '',
          unit.price || '',
          unit.status || '',
          unit.notes || ''
        ];
        
        const customData = customColumns.map(col => {
          const value = unit.custom_fields?.[col];
          return value !== null && value !== undefined ? String(value) : '';
        });
        
        return [...standardData, ...customData];
      });

      // Combine headers and data
      const csvContent = [headers, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `units_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (!projectId) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Project ID not found</div>
      </div>
    );
  }

  return (
    <div className={variant === 'mobile' ? 'space-y-6' : 'p-6 space-y-6'}>
      {/* Header */}
      {variant === 'desktop' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {role === 'agent' ? 'Project Units' : 'Units Management'}
              </h1>
              <p className="text-gray-600">
                {role === 'agent' ? 'View available units for this project' : 'Manage units for this project'}
              </p>
            </div>
          </div>
          {/* Only show management buttons for developers */}
          {role !== 'agent' && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowImport(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Units
              </Button>
              <Button
                onClick={() => navigate(`/projects/${projectId}/units/new`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Import History - Only show for developers */}
      {importHistory.length > 0 && role !== 'agent' && (
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importHistory.slice(0, 5).map((importRecord) => (
                <div key={importRecord.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{importRecord.source_file_name}</div>
                    <div className="text-sm text-gray-600">
                      {importRecord.import_type.toUpperCase()} • {importRecord.total_rows} rows • 
                      {importRecord.units_created} created, {importRecord.units_updated} updated
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(importRecord.imported_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Units Table */}
      <UnitsTable
        units={units}
        loading={loading}
        customColumns={customColumns}
        displayConfig={displayConfig}
        onEdit={handleEditUnit}
        onDelete={handleDeleteUnit}
        onView={handleViewUnit}
        onImport={() => setShowImport(true)}
        onExport={handleExport}
        role={role}
      />



      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Import Units</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowImport(false)}
                >
                  Close
                </Button>
              </div>
              <UnitImportComponent
                projectId={projectId}
                onImportComplete={handleImportComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
