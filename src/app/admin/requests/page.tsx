'use client';

import { useState, useEffect } from 'react';

export default function AdminRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('desc'); // desc = newest, asc = oldest
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Notes state for individual rows
  const [notesState, setNotesState] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await fetch('/api/stitch/customRequests');
      if (res.ok) {
        const list = await res.json();
        setRequests(list);
        // Pre-fill notesState
        const notesObj: { [key: string]: string } = {};
        list.forEach((r: any) => {
          notesObj[r.id] = r.adminNotes || '';
        });
        setNotesState(notesObj);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const targetReq = requests.find((r) => r.id === id);
      if (!targetReq) return;

      const res = await fetch(`/api/stitch/customRequests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );

        // Find user by email and send notification
        try {
          const usersRes = await fetch('/api/stitch/users');
          if (usersRes.ok) {
            const usersList = await usersRes.json();
            const targetUser = usersList.find(
              (u: any) => u.email?.toLowerCase().trim() === targetReq.email?.toLowerCase().trim()
            );

            if (targetUser) {
              let title = 'Custom Request Status Updated';
              let message = `Your request for "${targetReq.eaName}" is now in "${newStatus}" status.`;

              if (newStatus === 'pending') {
                title = 'Request In Progress 🛠️';
                message = `Good news! Sourcing is in progress for your requested EA: "${targetReq.eaName}". We will notify you when decrypted.`;
              } else if (newStatus === 'accepted') {
                title = 'Request Fulfilled 🎉';
                message = `Excellent news! We have successfully sourced and verified "${targetReq.eaName}". Check your email for purchase instructions.`;
              } else if (newStatus === 'rejected') {
                title = 'Request Declined ❌';
                message = `Unfortunately, we were unable to verify or source "${targetReq.eaName}". Please submit another request or contact support.`;
              }

              await fetch('/api/stitch/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: targetUser.id,
                  title,
                  message,
                  type: 'request',
                  read: false,
                  createdAt: new Date().toISOString()
                })
              });
            }
          }
        } catch (notifErr) {
          console.error('Error sending request notification:', notifErr);
        }
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    const text = notesState[id] || '';
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/stitch/customRequests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: text })
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, adminNotes: text } : r))
        );
        alert('Internal admin notes saved.');
      } else {
        alert('Failed to save notes.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving notes.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Sort and Filter logic
  const filteredRequests = requests
    .filter((r) => {
      const eaName = r.eaName.toLowerCase();
      const email = r.email ? r.email.toLowerCase() : '';
      const notes = r.notes ? r.notes.toLowerCase() : '';

      const matchesSearch =
        eaName.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase()) ||
        notes.includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'desc' ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">
          Custom EA Requests Queue
        </h1>
        <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
          Track customer pipelines for custom Expert Advisor decryptions and licensing.
        </p>
      </div>

      {/* Filter and Sorting bar */}
      <div className="bg-vault-surface border border-vault-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request tags, EA names, customer emails..."
            className="w-full md:w-60 rounded-xl border border-vault-border bg-vault-bg px-3.5 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New (Red)</option>
            <option value="pending">In Progress (Amber)</option>
            <option value="reviewing">Reviewing (Blue)</option>
            <option value="accepted">Fulfilled (Green)</option>
            <option value="rejected">Declined (Gray)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <span className="font-body text-xs text-vault-text-secondary">
          Active requests: <strong>{filteredRequests.length}</strong>
        </span>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-12 text-center font-body text-xs text-vault-text-muted">
          No sourcing requests match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-vault-border bg-vault-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vault-border bg-vault-bg/60 font-heading text-xs font-bold text-vault-text-secondary uppercase">
                <th className="p-4 sm:p-5">EA Name</th>
                <th className="p-4 sm:p-5">MQL5 Link</th>
                <th className="p-4 sm:p-5">Platform</th>
                <th className="p-4 sm:p-5">WhatsApp / Budget</th>
                <th className="p-4 sm:p-5">Customer Email</th>
                <th className="p-4 sm:p-5">Date</th>
                <th className="p-4 sm:p-5">Status</th>
                <th className="p-4 sm:p-5 text-right font-heading text-xs font-bold text-vault-text-secondary uppercase">Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs text-vault-text-secondary">
              {filteredRequests.map((req) => {
                const isExpanded = expandedReqId === req.id;

                // Color coding tags based on status options
                let badgeClass = 'bg-vault-border text-vault-text-muted'; // Declined
                let statusLabel = req.status;

                if (req.status === 'new') {
                  badgeClass = 'bg-vault-loss/15 text-vault-loss border border-vault-loss/20'; // New (red)
                  statusLabel = 'New';
                } else if (req.status === 'pending' || req.status === 'reviewing' || req.status === 'quoted') {
                  badgeClass = 'bg-vault-gold/15 text-vault-gold border border-vault-gold/20'; // In Progress (amber)
                  statusLabel = 'In Progress';
                } else if (req.status === 'accepted' || req.status === 'completed' || req.status === 'fulfilled') {
                  badgeClass = 'bg-vault-profit/15 text-vault-profit border border-vault-profit/20'; // Fulfilled (green)
                  statusLabel = 'Fulfilled';
                } else if (req.status === 'rejected' || req.status === 'declined') {
                  badgeClass = 'bg-vault-surface-high text-vault-text-muted border border-vault-border'; // Declined (gray)
                  statusLabel = 'Declined';
                }

                // Mailto Subject
                const mailtoUrl = `mailto:${req.email}?subject=Re: Your EA Request - ${encodeURIComponent(req.eaName)}&body=Hello,\n\nRegarding your request for the EA "${req.eaName}"...`;

                return (
                  <>
                    <tr
                      key={req.id}
                      onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                      className="border-b border-vault-border last:border-none hover:bg-vault-surface-high/30 transition-colors cursor-pointer select-none"
                    >
                      <td className="p-4 sm:p-5 font-heading font-bold text-vault-text">
                        {req.eaName}
                      </td>
                      <td className="p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
                        {req.mql5Url ? (
                          <a
                            href={req.mql5Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-vault-gold hover:underline font-heading font-bold text-[11px]"
                          >
                            MQL5 Listing ↗
                          </a>
                        ) : (
                          <span className="text-vault-text-muted">None</span>
                        )}
                      </td>
                      <td className="p-4 sm:p-5 uppercase font-heading font-semibold text-vault-text">
                        {req.platform}
                      </td>
                      <td className="p-4 sm:p-5 font-heading font-semibold text-vault-text">
                        {req.whatsapp || req.budget || 'N/A'}
                      </td>
                      <td className="p-4 sm:p-5">
                        {req.email}
                      </td>
                      <td className="p-4 sm:p-5 text-vault-text-muted">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-heading font-extrabold uppercase ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          disabled={updatingId === req.id}
                          value={req.status}
                          onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                          className="rounded border border-vault-border bg-vault-bg px-2 py-1 text-[10px] font-heading font-semibold text-vault-text focus:border-vault-gold outline-none cursor-pointer"
                        >
                          <option value="new">New (Red)</option>
                          <option value="pending">In Progress (Amber)</option>
                          <option value="accepted">Fulfilled (Green)</option>
                          <option value="rejected">Declined (Gray)</option>
                        </select>
                      </td>
                    </tr>

                    {/* DETAIL PANEL */}
                    {isExpanded && (
                      <tr className="bg-vault-bg/40 border-b border-vault-border">
                        <td colSpan={8} className="p-6 space-y-5 font-body text-xs text-vault-text-secondary leading-relaxed">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Submitted info */}
                            <div className="space-y-4">
                              <h4 className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-vault-text-muted">Submitted Form Parameters</h4>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block">Requested Name:</span>
                                  <span className="font-heading text-xs font-bold text-vault-text">{req.eaName}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block">Platform:</span>
                                  <span className="font-heading text-xs font-bold text-vault-text uppercase">{req.platform}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block">{req.whatsapp ? 'WhatsApp Number:' : 'Sourcing Budget:'}</span>
                                  <span className="font-heading text-xs font-bold text-vault-text">{req.whatsapp || req.budget || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block">Customer Email:</span>
                                  <span className="font-heading text-xs font-bold text-vault-text">{req.email}</span>
                                </div>
                              </div>

                              {req.notes && (
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block mb-1">Customer Message:</span>
                                  <div className="rounded-xl border border-vault-border bg-vault-surface p-4 text-vault-text">
                                    {req.notes}
                                  </div>
                                </div>
                              )}

                              <div className="pt-2">
                                <a
                                  href={mailtoUrl}
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-vault-gold px-4 py-2.5 font-heading text-[11px] font-bold text-vault-bg hover:opacity-90 transition-opacity"
                                >
                                  📧 Reply via Customer Email
                                </a>
                              </div>
                            </div>

                            {/* Internal Admin notes */}
                            <div className="space-y-3">
                              <h4 className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-vault-text-muted">Internal Notes (Visible only to Admin)</h4>
                              
                              <textarea
                                rows={4}
                                value={notesState[req.id] || ''}
                                onChange={(e) => setNotesState({ ...notesState, [req.id]: e.target.value })}
                                placeholder="Enter internal notes, progress tracking, link to decryption tools..."
                                className="w-full rounded-xl border border-vault-border bg-vault-surface px-3 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold resize-none"
                              />

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  disabled={updatingId === req.id}
                                  onClick={() => handleSaveNotes(req.id)}
                                  className="rounded-lg bg-vault-gold/10 hover:bg-vault-gold hover:text-vault-bg px-4 py-2 text-[10px] font-heading font-extrabold text-vault-gold transition-all cursor-pointer"
                                >
                                  Save Internal Note
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
