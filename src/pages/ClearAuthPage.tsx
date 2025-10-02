import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ClearAuthPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const clearAuth = async () => {
      try {
        // Sign out the user
        await supabase.auth.signOut();
        
        // Clear any local storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any cookies (if any)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        console.log('Authentication cleared successfully');
        
        // Redirect to login page
        navigate('/login');
      } catch (error) {
        console.error('Error clearing auth:', error);
        // Still redirect to login
        navigate('/login');
      }
    };

    clearAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Clearing authentication...</p>
      </div>
    </div>
  );
};
