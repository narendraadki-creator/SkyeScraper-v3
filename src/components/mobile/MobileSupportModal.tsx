import React, { useState } from 'react';
import { 
  X,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface MobileSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSupportModal: React.FC<MobileSupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'resources'>('contact');

  if (!isOpen) return null;

  const contactMethods = [
    {
      icon: <Mail size={20} color="var(--primary-600)" />,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@skyescraper.com',
      action: () => window.open('mailto:support@skyescraper.com', '_blank')
    },
    {
      icon: <Phone size={20} color="var(--primary-600)" />,
      title: 'Phone Support',
      description: 'Call us directly',
      contact: '+971 4 123 4567',
      action: () => window.open('tel:+97141234567', '_blank')
    },
    {
      icon: <MessageSquare size={20} color="var(--primary-600)" />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Available 9 AM - 6 PM GST',
      action: () => alert('Live chat would open here')
    }
  ];

  const faqItems = [
    {
      question: 'How do I create a new lead?',
      answer: 'Navigate to any project and click the "Create Lead" button. Fill in the lead information and save.'
    },
    {
      question: 'How do I update my profile?',
      answer: 'Go to Settings > Profile and click the "Edit" button to modify your personal information.'
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security and use the "Change Password" section to update your password.'
    },
    {
      question: 'How do I manage notifications?',
      answer: 'Go to Settings > Notifications to customize your notification preferences.'
    }
  ];

  const resources = [
    {
      title: 'User Guide',
      description: 'Complete guide to using the platform',
      action: () => alert('User guide would open here')
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video instructions',
      action: () => alert('Video tutorials would open here')
    },
    {
      title: 'API Documentation',
      description: 'Technical documentation for developers',
      action: () => alert('API documentation would open here')
    },
    {
      title: 'System Status',
      description: 'Check current system status',
      action: () => alert('System status would open here')
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 16px 20px',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={24} color="var(--primary-600)" />
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'var(--gray-900)',
              margin: 0
            }}>
              Help & Support
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} color="var(--gray-500)" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--gray-200)',
          backgroundColor: 'var(--gray-50)'
        }}>
          {[
            { key: 'contact', label: 'Contact' },
            { key: 'faq', label: 'FAQ' },
            { key: 'resources', label: 'Resources' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                color: activeTab === tab.key ? 'var(--primary-600)' : 'var(--gray-600)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary-600)' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {activeTab === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--gray-600)',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Get in touch with our support team. We're here to help!
              </p>
              
              {contactMethods.map((method, index) => (
                <button
                  key={index}
                  onClick={method.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                    e.currentTarget.style.borderColor = 'var(--primary-300)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--primary-50)',
                    borderRadius: '8px'
                  }}>
                    {method.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: 'var(--gray-900)',
                      margin: '0 0 2px 0'
                    }}>
                      {method.title}
                    </h4>
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'var(--gray-600)',
                      margin: '0 0 4px 0'
                    }}>
                      {method.description}
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'var(--primary-600)',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {method.contact}
                    </p>
                  </div>
                  
                  <ExternalLink size={16} color="var(--gray-400)" />
                </button>
              ))}
            </div>
          )}

          {activeTab === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--gray-600)',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Frequently asked questions and answers.
              </p>
              
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '12px'
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '500', 
                    color: 'var(--gray-900)',
                    margin: '0 0 8px 0'
                  }}>
                    {item.question}
                  </h4>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--gray-600)',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--gray-600)',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                Additional resources and documentation.
              </p>
              
              {resources.map((resource, index) => (
                <button
                  key={index}
                  onClick={resource.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                    e.currentTarget.style.borderColor = 'var(--primary-300)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--primary-50)',
                    borderRadius: '8px'
                  }}>
                    <ExternalLink size={20} color="var(--primary-600)" />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: 'var(--gray-900)',
                      margin: '0 0 2px 0'
                    }}>
                      {resource.title}
                    </h4>
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'var(--gray-600)',
                      margin: 0
                    }}>
                      {resource.description}
                    </p>
                  </div>
                  
                  <ExternalLink size={16} color="var(--gray-400)" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

