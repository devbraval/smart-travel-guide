import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartPie, 
  faConciergeBell, 
  faCalendarCheck, 
  faWallet, 
  faUserCog,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: faChartPie },
  { id: 'services', label: 'My Services', icon: faConciergeBell },
  { id: 'bookings', label: 'Bookings', icon: faCalendarCheck },
  { id: 'earnings', label: 'Earnings', icon: faWallet },
  { id: 'profile', label: 'Profile Settings', icon: faUserCog },
];

export default function ProviderSidebar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on desktop resize if inadvertently left open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-xl" />
      </button>

      {/* Sidebar Content */}
      <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 w-64 flex flex-col transition-transform duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className={`text-lg w-5 ${activeTab === item.id ? 'text-blue-500' : ''}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
