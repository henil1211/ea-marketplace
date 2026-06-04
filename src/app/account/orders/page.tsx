'use client';

import { useState, useEffect } from 'react';

export default function OrdersHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const currentUser = meData.user;

        const ordersRes = await fetch('/api/stitch/orders');
        const easRes = await fetch('/api/stitch/eas');
        
        let allOrders: any[] = [];
        let allEAs: any[] = [];

        if (ordersRes.ok) allOrders = await ordersRes.json();
        if (easRes.ok) allEAs = await easRes.json();

        // Filter user orders
        const userOrders = allOrders.filter(
          (o: any) => o.userId === currentUser.userId
        );

        // Match EA name
        const easMap = new Map(allEAs.map((e: any) => [e.id, e]));
        const mappedOrders = userOrders.map((o: any) => {
          const matchingEA = easMap.get(o.eaId);
          return {
            ...o,
            eaName: matchingEA ? matchingEA.name : 'Unknown EA Product'
          };
        });

        // Sort descending
        mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(mappedOrders);

      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">
          Order & Payment History
        </h1>
        <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
          Review your invoices, payment receipts, and billing details.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-10 text-center font-body text-xs text-vault-text-muted">
          No billing records found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-vault-border bg-vault-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vault-border bg-vault-bg/60 font-heading text-xs font-bold text-vault-text-secondary uppercase">
                <th className="p-4 sm:p-5">Order ID</th>
                <th className="p-4 sm:p-5">Product Name</th>
                <th className="p-4 sm:p-5">Date</th>
                <th className="p-4 sm:p-5">Price Paid</th>
                <th className="p-4 sm:p-5">Status</th>
                <th className="p-4 sm:p-5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs text-vault-text-secondary">
              {orders.map((order, idx) => (
                <tr key={idx} className="border-b border-vault-border last:border-none hover:bg-vault-surface-high/30 transition-colors">
                  <td className="p-4 sm:p-5 font-heading font-semibold text-vault-text">
                    {order.orderId}
                  </td>
                  <td className="p-4 sm:p-5 font-heading font-bold text-vault-text">
                    {order.eaName}
                  </td>
                  <td className="p-4 sm:p-5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 sm:p-5 font-heading font-bold text-vault-text">
                    ${Number(order.amount).toFixed(2)}
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-heading font-extrabold uppercase ${
                      order.status === 'completed' ? 'bg-vault-profit/10 text-vault-profit' :
                      order.status === 'pending' ? 'bg-vault-gold/10 text-vault-gold' :
                      'bg-vault-loss/10 text-vault-loss'
                    }`}>
                      {order.status === 'completed' ? 'Paid' : order.status}
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <button
                      onClick={() => setSelectedInvoice(order)}
                      className="rounded bg-vault-bg border border-vault-border px-2.5 py-1 text-[10px] font-heading font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors cursor-pointer"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vault-bg/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-6 shadow-2xl relative animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-vault-border pb-4">
              <div>
                <span className="font-heading text-[10px] font-bold text-vault-gold uppercase tracking-wider">
                  Payment Receipt
                </span>
                <h3 className="font-heading text-lg font-bold text-vault-text">
                  Invoice {selectedInvoice.orderId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-vault-border text-vault-text-muted hover:border-vault-gold hover:text-vault-gold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4 font-body text-xs text-vault-text-secondary">
              <div className="flex justify-between">
                <span className="text-vault-text-muted">Transaction ID:</span>
                <span className="font-mono text-vault-text text-[11px] select-all">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-vault-text-muted">Payment Date:</span>
                <span>{new Date(selectedInvoice.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-vault-text-muted">Payment Method:</span>
                <span className="uppercase">{selectedInvoice.paymentMethod}</span>
              </div>
              
              <div className="border-t border-vault-border pt-4 mt-4">
                <div className="flex justify-between font-heading font-semibold text-vault-text text-sm">
                  <span>Product Purchased</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between mt-2 text-vault-text-secondary">
                  <span>{selectedInvoice.eaName}</span>
                  <span>${Number(selectedInvoice.amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-vault-border pt-4 flex justify-between font-heading font-extrabold text-base text-vault-text">
                <span>Total Paid:</span>
                <span className="text-vault-gold">${Number(selectedInvoice.amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-vault-border pt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-xl border border-vault-border py-2.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors cursor-pointer"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 rounded-xl bg-vault-gold py-2.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
