import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  StatusBadge,
  Select,
  Textarea,
  Modal,
  Loading,
  Spinner,
  Skeleton,
} from './ui';
import { designTokens } from '../design-tokens';

const DesignSystemDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const selectOptions = [
    { value: 'developer', label: 'Developer' },
    { value: 'agent', label: 'Agent' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SkyeScraper Design System
          </h1>
          <p className="text-lg text-gray-600">
            Complete UI component library with role-based theming
          </p>
        </div>

        {/* Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>
              Role-based color themes and semantic colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Role-Based Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Developer (Blue)</h4>
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-developer-500 rounded-lg"></div>
                    <div className="w-12 h-12 bg-developer-600 rounded-lg"></div>
                    <div className="w-12 h-12 bg-developer-700 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Agent (Green)</h4>
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-agent-500 rounded-lg"></div>
                    <div className="w-12 h-12 bg-agent-600 rounded-lg"></div>
                    <div className="w-12 h-12 bg-agent-700 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Admin (Red)</h4>
                  <div className="flex space-x-2">
                    <div className="w-12 h-12 bg-admin-500 rounded-lg"></div>
                    <div className="w-12 h-12 bg-admin-600 rounded-lg"></div>
                    <div className="w-12 h-12 bg-admin-700 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Semantic Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-500 rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-medium">Success</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-500 rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-medium">Warning</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-error-500 rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-medium">Error</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-info-500 rounded-lg mx-auto mb-2"></div>
                  <span className="text-sm font-medium">Info</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Various button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="developer">Developer</Button>
                <Button variant="agent">Agent</Button>
                <Button variant="admin">Admin</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </div>
            </div>

            {/* Loading States */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Loading States</h3>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button variant="secondary" loading>Loading</Button>
                <Button variant="outline" loading>Loading</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Input fields, selects, and textareas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Project Name"
                placeholder="Enter project name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="This will be displayed on the project card"
              />
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                error="Please enter a valid email address"
              />
              <Select
                label="Organization Type"
                placeholder="Select organization type"
                options={selectOptions}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              />
              <Input
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                leftIcon={<span>📞</span>}
              />
            </div>
            <Textarea
              label="Project Description"
              placeholder="Describe your project..."
              rows={4}
              helperText="Provide a detailed description of your real estate project"
            />
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>
              Status indicators and labels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Badge Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="developer">Developer</Badge>
                <Badge variant="agent">Agent</Badge>
                <Badge variant="admin">Admin</Badge>
              </div>
            </div>

            {/* Status Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Status Badges</h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge>Available</StatusBadge>
                <StatusBadge>Held</StatusBadge>
                <StatusBadge>Sold</StatusBadge>
                <StatusBadge>Reserved</StatusBadge>
                <StatusBadge>New</StatusBadge>
                <StatusBadge>Contacted</StatusBadge>
                <StatusBadge>Qualified</StatusBadge>
                <StatusBadge>Won</StatusBadge>
                <StatusBadge>Lost</StatusBadge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading States Section */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>
              Loading indicators and skeletons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Loading size="sm" text="Small loading" />
              </div>
              <div className="text-center">
                <Loading size="md" text="Medium loading" />
              </div>
              <div className="text-center">
                <Loading size="lg" text="Large loading" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Skeleton Loading</h3>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Section */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>
              Modal dialogs and overlays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </CardContent>
        </Card>

        {/* Design Tokens Info */}
        <Card>
          <CardHeader>
            <CardTitle>Design Tokens</CardTitle>
            <CardDescription>
              All components use design tokens from design-tokens.ts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{JSON.stringify(designTokens.colors.primary, null, 2)}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is an example modal dialog. It demonstrates the modal component
            with proper backdrop, escape key handling, and focus management.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DesignSystemDemo;
