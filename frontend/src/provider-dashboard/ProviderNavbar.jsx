import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function ProviderNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-gray-800 tracking-tight">Smart Travel Guide</span>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Provider</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
          <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
        <button className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span className="text-sm font-medium hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
