'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/lib/hooks';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebounce(searchInput, 300);
  const [actionFilter, setActionFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await fetch('/api/stitch/activityLogs');
        if (res.ok) {
          const data = await res.json();
          // Sort by timestamp descending
          data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLogs(data);
        } else {
          throw new Error('Failed to load system activity logs.');
        }
      } catch (err: any) {
        setError(err.message || 'Error occurred while load auditing logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const handleClearFilters = () => {
    setSearchInput('');
    setActionFilter('all');
    setCurrentPage(1);
  };

  // Filter logs logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Action filter
      if (actionFilter !== 'all') {
        if (actionFilter === 'failed_login') {
          if (log.action !== 'failed_login') return false;
        } else if (actionFilter === 'login_signup') {
          if (log.action !== 'login' && log.action !== 'signup') return false;
        } else if (actionFilter === 'download') {
          if (log.action !== 'download') return false;
        } else if (actionFilter === 'mutations') {
          if (log.action !== 'create' && log.action !== 'update' && log.action !== 'delete') return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const emailMatch = log.email?.toLowerCase().includes(q) || log.userId?.toLowerCase().includes(q);
        const actionMatch = log.action?.toLowerCase().includes(q);
        const detailsMatch = log.details?.toLowerCase().includes(q);
        const ipMatch = log.ipAddress?.toLowerCase().includes(q);
        const collMatch = log.collection?.toLowerCase().includes(q);

        return emailMatch || actionMatch || detailsMatch || ipMatch || collMatch;
      }

      return true;
    });
  }, [logs, searchQuery, actionFilter]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    
    const headers = ['Timestamp', 'Action', 'Email', 'User ID', 'Collection', 'IP Address', 'Details'];
    const rows = filteredLogs.map((log) => [
      log.timestamp || '',
      log.action || '',
      log.email || '',
      log.userId || '',
      log.collection || '',
      log.ipAddress || '',
      `"${(log.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eavault_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'login':
      case 'signup':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed_login':
      case 'delete':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'create':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'update':
      case 'download':
        return 'bg-vault-gold/10 text-vault-gold border-vault-gold/20';
      default:
        return 'bg-vault-border/50 text-vault-text-secondary border-vault-border';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            Audit Activity Trail
          </h1>
          <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
            Live administrative and database modification logger. Monitored for compliance and security forensics.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredLogs.length === 0}
          className="rounded-xl border border-vault-border bg-vault-surface px-5 py-2.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors disabled:opacity-40"
        >
          📥 Export Audit Trail (.CSV)
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
          {error}
        </div>
      )}

      {/* Toolbar controls */}
      <div className="bg-vault-surface border border-vault-border p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-center flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search logs by email, resource, description or IP..."
            className="w-full sm:w-80 rounded-xl border border-vault-border bg-vault-bg px-3.5 py-2.5 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto rounded-xl border border-vault-border bg-vault-bg px-3 py-2.5 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
          >
            <option value="all">All Event Categories</option>
            <option value="login_signup">Access (Login / Signup)</option>
            <option value="failed_login">Lockouts & Failed Logins</option>
            <option value="download">File Downloads</option>
            <option value="mutations">DB Changes (Create/Edit/Delete)</option>
          </select>
        </div>

        {(searchInput || actionFilter !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="text-vault-text-muted hover:text-vault-gold transition-colors font-heading text-xs font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Audit Table */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-12 text-center font-body text-xs text-vault-text-muted">
          No audit records found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-vault-border bg-vault-surface">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-vault-border bg-vault-bg/60 font-heading text-xs font-bold text-vault-text-secondary uppercase select-none">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Collection</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="font-body text-xs text-vault-text-secondary">
                {paginatedLogs.map((log, idx) => (
                  <tr
                    key={log.id || idx}
                    className="border-b border-vault-border last:border-none hover:bg-vault-surface-high/30 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap text-vault-text-muted font-heading font-medium text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {log.email ? (
                        <div>
                          <span className="font-heading font-bold text-vault-text block">{log.email}</span>
                          <span className="text-[10px] text-vault-text-muted">{log.userId}</span>
                        </div>
                      ) : (
                        <span className="text-vault-text-muted">Anonymous Guest</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-heading font-bold uppercase border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-heading font-semibold text-vault-text capitalize">
                      {log.collection || '—'}
                    </td>
                    <td className="p-4 max-w-sm font-body text-xs text-vault-text leading-relaxed">
                      {log.details}
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono text-[10px] text-vault-text-muted">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-vault-border pt-4 select-none">
              <span className="font-body text-xs text-vault-text-muted">
                Showing page <strong className="text-vault-text">{currentPage}</strong> of <strong className="text-vault-text">{totalPages}</strong> ({filteredLogs.length} total entries)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="rounded-xl border border-vault-border px-3.5 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  &larr; Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="rounded-xl border border-vault-border px-3.5 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
