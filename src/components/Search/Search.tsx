import { useState } from 'react';
import { Search as SearchIcon, Filter, MapPin, Calendar, Tag, Package } from 'lucide-react';
import { supabase, LostItem, FoundItem } from '../../lib/supabase';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Documents', 'Accessories', 'Books', 'Keys', 'Other'];

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [results, setResults] = useState<(LostItem | FoundItem)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);

    try {
      const tableName = itemType === 'lost' ? 'lost_items' : 'found_items';
      let query = supabase
        .from(tableName)
        .select('*, profiles(full_name, email)')
        .eq('status', 'pending');

      if (category !== 'All') {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        query = query.or(
          `item_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching items:', error);
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

  const ItemCard = ({ item }: { item: LostItem | FoundItem }) => {
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Tag className="w-3 h-3 mr-1" />
                {item.category}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{formatDate(date)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Items</h1>
          <p className="text-gray-600">Find lost or found items on campus</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setItemType('lost')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                itemType === 'lost'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Search Lost Items
            </button>
            <button
              onClick={() => setItemType('found')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                itemType === 'found'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Search Found Items
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SearchIcon className="inline w-4 h-4 mr-1" />
                Search by keyword
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., iPhone, blue backpack, student ID..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Filter by category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {searched && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({results.length})
              </h2>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or check back later
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
