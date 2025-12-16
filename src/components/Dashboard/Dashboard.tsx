import { useEffect, useState } from 'react';
import { Package, MapPin, Calendar, User, Tag } from 'lucide-react';
import { supabase, LostItem, FoundItem } from '../../lib/supabase';

export default function Dashboard() {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const [lostResponse, foundResponse] = await Promise.all([
        supabase
          .from('lost_items')
          .select('*, profiles(full_name, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('found_items')
          .select('*, profiles(full_name, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (lostResponse.data) setLostItems(lostResponse.data);
      if (foundResponse.data) setFoundItems(foundResponse.data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ItemCard = ({ item, type }: { item: LostItem | FoundItem; type: 'lost' | 'found' }) => {
    const location = 'location_lost' in item ? item.location_lost : item.location_found;
    const date = 'date_lost' in item ? item.date_lost : item.date_found;

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
        {item.image_url && (
          <div className="h-48 overflow-hidden bg-gray-100">
            <img
              src={item.image_url}
              alt={item.item_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.item_name}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  type === 'lost'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <Tag className="w-3 h-3 mr-1" />
                {item.category}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>{item.profiles?.full_name || 'Anonymous'}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                type === 'lost'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Browse recently reported items</p>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('lost')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'lost'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Lost Items ({lostItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'found'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Found Items ({foundItems.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'lost' ? (
            lostItems.length > 0 ? (
              lostItems.map((item) => (
                <ItemCard key={item.id} item={item} type="lost" />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No lost items reported yet</p>
              </div>
            )
          ) : foundItems.length > 0 ? (
            foundItems.map((item) => (
              <ItemCard key={item.id} item={item} type="found" />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No found items reported yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
