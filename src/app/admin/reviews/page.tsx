'use client';

import { useState, useEffect } from 'react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [eas, setEas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const revRes = await fetch('/api/stitch/reviews');
      const easRes = await fetch('/api/stitch/eas');

      if (revRes.ok && easRes.ok) {
        const revData = await revRes.json();
        const easData = await easRes.json();
        setReviews(Array.isArray(revData) ? revData : (revData?.data || []));
        setEas(Array.isArray(easData) ? easData : (easData?.data || []));
      }
    } catch (err) {
      console.error('Failed to load admin reviews data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateReviewStatus = async (id: string, approved: boolean) => {
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/stitch/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, approved } : r))
        );

        // If approved, trigger a notification for the reviewer that their review was published!
        if (approved) {
          const review = reviews.find((r) => r.id === id);
          if (review && review.userId) {
            await fetch('/api/stitch/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: review.userId,
                title: 'Review Published',
                message: `Thank you! Your verified purchase review has been approved and published.`,
                type: 'review_approved',
                read: false,
                createdAt: new Date().toISOString(),
              }),
            });
            window.dispatchEvent(new Event('notifications-updated'));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/stitch/reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const getEAName = (eaId: string) => {
    const ea = eas.find((e) => e.id === eaId);
    return ea ? ea.name : 'Unknown EA';
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-vault-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            Review Moderation
          </h1>
          <p className="mt-1 font-body text-xs text-vault-text-muted">
            Manage customer feedback, toggle approval status, and remove reviews.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-vault-border bg-vault-surface">
        <table className="w-full border-collapse text-left font-body text-xs text-vault-text-secondary">
          <thead>
            <tr className="border-b border-vault-border bg-vault-bg/50 font-heading text-[10px] font-bold uppercase tracking-wider text-vault-text-muted">
              <th className="p-4">EA Name</th>
              <th className="p-4">Reviewer</th>
              <th className="p-4">Rating</th>
              <th className="p-4 max-w-xs">Comment</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-vault-text-muted">
                  No reviews found in database.
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-vault-surface-high/20 transition-colors">
                  <td className="p-4 font-heading font-semibold text-vault-text">
                    {getEAName(rev.eaId)}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-vault-text">{rev.userName}</div>
                    <div className="text-[10px] text-vault-text-muted">
                      {rev.userCountry ? `📍 ${rev.userCountry}` : 'Trader'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-0.5 text-vault-gold">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs break-words leading-relaxed text-vault-text">
                    {rev.comment}
                    {rev.verifiedPurchase && (
                      <span className="ml-2 inline-block rounded bg-vault-profit/10 px-1.5 py-0.5 font-heading text-[9px] font-bold text-vault-profit uppercase tracking-wider">
                        Verified
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-vault-text-muted">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {rev.approved ? (
                      <span className="rounded-full bg-vault-profit/10 px-2.5 py-1 font-heading text-[9px] font-bold uppercase tracking-wider text-vault-profit">
                        Approved
                      </span>
                    ) : (
                      <span className="rounded-full bg-vault-loss/10 px-2.5 py-1 font-heading text-[9px] font-bold uppercase tracking-wider text-vault-loss">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {rev.approved ? (
                        <button
                          disabled={submittingId === rev.id}
                          onClick={() => updateReviewStatus(rev.id, false)}
                          className="rounded bg-vault-border px-2.5 py-1.5 hover:bg-vault-surface-high text-vault-text transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          disabled={submittingId === rev.id}
                          onClick={() => updateReviewStatus(rev.id, true)}
                          className="rounded bg-vault-gold px-2.5 py-1.5 font-bold text-vault-bg hover:opacity-90 transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        disabled={submittingId === rev.id}
                        onClick={() => deleteReview(rev.id)}
                        className="rounded border border-vault-loss/30 px-2.5 py-1.5 text-vault-loss hover:bg-vault-loss/5 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
