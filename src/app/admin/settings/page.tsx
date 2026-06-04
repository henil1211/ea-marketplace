'use client';

import { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Settings state
  const [siteName, setSiteName] = useState('EA VAULT');
  const [contactEmail, setContactEmail] = useState('support@eavault.com');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Social link parameters
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');

  // Announcement settings
  const [announcementText, setAnnouncementText] = useState('🔥 Get top-rated MQL5 EAs at up to 80% OFF — Limited time!');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [hidePublicPrices, setHidePublicPrices] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/stitch/settings?t=${Date.now()}`);
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            const doc = list[0];
            setSettingsId(doc.id);
            setSiteName(doc.siteName || 'EA VAULT');
            setContactEmail(doc.contactEmail || 'support@eavault.com');
            setWhatsapp(doc.whatsapp || '');
            setTwitter(doc.twitter || '');
            setTelegram(doc.telegram || '');
            setInstagram(doc.instagram || '');
            setAnnouncementText(doc.announcementText || doc.announcementBar || '');
            setAnnouncementActive(doc.announcementActive !== false);
            setMaintenanceActive(!!doc.maintenanceActive);
            setHidePublicPrices(!!doc.hidePublicPrices);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      id: settingsId || 'site-settings',
      siteName,
      contactEmail,
      whatsapp,
      twitter,
      telegram,
      instagram,
      announcementText,
      announcementActive,
      maintenanceActive,
      hidePublicPrices
    };

    try {
      const url = settingsId ? `/api/stitch/settings/${settingsId}` : '/api/stitch/settings';
      const method = settingsId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (!settingsId) {
          setSettingsId('site-settings');
        }
        alert('Site configuration and announcement settings updated successfully!');
      } else {
        throw new Error('Failed to save settings to database.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while saving configurations.');
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
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">
          Site Settings
        </h1>
        <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
          Configure site name, support contacts, WhatsApp phone links, social networks, and live alert banners.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-vault-surface rounded-2xl border border-vault-border p-6 sm:p-8 space-y-6">
        {/* Brand & Support */}
        <div className="space-y-4">
          <h3 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-2 text-vault-gold">Branding & Contact</h3>
          
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Site Brand Title
            </label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block font-body text-xs font-bold text-vault-text">
                Support Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-bold text-vault-text">
                WhatsApp Link (including country code)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 447123456789 (no +, spaces, or leading zeroes)"
                className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
              />
            </div>
          </div>
        </div>

        {/* Social Networks Links */}
        <div className="space-y-4 pt-2">
          <h3 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-2 text-vault-gold">Social Media Links</h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block font-body text-xs font-bold text-vault-text">
                Twitter / X URL
              </label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/eavault"
                className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-bold text-vault-text">
                Telegram Channel URL
              </label>
              <input
                type="url"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/eavault"
                className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-bold text-vault-text">
                Instagram URL
              </label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/eavault"
                className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
              />
            </div>
          </div>
        </div>

        {/* Global Announcement bar settings */}
        <div className="space-y-4 pt-2">
          <h3 className="font-heading text-sm font-bold text-vault-text border-b border-vault-border pb-2 text-vault-gold">Global Announcement Banner</h3>

          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Announcement Banner Message
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anno-active"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
            />
            <label htmlFor="anno-active" className="ml-2 font-body text-xs text-vault-text-secondary select-none cursor-pointer">
              Enable banner notification bar globally (visible at the top of pages)
            </label>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="maint-active"
              checked={maintenanceActive}
              onChange={(e) => setMaintenanceActive(e.target.checked)}
              className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
            />
            <label htmlFor="maint-active" className="ml-2 font-body text-xs text-vault-text-secondary select-none cursor-pointer">
              Enable Maintenance Mode (locks public site access, keeps /admin accessible)
            </label>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="hide-prices"
              checked={hidePublicPrices}
              onChange={(e) => setHidePublicPrices(e.target.checked)}
              className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
            />
            <label htmlFor="hide-prices" className="ml-2 font-body text-xs text-vault-text-secondary select-none cursor-pointer">
              Hide Public Prices (replace with &quot;Contact for Best Price&quot; on marketplace and product detail pages)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t border-vault-border pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-vault-gold px-6 py-3.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving Settings...' : 'Save Site Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
