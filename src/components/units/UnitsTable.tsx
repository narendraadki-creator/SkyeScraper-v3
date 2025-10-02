import React, { useState } from 'react';
import { Edit, Trash2, Eye, Filter, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { Unit, UnitFilters } from '../../types/unit';

interface DisplayConfig {
  source: string;
  label: string;
  type: 'text' | 'number' | 'currency';
}

interface UnitsTableProps {
  units: Unit[];
  loading?: boolean;
  onEdit?: (unit: Unit) => void;
  onDelete?: (unit: Unit) => void;
  onView?: (unit: Unit) => void;
  onImport?: () => void;
  onExport?: () => void;
  customColumns?: string[];
  displayConfig?: DisplayConfig[];
  role?: string;
}

export const UnitsTable: React.FC<UnitsTableProps> = ({
  units,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onImport,
  onExport,
  customColumns = [],
  displayConfig,
  role
}) => {
  console.log('UnitsTable received props:', {
    units: units.length,
    loading,
    customColumns,
    displayConfig
  });
  console.log('Units data:', units);
  const [filters, setFilters] = useState<UnitFilters>({});
  const [sortField, setSortField] = useState<string>('unit_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // Helper functions for dynamic table
  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (type === 'currency') {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Number(value));
    }

    if (type === 'number') {
      return new Intl.NumberFormat('en-US').format(Number(value));
    }

    return String(value);
  };

  const getValue = (unit: Unit, source: string) => {
    // Handle undefined or null source
    if (!source) {
      console.log(`Source is undefined/null`);
      return null;
    }
    
    console.log(`Looking for "${source}" in unit:`, unit);
    console.log(`Available keys in custom_fields:`, unit.custom_fields ? Object.keys(unit.custom_fields) : 'none');
    
    // Simply return the value from custom_fields using the exact source name
    if (unit.custom_fields && unit.custom_fields[source] !== undefined) {
      console.log(`Found "${source}":`, unit.custom_fields[source]);
      return unit.custom_fields[source];
    }
    
    // Try with trimmed source (remove leading/trailing spaces)
    const trimmedSource = source.trim();
    if (unit.custom_fields && unit.custom_fields[trimmedSource] !== undefined) {
      console.log(`Found "${trimmedSource}":`, unit.custom_fields[trimmedSource]);
      return unit.custom_fields[trimmedSource];
    }
    
    console.log(`NOT FOUND: "${source}"`);
    return null;
  };

  // Dynamic columns based on displayConfig - no rigid structure
  const dynamicColumns = displayConfig && displayConfig.length > 0 
    ? displayConfig
        .filter(col => col.source || col.key) // Filter out columns with undefined source/key
        .map(col => ({ 
          key: col.source || col.key, 
          label: col.label, 
          sortable: true,
          type: col.type 
        }))
    : [];

  console.log('Dynamic columns:', dynamicColumns);
  console.log('Display config:', displayConfig);
  console.log('First displayConfig item:', displayConfig[0]);
  console.log('DisplayConfig items with source:', displayConfig.filter(col => col.source));

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: 'green', label: 'Available' },
      held: { color: 'yellow', label: 'Held' },
      sold: { color: 'red', label: 'Sold' },
      reserved: { color: 'blue', label: 'Reserved' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'gray', label: status };
    
    return (
      <Badge variant={config.color as any}>
        {config.label}
      </Badge>
    );
  };


  const getCustomFieldValue = (unit: Unit, customField: string) => {
    return unit.custom_fields?.[customField] || '-';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnits(units.map(unit => unit.id));
    } else {
      setSelectedUnits([]);
    }
  };

  const handleSelectUnit = (unitId: string, checked: boolean) => {
    if (checked) {
      setSelectedUnits(prev => [...prev, unitId]);
    } else {
      setSelectedUnits(prev => prev.filter(id => id !== unitId));
    }
  };

  const filteredAndSortedUnits = React.useMemo(() => {
    let filtered = units;

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(unit => unit.status === filters.status);
    }
    if (filters.unit_type) {
      filtered = filtered.filter(unit => unit.unit_type === filters.unit_type);
    }
    if (filters.floor_number) {
      filtered = filtered.filter(unit => unit.floor_number === filters.floor_number);
    }
    if (filters.price_min) {
      filtered = filtered.filter(unit => (unit.price || 0) >= filters.price_min!);
    }
    if (filters.price_max) {
      filtered = filtered.filter(unit => (unit.price || 0) <= filters.price_max!);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(unit => 
        unit.unit_number.toLowerCase().includes(searchLower) ||
        (unit.notes && unit.notes.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField.startsWith('custom_fields.')) {
        const customField = sortField.replace('custom_fields.', '');
        aValue = a.custom_fields?.[customField];
        bValue = b.custom_fields?.[customField];
      } else {
        aValue = a[sortField as keyof Unit];
        bValue = b[sortField as keyof Unit];
      }

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [units, filters, sortField, sortDirection]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading units...</div>
        </CardContent>
      </Card>
    );
  }

  // If we have displayConfig, use dynamic table
  if (displayConfig && displayConfig.length > 0) {
    console.log('Using dynamic table with displayConfig:', displayConfig);
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Units ({filteredAndSortedUnits.length})</CardTitle>
            <div className="flex space-x-2">
              {/* Only show Import button for developers */}
              {role !== 'agent' && onImport && (
                <Button variant="outline" size="sm" onClick={onImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              )}
              {/* Export button available for both agents and developers */}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search units..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              options={[
                { value: '', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'held', label: 'Held' },
                { value: 'sold', label: 'Sold' },
                { value: 'reserved', label: 'Reserved' }
              ]}
            />
            <Select
              value={filters.unit_type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, unit_type: e.target.value || undefined }))}
              options={[
                { value: '', label: 'All Types' },
                { value: 'Apartment', label: 'Apartment' },
                { value: 'Villa', label: 'Villa' },
                { value: 'Townhouse', label: 'Townhouse' },
                { value: 'Penthouse', label: 'Penthouse' },
                { value: 'Studio', label: 'Studio' },
                { value: 'Commercial', label: 'Commercial' }
              ]}
            />
            <Input
              type="number"
              placeholder="Floor"
              value={filters.floor_number || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, floor_number: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>

          {/* Dynamic Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {dynamicColumns.map((col, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUnits.map((unit, unitIndex) => {
                  console.log(`Rendering unit ${unitIndex}:`, unit);
                  return (
                    <tr key={unit.id || unitIndex}>
                      {dynamicColumns.map((col, colIndex) => {
                        console.log(`Rendering column ${colIndex}:`, col);
                        const value = getValue(unit, col.key);
                        const formattedValue = formatValue(value, col.type);
                      
                        return (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {formattedValue}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedUnits.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No units found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // If no displayConfig, show a message
  if (!displayConfig || displayConfig.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            {role === 'agent' 
              ? 'No units available for this project.'
              : 'No units data available. Please import units to see the data.'
            }
          </div>
        </CardContent>
      </Card>
    );
  }
};
