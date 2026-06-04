'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FAQItem {
  question: string;
  answer: string;
}

interface EAFormProps {
  eaId?: string;
}

export default function EAForm({ eaId }: EAFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!eaId);
  const [error, setError] = useState('');

  // Core Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [platform, setPlatform] = useState('both');
  const [category, setCategory] = useState('scalper');
  const [tags, setTags] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');

  // Pricing
  const [mql5Price, setMql5Price] = useState('');
  const [ourPrice, setOurPrice] = useState('');

  // Performance Statistics (needed for card winRate, drawdown & profitFactor)
  const [winRate, setWinRate] = useState('72');
  const [maxDrawdown, setMaxDrawdown] = useState('12.5');
  const [profitFactor, setProfitFactor] = useState('1.85');

  // Backtest Results Screenshots
  const [backtestImage, setBacktestImage] = useState('/images/backtest-chart.png');
  const [backtestImages, setBacktestImages] = useState<string[]>([]);

  // Media
  const [thumbnail, setThumbnail] = useState('/images/ea-placeholder.png');
  const [eaFile, setEaFile] = useState('/downloads/ea-file.ex4');

  // Upload States
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingBacktest, setUploadingBacktest] = useState(false);
  const [parsingReport, setParsingReport] = useState(false);

  // FAQs
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { question: 'What is the recommended leverage?', answer: 'We recommend at least 1:100 leverage, ideally 1:500.' },
    { question: 'Does this EA require a VPS?', answer: 'Yes, a VPS with low latency to your broker is highly recommended.' }
  ]);

  // Settings
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [featured, setFeatured] = useState(false);
  const [propFirmCompatible, setPropFirmCompatible] = useState(false);
  const [trending, setTrending] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (!eaId) return;

    async function loadEA() {
      try {
        const res = await fetch(`/api/stitch/eas/${eaId}`);
        if (!res.ok) throw new Error('Failed to retrieve EA data.');
        const ea = await res.json();

        setName(ea.name || '');
        setSlug(ea.slug || '');
        setPlatform(ea.platform || 'both');
        setCategory(ea.category || 'scalping');
        setTags(ea.tags ? ea.tags.join(', ') : '');
        setShortDesc(ea.shortDesc || '');
        setFullDesc(ea.fullDesc || '');
        setMql5Price(ea.mql5Price ? String(ea.mql5Price) : '');
        setOurPrice(ea.ourPrice ? String(ea.ourPrice) : '');
        setThumbnail(ea.thumbnail || '/images/ea-placeholder.png');
        setEaFile(ea.eaFile || '/downloads/ea-file.ex4');
        setStatus(ea.status || 'active');
        setFeatured(!!ea.featured);
        setPropFirmCompatible(!!ea.propFirmCompatible);
        setTrending(!!ea.trending);
        setWinRate(ea.winRate ? String(ea.winRate) : '72');
        setMaxDrawdown(ea.maxDrawdown ? String(ea.maxDrawdown) : '12.5');
        setProfitFactor(ea.profitFactor ? String(ea.profitFactor) : '1.85');

        if (ea.backtestImage) {
          setBacktestImage(ea.backtestImage);
        }
        
        if (ea.backtestImages && ea.backtestImages.length > 0) {
          setBacktestImages(ea.backtestImages);
        } else if (ea.backtestImage) {
          setBacktestImages([ea.backtestImage]);
        } else {
          setBacktestImages([]);
        }

        if (ea.faqs && ea.faqs.length > 0) {
          setFaqs(ea.faqs);
        }
      } catch (err: any) {
        setError(err?.message || 'Error occurred while loading EA.');
      } finally {
        setFetching(false);
      }
    }

    loadEA();
  }, [eaId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!eaId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Upload utility handlers
  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      const data = await res.json();
      setThumbnail(data.url);
    } catch (err: any) {
      setError(err.message || 'Error uploading thumbnail.');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleBacktestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = backtestImages.length;
    const remainingSlots = 2 - currentCount;
    if (remainingSlots <= 0) {
      setError('You can upload a maximum of 2 backtest images.');
      return;
    }

    setUploadingBacktest(true);
    setError('');

    const uploadPromises = Array.from(files)
      .slice(0, remainingSlots)
      .map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to upload backtest image');
        }

        const data = await res.json();
        return data.url;
      });

    try {
      const newUrls = await Promise.all(uploadPromises);
      setBacktestImages([...backtestImages, ...newUrls]);
    } catch (err: any) {
      setError(err.message || 'Error uploading backtest images.');
    } finally {
      setUploadingBacktest(false);
    }
  };

  const handleRemoveBacktestImage = (idx: number) => {
    setBacktestImages(backtestImages.filter((_, i) => i !== idx));
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingReport(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/parse-backtest', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to parse backtest report.');
      }

      const responseData = await res.json();
      const data = responseData.data;

      // Populate basic info
      if (data.name) {
        setName(data.name);
        setSlug(
          data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        );
      }
      
      setPlatform(data.platform || 'both');
      if (data.winRate) setWinRate(String(data.winRate));
      if (data.maxDrawdown) setMaxDrawdown(String(data.maxDrawdown));
      if (data.profitFactor) setProfitFactor(String(data.profitFactor));

      alert('Backtest report successfully parsed! Key fields have been auto-populated.');
    } catch (err: any) {
      setError(err.message || 'Error parsing HTML report file.');
    } finally {
      setParsingReport(false);
      // Clear input so uploading the same file triggers again
      if (e.target) e.target.value = '';
    }
  };

  // FAQ handlers
  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFAQ = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleFAQChange = (idx: number, field: keyof FAQItem, val: string) => {
    setFaqs(
      faqs.map((faq, i) => (i === idx ? { ...faq, [field]: val } : faq))
    );
  };

  // Submit Handler
  const handleSave = async (submitStatus?: 'active' | 'draft') => {
    const finalStatus = submitStatus || status;

    if (!name.trim() || !slug.trim() || !ourPrice || !mql5Price) {
      setError('Please fill in all required fields marked with * (Name, Slug, MQL5 Price, Our Price).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      id: eaId || `ea-${Math.floor(Math.random() * 9000) + 1000}`,
      name: name.trim(),
      slug: slug.trim(),
      platform,
      category,
      shortDesc: shortDesc.trim(),
      fullDesc: fullDesc.trim(),
      mql5Price: Number(mql5Price),
      ourPrice: Number(ourPrice),
      winRate: Number(winRate) || 72,
      maxDrawdown: Number(maxDrawdown) || 12.5,
      profitFactor: Number(profitFactor) || 1.85,
      backtestImage: backtestImages[0] || backtestImage.trim(),
      backtestImages,
      backtestRows: [],
      monthlyReturns: [],
      thumbnail: thumbnail.trim(),
      eaFile: eaFile.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter((t) => t !== ''),
      faqs,
      status: finalStatus,
      featured,
      propFirmCompatible,
      trending,
      recommendedPairs: '',
      recommendedTimeframe: '',
      createdAt: new Date().toISOString()
    };

    try {
      const url = eaId ? `/api/stitch/eas/${eaId}` : '/api/stitch/eas';
      const method = eaId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit expert advisor details.');
      }

      alert(eaId ? 'Expert Advisor updated successfully!' : 'Expert Advisor listed successfully!');
      router.refresh();
      router.push('/admin/eas');
    } catch (err: any) {
      setError(err?.message || 'Error occurred while saving EA.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[45vh] items-center justify-center">
        <div className="text-center space-y-3">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-vault-gold border-t-transparent" />
          <p className="font-body text-xs text-vault-text-secondary">Loading product fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {error && (
        <div className="rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
          {error}
        </div>
      )}

      {/* Auto-Fill Strategy Tester Report HTML */}
      <div className="bg-vault-surface/40 rounded-2xl border border-dashed border-vault-gold/20 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-vault-gold uppercase tracking-wider flex items-center gap-1.5">
              ⚡ MetaTrader Report Auto-Fill
            </h3>
            <p className="font-body text-xs text-vault-text-secondary mt-1">
              Upload a Strategy Tester HTML report file (.html/.htm) directly exported from MT4 or MT5. The system will automatically parse and fill in the stats, name, and monthly returns heatmap.
            </p>
          </div>
          <div className="flex items-center shrink-0">
            <label className="inline-flex items-center gap-2 rounded-xl bg-vault-gold px-4 py-3 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shadow-md">
              <input
                type="file"
                accept=".html,.htm"
                onChange={handleReportUpload}
                className="hidden"
                disabled={parsingReport}
              />
              {parsingReport ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-vault-bg border-t-transparent" />
                  Parsing Report...
                </>
              ) : (
                'Upload Tester HTML'
              )}
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 1 — Basic Info */}
      <div className="bg-vault-surface rounded-2xl border border-vault-border p-6 sm:p-8 space-y-6">
        <h2 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-3 uppercase tracking-wider text-vault-gold">
          Section 1: Basic Information
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              EA Name <span className="text-vault-loss">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Grid Master Pro"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              URL Slug <span className="text-vault-loss">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. grid-master-pro"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Trading Platform <span className="text-vault-loss">*</span>
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer"
            >
              <option value="mt4">MetaTrader 4 (MT4)</option>
              <option value="mt5">MetaTrader 5 (MT5)</option>
              <option value="both">Both MT4 & MT5</option>
            </select>
          </div>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Strategy Category <span className="text-vault-loss">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text focus:border-vault-gold outline-none cursor-pointer capitalize"
            >
              <option value="scalper">Scalping</option>
              <option value="trend">Trend Following</option>
              <option value="grid">Grid Strategy</option>
              <option value="martingale">Martingale</option>
              <option value="hedging">Hedging</option>
              <option value="news">News Trading</option>
              <option value="breakout">Breakout</option>
              <option value="swing">Swing Trading</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-vault-text">
            Search Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="EURUSD, Gold, Low Drawdown, Scalper"
            className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
          />
        </div>
 


        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-vault-bg/30 p-4 rounded-xl border border-vault-border/50">
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Prop Firm Compatibility
            </label>
            <div className="flex items-center mt-2.5">
              <input
                type="checkbox"
                id="form-propfirm"
                checked={propFirmCompatible}
                onChange={(e) => setPropFirmCompatible(e.target.checked)}
                className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
              />
              <label htmlFor="form-propfirm" className="ml-2 font-body text-xs text-vault-text-secondary select-none cursor-pointer">
                Passed prop firm challenges compatible
              </label>
            </div>
          </div>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Trending Highlight
            </label>
            <div className="flex items-center mt-2.5">
              <input
                type="checkbox"
                id="form-trending"
                checked={trending}
                onChange={(e) => setTrending(e.target.checked)}
                className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
              />
              <label htmlFor="form-trending" className="ml-2 font-body text-xs text-vault-text-secondary select-none cursor-pointer">
                Highlight as trending product (show badges)
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-vault-text">
            Short Description <span className="text-vault-loss">*</span>{' '}
            <span className="text-[10px] text-vault-text-muted font-normal">(max 160 chars — for card layouts)</span>
          </label>
          <textarea
            maxLength={160}
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Provide a concise 2-line summary describing the trading logic..."
            className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold resize-none"
          />
          <div className="text-right text-[10px] text-vault-text-muted mt-1">
            {shortDesc.length}/160 characters
          </div>
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-vault-text">
            Full Description <span className="text-vault-loss">*</span>{' '}
            <span className="text-[10px] text-vault-text-muted font-normal">(Supports details, recommendations, setup advice)</span>
          </label>
          <textarea
            rows={10}
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            placeholder="Enter full description..."
            className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
          />
          <div className="mt-2 rounded-lg bg-vault-bg/40 border border-vault-border/50 p-3 text-[10px] text-vault-text-muted font-body leading-relaxed space-y-1">
            <p className="font-bold text-vault-gold">💡 Formatting Guide for Product Pages:</p>
            <p>• <strong>Paragraphs:</strong> Separate main paragraphs with a double line break (press Enter twice).</p>
            <p>• <strong>Headings:</strong> Keep lines short without periods (e.g., <em>How I Work - Smart, Precise, and Effortless</em>) to auto-style them as golden section headings.</p>
            <p>• <strong>List Items / Bullets:</strong> Start lines with a bullet character (•, -, *) or keywords like <em>Recommended initial deposit:</em>, <em>Account type:</em>, <em>Minimum initial deposit:</em>, etc., to render them in a clean bullet list.</p>
            <p>• <strong>Bolding Keywords:</strong> Words before a separator like &quot; — &quot; or &quot; - &quot; (e.g., <em>Plug &amp; Play installation — simply attach...</em>) will automatically bold the prefix term.</p>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Pricing */}
      <div className="bg-vault-surface rounded-2xl border border-vault-border p-6 sm:p-8 space-y-6">
        <h2 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-3 uppercase tracking-wider text-vault-gold">
          Section 2: Pricing Matrix
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              MQL5 Original Price ($ USD) <span className="text-vault-loss">*</span>
            </label>
            <input
              type="number"
              value={mql5Price}
              onChange={(e) => setMql5Price(e.target.value)}
              placeholder="e.g. 399"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Our Offered Selling Price ($ USD) <span className="text-vault-loss">*</span>
            </label>
            <input
              type="number"
              value={ourPrice}
              onChange={(e) => setOurPrice(e.target.value)}
              placeholder="e.g. 59"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3 — Backtest Results */}
      <div className="bg-vault-surface rounded-2xl border border-vault-border p-6 sm:p-8 space-y-6">
        <h2 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-3 uppercase tracking-wider text-vault-gold">
          Section 3: Backtest Benchmarks
        </h2>

        {/* Backtest Results Screenshots (PC Upload) */}
        <div>
          <label className="block font-body text-xs font-bold text-vault-text mb-1">
            Real Backtest Screenshot Images (Upload up to 2 from PC)
          </label>
          <p className="font-body text-[10px] text-vault-text-muted mb-3">
            These images will be displayed in the &quot;Backtest Results&quot; section on the public product page.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {backtestImages.map((url, idx) => (
              <div key={idx} className="relative rounded-xl border border-vault-border bg-vault-bg overflow-hidden group/img h-40">
                <img src={url} alt={`Backtest ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveBacktestImage(idx)}
                    className="rounded-lg bg-vault-loss px-3 py-1.5 font-heading text-[10px] font-bold text-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Delete Image
                  </button>
                </div>
              </div>
            ))}
            
            {backtestImages.length < 2 && (
              <label className="border border-dashed border-vault-border rounded-xl bg-vault-bg hover:border-vault-gold/30 cursor-pointer flex flex-col items-center justify-center p-6 h-40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple={backtestImages.length === 0}
                  onChange={handleBacktestUpload}
                  className="hidden"
                  disabled={uploadingBacktest}
                />
                {uploadingBacktest ? (
                  <div className="text-center space-y-2">
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
                    <p className="font-body text-[10px] text-vault-text-secondary">Uploading image...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <span className="text-xl">📤</span>
                    <p className="font-heading text-xs font-bold text-vault-text">Upload Backtest Image</p>
                    <p className="font-body text-[10px] text-vault-text-muted">JPEG, PNG up to 5MB (Max 2 images)</p>
                  </div>
                )}
              </label>
            )}
          </div>
          
          <div className="mt-3">
            <label className="block font-body text-[10px] font-bold text-vault-text-muted">
              Fallback / Direct Image URL
            </label>
            <input
              type="text"
              value={backtestImage}
              onChange={(e) => setBacktestImage(e.target.value)}
              placeholder="/images/ea-backtest-example.png"
              className="w-full mt-1.5 rounded-xl border border-vault-border bg-vault-bg px-4 py-2 font-body text-[11px] text-vault-text outline-none focus:border-vault-gold"
            />
          </div>
        </div>

        <div className="border-t border-vault-border pt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Win Rate (%) *
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              required
              value={winRate}
              onChange={(e) => setWinRate(e.target.value)}
              placeholder="e.g. 72"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Max Drawdown (%) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              value={maxDrawdown}
              onChange={(e) => setMaxDrawdown(e.target.value)}
              placeholder="e.g. 12.5"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Profit Factor *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={profitFactor}
              onChange={(e) => setProfitFactor(e.target.value)}
              placeholder="e.g. 1.85"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5 — Media */}
      <div className="bg-vault-surface rounded-2xl border border-vault-border p-6 sm:p-8 space-y-6">
        <h2 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-3 uppercase tracking-wider text-vault-gold">
          Section 4: Media & Asset Paths
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Product Thumbnail Image
            </label>
            
            <div className="mt-2 flex gap-4 items-center">
              <div className="relative h-20 w-20 rounded-xl border border-vault-border bg-vault-bg overflow-hidden flex items-center justify-center shrink-0">
                {thumbnail ? (
                  <img src={thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl">🤖</span>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="/images/ea-placeholder.png"
                  className="w-full rounded-xl border border-vault-border bg-vault-bg px-4 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
                />
                
                <label className="inline-flex items-center gap-1.5 rounded-lg border border-vault-border bg-vault-surface-high px-3 py-1.5 font-heading text-[10px] font-bold text-vault-text hover:border-vault-gold cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbUpload}
                    className="hidden"
                    disabled={uploadingThumb}
                  />
                  {uploadingThumb ? 'Uploading...' : 'Upload Thumbnail from PC'}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              EA Trading File (.ex4 / .ex5 / .zip)
            </label>
            <input
              type="text"
              value={eaFile}
              onChange={(e) => setEaFile(e.target.value)}
              placeholder="/downloads/expert_ea_system.ex4"
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6 — FAQs */}
      <div className="bg-vault-surface rounded-2xl border border-vault-border p-6 sm:p-8 space-y-6">
        <h2 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-3 uppercase tracking-wider text-vault-gold">
          Section 5: Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-vault-text-secondary">Provide answers to pre-sales setup questions.</span>
            <button
              type="button"
              onClick={handleAddFAQ}
              className="rounded-lg bg-vault-gold/15 px-3 py-1.5 font-heading text-[10px] font-bold text-vault-gold hover:bg-vault-gold hover:text-vault-bg transition-all"
            >
              + Add FAQ Item
            </button>
          </div>

          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-vault-border bg-vault-bg p-4 space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="font-heading text-[10px] font-extrabold uppercase text-vault-text-secondary">Q&A Pair #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFAQ(idx)}
                  className="text-vault-loss hover:underline text-[10px] font-heading font-bold cursor-pointer"
                >
                  Delete FAQ
                </button>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={faq.question}
                  onChange={(e) => handleFAQChange(idx, 'question', e.target.value)}
                  placeholder="Question input (e.g. Does it support hedging?)"
                  className="w-full rounded-xl border border-vault-border bg-vault-surface px-3 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
                />
              </div>
              <div>
                <textarea
                  rows={2}
                  required
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(idx, 'answer', e.target.value)}
                  placeholder="Answer textarea..."
                  className="w-full rounded-xl border border-vault-border bg-vault-surface px-3 py-2 font-body text-xs text-vault-text outline-none focus:border-vault-gold resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7 — Visibility Settings */}
      <div className="bg-vault-surface rounded-2xl border border-vault-border p-6 sm:p-8 space-y-6">
        <h2 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-3 uppercase tracking-wider text-vault-gold">
          Section 6: Visibility Settings
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Status Radio options */}
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Listing Status
            </label>
            <div className="flex gap-4 mt-3">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="h-4 w-4 bg-vault-bg border-vault-border text-vault-gold accent-vault-gold cursor-pointer"
                />
                <span className="ml-2 font-body text-xs text-vault-text">Active (Publish immediately)</span>
              </label>

              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="h-4 w-4 bg-vault-bg border-vault-border text-vault-gold accent-vault-gold cursor-pointer"
                />
                <span className="ml-2 font-body text-xs text-vault-text-secondary">Draft (Save offline)</span>
              </label>
            </div>
          </div>

          {/* Featured Toggle */}
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Feature Showcase
            </label>
            <div className="flex items-center mt-3">
              <input
                type="checkbox"
                id="form-featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
              />
              <label htmlFor="form-featured" className="ml-2 font-body text-xs text-vault-text-secondary select-none cursor-pointer">
                Highlight in featured showcase row
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-3 border-t border-vault-border pt-6">
        <button
          type="button"
          onClick={() => router.push('/admin/eas')}
          className="rounded-xl border border-vault-border px-5 py-3.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSave('draft')}
          className="rounded-xl border border-vault-border bg-vault-surface-high px-5 py-3.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSave('active')}
          className="rounded-xl bg-vault-gold px-6 py-3.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Saving...' : eaId ? 'Update EA System' : 'Publish EA System'}
        </button>
      </div>
    </div>
  );
}
