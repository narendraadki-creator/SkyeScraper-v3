import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const AuthDebugPage: React.FC = () => {
  const { user, employeeId, organizationId, role, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [organizationData, setOrganizationData] = useState<any>(null);

  const fetchDebugInfo = async () => {
    if (!user) return;

    try {
      // Fetch employee data directly
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Direct employee fetch:', { empData, empError });
      setEmployeeData({ data: empData, error: empError });

      if (empData?.organization_id) {
        // Fetch organization data
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', empData.organization_id)
          .single();

        console.log('Direct organization fetch:', { orgData, orgError });
        setOrganizationData({ data: orgData, error: orgError });
      }

      setDebugInfo({
        user: user,
        authContext: { employeeId, organizationId, role, loading },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Debug fetch error:', error);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Debug</h1>
          <p className="text-gray-600">Debug information for authentication issues</p>
        </div>

        <div className="space-y-6">
          {/* Auth Context Info */}
          <Card>
            <CardHeader>
              <CardTitle>Auth Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>User ID:</strong> {user?.id || 'None'}</p>
                <p><strong>User Email:</strong> {user?.email || 'None'}</p>
                <p><strong>Employee ID:</strong> {employeeId || 'None'}</p>
                <p><strong>Organization ID:</strong> {organizationId || 'None'}</p>
                <p><strong>Role:</strong> {role || 'None'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Employee Data */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Data (Direct Query)</CardTitle>
            </CardHeader>
            <CardContent>
              {employeeData ? (
                <div>
                  {employeeData.error ? (
                    <div className="text-red-600">
                      <p><strong>Error:</strong> {employeeData.error.message}</p>
                      <p><strong>Code:</strong> {employeeData.error.code}</p>
                      <p><strong>Details:</strong> {employeeData.error.details}</p>
                    </div>
                  ) : (
                    <div>
                      <p><strong>Employee ID:</strong> {employeeData.data?.id}</p>
                      <p><strong>User ID:</strong> {employeeData.data?.user_id}</p>
                      <p><strong>Organization ID:</strong> {employeeData.data?.organization_id}</p>
                      <p><strong>Role:</strong> {employeeData.data?.role}</p>
                      <p><strong>Status:</strong> {employeeData.data?.status}</p>
                      <p><strong>Name:</strong> {employeeData.data?.first_name} {employeeData.data?.last_name}</p>
                      <p><strong>Email:</strong> {employeeData.data?.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>No employee data</p>
              )}
            </CardContent>
          </Card>

          {/* Organization Data */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Data (Direct Query)</CardTitle>
            </CardHeader>
            <CardContent>
              {organizationData ? (
                <div>
                  {organizationData.error ? (
                    <div className="text-red-600">
                      <p><strong>Error:</strong> {organizationData.error.message}</p>
                      <p><strong>Code:</strong> {organizationData.error.code}</p>
                    </div>
                  ) : (
                    <div>
                      <p><strong>Organization ID:</strong> {organizationData.data?.id}</p>
                      <p><strong>Name:</strong> {organizationData.data?.name}</p>
                      <p><strong>Type:</strong> {organizationData.data?.type}</p>
                      <p><strong>Status:</strong> {organizationData.data?.status}</p>
                      <p><strong>Contact Phone:</strong> {organizationData.data?.contact_phone}</p>
                      <p><strong>Website:</strong> {organizationData.data?.website}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>No organization data</p>
              )}
            </CardContent>
          </Card>

          {/* Raw Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-x-4">
                <Button onClick={fetchDebugInfo}>
                  Refresh Debug Info
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Current auth state:', { user, employeeId, organizationId, role, loading });
                    console.log('Employee data:', employeeData);
                    console.log('Organization data:', organizationData);
                  }}
                >
                  Log to Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
