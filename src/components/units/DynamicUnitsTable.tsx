import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { Unit } from '../../types/unit';

interface DisplayConfig {
  source: string;
  label: string;
  type: 'text' | 'number' | 'currency';
}

interface DynamicUnitsTableProps {
  units: Unit[];
  displayConfig: DisplayConfig[];
  loading?: boolean;
  onEdit?: (unit: Unit) => void;  // Add this
  onDelete?: (unit: Unit) => void; // Add this
  showActions?: boolean;           // Add this
}

export const DynamicUnitsTable: React.FC<DynamicUnitsTableProps> = ({
  units,
  displayConfig,
  loading = false,
  onEdit,
  onDelete,
  showActions = false
}) => {
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
    // Check standard fields first
    if (unit[source as keyof Unit] !== undefined) {
      return unit[source as keyof Unit];
    }
    
    // Check custom fields
    if (unit.custom_fields && unit.custom_fields[source] !== undefined) {
      return unit.custom_fields[source];
    }
    
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading units...</div>
        </CardContent>
      </Card>
    );
  }

  if (units.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No units found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Units ({units.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {displayConfig.map((col, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {units.map((unit, unitIndex) => (
                <tr key={unit.id || unitIndex} className="hover:bg-gray-50">
                  {displayConfig.map((col, colIndex) => {
                    const value = getValue(unit, col.source);
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
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(unit)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(unit)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
