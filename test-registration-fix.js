// Test script to run in browser console to debug registration issues
// Copy and paste this into the browser console on the registration page

console.log('=== Registration Debug Test ===');

// Test 1: Check current user authentication
const { data: { user }, error: authError } = await supabase.auth.getUser();
console.log('1. Current user:', user);
console.log('   Auth error:', authError);

if (!user) {
  console.log('❌ No authenticated user found');
  console.log('   Please sign up first, then run this test');
} else {
  console.log('✅ User authenticated:', user.id);
  
  // Test 2: Check if employees table is accessible
  console.log('\n2. Testing employees table access...');
  const { data: empTest, error: empError } = await supabase
    .from('employees')
    .select('*')
    .limit(1);
  
  console.log('   Employees table test:', empTest);
  console.log('   Employees error:', empError);
  
  // Test 3: Check if role_new column exists
  console.log('\n3. Testing role_new column...');
  const { data: roleTest, error: roleError } = await supabase
    .from('employees')
    .select('role, role_new')
    .limit(1);
  
  console.log('   role_new column test:', roleTest);
  console.log('   role_new error:', roleError);
  
  // Test 4: Check organizations table
  console.log('\n4. Testing organizations table...');
  const { data: orgTest, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .limit(1);
  
  console.log('   Organizations table test:', orgTest);
  console.log('   Organizations error:', orgError);
  
  // Test 5: Try to insert a test employee record
  console.log('\n5. Testing employee insertion...');
  const testEmployee = {
    user_id: user.id,
    organization_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
    employee_code: 'TEST-' + Date.now(),
    first_name: 'Test',
    last_name: 'User',
    email: user.email,
    role: 'developer',
    status: 'active'
  };
  
  console.log('   Test employee data:', testEmployee);
  
  // Try with role_new first
  const { data: insertTest1, error: insertError1 } = await supabase
    .from('employees')
    .insert({ ...testEmployee, role_new: 'developer' })
    .select();
  
  console.log('   Insert with role_new:', insertTest1);
  console.log('   Insert with role_new error:', insertError1);
  
  // Try without role_new
  const { data: insertTest2, error: insertError2 } = await supabase
    .from('employees')
    .insert(testEmployee)
    .select();
  
  console.log('   Insert without role_new:', insertTest2);
  console.log('   Insert without role_new error:', insertError2);
}

console.log('\n=== Test Complete ===');
