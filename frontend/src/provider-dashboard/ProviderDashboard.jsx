import { useState } from 'react';
import ProviderNavbar from './ProviderNavbar';
import ProviderSidebar from './ProviderSidebar';
import ProviderOverview from './ProviderOverview';
import ProviderServices from './ProviderServices';
import ProviderBookings from './ProviderBookings';
import ProviderEarnings from './ProviderEarnings';
import ProviderProfile from './ProviderProfile';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <ProviderOverview />;
      case 'services': return <ProviderServices />;
      case 'bookings': return <ProviderBookings />;
      case 'earnings': return <ProviderEarnings />;
      case 'profile': return <ProviderProfile />;
      default: return <ProviderOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <ProviderNavbar />
      
      <div className="flex flex-1 relative">
        <ProviderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
