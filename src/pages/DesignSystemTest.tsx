import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { Loading, Spinner, Skeleton } from '../components/ui/Loading';

export const DesignSystemTest = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [selectValue, setSelectValue] = React.useState('');

  const selectOptions = [
    { value: 'developer', label: 'Developer' },
    { value: 'agent', label: 'Agent' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Design System Test</h1>
        <p className="text-lg text-gray-600 mb-8">Testing all UI components with design tokens</p>
        
        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Buttons</h2>
          <Card>
            <CardContent className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="text-lg font-medium mb-3">Variants</h3>
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
                <h3 className="text-lg font-medium mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">🚀</Button>
                </div>
              </div>

              {/* Loading States */}
              <div>
                <h3 className="text-lg font-medium mb-3">Loading States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button loading>Loading</Button>
                  <Button variant="secondary" loading>Loading</Button>
                  <Button variant="outline" loading>Loading</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Components Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Form Components</h2>
          <Card>
            <CardContent>
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
              <div className="mt-6">
                <Textarea
                  label="Project Description"
                  placeholder="Describe your project..."
                  rows={4}
                  helperText="Provide a detailed description of your real estate project"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This is a basic card component with header and content.</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card has an elevated shadow for more prominence.</p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This card has a prominent border without shadow.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Badges</h2>
          <Card>
            <CardContent className="space-y-6">
              {/* Badge Variants */}
              <div>
                <h3 className="text-lg font-medium mb-3">Variants</h3>
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
                <h3 className="text-lg font-medium mb-3">Status Badges</h3>
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
        </section>

        {/* Loading States Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Loading States</h2>
          <Card>
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
                <h3 className="text-lg font-medium">Skeleton Loading</h3>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inline Spinners</h3>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <span className="text-gray-600">Loading content...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Modal Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Modal</h2>
          <Card>
            <CardContent>
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Design Tokens Verification */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Design Tokens Verification</h2>
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Color Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-developer-700">Developer Theme (Blue)</h3>
                  <div className="space-y-2">
                    <div className="h-8 bg-developer-500 rounded flex items-center justify-center text-white text-sm font-medium">
                      Developer Button
                    </div>
                    <div className="h-6 bg-developer-50 rounded flex items-center justify-center text-developer-700 text-sm">
                      Developer Badge
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-agent-700">Agent Theme (Green)</h3>
                  <div className="space-y-2">
                    <div className="h-8 bg-agent-500 rounded flex items-center justify-center text-white text-sm font-medium">
                      Agent Button
                    </div>
                    <div className="h-6 bg-agent-50 rounded flex items-center justify-center text-agent-700 text-sm">
                      Agent Badge
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-admin-700">Admin Theme (Red)</h3>
                  <div className="space-y-2">
                    <div className="h-8 bg-admin-500 rounded flex items-center justify-center text-white text-sm font-medium">
                      Admin Button
                    </div>
                    <div className="h-6 bg-admin-50 rounded flex items-center justify-center text-admin-700 text-sm">
                      Admin Badge
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Test Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a test modal to verify the modal component is working correctly.
            It includes proper backdrop, escape key handling, and focus management.
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
