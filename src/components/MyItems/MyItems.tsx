import { useEffect, useState } from 'react';
import { Package, MapPin, Calendar, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase, LostItem, FoundItem, Match } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function MyItems() {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserItems();
    }
  }, [user]);

  const loadUserItems = async () => {
    setLoading(true);
    try {
      const [lostResponse, foundResponse, matchesResponse] = await Promise.all([
        supabase
          .from('lost_items')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('found_items')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('matches')
          .select(`
            *,
            lost_items!inner(*, profiles(full_name)),
            found_items!inner(*, profiles(full_name))
          `)
          .or(`lost_items.user_id.eq.${user!.id},found_items.user_id.eq.${user!.id}`)
          .eq('status', 'pending'),
      ]);

      if (lostResponse.data) setLostItems(lostResponse.data);
      if (foundResponse.data) setFoundItems(foundResponse.data);
      if (matchesResponse.data) setMatches(matchesResponse.data);
    } catch (error) {
      console.error('Error loading user items:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string, type: 'lost' | 'found') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const tableName = type === 'lost' ? 'lost_items' : 'found_items';
      const { error } = await supabase.from(tableName).delete().eq('id', itemId);

      if (error) throw error;

      if (type === 'lost') {
        setLostItems(lostItems.filter((item) => item.id !== itemId));
      } else {
        setFoundItems(foundItems.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const updateItemStatus = async (itemId: string, type: 'lost' | 'found', status: string) => {
    try {
      const tableName = type === 'lost' ? 'lost_items' : 'found_items';
      const { error } = await supabase
        .from(tableName)
        .update({ status })
        .eq('id', itemId);

      if (error) throw error;

      if (type === 'lost') {
        setLostItems(
          lostItems.map((item) =>
            item.id === itemId ? { ...item, status: status as any } : item
          )
        );
      } else {
        setFoundItems(
          foundItems.map((item) =>
            item.id === itemId ? { ...item, status: status as any } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ItemCard = ({ item, type }: { item: LostItem | FoundItem; type: 'lost' | 'found' }) => {
    const location = 'location_lost' in item ? item.location_lost : item.location_found;
    const date = 'date_lost' in item ? item.date_lost : item.date_found;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {item.image_url && (
          <div className="h-40 overflow-hidden bg-gray-100">
            <img
              src={item.image_url}
              alt={item.item_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{item.item_name}</h3>
            <StatusBadge status={item.status} />
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{formatDate(date)}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            {item.status === 'pending' && (
              <button
                onClick={() => updateItemStatus(item.id, type, 'closed')}
                className="flex-1 py-2 px-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Found
              </button>
            )}
            <button
              onClick={() => deleteItem(item.id, type)}
              className="py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
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
          <p className="text-gray-600">Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Items</h1>
          <p className="text-gray-600">Manage your reported items and matches</p>
        </div>

        {matches.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Potential Matches Found!
                </h3>
                <p className="text-blue-800 mb-3">
                  We found {matches.length} potential match{matches.length > 1 ? 'es' : ''} for your items.
                </p>
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div key={match.id} className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Match Score:</strong> {match.match_score}%
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Reason:</strong> {match.match_reason}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Contact:</strong> {match.lost_items?.profiles?.full_name || match.found_items?.profiles?.full_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Lost Items ({lostItems.length})
          </h2>
          {lostItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map((item) => (
                <ItemCard key={item.id} item={item} type="lost" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">You haven't reported any lost items yet</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Found Items ({foundItems.length})
          </h2>
          {foundItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundItems.map((item) => (
                <ItemCard key={item.id} item={item} type="found" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">You haven't reported any found items yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
