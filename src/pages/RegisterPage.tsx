import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';

export const RegisterPage: React.FC = () => {
  const { loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationType: 'developer' as 'developer' | 'agent' | 'admin',
    contactPhone: '',
    address: '',
    website: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const organizationTypeOptions = [
    { value: 'developer', label: 'Developer' },
    { value: 'agent', label: 'Real Estate Agent' },
    { value: 'admin', label: 'System Administrator' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    console.log('Starting registration process...');
    console.log('Form data:', formData);
    
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        setErrors({ submit: authError.message || 'Registration failed' });
        return;
      }

      if (!authData.user) {
        setErrors({ submit: 'Failed to create user account' });
        return;
      }

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.organizationName,
          type: formData.organizationType,
          contact_email: formData.email, // Add required contact_email field
          contact_phone: formData.contactPhone || null,
          website: formData.website || null,
          address: formData.address || null,
          description: formData.description || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        setErrors({ submit: `Failed to create organization: ${orgError.message}` });
        return;
      }

      // Create employee record
      // Generate employee code
      const employeeCode = `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Determine the employee role based on organization type (NEW THREE-ROLE SYSTEM)
      const employeeRole = formData.organizationType === 'admin' ? 'admin' : 
                          formData.organizationType === 'developer' ? 'developer' : 'agent';
      const employeeRoleNew = formData.organizationType === 'admin' ? 'admin' : 
                             formData.organizationType === 'developer' ? 'developer' : 'agent';
      
      console.log('Creating employee record with data:', {
        user_id: authData.user.id,
        organization_id: orgData.id,
        employee_code: employeeCode,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: employeeRole,
        role_new: employeeRoleNew,
        status: 'active',
      });
      
      // Try to insert with role_new first, fallback to just role if column doesn't exist
      let empData, empError;
      
      try {
        const result = await supabase
          .from('employees')
          .insert({
            user_id: authData.user.id,
            organization_id: orgData.id,
            employee_code: employeeCode,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            role: employeeRole,
            role_new: employeeRoleNew, // Try with role_new
            status: 'active',
          })
          .select()
          .single();
        
        empData = result.data;
        empError = result.error;
      } catch (error) {
        // If role_new column doesn't exist, try without it
        console.log('role_new column might not exist, trying without it...');
        const result = await supabase
          .from('employees')
          .insert({
            user_id: authData.user.id,
            organization_id: orgData.id,
            employee_code: employeeCode,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            role: employeeRole,
            status: 'active',
          })
          .select()
          .single();
        
        empData = result.data;
        empError = result.error;
      }

      console.log('Employee creation result:', { empData, empError });

      if (empError) {
        console.error('Employee creation error:', empError);
        setErrors({ submit: `Failed to create employee record: ${empError.message}` });
        return;
      }

      // Registration successful
      console.log('Registration successful');
      console.log('Created organization:', orgData);
      setErrors({ submit: 'Registration successful! Please check your email to confirm your account.' });
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        organizationName: '',
        organizationType: 'developer',
        contactPhone: '',
        address: '',
        website: '',
        description: '',
      });

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Organization
          </h1>
          <p className="text-gray-600">
            Join SkyeScraper and start managing your real estate projects
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Registration</CardTitle>
            <CardDescription>
              Fill out the form below to create your organization account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
                    placeholder="Enter your first name"
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={errors.lastName}
                    placeholder="Enter your last name"
                  />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email address"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={errors.password}
                    placeholder="Create a password"
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Organization Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Organization Name"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    error={errors.organizationName}
                    placeholder="Enter organization name"
                  />
                  <Select
                    label="Organization Type"
                    value={formData.organizationType}
                    onChange={(e) => handleInputChange('organizationType', e.target.value)}
                    options={organizationTypeOptions}
                  />
                </div>
                <Input
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="Enter contact phone number"
                />
                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  error={errors.website}
                  placeholder="https://your-website.com"
                />
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter organization address"
                />
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your organization..."
                  rows={3}
                />
              </div>

              {/* Organization Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">You will be registered as:</span>
                <Badge variant={formData.organizationType === 'developer' ? 'developer' : 'agent'}>
                  {formData.organizationType === 'developer' ? 'Developer' : 'Agent'} Admin
                </Badge>
              </div>

              {/* Submit Error/Success */}
              {errors.submit && (
                <div className={`px-4 py-3 rounded-md ${
                  errors.submit.includes('successful') 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <a
                  href="/login"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Already have an account? Sign in
                </a>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Create Organization
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
