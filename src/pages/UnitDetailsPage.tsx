import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building, MapPin, DollarSign, Ruler, Bed, Bath, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { unitService } from '../services/unitService';
import type { Unit } from '../types/unit';

export const UnitDetailsPage: React.FC = () => {
  const { projectId, unitId } = useParams<{ projectId: string; unitId: string }>();
  const navigate = useNavigate();
  
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unitId) {
      loadUnit();
    }
  }, [unitId]);

  const loadUnit = async () => {
    if (!unitId) return;
    
    try {
      setLoading(true);
      const unitData = await unitService.getUnit(unitId);
      setUnit(unitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load unit');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit unit:', unit);
  };

  const handleDelete = async () => {
    if (!unit || !confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await unitService.deleteUnit(unit.id);
      navigate(`/projects/${projectId}/units`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete unit');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'held': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The unit you are looking for does not exist.'}</p>
          <Button onClick={() => navigate(`/projects/${projectId}/units`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Units
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/projects/${projectId}/units`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Units
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{unit.unit_number}</h1>
                <p className="text-gray-600">Unit Details</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                    <p className="text-lg font-semibold">{unit.unit_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                    <p className="text-lg">{unit.unit_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                    <p className="text-lg">{unit.floor_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Badge className={getStatusColor(unit.status)}>
                      {unit.status?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ruler className="w-5 h-5 mr-2" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <Ruler className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Area</p>
                      <p className="font-semibold">{unit.area_sqft ? `${unit.area_sqft} sqft` : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                      <p className="font-semibold">{unit.bedrooms || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                      <p className="font-semibold">{unit.bathrooms || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Parking</p>
                      <p className="font-semibold">{unit.parking_spaces || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <p className="text-2xl font-bold text-green-600">
                      {unit.price ? `$${unit.price.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per sqft</label>
                    <p className="text-lg">
                      {unit.price && unit.area_sqft 
                        ? `$${Math.round(unit.price / unit.area_sqft).toLocaleString()}/sqft`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            {unit.custom_fields && Object.keys(unit.custom_fields).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(unit.custom_fields).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <p className="text-lg">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Unit
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Location
                </Button>
                <Button variant="outline" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Generate Quote
                </Button>
              </CardContent>
            </Card>

            {/* Unit Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Unit Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Unit Created</p>
                      <p className="text-xs text-gray-500">
                        {new Date(unit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {unit.updated_at && unit.updated_at !== unit.created_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-gray-500">
                          {new Date(unit.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
