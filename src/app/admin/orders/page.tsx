'use client';

import { useState, useEffect } from 'react';

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [eas, setEas] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersRes, easRes, usersRes] = await Promise.all([
        fetch('/api/stitch/orders'),
        fetch('/api/stitch/eas'),
        fetch('/api/stitch/users')
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (easRes.ok) setEas(await easRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Error loading admin orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const targetOrder = orders.find((o) => o.id === id);
      if (!targetOrder) return;

      const updatedOrder = { ...targetOrder, status: newStatus };

      const res = await fetch(`/api/stitch/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map((o) => (o.id === id ? updatedOrder : o)));
        
        // Send user notification if status is completed
        if (newStatus === 'completed') {
          try {
            await fetch('/api/stitch/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: targetOrder.userId,
                title: 'Order Completed',
                message: `Your payment of $${Number(targetOrder.amount).toFixed(2)} was processed successfully! You can now download the EA from your account dashboard.`,
                type: 'order',
                read: false,
                createdAt: new Date().toISOString()
              })
            });
          } catch (notifErr) {
            console.error('Error creating notification:', notifErr);
          }
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

  // Export to CSV helper
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'EA Purchased', 'Amount ($)', 'Payment Method', 'Date', 'Status'];
    const rows = filteredOrders.map((o) => {
      const user = usersMap.get(o.userId);
      const ea = easMap.get(o.eaId);
      return [
        o.orderId,
        user ? user.name : 'Unknown User',
        user ? user.email : 'N/A',
        ea ? ea.name : 'Unknown EA',
        Number(o.amount).toFixed(2),
        o.paymentMethod || 'Credit Card',
        new Date(o.createdAt).toLocaleDateString(),
        o.status
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Maps
  const easMap = new Map(eas.map((e) => [e.id, e]));
  const usersMap = new Map(users.map((u) => [u.id, u]));

  // Filters
  const filteredOrders = orders.filter((o) => {
    const ea = easMap.get(o.eaId);
    const user = usersMap.get(o.userId);
    const eaName = ea ? ea.name.toLowerCase() : '';
    const userEmail = user ? user.email.toLowerCase() : '';
    const userName = user ? user.name.toLowerCase() : '';
    const orderId = o.orderId.toLowerCase();

    const matchesSearch =
      orderId.includes(search.toLowerCase()) ||
      eaName.includes(search.toLowerCase()) ||
      userEmail.includes(search.toLowerCase()) ||
      userName.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && (o.status === 'completed' || o.status === 'paid')) ||
      (statusFilter === 'pending' && o.status === 'pending') ||
      (statusFilter === 'refunded' && (o.status === 'failed' || o.status === 'refunded'));

    // Date range filters
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(o.createdAt) >= new Date(startDate);
    }
    if (endDate) {
      // Set end date to end of that day
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(o.createdAt) <= endDateTime;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            Orders Management
          </h1>
          <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
            Process payments, inspect customer accounts, view download parameters, and download invoices.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="rounded-xl border border-vault-border bg-vault-surface px-5 py-2.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors flex items-center gap-2 cursor-pointer"
        >
          📥 Export to CSV
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-vault-surface border border-vault-border p-4 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div>
            <label className="block font-body text-[10px] font-bold text-vault-text-secondary uppercase mb-1.5">
              Search Orders
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Email, Order ID, EA..."
              className="w-full rounded-xl border border-vault-border bg-vault-bg px-3.5 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-body text-[10px] font-bold text-vault-text-secondary uppercase mb-1.5">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-vault-border bg-vault-bg px-3 py-2 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid (Completed)</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded / Failed</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-body text-[10px] font-bold text-vault-text-secondary uppercase mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-vault-border bg-vault-bg px-3.5 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block font-body text-[10px] font-bold text-vault-text-secondary uppercase mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-vault-border bg-vault-bg px-3.5 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>
        </div>

        {/* Clear Filters helper */}
        {(search || statusFilter !== 'all' || startDate || endDate) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="font-body text-xs text-vault-gold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ORDERS TABLE */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-12 text-center font-body text-xs text-vault-text-muted">
          No records match search filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-vault-border bg-vault-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vault-border bg-vault-bg/60 font-heading text-xs font-bold text-vault-text-secondary uppercase">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">EA Purchased</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs text-vault-text-secondary">
              {filteredOrders.map((order) => {
                const ea = easMap.get(order.eaId);
                const user = usersMap.get(order.userId);
                const isExpanded = expandedOrderId === order.orderId;

                const displayStatus =
                  order.status === 'completed' || order.status === 'paid' ? 'Paid' :
                  order.status === 'pending' ? 'Pending' : 'Refunded';

                return (
                  <>
                    <tr
                      key={order.id}
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                      className="border-b border-vault-border last:border-none hover:bg-vault-surface-high/30 transition-colors cursor-pointer select-none"
                    >
                      <td className="p-4 font-heading font-semibold text-vault-text">
                        {order.orderId}
                      </td>
                      <td className="p-4 font-bold text-vault-text">
                        {user ? user.name : 'Unknown User'}
                      </td>
                      <td className="p-4">
                        {user ? user.email : 'N/A'}
                      </td>
                      <td className="p-4 font-heading font-bold text-vault-text">
                        {ea ? ea.name : 'Unknown EA'}
                      </td>
                      <td className="p-4 font-heading font-bold text-vault-text">
                        ${Number(order.amount).toFixed(2)}
                      </td>
                      <td className="p-4 uppercase">
                        {order.paymentMethod || 'Card'}
                      </td>
                      <td className="p-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-heading font-extrabold uppercase ${
                          displayStatus === 'Paid' ? 'bg-vault-profit/10 text-vault-profit' :
                          displayStatus === 'Pending' ? 'bg-vault-gold/10 text-vault-gold' :
                          'bg-vault-loss/10 text-vault-loss'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="rounded border border-vault-border bg-vault-bg px-2 py-1 text-[10px] font-heading font-semibold text-vault-text focus:border-vault-gold outline-none cursor-pointer"
                        >
                          <option value="completed">Paid (Completed)</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Refunded (Failed)</option>
                        </select>
                      </td>
                    </tr>

                    {/* EXPANDED DETAILS */}
                    {isExpanded && (
                      <tr className="bg-vault-bg/40 border-b border-vault-border">
                        <td colSpan={9} className="p-6 space-y-6 font-body text-xs text-vault-text-secondary">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Customer info */}
                            <div className="space-y-2">
                              <h4 className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-vault-text-muted">Customer details</h4>
                              <p className="font-heading text-xs font-bold text-vault-text">{user ? user.name : 'Unknown Customer'}</p>
                              <p className="text-vault-text-secondary">{user ? user.email : 'No email registered'}</p>
                              <p className="text-[10px] text-vault-text-muted">User Database ID: <code className="select-all font-mono">{order.userId}</code></p>
                            </div>

                            {/* EA info */}
                            <div className="space-y-2">
                              <h4 className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-vault-text-muted">Expert Advisor System</h4>
                              <p className="font-heading text-xs font-bold text-vault-text">{ea ? ea.name : 'Deleted EA'}</p>
                              <p className="text-vault-text-secondary">Platform: <span className="uppercase font-semibold">{ea ? ea.platform : 'MT4/MT5'}</span> | Category: <span className="capitalize">{ea ? ea.category : 'N/A'}</span></p>
                              
                              {ea?.eaFile ? (
                                <a
                                  href={ea.eaFile}
                                  download
                                  className="inline-flex items-center gap-1.5 text-vault-gold hover:underline font-bold mt-1"
                                >
                                  📥 Download Trading Binary ({ea.platform === 'mt4' ? '.ex4' : '.ex5'})
                                </a>
                              ) : (
                                <span className="text-vault-text-muted text-[10px] block mt-1">No file attached to listing</span>
                              )}
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-2">
                              <h4 className="font-heading text-[10px] font-extrabold uppercase tracking-wider text-vault-text-muted">Transaction audit details</h4>
                              <p className="text-vault-text">Payment Gateway: <span className="uppercase font-bold text-vault-text">{order.paymentMethod || 'Credit Card / Crypto'}</span></p>
                              <p className="text-vault-text">Total Volume Paid: <span className="font-bold text-vault-profit">${Number(order.amount).toFixed(2)}</span></p>
                              <p className="text-vault-text-muted text-[10px]">Reference: <code className="select-all font-mono">{order.id}</code></p>
                              
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => setInvoiceModalOrder({ order, user, ea })}
                                  className="rounded-lg bg-vault-gold/10 hover:bg-vault-gold hover:text-vault-bg px-3.5 py-1.5 text-[10px] font-heading font-extrabold text-vault-gold transition-all"
                                >
                                  📄 Generate Tax Invoice
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

      {/* INVOICE PRINT MODAL */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vault-bg/85 backdrop-blur-sm p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setInvoiceModalOrder(null)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold border border-gray-200"
            >
              ✕
            </button>

            {/* Invoice Layout */}
            <div id="printable-invoice" className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-200 pb-5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 font-heading">EA VAULT</h2>
                  <p className="text-xs text-gray-500">Premium EA Trading Systems at Fraction Prices</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-gray-700">TAX INVOICE</h3>
                  <p className="text-xs text-gray-500">Invoice: #{invoiceModalOrder.order.orderId}</p>
                  <p className="text-xs text-gray-500">Date: {new Date(invoiceModalOrder.order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">BILLED BY</h4>
                  <p className="font-bold text-gray-900 mt-1">EA VAULT LLC</p>
                  <p className="text-gray-500">support@eavault.com</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">BILLED TO</h4>
                  <p className="font-bold text-gray-900 mt-1">{invoiceModalOrder.user ? invoiceModalOrder.user.name : 'Trader Account'}</p>
                  <p className="text-gray-500">{invoiceModalOrder.user ? invoiceModalOrder.user.email : 'N/A'}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse mt-4">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-bold text-gray-700">
                    <th className="p-3">Product Description</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3 text-right">Price Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-3 font-bold text-gray-900">
                      {invoiceModalOrder.ea ? invoiceModalOrder.ea.name : 'Expert Advisor Trading Robot'}
                    </td>
                    <td className="p-3 uppercase text-gray-500">
                      {invoiceModalOrder.ea ? invoiceModalOrder.ea.platform : 'MT4/MT5'}
                    </td>
                    <td className="p-3 text-right font-bold text-gray-900">
                      ${Number(invoiceModalOrder.order.amount).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="font-bold text-gray-900 text-sm">
                    <td colSpan={2} className="p-3 text-right text-gray-500 text-xs">Total Amount Paid:</td>
                    <td className="p-3 text-right text-lg font-black text-emerald-600">${Number(invoiceModalOrder.order.amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-gray-100 pt-5 text-center text-[10px] text-gray-400">
                <p>Thank you for purchasing from EA Vault. Digital downloads are accessible in your Trader Console.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setInvoiceModalOrder(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const printContents = document.getElementById('printable-invoice')?.innerHTML;
                  const originalContents = document.body.innerHTML;
                  if (printContents) {
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload(); // refresh page state after restoring HTML
                  }
                }}
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
