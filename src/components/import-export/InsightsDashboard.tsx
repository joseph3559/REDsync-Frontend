"use client";
import { useMemo } from "react";
import { ImportExportRow } from "@/lib/api";
import { TrendingUp, DollarSign, Package, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface InsightsDashboardProps {
  data: ImportExportRow[];
}

export default function InsightsDashboard({ data }: InsightsDashboardProps) {
  const insights = useMemo(() => {
    if (!data.length) return null;

    // Basic statistics
    const totalRows = data.length;
    const totalQuantity = data.reduce((sum, row) => sum + (row.Quantity || 0), 0);
    const totalValue = data.reduce((sum, row) => sum + ((row.Price || 0) * (row.Quantity || 0)), 0);
    const avgPrice = data.filter(row => row.Price).reduce((sum, row) => sum + (row.Price || 0), 0) / data.filter(row => row.Price).length;

    // Top competitors by frequency
    const competitorCounts = data.reduce((acc, row) => {
      const competitor = row["Importer/Exporter"] || 'Unknown';
      acc[competitor] = (acc[competitor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCompetitors = Object.entries(competitorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Price trends by product (simplified - group by product name)
    const productPrices = data.reduce((acc, row) => {
      if (!row.Price || !row["Product Name"]) return acc;
      const product = row["Product Name"];
      if (!acc[product]) acc[product] = [];
      acc[product].push(row.Price);
      return acc;
    }, {} as Record<string, number[]>);

    const avgPriceByProduct = Object.entries(productPrices)
      .map(([product, prices]) => ({
        product: product.length > 30 ? product.substring(0, 30) + '...' : product,
        avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        count: prices.length
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 8);

    // Currency distribution
    const currencyDistribution = data.reduce((acc, row) => {
      const currency = row.Currency || 'Unknown';
      acc[currency] = (acc[currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currencyData = Object.entries(currencyDistribution)
      .map(([currency, count]) => ({ currency, count }))
      .sort((a, b) => b.count - a.count);

    // Incoterm distribution
    const incotermDistribution = data.reduce((acc, row) => {
      const incoterm = row.Incoterm || 'Unknown';
      acc[incoterm] = (acc[incoterm] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const incotermData = Object.entries(incotermDistribution)
      .map(([incoterm, count]) => ({ incoterm, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRows,
      totalQuantity,
      totalValue,
      avgPrice,
      topCompetitors,
      avgPriceByProduct,
      currencyData,
      incotermData
    };
  }, [data]);

  if (!insights) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-500">Upload files to see insights and analytics</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const colors = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Records</p>
              <p className="text-3xl font-bold text-slate-900">{formatNumber(insights.totalRows)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Quantity</p>
              <p className="text-3xl font-bold text-slate-900">{formatNumber(insights.totalQuantity)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(insights.totalValue)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Price</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(insights.avgPrice)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Competitors */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Competitors</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.topCompetitors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Price by Product */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Average Price by Product</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.avgPriceByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="product" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="avgPrice" stroke="#0f172a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Currency Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Currency Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insights.currencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {insights.currencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incoterm Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Incoterm Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.incotermData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="incoterm" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#64748b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Competitors List */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Competitor Details</h3>
        <div className="space-y-3">
          {insights.topCompetitors.map((competitor, index) => (
            <div key={competitor.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-700">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{competitor.name}</p>
                  <p className="text-sm text-slate-500">{competitor.count} records</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-900">{competitor.count}</p>
                <p className="text-sm text-slate-500">
                  {((competitor.count / insights.totalRows) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
