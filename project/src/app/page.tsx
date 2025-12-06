'use client';

import { useState, useEffect } from 'react';
import { StoreCard } from '@/components/StoreCard';
import { AddStoreModal } from '@/components/AddStoreModal';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Store {
  id: string;
  shopDomain: string;
  storeName: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

export default function Home() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingStores, setSyncingStores] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    try {
      const response = await fetch('/api/stores');
      const data = await response.json();
      setStores(data.stores);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStore(data: { shopDomain: string; storeName: string; accessToken: string }) {
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchStores();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add store');
      }
    } catch (error) {
      console.error('Failed to add store:', error);
      alert('Failed to add store');
    }
  }

  async function handleSync(storeId: string) {
    setSyncingStores(prev => new Set(prev).add(storeId));

    try {
      const response = await fetch(`/api/stores/${storeId}/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Sync completed successfully!');
        fetchStores();
      } else {
        const error = await response.json();
        alert(error.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed');
    } finally {
      setSyncingStores(prev => {
        const next = new Set(prev);
        next.delete(storeId);
        return next;
      });
    }
  }

  async function handleDelete(storeId: string) {
    if (!confirm('Are you sure you want to delete this store?')) return;

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchStores();
      } else {
        alert('Failed to delete store');
      }
    } catch (error) {
      console.error('Failed to delete store:', error);
      alert('Failed to delete store');
    }
  }

  function handleViewAnalytics(storeId: string) {
    router.push(`/analytics/${storeId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopify Analytics System</h1>
            <p className="text-gray-600 mt-2">Manage your Shopify stores and view analytics</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Store
          </button>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No stores added yet</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onSync={handleSync}
                onDelete={handleDelete}
                onViewAnalytics={handleViewAnalytics}
                isSyncing={syncingStores.has(store.id)}
              />
            ))}
          </div>
        )}

        <AddStoreModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddStore}
        />
      </div>
    </div>
  );
}
