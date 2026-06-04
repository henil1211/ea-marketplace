'use client';

import { useState, useEffect } from 'react';

export default function AdminFeaturedEAsPage() {
  const [loading, setLoading] = useState(true);
  const [eas, setEas] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Search/Dropdown selection state
  const [selectedAddId, setSelectedAddId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEAs();
  }, []);

  async function fetchEAs() {
    try {
      const res = await fetch('/api/stitch/eas');
      if (res.ok) {
        setEas(await res.json());
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  }

  // Get active featured EAs, sorted by their 'featuredOrder' attribute
  const featuredEAs = eas
    .filter((e) => e.featured)
    .sort((a, b) => (Number(a.featuredOrder) || 0) - (Number(b.featuredOrder) || 0));

  // Get non-featured EAs that can be added
  const nonFeaturedEAs = eas.filter((e) => !e.featured && e.status === 'active');

  // Filter dropdown by query search
  const availableToAdd = nonFeaturedEAs.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add EA to featured list (appended to end)
  const handleAddFeatured = (id: string) => {
    if (!id) return;
    const maxOrder = featuredEAs.reduce((max, e) => Math.max(max, Number(e.featuredOrder) || 0), 0);
    
    setEas(
      eas.map((e) =>
        e.id === id ? { ...e, featured: true, featuredOrder: maxOrder + 1 } : e
      )
    );
    setSelectedAddId('');
    setSearchQuery('');
  };

  // Remove EA from featured list
  const handleRemoveFeatured = (id: string) => {
    setEas(
      eas.map((e) =>
        e.id === id ? { ...e, featured: false, featuredOrder: 9999 } : e
      )
    );
  };

  // Reorder: Move UP
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...featuredEAs];
    // Swap items
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;

    // Recalculate orders
    const updatedEas = eas.map((e) => {
      const idxInFeatured = list.findIndex((item) => item.id === e.id);
      if (idxInFeatured !== -1) {
        return { ...e, featuredOrder: idxInFeatured + 1 };
      }
      return e;
    });

    setEas(updatedEas);
  };

  // Reorder: Move DOWN
  const handleMoveDown = (index: number) => {
    if (index === featuredEAs.length - 1) return;
    const list = [...featuredEAs];
    // Swap items
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;

    // Recalculate orders
    const updatedEas = eas.map((e) => {
      const idxInFeatured = list.findIndex((item) => item.id === e.id);
      if (idxInFeatured !== -1) {
        return { ...e, featuredOrder: idxInFeatured + 1 };
      }
      return e;
    });

    setEas(updatedEas);
  };

  // Save the entire catalog config to database
  const handleSaveShowcaseOrder = async () => {
    setSaving(true);
    try {
      // Send PATCH requests to update featured & order settings for all EAs
      await Promise.all(
        eas.map((ea) =>
          fetch(`/api/stitch/eas/${ea.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              featured: ea.featured,
              featuredOrder: ea.featuredOrder || 9999
            })
          })
        )
      );

      alert('Showcase layout order saved successfully!');
      await fetchEAs();
    } catch (err) {
      console.error(err);
      alert('Error updating showcase configurations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">
          Featured EA Showcase Manager
        </h1>
        <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
          Configure which Expert Advisors appear highlighted on the home page showcase grid and specify their display order.
        </p>
      </div>

      {/* Info notice */}
      <div className="bg-vault-gold/10 border border-vault-gold/20 p-4 rounded-xl flex items-start gap-3">
        <span className="text-lg">💡</span>
        <div>
          <p className="font-heading text-xs font-bold text-vault-gold">Homepage Preview Note</p>
          <p className="font-body text-[11px] text-vault-text-secondary mt-1">
            These EAs appear in the featured showcase rows on the homepage. Use the arrows to position them from left to right.
          </p>
        </div>
      </div>

      {/* Control panel: ADD EA */}
      <div className="bg-vault-surface border border-vault-border p-5 rounded-2xl space-y-4">
        <h3 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider">
          Add EA to Featured Showcase
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active EAs to add..."
              className="w-full rounded-xl border border-vault-border bg-vault-bg px-4 py-2.5 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
            />
            {/* Simple dropdown indicator */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-vault-border bg-vault-surface shadow-2xl p-1 divide-y divide-vault-border/50">
                {availableToAdd.length === 0 ? (
                  <p className="p-3 text-[10px] text-vault-text-muted font-body text-center">No unfeatured EAs match search query.</p>
                ) : (
                  availableToAdd.map((ea) => (
                    <button
                      key={ea.id}
                      onClick={() => handleAddFeatured(ea.id)}
                      className="w-full text-left p-2.5 font-body text-xs text-vault-text hover:bg-vault-bg hover:text-vault-gold transition-colors rounded-lg flex items-center gap-2"
                    >
                      <span>🤖</span>
                      <span className="font-heading font-bold">{ea.name}</span>
                      <span className="text-[10px] text-vault-text-muted font-mono uppercase">({ea.platform})</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Reordering List */}
      <div className="bg-vault-surface border border-vault-border rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-vault-border pb-3">
          <span className="font-heading text-xs font-bold text-vault-text">Showcase Layout Order</span>
          <span className="font-body text-[10px] text-vault-text-muted">Total featured: {featuredEAs.length}</span>
        </div>

        {featuredEAs.length === 0 ? (
          <div className="p-8 text-center font-body text-xs text-vault-text-muted border border-dashed border-vault-border rounded-xl">
            No featured Expert Advisors added yet. Search and select EAs above.
          </div>
        ) : (
          <div className="space-y-3">
            {featuredEAs.map((ea, idx) => (
              <div
                key={ea.id}
                className="flex items-center justify-between p-4 bg-vault-bg/60 border border-vault-border rounded-xl hover:border-vault-gold/45 transition-all gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-heading text-xs font-extrabold text-vault-text-muted w-5">#{idx + 1}</span>
                  <div className="h-10 w-10 rounded bg-vault-surface overflow-hidden border border-vault-border flex items-center justify-center shrink-0">
                    {ea.thumbnail ? (
                      <img src={ea.thumbnail} alt={ea.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">🤖</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading text-xs font-bold text-vault-text truncate">{ea.name}</p>
                    <p className="font-body text-[10px] text-vault-text-muted truncate mt-0.5 capitalize">
                      Platform: <span className="uppercase font-semibold">{ea.platform}</span> | Category: {ea.category}
                    </p>
                  </div>
                </div>

                {/* Operations & Arrows */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="h-8 w-8 rounded border border-vault-border flex items-center justify-center text-vault-text-secondary hover:text-vault-gold hover:border-vault-gold disabled:opacity-30 disabled:hover:text-vault-text-secondary disabled:hover:border-vault-border transition-colors cursor-pointer select-none"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === featuredEAs.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="h-8 w-8 rounded border border-vault-border flex items-center justify-center text-vault-text-secondary hover:text-vault-gold hover:border-vault-gold disabled:opacity-30 disabled:hover:text-vault-text-secondary disabled:hover:border-vault-border transition-colors cursor-pointer select-none"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeatured(ea.id)}
                    className="h-8 rounded border border-vault-loss/20 hover:bg-vault-loss/5 px-2.5 font-heading text-[10px] font-bold text-vault-loss transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={fetchEAs}
          className="rounded-xl border border-vault-border px-5 py-3 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
        >
          Reset Config
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveShowcaseOrder}
          className="rounded-xl bg-vault-gold px-6 py-3 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving layout order...' : 'Save Showcase Order'}
        </button>
      </div>
    </div>
  );
}
