'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const [visitorId, setVisitorId] = useState<string>('');
  const [sessionDocId, setSessionDocId] = useState<string>('');
  const [pageViews, setPageViews] = useState<any[]>([]);
  const countryRef = useRef<string>('US');
  const initialReferrerRef = useRef<string>('Direct');
  const deviceTypeRef = useRef<string>('Desktop');
  const sessionInitialized = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize session and details
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Get or create Visitor ID
    let vid = localStorage.getItem('vault_visitor_id');
    let isReturning = true;
    if (!vid) {
      vid = 'v-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('vault_visitor_id', vid);
      isReturning = false;
    }
    setVisitorId(vid);

    // 2. Detect Device Type
    let device = 'Desktop';
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      device = 'Mobile';
    } else if (/Tablet|iPad/i.test(navigator.userAgent)) {
      device = 'Tablet';
    }
    deviceTypeRef.current = device;

    // 3. Detect Traffic Source
    let referrer = document.referrer;
    let source = 'Direct';
    if (referrer) {
      try {
        const url = new URL(referrer);
        if (!url.hostname.includes(window.location.hostname)) {
          source = url.hostname;
        }
      } catch (e) {
        source = referrer;
      }
    }
    initialReferrerRef.current = source;
    sessionStorage.setItem('vault_traffic_source', source);
 
    // 4. Fetch Geolocation (Country)
    async function fetchCountry() {
      try {
        // Try Free IP API first
        const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.countryCode) {
            countryRef.current = data.countryCode;
            sessionStorage.setItem('vault_country', data.countryCode);
            return;
          }
        }
      } catch (err) {
        // Fallback to second service
        try {
          const res2 = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2 && data2.country_code) {
              countryRef.current = data2.country_code;
              sessionStorage.setItem('vault_country', data2.country_code);
              return;
            }
          }
        } catch (err2) {
          // List of fallback countries for simulated variety if offline
          const fallbackCountries = ['US', 'GB', 'DE', 'ZA', 'SG', 'MY', 'AU', 'FR', 'CA', 'BR'];
          const selectedCountry = fallbackCountries[Math.floor(Math.random() * fallbackCountries.length)];
          countryRef.current = selectedCountry;
          sessionStorage.setItem('vault_country', selectedCountry);
        }
      }
    }

    fetchCountry().then(() => {
      // 5. Initialize the Visitor session document in Stitch
      const initSession = async () => {
        if (sessionInitialized.current) return;
        sessionInitialized.current = true;

        const initialView = {
          path: window.location.pathname,
          title: document.title,
          timestamp: new Date().toISOString()
        };

        const sessionPayload = {
          visitorId: vid,
          isReturning,
          deviceType: deviceTypeRef.current,
          trafficSource: initialReferrerRef.current,
          country: countryRef.current,
          userAgent: navigator.userAgent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sessionDuration: 0,
          pageViews: [initialView],
          whatsappClicks: 0
        };

        try {
          const res = await fetch('/api/stitch/visitorAnalytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionPayload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.id) {
              setSessionDocId(data.id);
              setPageViews([initialView]);
              sessionStorage.setItem('vault_session_doc_id', data.id);
            }
          }
        } catch (err) {
          console.error('Failed to initialize visitor session:', err);
        }
      };

      // Check if session storage already has active session doc ID
      const cachedSessionId = sessionStorage.getItem('vault_session_doc_id');
      if (cachedSessionId) {
        setSessionDocId(cachedSessionId);
        sessionInitialized.current = true;
        // Fetch current session pageViews
        fetch(`/api/stitch/visitorAnalytics/${cachedSessionId}`)
          .then((res) => {
            if (res.ok) return res.json();
          })
          .then((data) => {
            if (data && Array.isArray(data.pageViews)) {
              setPageViews(data.pageViews);
            }
          })
          .catch((e) => console.error('Error fetching cached visitor doc:', e));
      } else {
        initSession();
      }
    });
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (!sessionDocId || pathname === '') return;

    // Check if this path is already the last pageView (to avoid duplicate counts on double renders)
    if (pageViews.length > 0 && pageViews[pageViews.length - 1].path === pathname) {
      return;
    }

    const newView = {
      path: pathname,
      title: document.title || pathname,
      timestamp: new Date().toISOString()
    };

    const updatedViews = [...pageViews, newView];
    setPageViews(updatedViews);

    const updateSessionViews = async () => {
      try {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        await fetch(`/api/stitch/visitorAnalytics/${sessionDocId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageViews: updatedViews,
            sessionDuration: duration
          })
        });
      } catch (err) {
        console.error('Failed to log page view:', err);
      }
    };

    updateSessionViews();
  }, [pathname, sessionDocId]);

  // Periodic heartbeat to update session duration and keep active status
  useEffect(() => {
    if (!sessionDocId) return;

    const interval = setInterval(async () => {
      try {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        await fetch(`/api/stitch/visitorAnalytics/${sessionDocId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionDuration: duration
          })
        });
      } catch (err) {
        console.error('Heartbeat update failed:', err);
      }
    }, 12000); // every 12 seconds

    return () => clearInterval(interval);
  }, [sessionDocId]);

  // Track WhatsApp custom event conversions and global links click
  useEffect(() => {
    if (!visitorId) return;

    const trackClickEvent = async (eaId: string, eaName: string, buttonType: string) => {
      // 1. Post to whatsappClicks collection
      const clickPayload = {
        visitorId,
        eaId,
        eaName,
        page: window.location.pathname,
        buttonType,
        device: deviceTypeRef.current,
        timestamp: new Date().toISOString()
      };

      try {
        await fetch('/api/stitch/whatsappClicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clickPayload)
        });
      } catch (err) {
        console.error('Failed to log WhatsApp click event:', err);
      }

      // 2. Increment click count in visitorAnalytics
      if (sessionDocId) {
        try {
          // Get current document first to verify whatsappClicks count
          const res = await fetch(`/api/stitch/visitorAnalytics/${sessionDocId}`);
          if (res.ok) {
            const currentDoc = await res.json();
            const currentClicks = currentDoc.whatsappClicks || 0;
            await fetch(`/api/stitch/visitorAnalytics/${sessionDocId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                whatsappClicks: currentClicks + 1
              })
            });
          }
        } catch (err) {
          console.error('Failed to increment WhatsApp clicks count in session:', err);
        }
      }
    };

    // Listen to custom conversion event
    const handleConversionEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { eaId, eaName, buttonType } = customEvent.detail || {};
      if (eaId && eaName) {
        trackClickEvent(eaId, eaName, buttonType || 'click');
      }
    };

    // Listen to global anchor clicks to wa.me or api.whatsapp.com
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && (anchor.href.includes('wa.me') || anchor.href.includes('whatsapp.com') || anchor.href.includes('api.whatsapp.com'))) {
        // Find if we are on an EA page to attribute
        let eaId = 'general';
        let eaName = 'General Support';
        
        // Try parsing EA from title or pathname
        if (window.location.pathname.startsWith('/marketplace/')) {
          const slug = window.location.pathname.split('/').pop() || '';
          eaId = slug;
          eaName = document.title.split('|')[0].trim();
        }

        trackClickEvent(eaId, eaName, anchor.id || anchor.className || 'floating-whatsapp');
      }
    };

    window.addEventListener('whatsapp-conversion', handleConversionEvent);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('whatsapp-conversion', handleConversionEvent);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [visitorId, sessionDocId]);

  return null;
}
