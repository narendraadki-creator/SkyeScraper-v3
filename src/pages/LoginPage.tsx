import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

export const LoginPage: React.FC = () => {
  const { loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) setErrors({ submit: error.message || 'Login failed' });
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
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
    <div className="page-wrapper">
      {/* Brand Hero Header (same structure as dashboard) */}
      <section className="page-header">
        <div className="container-narrow">
          <h1 className="hero-title" style={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}>SKYESCRAPER</h1>
          <p className="page-subtitle" style={{ marginTop: 'var(--space-2xs)' }}>
            Discover · Manage · Book Properties in Real-Time
          </p>
        </div>
      </section>

      {/* Sign-in card */}
      <main className="section-content">
        <div className="container-narrow">
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="card-professional" style={{ padding: 'var(--space-sm)' }}>
              <div className="text-center" style={{ marginBottom: 'var(--space-sm)' }}>
                <p className="page-subtitle">Sign in to your account</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{errors.submit}</div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm" style={{ marginLeft: 'auto' }}>
                    <a href="/forgot-password" className="font-medium" style={{ color: 'var(--color-accent-emerald)' }}>
                      Forgot your password?
                    </a>
                  </div>
                </div>
                <Button type="submit" className="w-full btn-primary" loading={isSubmitting} disabled={isSubmitting}>
                  Sign In
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Don't have an account?{' '}
                  <a href="/register" className="font-medium" style={{ color: 'var(--color-accent-emerald)' }}>
                    Create one here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
