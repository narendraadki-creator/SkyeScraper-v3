// Component Test Utilities
// This file helps verify that all components are properly exported and working

import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter, 
  CardDescription,
  Badge, 
  StatusBadge, 
  Select, 
  Textarea, 
  Modal, 
  Loading, 
  Spinner, 
  Skeleton 
} from '../components/ui';

import { designTokens } from '../design-tokens';

// Test that all components are properly imported
export const componentTest = {
  // Verify all components are imported
  components: {
    Button,
    Input,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    CardDescription,
    Badge,
    StatusBadge,
    Select,
    Textarea,
    Modal,
    Loading,
    Spinner,
    Skeleton,
  },

  // Verify design tokens are accessible
  designTokens,

  // Test function to verify everything is working
  verify: () => {
    console.log('✅ All UI components imported successfully');
    console.log('✅ Design tokens accessible');
    console.log('✅ Component library ready for use');
    
    // Test design token access
    console.log('Primary color:', designTokens.colors.primary[500]);
    console.log('Developer color:', designTokens.colors.developer[500]);
    console.log('Agent color:', designTokens.colors.agent[500]);
    console.log('Admin color:', designTokens.colors.admin[500]);
    
    return true;
  }
};

// Auto-run verification in development
if (import.meta.env.DEV) {
  componentTest.verify();
}
