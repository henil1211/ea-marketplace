'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/lib/hooks';

export default function AdminEAManagementPage() {
  const [loading, setLoading] = useState(true);
  const [eas, setEas] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Bulk Actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchEAs();
  }, []);

  async function fetchEAs() {
    setLoading(true);
    try {
      const res = await fetch('/api/stitch/eas');
      if (res.ok) {
        const data = await res.json();
        setEas(data);
      } else {
        throw new Error('Failed to load expert advisors.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while fetching EAs.');
    } finally {
      setLoading(false);
    }
  }

  // Toggle status (Active / Draft)
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      const res = await fetch(`/api/stitch/eas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setEas((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    }
  };

  // Toggle Featured (Yes / No)
  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const newFeatured = !currentFeatured;
    try {
      const res = await fetch(`/api/stitch/eas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured })
      });
      if (res.ok) {
        setEas((prev) =>
          prev.map((e) => (e.id === id ? { ...e, featured: newFeatured } : e))
        );
      } else {
        alert('Failed to update featured state.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating featured state.');
    }
  };

  // Single Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Expert Advisor? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/stitch/eas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEas((prev) => prev.filter((e) => e.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } else {
        alert('Failed to delete EA.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting EA.');
    }
  };

  // Bulk Selection helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEas.map((ea) => ea.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Process Bulk Action
  const handleExecuteBulkAction = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one Expert Advisor.');
      return;
    }
    if (!bulkAction) return;

    if (bulkAction === 'delete') {
      if (!confirm(`Are you sure you want to delete all ${selectedIds.length} selected EAs?`)) return;
    }

    setLoading(true);
    try {
      if (bulkAction === 'activate') {
        await Promise.all(
          selectedIds.map((id) =>
            fetch(`/api/stitch/eas/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'active' })
            })
          )
        );
        alert('Selected EAs activated successfully.');
      } else if (bulkAction === 'deactivate') {
        await Promise.all(
          selectedIds.map((id) =>
            fetch(`/api/stitch/eas/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'draft' })
            })
          )
        );
        alert('Selected EAs deactivated successfully.');
      } else if (bulkAction === 'delete') {
        await Promise.all(selectedIds.map((id) => fetch(`/api/stitch/eas/${id}`, { method: 'DELETE' })));
        alert('Selected EAs deleted successfully.');
      }
      setSelectedIds([]);
      setBulkAction('');
      await fetchEAs();
    } catch (err) {
      console.error(err);
      alert('Error occurred during bulk action.');
      setLoading(false);
    }
  };

  // Filter application
  const filteredEas = eas.filter((ea) => {
    const matchesSearch =
      ea.name.toLowerCase().includes(search.toLowerCase()) ||
      ea.shortDesc?.toLowerCase().includes(search.toLowerCase()) ||
      (ea.tags && ea.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesPlatform = platformFilter === 'all' || ea.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || ea.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ea.category === categoryFilter;

    return matchesSearch && matchesPlatform && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            EA Catalog Management
          </h1>
          <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
            Manage listing status, edit configurations, verify backtest benchmarks, and toggle homepage showcases.
          </p>
        </div>
        <Link
          href="/admin/eas/new"
          className="rounded-xl bg-vault-gold px-5 py-2.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
        >
          + Add New EA
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
          {error}
        </div>
      )}

      {/* Toolbar Filter Controls */}
      <div className="bg-vault-surface border border-vault-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex flex-wrap gap-3 items-center flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search EAs by name, tags, description..."
            className="w-full md:w-60 rounded-xl border border-vault-border bg-vault-bg px-3.5 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="mt4">MT4</option>
            <option value="mt5">MT5</option>
            <option value="both">Both MT4 & MT5</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer capitalize"
          >
            <option value="all">All Categories</option>
            <option value="scalping">Scalping</option>
            <option value="swing trading">Swing Trading</option>
            <option value="grid">Grid Strategy</option>
            <option value="hedging">Hedging</option>
            <option value="trend following">Trend Following</option>
            <option value="news trading">News Trading</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-vault-border">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
            >
              <option value="">Bulk Actions</option>
              <option value="activate">Activate Selected</option>
              <option value="deactivate">Deactivate Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              onClick={handleExecuteBulkAction}
              disabled={!bulkAction}
              className="rounded-xl bg-vault-gold px-4 py-2 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
            >
              Apply ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
        </div>
      ) : filteredEas.length === 0 ? (
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-12 text-center font-body text-xs text-vault-text-muted">
          No listed Expert Advisors match the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-vault-border bg-vault-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vault-border bg-vault-bg/60 font-heading text-xs font-bold text-vault-text-secondary uppercase select-none">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredEas.length > 0 && selectedIds.length === filteredEas.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
                  />
                </th>
                <th className="p-4">Thumbnail</th>
                <th className="p-4">EA Name</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Category</th>
                <th className="p-4">Prices (Our/MQL5)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs text-vault-text-secondary">
              {filteredEas.map((ea) => {
                const isSelected = selectedIds.includes(ea.id);
                return (
                  <tr
                    key={ea.id}
                    className={`border-b border-vault-border last:border-none hover:bg-vault-surface-high/30 transition-colors ${
                      isSelected ? 'bg-vault-gold/5' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(ea.id, e.target.checked)}
                        className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="h-12 w-12 overflow-hidden rounded bg-vault-bg border border-vault-border flex items-center justify-center shrink-0">
                        {ea.thumbnail ? (
                          <img src={ea.thumbnail} alt={ea.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl">🤖</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-heading font-bold text-vault-text block text-sm">{ea.name}</span>
                      <span className="text-[10px] text-vault-text-muted mt-0.5 block truncate max-w-[160px]">{ea.slug}</span>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-heading font-extrabold uppercase ${
                        ea.platform === 'mt4' ? 'bg-blue-500/10 text-blue-400' :
                        ea.platform === 'mt5' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-vault-gold/10 text-vault-gold'
                      }`}>
                        {ea.platform}
                      </span>
                    </td>
                    <td className="p-4 font-heading font-medium text-vault-text capitalize">
                      {ea.category}
                    </td>
                    <td className="p-4 font-heading font-semibold text-vault-text">
                      <span className="text-vault-gold font-bold">${ea.ourPrice}</span>
                      <span className="line-through text-vault-text-muted text-[10px] ml-1.5">${ea.mql5Price}</span>
                    </td>
                    <td className="p-4">
                      {/* Status Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(ea.id, ea.status)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          ea.status === 'active' ? 'bg-vault-profit' : 'bg-vault-border'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-vault-bg shadow ring-0 transition duration-200 ease-in-out ${
                            ea.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-4">
                      {/* Featured Toggle Switch */}
                      <button
                        onClick={() => handleToggleFeatured(ea.id, ea.featured)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          ea.featured ? 'bg-vault-gold' : 'bg-vault-border'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-vault-bg shadow ring-0 transition duration-200 ease-in-out ${
                            ea.featured ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/eas/${ea.id}/edit`}
                          className="rounded border border-vault-border bg-vault-bg px-2.5 py-1 text-[10px] font-heading font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/marketplace/${ea.slug}`}
                          target="_blank"
                          className="rounded border border-vault-border bg-vault-bg px-2.5 py-1 text-[10px] font-heading font-bold text-vault-text hover:text-vault-gold transition-colors"
                        >
                          Preview
                        </Link>
                        <button
                          onClick={() => handleDelete(ea.id)}
                          className="rounded border border-vault-loss/20 text-vault-loss px-2.5 py-1 text-[10px] font-heading font-bold hover:bg-vault-loss/5 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
