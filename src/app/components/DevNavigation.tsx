import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Menu, X, Home, Monitor, LogIn, LayoutDashboard, Ticket } from 'lucide-react';

export const DevNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Customer Kiosk', icon: Home },
    { path: '/queue-ticket', label: 'Queue Ticket', icon: Ticket },
    { path: '/display', label: 'Public Display', icon: Monitor },
    { path: '/staff-login', label: 'Staff Login', icon: LogIn },
    { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Navigation Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Navigation Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="fixed top-20 right-4 bg-white rounded-2xl shadow-2xl z-50 w-80 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <h3 className="font-bold text-lg">Quick Navigation</h3>
              <p className="text-sm text-blue-100">Demo Helper Menu</p>
            </div>
            <div className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <p className="text-xs">Admin: admin / admin123</p>
              <p className="text-xs">Staff: cashier1 / cash123</p>
            </div>
          </div>
        </>
      )}
    </>
  );
};
