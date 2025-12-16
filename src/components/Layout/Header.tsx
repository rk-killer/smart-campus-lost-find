import { LogOut, Search, Bell, User, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  unreadCount?: number;
}

export default function Header({ currentView, onNavigate, unreadCount = 0 }: HeaderProps) {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2"
            >
              <Search className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Campus Lost & Found</span>
            </button>

            <nav className="hidden md:flex space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('search')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'search'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Search Items
              </button>
              <button
                onClick={() => onNavigate('my-items')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'my-items'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                My Items
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('report')}
              className="hidden sm:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Report Item</span>
            </button>

            <button
              onClick={() => onNavigate('notifications')}
              className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="md:hidden flex space-x-4 pb-3 overflow-x-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              currentView === 'search'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => onNavigate('my-items')}
            className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              currentView === 'my-items'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Items
          </button>
        </nav>
      </div>
    </header>
  );
}
