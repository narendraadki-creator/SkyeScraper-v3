import React from 'react';
import { Link } from 'react-router-dom';
import { MobileAgentLanding } from '../components/mobile/MobileAgentLanding';

export const MobileTestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Mobile Interface Test</h1>
      <p>This page allows you to test the mobile interface without authentication.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <Link to="/mobile/developer" style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          backgroundColor: '#0ea5e9', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px' 
        }}>
          View Mobile Agent Interface
        </Link>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <Link to="/agent-projects" style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          backgroundColor: '#6b7280', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px' 
        }}>
          View Original Agent Interface
        </Link>
      </div>
      
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      }}>
        <h3>Mobile Interface Features:</h3>
        <ul>
          <li>✅ Mobile-first responsive design</li>
          <li>✅ Touch-friendly interface</li>
          <li>✅ Bottom navigation bar</li>
          <li>✅ Search and filter functionality</li>
          <li>✅ Project cards with images</li>
          <li>✅ Agent dashboard widgets</li>
          <li>✅ Availability badges</li>
          <li>✅ Action buttons (View Units, Share, Reserve)</li>
        </ul>
      </div>
    </div>
  );
};
