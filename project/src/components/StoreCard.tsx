import { Store, RefreshCw, Trash2, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StoreCardProps {
  store: {
    id: string;
    shopDomain: string;
    storeName: string;
    isActive: boolean;
    lastSyncAt: string | null;
  };
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
  onViewAnalytics: (id: string) => void;
  isSyncing: boolean;
}

export function StoreCard({ store, onSync, onDelete, onViewAnalytics, isSyncing }: StoreCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Store className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{store.storeName}</h3>
            <p className="text-sm text-gray-600">{store.shopDomain}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          store.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {store.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Last synced: {' '}
          {store.lastSyncAt
            ? formatDistanceToNow(new Date(store.lastSyncAt), { addSuffix: true })
            : 'Never'}
        </p>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => onViewAnalytics(store.id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
        <button
          onClick={() => onSync(store.id)}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync
        </button>
        <button
          onClick={() => onDelete(store.id)}
          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
