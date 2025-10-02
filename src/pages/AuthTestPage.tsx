import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const AuthTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Check Supabase connection
      addResult('Testing Supabase connection...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`);
      } else {
        addResult(`✅ Session check passed. Current user: ${session?.user?.email || 'None'}`);
      }

      // Test 2: Check if we can read organizations table
      addResult('Testing organizations table access...');
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, type')
        .limit(1);
      
      if (orgError) {
        addResult(`❌ Organizations table error: ${orgError.message}`);
      } else {
        addResult(`✅ Organizations table accessible. Found ${orgs?.length || 0} organizations`);
      }

      // Test 3: Check if we can read employees table
      addResult('Testing employees table access...');
      const { data: emps, error: empError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role')
        .limit(1);
      
      if (empError) {
        addResult(`❌ Employees table error: ${empError.message}`);
      } else {
        addResult(`✅ Employees table accessible. Found ${emps?.length || 0} employees`);
      }

      // Test 4: Check RLS policies
      addResult('Testing RLS policies...');
      if (session?.user) {
        // Try to insert a test organization (this should fail due to RLS)
        const { error: insertError } = await supabase
          .from('organizations')
          .insert({
            name: 'Test Org',
            type: 'developer',
            contact_email: 'test@example.com',
          });
        
        if (insertError) {
          addResult(`✅ RLS working - Insert blocked: ${insertError.message}`);
        } else {
          addResult(`❌ RLS not working - Insert allowed when it shouldn't be`);
        }
      } else {
        addResult('⚠️ No authenticated user - skipping RLS test');
      }

      // Test 5: Check environment variables
      addResult('Testing environment variables...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        addResult('❌ VITE_SUPABASE_URL not configured properly');
      } else {
        addResult(`✅ VITE_SUPABASE_URL configured: ${supabaseUrl.substring(0, 30)}...`);
      }
      
      if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
        addResult('❌ VITE_SUPABASE_ANON_KEY not configured properly');
      } else {
        addResult(`✅ VITE_SUPABASE_ANON_KEY configured: ${supabaseKey.substring(0, 20)}...`);
      }

    } catch (error) {
      addResult(`❌ Test error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supabase Connection Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} loading={isRunning} disabled={isRunning}>
              Run Authentication Tests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.length === 0 ? (
                <p className="text-gray-500">Click "Run Authentication Tests" to see results</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
              </div>
              <div>
                <strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
