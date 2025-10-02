// design-tokens.ts
// SkyeScraper Design System - Extracted Design Tokens
// Reference: https://skye-scraper-bz2z.vercel.app/

export const designTokens = {
  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Base Colors
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6', // Main primary
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    
    // Role-Specific Accent Colors
    developer: {
      50: '#EFF6FF',
      500: '#3B82F6', // Blue theme for developers
      600: '#2563EB',
      700: '#1D4ED8',
    },
    
    agent: {
      50: '#F0FDF4',
      500: '#10B981', // Green theme for agents
      600: '#059669',
      700: '#047857',
    },
    
    admin: {
      50: '#FEF2F2',
      500: '#EF4444', // Red theme for admin
      600: '#DC2626',
      700: '#B91C1C',
    },
    
    // Neutral/Gray Scale
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Semantic Colors
    success: {
      50: '#F0FDF4',
      500: '#10B981',
      600: '#059669',
    },
    
    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
    },
    
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
    },
    
    info: {
      50: '#EFF6FF',
      500: '#3B82F6',
      600: '#2563EB',
    },
    
    // Status Colors (for units, leads, etc.)
    status: {
      available: '#10B981',
      held: '#F59E0B',
      sold: '#EF4444',
      reserved: '#3B82F6',
      new: '#8B5CF6',
      contacted: '#3B82F6',
      qualified: '#10B981',
      won: '#059669',
      lost: '#6B7280',
    },
  },
  
  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      sans: ['Montserrat', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // ============================================
  // SPACING
  // ============================================
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // ============================================
  // BORDERS
  // ============================================
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  borderWidth: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
  },
  
  // ============================================
  // SHADOWS
  // ============================================
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  
  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  
  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // ============================================
  // TRANSITIONS
  // ============================================
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================

export const componentTokens = {
  // Button variants
  button: {
    primary: {
      bg: designTokens.colors.primary[500],
      bgHover: designTokens.colors.primary[600],
      text: '#FFFFFF',
      border: 'transparent',
    },
    secondary: {
      bg: designTokens.colors.gray[100],
      bgHover: designTokens.colors.gray[200],
      text: designTokens.colors.gray[700],
      border: designTokens.colors.gray[300],
    },
    outline: {
      bg: 'transparent',
      bgHover: designTokens.colors.gray[50],
      text: designTokens.colors.gray[700],
      border: designTokens.colors.gray[300],
    },
    ghost: {
      bg: 'transparent',
      bgHover: designTokens.colors.gray[100],
      text: designTokens.colors.gray[700],
      border: 'transparent',
    },
    danger: {
      bg: designTokens.colors.error[500],
      bgHover: designTokens.colors.error[600],
      text: '#FFFFFF',
      border: 'transparent',
    },
  },
  
  // Card styles
  card: {
    bg: '#FFFFFF',
    border: designTokens.colors.gray[200],
    borderRadius: designTokens.borderRadius.lg,
    shadow: designTokens.boxShadow.sm,
    padding: designTokens.spacing[6],
  },
  
  // Input styles
  input: {
    bg: '#FFFFFF',
    border: designTokens.colors.gray[300],
    borderFocus: designTokens.colors.primary[500],
    borderRadius: designTokens.borderRadius.md,
    padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
    text: designTokens.colors.gray[900],
    placeholder: designTokens.colors.gray[400],
  },
  
  // Badge styles
  badge: {
    primary: {
      bg: designTokens.colors.primary[100],
      text: designTokens.colors.primary[700],
    },
    success: {
      bg: designTokens.colors.success[50],
      text: designTokens.colors.success[600],
    },
    warning: {
      bg: designTokens.colors.warning[50],
      text: designTokens.colors.warning[600],
    },
    error: {
      bg: designTokens.colors.error[50],
      text: designTokens.colors.error[600],
    },
    gray: {
      bg: designTokens.colors.gray[100],
      text: designTokens.colors.gray[700],
    },
  },
};

// ============================================
// TAILWIND CONFIG EXPORT
// ============================================

export const tailwindTheme = {
  extend: {
    colors: {
      primary: designTokens.colors.primary,
      developer: designTokens.colors.developer,
      agent: designTokens.colors.agent,
      admin: designTokens.colors.admin,
      gray: designTokens.colors.gray,
      success: designTokens.colors.success,
      warning: designTokens.colors.warning,
      error: designTokens.colors.error,
      info: designTokens.colors.info,
    },
    fontFamily: designTokens.typography.fontFamily,
    fontSize: designTokens.typography.fontSize,
    fontWeight: designTokens.typography.fontWeight,
    spacing: designTokens.spacing,
    borderRadius: designTokens.borderRadius,
    boxShadow: designTokens.boxShadow,
    zIndex: designTokens.zIndex,
    screens: designTokens.breakpoints,
    transitionDuration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
  },
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Using in Tailwind classes
<button className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg px-4 py-2">
  Click Me
</button>

// Example 2: Using in styled components
const StyledButton = styled.button`
  background-color: ${designTokens.colors.primary[500]};
  color: white;
  padding: ${designTokens.spacing[2]} ${designTokens.spacing[4]};
  border-radius: ${designTokens.borderRadius.lg};
  font-weight: ${designTokens.typography.fontWeight.medium};
  transition: background-color ${designTokens.transition.base};
  
  &:hover {
    background-color: ${designTokens.colors.primary[600]};
  }
`;

// Example 3: Role-based theming
const getRoleColor = (role: 'developer' | 'agent' | 'admin') => {
  return designTokens.colors[role][500];
};

// Example 4: Status badges
const getStatusColor = (status: string) => {
  return designTokens.colors.status[status] || designTokens.colors.gray[500];
};
*/
