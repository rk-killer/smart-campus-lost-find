import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Search from './components/Search/Search';
import ReportItem from './components/Items/ReportItem';
import MyItems from './components/MyItems/MyItems';
import Notifications from './components/Notifications/Notifications';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
          loadUnreadCount();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setUnreadCount(count || 0);
  };

  const handleReportSuccess = async () => {
    setCurrentView('my-items');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-matches`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Matching results:', data);
      }
    } catch (error) {
      console.error('Error running match finder:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onToggleForm={() => setAuthView('signup')} />
    ) : (
      <Signup onToggleForm={() => setAuthView('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        unreadCount={unreadCount}
      />

      <main>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'search' && <Search />}
        {currentView === 'report' && (
          <ReportItem
            onSuccess={handleReportSuccess}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'my-items' && <MyItems />}
        {currentView === 'notifications' && <Notifications />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
