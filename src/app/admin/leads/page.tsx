'use client';

import { useState, useEffect, Fragment } from 'react';
import { formatPrice } from '@/lib/utils';
import { Lead, LeadStatus } from '@/lib/stitch';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-vault-loss/10 text-vault-loss border-vault-loss/20' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'negotiating', label: 'Negotiating', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'converted', label: 'Converted', color: 'bg-vault-profit/10 text-vault-profit border-vault-profit/20' },
  { value: 'closed', label: 'Closed', color: 'bg-vault-text-muted/10 text-vault-text-muted border-vault-text-muted/20' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing notes state
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');

  // Expanded detail panel
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [newNotes, setNewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stitch/leads');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        // Sort newest first
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLeads(list);
      } else {
        setError('Failed to fetch leads database.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading leads.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const timestamp = new Date().toISOString();
    const timeline = Array.isArray(lead.timeline) ? [...lead.timeline] : [];
    if (timeline.length === 0) {
      timeline.push({ event: 'Lead Created', timestamp: lead.createdAt || timestamp });
    }
    const statusLabel = STATUS_OPTIONS.find(o => o.value === newStatus)?.label || newStatus;
    timeline.push({ event: `Status Changed to ${statusLabel}`, timestamp });

    try {
      const res = await fetch(`/api/stitch/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          timeline
        }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, timeline } : l))
        );
        setSuccess(`Lead status updated to ${statusLabel}.`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update lead status.');
      }
    } catch (err) {
      console.error(err);
      setError('Error updating lead status.');
    }
  };

  const handleSaveNotes = async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const timestamp = new Date().toISOString();
    const notesLog = Array.isArray(lead.notesLog) ? [...lead.notesLog] : [];
    if (notesLog.length === 0 && lead.notes) {
      notesLog.push({ text: lead.notes, createdAt: lead.createdAt || timestamp });
    }
    notesLog.push({ text: editingNotes, createdAt: timestamp });

    const timeline = Array.isArray(lead.timeline) ? [...lead.timeline] : [];
    if (timeline.length === 0) {
      timeline.push({ event: 'Lead Created', timestamp: lead.createdAt || timestamp });
    }
    timeline.push({ event: `Note Added (Inline Edit): ${editingNotes.substring(0, 30)}...`, timestamp });

    try {
      const res = await fetch(`/api/stitch/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: editingNotes,
          notesLog,
          timeline
        }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, notes: editingNotes, notesLog, timeline } : l))
        );
        setEditingLeadId(null);
        setSuccess('Notes updated successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save notes.');
      }
    } catch (err) {
      console.error(err);
      setError('Error saving notes.');
    }
  };

  const handleAppendNote = async (leadId: string, newNoteText: string) => {
    if (!newNoteText.trim()) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const timestamp = new Date().toISOString();
    const notesLog = Array.isArray(lead.notesLog) ? [...lead.notesLog] : [];
    if (notesLog.length === 0 && lead.notes) {
      notesLog.push({ text: lead.notes, createdAt: lead.createdAt || timestamp });
    }
    notesLog.push({ text: newNoteText, createdAt: timestamp });

    const timeline = Array.isArray(lead.timeline) ? [...lead.timeline] : [];
    if (timeline.length === 0) {
      timeline.push({ event: 'Lead Created', timestamp: lead.createdAt || timestamp });
    }
    timeline.push({ event: `Note Added: ${newNoteText.substring(0, 30)}...`, timestamp });

    try {
      const res = await fetch(`/api/stitch/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: newNoteText,
          notesLog,
          timeline
        }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, notes: newNoteText, notesLog, timeline } : l))
        );
        setSuccess('Internal note added to lead timeline.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to append note.');
      }
    } catch (err) {
      console.error(err);
      setError('Error appending note.');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/stitch/leads/${leadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
        setSuccess('Lead deleted successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete lead.');
      }
    } catch (err) {
      console.error(err);
      setError('Error deleting lead.');
    }
  };

  // Compute stats
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Inquiries today
  const inquiriesToday = leads.filter((l) => {
    const today = new Date().toISOString().split('T')[0];
    return l.createdAt && l.createdAt.startsWith(today);
  }).length;

  // Most requested EA
  const eaCounts = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.eaName] = (acc[lead.eaName] || 0) + 1;
    return acc;
  }, {});
  let mostRequestedEA = 'None';
  let maxCount = 0;
  Object.entries(eaCounts).forEach(([eaName, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostRequestedEA = eaName;
    }
  });

  // Filtered leads list
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch =
      lead.eaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            Lead Management
          </h1>
          <p className="mt-1 font-body text-xs text-vault-text-secondary">
            Manage manual sales inquiries, transition lead statuses, add transaction notes, and coordinate WhatsApp sales channels.
          </p>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold ml-2">×</button>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-vault-profit/20 bg-vault-profit/5 p-4 text-xs text-vault-profit font-body flex justify-between items-center animate-pulse">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Dashboard Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5">
          <span className="font-body text-xs text-vault-text-secondary">Total Inquiries</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold text-vault-text">{totalLeads}</span>
            <span className="font-body text-[10px] text-vault-text-secondary">leads captured</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5">
          <span className="font-body text-xs text-vault-text-secondary">Conversion Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold text-vault-profit">{conversionRate}%</span>
            <span className="font-body text-[10px] text-vault-text-secondary">converted leads</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5">
          <span className="font-body text-xs text-vault-text-secondary">Inquiries Today</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold text-vault-gold">{inquiriesToday}</span>
            <span className="font-body text-[10px] text-vault-text-secondary">new queries</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5">
          <span className="font-body text-xs text-vault-text-secondary">Most Requested EA</span>
          <div className="mt-2 block truncate">
            <span className="font-heading text-sm font-bold text-vault-text block truncate" title={mostRequestedEA}>
              {mostRequestedEA}
            </span>
            <span className="font-body text-[10px] text-vault-text-secondary">
              {maxCount} {maxCount === 1 ? 'request' : 'requests'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-vault-surface border border-vault-border p-4 rounded-2xl">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search by customer, email, or EA name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-vault-border bg-vault-bg px-4 py-2.5 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-vault-text-secondary">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="negotiating">Negotiating</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="overflow-hidden rounded-2xl border border-vault-border bg-vault-surface">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-left">
            <thead>
              <tr className="border-b border-vault-border bg-vault-bg/50 font-heading text-[10px] font-bold uppercase tracking-wider text-vault-text-secondary">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">EA Name</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Source Channel</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Notes Preview</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vault-border font-body text-xs text-vault-text">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-vault-text-secondary">
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
                    <p className="mt-2">Loading manual leads databases...</p>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-vault-text-secondary">
                    No leads found matching current filtering settings.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isEditing = editingLeadId === lead.id;
                  const isExpanded = expandedLeadId === lead.id;
                  const currentStatusOpt = STATUS_OPTIONS.find((o) => o.value === lead.status) || STATUS_OPTIONS[0];

                  return (
                    <Fragment key={lead.id}>
                      <tr
                        className={`transition-colors hover:bg-vault-surface-high/30 cursor-pointer ${
                          isExpanded ? 'bg-vault-surface-high/20' : ''
                        }`}
                        onClick={() => lead.id && setExpandedLeadId(isExpanded ? null : lead.id)}
                      >
                        <td className="px-6 py-4 text-vault-text-secondary whitespace-nowrap">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-bold text-vault-text whitespace-nowrap">
                          {lead.eaName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="font-semibold">{lead.customerName || 'Guest User'}</div>
                          <div className="text-[10px] text-vault-text-secondary select-all">
                            {lead.customerEmail || 'No Email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="rounded bg-vault-surface-high px-2 py-1 font-body text-[10px] text-vault-text-secondary">
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id!, e.target.value as LeadStatus)}
                            className={`rounded-lg border px-2 py-1 font-heading text-[10px] font-bold outline-none cursor-pointer ${currentStatusOpt.color}`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value} className="bg-vault-surface text-vault-text font-body">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={editingNotes}
                                onChange={(e) => setEditingNotes(e.target.value)}
                                className="rounded border border-vault-border bg-vault-bg px-2 py-1 font-body text-xs text-vault-text outline-none focus:border-vault-gold w-full"
                              />
                              <button
                                onClick={() => handleSaveNotes(lead.id!)}
                                className="rounded bg-vault-profit px-2 py-1 text-[10px] font-bold text-vault-bg hover:opacity-90 transition-opacity"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingLeadId(null)}
                                className="rounded bg-vault-surface-high border border-vault-border px-2 py-1 text-[10px] text-vault-text hover:bg-vault-surface transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="truncate block max-w-[200px]" title={lead.notes}>
                                {lead.notes || <span className="italic text-vault-text-muted">No notes</span>}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingLeadId(lead.id!);
                                  setEditingNotes(lead.notes || '');
                                }}
                                className="opacity-0 group-hover:opacity-100 text-vault-gold hover:underline text-[10px] font-bold whitespace-nowrap"
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {lead.customerEmail && lead.customerEmail !== 'guest_guest@example.com' && (
                              <a
                                href={`mailto:${lead.customerEmail}?subject=Re: EAVault Inquiry for ${encodeURIComponent(lead.eaName)}&body=Hello ${encodeURIComponent(lead.customerName || '')},%0A%0AThank you for contacting EAVault support desk.%0A%0ARegarding your inquiry about the ${encodeURIComponent(lead.eaName)} Expert Advisor...`}
                                className="rounded-lg bg-vault-gold/10 px-2.5 py-1.5 font-heading text-[10px] font-bold text-vault-gold hover:bg-vault-gold hover:text-vault-bg transition-all"
                                title="Send prefilled email inquiry reply"
                              >
                                ✉️ Email
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteLead(lead.id!)}
                              className="rounded-lg border border-vault-loss/20 bg-vault-loss/5 px-2.5 py-1.5 font-heading text-[10px] font-bold text-vault-loss hover:bg-vault-loss hover:text-vault-text transition-all"
                              title="Delete Lead"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-vault-bg/60 border-b border-vault-border">
                          <td colSpan={7} className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Left Column: Lead Profile & Details */}
                              <div className="space-y-4 rounded-xl border border-vault-border bg-vault-surface p-4">
                                <h4 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider border-b border-vault-border/50 pb-2">
                                  Lead Profile & Attribution
                                </h4>
                                <div className="space-y-2.5 font-body text-xs text-vault-text-secondary">
                                  <div>
                                    <span className="text-[10px] text-vault-text-muted block font-bold uppercase">Customer Name:</span>
                                    <span className="text-vault-text font-semibold">{lead.customerName || 'Guest User'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-vault-text-muted block font-bold uppercase">Email:</span>
                                    <span className="font-mono text-vault-text select-all">{lead.customerEmail || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-vault-text-muted block font-bold uppercase">Telegram / WhatsApp:</span>
                                    <span className="text-vault-gold font-bold select-all">{lead.contactHandle || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-vault-text-muted block font-bold uppercase">Form Template Type:</span>
                                    <span className="text-vault-text">{lead.formType || 'General Inquiry'}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-vault-border/40">
                                    <div>
                                      <span className="text-[9px] text-vault-text-muted block font-bold uppercase">Traffic Source:</span>
                                      <span className="rounded bg-vault-bg px-2 py-0.5 text-[10px] text-vault-gold font-bold block mt-0.5 w-fit border border-vault-border">
                                        {lead.trafficSource || 'Direct'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-vault-text-muted block font-bold uppercase">Country:</span>
                                      <span className="rounded bg-vault-bg px-2 py-0.5 text-[10px] text-vault-text block mt-0.5 w-fit border border-vault-border font-mono">
                                        {lead.country || 'Unknown'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="pt-1.5 border-t border-vault-border/40">
                                    <span className="text-[10px] text-vault-text-muted block font-bold uppercase">Created At:</span>
                                    <span>{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'}</span>
                                  </div>
                                </div>

                                {/* Status Quick Adjust */}
                                <div className="space-y-2 pt-3 border-t border-vault-border/50">
                                  <label className="font-heading text-[10px] font-bold text-vault-text uppercase tracking-wider block">
                                    Pipeline Status
                                  </label>
                                  <div className="grid grid-cols-5 gap-1.5">
                                    {STATUS_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.value}
                                        onClick={() => handleStatusChange(lead.id!, opt.value)}
                                        className={`rounded-lg py-1.5 font-heading text-[8px] font-extrabold uppercase border text-center transition-all ${
                                          lead.status === opt.value
                                            ? 'bg-vault-gold text-vault-bg border-vault-gold shadow-md'
                                            : 'bg-vault-bg text-vault-text-secondary border-vault-border hover:border-vault-gold/40'
                                        }`}
                                        title={`Set status to ${opt.label}`}
                                      >
                                        {opt.label.substring(0, 4)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Middle Column: Lead Timeline */}
                              <div className="space-y-4 rounded-xl border border-vault-border bg-vault-surface p-4">
                                <h4 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider border-b border-vault-border/50 pb-2">
                                  Lead Timeline
                                </h4>
                                <div className="space-y-4 overflow-y-auto max-h-[220px] pr-2">
                                  {(!lead.timeline || lead.timeline.length === 0) ? (
                                    <div className="relative pl-6 space-y-1">
                                      <div className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-vault-gold" />
                                      <div className="absolute left-2.5 top-3.5 bottom-0 w-[1px] bg-vault-border" />
                                      <div className="text-xs font-heading font-bold text-vault-text">Lead Created</div>
                                      <div className="text-[10px] text-vault-text-muted">
                                        {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'}
                                      </div>
                                    </div>
                                  ) : (
                                    lead.timeline.map((evt, idx) => (
                                      <div key={idx} className="relative pl-6 space-y-1 group">
                                        {/* Timeline Line */}
                                        {idx < lead.timeline!.length - 1 && (
                                          <div className="absolute left-[9px] top-3.5 bottom-[-16px] w-[1px] bg-vault-border" />
                                        )}
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-1.5 top-1.5 h-2 w-2 rounded-full ${
                                          evt.event.includes('Created') ? 'bg-vault-gold' : 
                                          evt.event.includes('Status') ? 'bg-blue-400' : 'bg-vault-profit'
                                        }`} />
                                        
                                        <div className="text-xs font-heading font-bold text-vault-text leading-tight">
                                          {evt.event}
                                        </div>
                                        <div className="text-[10px] text-vault-text-muted">
                                          {new Date(evt.timestamp).toLocaleString()}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Right Column: Internal CRM Notes */}
                              <div className="space-y-4 rounded-xl border border-vault-border bg-vault-surface p-4 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider border-b border-vault-border/50 pb-2 mb-3">
                                    Internal Notes Log
                                  </h4>
                                  <div className="space-y-3 overflow-y-auto max-h-[150px] pr-2">
                                    {(!lead.notesLog || lead.notesLog.length === 0) ? (
                                      <div className="rounded-lg bg-vault-bg/60 p-2.5 border border-vault-border">
                                        <p className="font-body text-xs text-vault-text-secondary italic">
                                          {lead.notes || 'No notes added to this lead profile.'}
                                        </p>
                                        <span className="block text-[9px] text-vault-text-muted text-right mt-1">
                                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                      </div>
                                    ) : (
                                      lead.notesLog.map((note, idx) => (
                                        <div key={idx} className="rounded-lg bg-vault-bg/60 p-2.5 border border-vault-border">
                                          <p className="font-body text-xs text-vault-text-secondary whitespace-pre-wrap">
                                            {note.text}
                                          </p>
                                          <span className="block text-[9px] text-vault-text-muted text-right mt-1">
                                            {new Date(note.createdAt).toLocaleString()}
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                {/* Append Note Field */}
                                <div className="space-y-2 pt-2 border-t border-vault-border/40 mt-3">
                                  <textarea
                                    placeholder="Type note to append..."
                                    value={newNotes[lead.id!] || ''}
                                    onChange={(e) => setNewNotes(prev => ({ ...prev, [lead.id!]: e.target.value }))}
                                    rows={2}
                                    className="w-full rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold resize-none"
                                  />
                                  <button
                                    onClick={() => {
                                      handleAppendNote(lead.id!, newNotes[lead.id!] || '');
                                      setNewNotes(prev => ({ ...prev, [lead.id!]: '' }));
                                    }}
                                    className="w-full rounded-xl bg-vault-profit px-3 py-2 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
                                  >
                                    ➕ Append Internal Note
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
