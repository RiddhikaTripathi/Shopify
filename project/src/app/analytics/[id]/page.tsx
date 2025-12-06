'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { AnalyticsChart } from '@/components/AnalyticsChart';

interface AnalyticsData {
  date: string;
  totalRevenue: string;
  totalOrders: number;
  averageOrderValue: string;
  newCustomers: number;
}

interface Summary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalNewCustomers: number;
}

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  async function fetchAnalytics() {
    try {
      const response = await fetch(`/api/stores/${params.id}/analytics?days=${days}`);
      const data = await response.json();
      setAnalytics(data.analytics);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  const chartData = analytics.map(a => ({
    date: a.date,
    totalRevenue: parseFloat(a.totalRevenue),
    totalOrders: a.totalOrders,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Stores
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Analytics</h1>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={`$${summary.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatCard
              title="Total Orders"
              value={summary.totalOrders}
              icon={ShoppingCart}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Average Order Value"
              value={`$${summary.averageOrderValue.toFixed(2)}`}
              icon={TrendingUp}
              bgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            <StatCard
              title="New Customers"
              value={summary.totalNewCustomers}
              icon={Users}
              bgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
          {chartData.length > 0 ? (
            <AnalyticsChart data={chartData} />
          ) : (
            <div className="text-center py-12 text-gray-600">
              No analytics data available. Try syncing your store data first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
