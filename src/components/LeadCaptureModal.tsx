'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LeadCaptureModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [eas, setEas] = useState<any[]>([]);
  const [formType, setFormType] = useState<'details' | 'guide' | 'broker'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactHandle, setContactHandle] = useState('');
  const [selectedEaId, setSelectedEaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch EAs for the dropdown list
  useEffect(() => {
    fetch('/api/stitch/eas?status=active')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setEas(list);
        
        // If on an EA detail page, pre-select that EA
        if (pathname.startsWith('/marketplace/')) {
          const slug = pathname.split('/').pop() || '';
          const currentEa = list.find((e: any) => e.slug === slug);
          if (currentEa) {
            setSelectedEaId(currentEa.id);
          }
        } else if (list.length > 0) {
          setSelectedEaId(list[0].id);
        }
      })
      .catch((err) => console.error('Error fetching EAs for lead capture:', err));
  }, [pathname]);

  // Pre-select EA if pathname changes (navigating between EAs)
  useEffect(() => {
    if (eas.length > 0 && pathname.startsWith('/marketplace/')) {
      const slug = pathname.split('/').pop() || '';
      const currentEa = eas.find((e: any) => e.slug === slug);
      if (currentEa) {
        setSelectedEaId(currentEa.id);
      }
    }
  }, [pathname, eas]);

  // Exit intent trigger (Desktop only)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves the top viewport boundary (potential close tab gesture)
      if (e.clientY < 5) {
        const hasShown = sessionStorage.getItem('vault_exit_intent_shown');
        if (!hasShown) {
          sessionStorage.setItem('vault_exit_intent_shown', 'true');
          setIsOpen(true);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  // Listen to global open event (e.g. from Request EA button in navbar)
  useEffect(() => {
    const handleOpenRequestModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.formType) {
        setFormType(customEvent.detail.formType);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-lead-capture', handleOpenRequestModal);
    return () => window.removeEventListener('open-lead-capture', handleOpenRequestModal);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !contactHandle || !selectedEaId) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const chosenEa = eas.find((ea: any) => ea.id === selectedEaId);
    
    let typeLabel = 'Get EA Details';
    if (formType === 'guide') typeLabel = 'Request Setup Guide';
    if (formType === 'broker') typeLabel = 'Get Broker Recommendation';

    const visitorId = typeof window !== 'undefined' ? localStorage.getItem('vault_visitor_id') || '' : '';
    const trafficSource = typeof window !== 'undefined' ? sessionStorage.getItem('vault_traffic_source') || 'Direct' : 'Direct';
    const country = typeof window !== 'undefined' ? sessionStorage.getItem('vault_country') || 'US' : 'US';
    const initialNote = `User submitted lead capture form: "${typeLabel}". Handle: ${contactHandle}.`;

    const leadPayload = {
      eaId: selectedEaId,
      eaName: chosenEa ? chosenEa.name : 'Unknown EA',
      customerName: name,
      customerEmail: email,
      contactHandle,
      formType: typeLabel,
      source: pathname.startsWith('/marketplace/') ? 'EA Detail Page' : 'Marketplace Portal',
      status: 'new' as const,
      notes: initialNote,
      visitorId,
      trafficSource,
      country,
      notesLog: [
        {
          text: initialNote,
          createdAt: new Date().toISOString()
        }
      ],
      timeline: [
        {
          event: 'Lead Created',
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const res = await fetch('/api/stitch/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });

      if (res.ok) {
        setSuccess(true);
        // Log custom analytics conversion event
        window.dispatchEvent(new CustomEvent('whatsapp-conversion', {
          detail: { eaId: selectedEaId, eaName: chosenEa?.name || 'Unknown', buttonType: `lead-form-${formType}` }
        }));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'details', label: 'ℹ️ Get EA Details', desc: 'Request institutional backtests and full parameters list.' },
    { id: 'guide', label: '📖 Setup Guide', desc: 'Get the exact VPS requirements, installation steps & set files.' },
    { id: 'broker', label: '🤝 Broker Match', desc: 'Get low spread / commission ECN broker recommendations.' }
  ] as const;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-vault-bg/90 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-vault-border bg-gradient-to-b from-vault-surface via-vault-surface-high to-vault-surface p-6 shadow-2xl md:p-8 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-vault-border bg-vault-bg text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Success State */}
        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vault-profit/20 border border-vault-profit text-vault-profit text-3xl">
              ✓
            </div>
            <h3 className="font-heading text-2xl font-bold text-vault-text">Request Logged!</h3>
            <p className="font-body text-sm text-vault-text-secondary">
              An EAVault coordinator will reach out to you directly on <strong>{contactHandle}</strong> or via email within 2 hours.
            </p>
            <button
              onClick={() => {
                setIsOpen(false);
                setSuccess(false);
                setName('');
                setEmail('');
                setContactHandle('');
              }}
              className="mt-6 w-full rounded-xl bg-vault-gold py-3.5 font-heading text-xs font-bold text-vault-bg hover:opacity-95 transition-opacity cursor-pointer"
            >
              Back to Browsing
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center md:text-left">
              <h3 className="font-heading text-xl md:text-2xl font-extrabold text-vault-text">
                Need Help Choosing an EA?
              </h3>
              <p className="mt-1 font-body text-xs text-vault-text-muted">
                Choose a request template below and get direct assistance from our quant team.
              </p>
            </div>

            {/* Tab Selectors */}
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-vault-bg p-1 border border-vault-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormType(tab.id)}
                  className={`rounded-lg py-2 font-heading text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                    formType === tab.id
                      ? 'bg-vault-gold text-vault-bg shadow-md'
                      : 'text-vault-text-secondary hover:text-vault-text'
                  }`}
                >
                  {tab.label.split(' ')[1] || tab.label}
                </button>
              ))}
            </div>

            {/* Selected Tab Description */}
            <div className="rounded-xl bg-vault-gold/5 border border-vault-gold/15 p-3 text-center">
              <p className="font-body text-xs text-vault-gold-light">
                {tabs.find((t) => t.id === formType)?.desc}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-3 text-xs text-vault-loss font-body">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block font-heading text-[11px] font-bold text-vault-text-secondary uppercase mb-1.5">
                  Interested Expert Advisor <span className="text-vault-gold">*</span>
                </label>
                <select
                  value={selectedEaId}
                  onChange={(e) => setSelectedEaId(e.target.value)}
                  className="w-full rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold transition-colors"
                  required
                >
                  {eas.map((ea: any) => (
                    <option key={ea.id} value={ea.id} className="bg-vault-surface">
                      {ea.name} ({ea.platform.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-heading text-[11px] font-bold text-vault-text-secondary uppercase mb-1.5">
                    Your Name <span className="text-vault-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block font-heading text-[11px] font-bold text-vault-text-secondary uppercase mb-1.5">
                    Email Address <span className="text-vault-gold">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-heading text-[11px] font-bold text-vault-text-secondary uppercase mb-1.5 flex justify-between">
                  <span>Telegram / WhatsApp Handle <span className="text-vault-gold">*</span></span>
                  <span className="text-[10px] text-vault-gold-light lowercase italic font-normal">For direct setups</span>
                </label>
                <input
                  type="text"
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  placeholder="@telegram_handle or WhatsApp number"
                  className="w-full rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-vault-gold py-4 font-heading text-xs font-bold text-vault-bg transition-opacity hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-vault-bg border-t-transparent" />}
                Submit Quant Inquiry
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
