# SkyeScraper Design System

A comprehensive design system built for SkyeScraper real estate management platform with role-based theming and modern UI components.

## 🎨 Features

- **Role-Based Theming**: Developer (Blue), Agent (Green), Admin (Red)
- **Design Tokens**: Centralized design system with TypeScript support
- **Modern Components**: Built with React, TypeScript, and Tailwind CSS
- **Accessibility**: WCAG compliant components with proper ARIA attributes
- **Responsive**: Mobile-first design with responsive breakpoints
- **Dark Mode Ready**: CSS variables for easy theme switching

## 📦 Components

### Core Components

- **Button**: Multiple variants (primary, secondary, outline, ghost, danger, role-based)
- **Input**: Form inputs with labels, error states, and icons
- **Card**: Flexible card components with header, content, and footer
- **Badge**: Status indicators and labels with semantic colors
- **Select**: Dropdown select with options and validation
- **Textarea**: Multi-line text input with validation
- **Modal**: Accessible modal dialogs with backdrop and keyboard navigation
- **Loading**: Loading states, spinners, and skeleton components

### Design Tokens

All components use design tokens from `src/design-tokens.ts`:

```typescript
import { designTokens } from './design-tokens';

// Colors
designTokens.colors.primary[500]    // #3B82F6
designTokens.colors.developer[500]  // #3B82F6
designTokens.colors.agent[500]      // #10B981
designTokens.colors.admin[500]      // #EF4444

// Typography
designTokens.typography.fontFamily.sans  // ['Montserrat', 'system-ui', 'sans-serif']
designTokens.typography.fontSize.lg      // '1.125rem'

// Spacing
designTokens.spacing[4]  // '1rem'
designTokens.spacing[6]  // '1.5rem'
```

## 🚀 Usage

### Basic Button

```tsx
import { Button } from './components/ui';

// Primary button
<Button variant="primary">Create Project</Button>

// Role-based buttons
<Button variant="developer">Developer Action</Button>
<Button variant="agent">Agent Action</Button>
<Button variant="admin">Admin Action</Button>

// Loading state
<Button loading>Processing...</Button>
```

### Form Components

```tsx
import { Input, Select, Textarea } from './components/ui';

// Input with validation
<Input
  label="Project Name"
  placeholder="Enter project name"
  error="This field is required"
  helperText="Choose a descriptive name"
/>

// Select dropdown
<Select
  label="Organization Type"
  options={[
    { value: 'developer', label: 'Developer' },
    { value: 'agent', label: 'Agent' }
  ]}
/>

// Textarea
<Textarea
  label="Description"
  placeholder="Describe your project..."
  rows={4}
/>
```

### Cards and Layout

```tsx
import { Card, CardHeader, CardTitle, CardContent } from './components/ui';

<Card>
  <CardHeader>
    <CardTitle>Project Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Project content goes here...</p>
  </CardContent>
</Card>
```

### Status Badges

```tsx
import { StatusBadge, Badge } from './components/ui';

// Automatic status colors
<StatusBadge>Available</StatusBadge>
<StatusBadge>Sold</StatusBadge>
<StatusBadge>Held</StatusBadge>

// Custom badges
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
```

## 🎨 Theming

### CSS Variables

The design system uses CSS variables for easy theming:

```css
:root {
  --color-primary-500: #3B82F6;
  --color-developer-500: #3B82F6;
  --color-agent-500: #10B981;
  --color-admin-500: #EF4444;
  --font-family-sans: 'Montserrat', system-ui, sans-serif;
}
```

### Role-Based Colors

```tsx
// Developer theme (Blue)
<Button variant="developer">Developer Action</Button>
<Badge variant="developer">Developer Badge</Badge>

// Agent theme (Green)
<Button variant="agent">Agent Action</Button>
<Badge variant="agent">Agent Badge</Badge>

// Admin theme (Red)
<Button variant="admin">Admin Action</Button>
<Badge variant="admin">Admin Badge</Badge>
```

### Tailwind Classes

All design tokens are available as Tailwind classes:

```tsx
// Colors
<div className="bg-primary-500 text-white">Primary</div>
<div className="bg-developer-500 text-white">Developer</div>
<div className="bg-agent-500 text-white">Agent</div>
<div className="bg-admin-500 text-white">Admin</div>

// Typography
<h1 className="font-sans text-4xl font-bold">Heading</h1>
<p className="text-gray-600">Body text</p>

// Spacing
<div className="p-6 m-4">Content</div>
```

## 📱 Responsive Design

The design system includes responsive breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Responsive Card</Card>
</div>
```

## ♿ Accessibility

All components include proper accessibility features:

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant colors
- **Semantic HTML**: Proper HTML structure

## 🛠️ Development

### Project Structure

```
src/
├── components/
│   ├── ui/                 # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── index.ts
│   └── DesignSystemDemo.tsx
├── lib/
│   └── utils.ts           # Utility functions
├── design-tokens.ts       # Design system tokens
└── style.css             # Global styles and CSS variables
```

### Dependencies

- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **class-variance-authority**: Component variants
- **clsx**: Conditional classes
- **tailwind-merge**: Tailwind class merging
- **lucide-react**: Icons

### Running the Demo

```bash
npm run dev
```

Visit `http://localhost:5173` to see the design system demo.

## 🎯 Best Practices

1. **Use Design Tokens**: Always use design tokens instead of hardcoded values
2. **Role-Based Theming**: Use appropriate role colors for different user types
3. **Accessibility First**: Ensure all components are accessible
4. **Consistent Spacing**: Use the spacing scale from design tokens
5. **Semantic Colors**: Use semantic colors for status and feedback
6. **Responsive Design**: Design mobile-first with responsive breakpoints

## 🔮 Future Enhancements

- [ ] Dark mode implementation
- [ ] Animation system
- [ ] Data visualization components
- [ ] Advanced form components
- [ ] Table and list components
- [ ] Navigation components
- [ ] Toast notifications
- [ ] Tooltip and popover components

## 📄 License

This design system is part of the SkyeScraper project.
