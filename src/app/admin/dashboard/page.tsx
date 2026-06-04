'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Live data state
  const [easList, setEasList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [visitorAnalyticsList, setVisitorAnalyticsList] = useState<any[]>([]);
  const [whatsappClicksList, setWhatsappClicksList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);

  // Computed metrics
  const [stats, setStats] = useState({
    totalEAs: 0,
    ordersToday: 0,
    revenueThisMonth: 0,
    pendingRequests: 0,
    totalReviews: 0,
    avgRating: 'N/A',
    wishlistCount: 0,
    subscriberCount: 0,
    mostViewedEA: 'None',
    mostPurchasedEA: 'None',
    
    // Telemetry and conversions
    totalVisitors: 0,
    liveVisitors: 0,
    dailyTraffic: 0,
    totalLeads: 0,
    whatsappClicksCount: 0,
    overallConversionRate: 0,
  });

  // UI state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [deviceStats, setDeviceStats] = useState<{device: string, count: number, percent: number}[]>([]);
  const [sourceStats, setSourceStats] = useState<{source: string, count: number, percent: number}[]>([]);
  const [geoStats, setGeoStats] = useState<{location: string, count: number}[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<any[]>([]);
  const [popularEAs, setPopularEAs] = useState<{id: string, name: string, views: number, clicks: number, leads: number}[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          easRes, 
          ordersRes, 
          requestsRes, 
          reviewsRes, 
          subscribersRes, 
          wishlistsRes,
          visitorAnalyticsRes,
          whatsappClicksRes,
          leadsRes
        ] = await Promise.all([
          fetch('/api/stitch/eas'),
          fetch('/api/stitch/orders'),
          fetch('/api/stitch/customRequests'),
          fetch('/api/stitch/reviews'),
          fetch('/api/stitch/subscribers'),
          fetch('/api/stitch/wishlists'),
          fetch('/api/stitch/visitorAnalytics'),
          fetch('/api/stitch/whatsappClicks'),
          fetch('/api/stitch/leads')
        ]);

        if (!easRes.ok || !ordersRes.ok || !requestsRes.ok) {
          throw new Error('Failed to retrieve control console databases.');
        }

        const eas = await easRes.json();
        const orders = await ordersRes.json();
        const requests = await requestsRes.json();
        const reviews = reviewsRes.ok ? await reviewsRes.json() : [];
        const subscribers = subscribersRes.ok ? await subscribersRes.json() : [];
        const wishlists = wishlistsRes.ok ? await wishlistsRes.json() : [];
        const visitorAnalytics = visitorAnalyticsRes.ok ? await visitorAnalyticsRes.json() : [];
        const whatsappClicks = whatsappClicksRes.ok ? await whatsappClicksRes.json() : [];
        const leads = leadsRes.ok ? await leadsRes.json() : [];

        setEasList(eas);
        setOrdersList(orders);
        setRequestsList(requests);
        setVisitorAnalyticsList(visitorAnalytics);
        setWhatsappClicksList(whatsappClicks);
        setLeadsList(leads);

        // Aggregate statistics
        const totalEAsCount = eas.length;

        // Orders today (UTC day check)
        const todayStr = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter((o: any) => {
          return o.createdAt && o.createdAt.split('T')[0] === todayStr;
        }).length;

        // Revenue this month (completed status only)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthRevenue = orders
          .filter((o: any) => {
            if (o.status !== 'completed' && o.status !== 'paid') return false;
            const date = new Date(o.createdAt);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);

        // Pending requests count
        const pendingReqs = requests.filter(
          (r: any) => r.status === 'new' || r.status === 'pending' || r.status === 'reviewing'
        ).length;

        // Trust & Engagement Metrics
        const totalReviewsCount = reviews.length;
        const approvedReviews = reviews.filter((r: any) => r.approved);
        const avgRatingValue = approvedReviews.length
          ? (approvedReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / approvedReviews.length).toFixed(1)
          : 'N/A';

        const totalWishlistsCount = wishlists.length;
        const totalSubscribersCount = subscribers.length;

        // Most Viewed EA
        const sortedByViews = [...eas].sort((a: any, b: any) => (b.viewsCount || 0) - (a.viewsCount || 0));
        const mostViewed = sortedByViews[0]?.name || 'None';

        // Most Purchased EA
        const purchaseCounts: { [key: string]: number } = {};
        orders.forEach((o: any) => {
          if (o.status === 'completed' || o.status === 'paid') {
            purchaseCounts[o.eaId] = (purchaseCounts[o.eaId] || 0) + 1;
          }
        });
        let mostPurchasedId = '';
        let maxPurchasedCount = 0;
        Object.entries(purchaseCounts).forEach(([eaId, count]) => {
          if (count > maxPurchasedCount) {
            maxPurchasedCount = count;
            mostPurchasedId = eaId;
          }
        });
        const mostPurchased = eas.find((e: any) => e.id === mostPurchasedId)?.name || 'None';

        // Telemetry calculation
        const totalUniqueVisitors = visitorAnalytics.length;
        
        // Live Visitors (updated in last 30s)
        const now = Date.now();
        const activeVisitors = visitorAnalytics.filter((v: any) => {
          const updatedTime = new Date(v.updatedAt).getTime();
          return now - updatedTime < 30 * 1000;
        });
        setLiveVisitors(activeVisitors);
        
        // Daily Traffic (created in last 24h)
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const dailyVisits = visitorAnalytics.filter((v: any) => {
          return new Date(v.createdAt).getTime() > oneDayAgo;
        }).length;

        // Device Breakdown
        const devices: { [key: string]: number } = { desktop: 0, mobile: 0, tablet: 0 };
        visitorAnalytics.forEach((v: any) => {
          const type = (v.deviceType || 'desktop').toLowerCase();
          if (devices[type] !== undefined) {
            devices[type]++;
          } else {
            devices.desktop++;
          }
        });
        const deviceArr = Object.entries(devices).map(([device, count]) => ({
          device: device.charAt(0).toUpperCase() + device.slice(1),
          count,
          percent: totalUniqueVisitors ? Math.round((count / totalUniqueVisitors) * 100) : 0
        })).sort((a, b) => b.count - a.count);
        setDeviceStats(deviceArr);

        // Traffic Sources Breakdown
        const sourcesMap: { [key: string]: number } = {};
        visitorAnalytics.forEach((v: any) => {
          const src = v.trafficSource || 'Direct';
          sourcesMap[src] = (sourcesMap[src] || 0) + 1;
        });
        const sourceArr = Object.entries(sourcesMap).map(([source, count]) => ({
          source,
          count,
          percent: totalUniqueVisitors ? Math.round((count / totalUniqueVisitors) * 100) : 0
        })).sort((a, b) => b.count - a.count).slice(0, 5);
        setSourceStats(sourceArr);

        // Location Breakdown
        const locationsMap: { [key: string]: number } = {};
        visitorAnalytics.forEach((v: any) => {
          const loc = v.location || 'Unknown';
          locationsMap[loc] = (locationsMap[loc] || 0) + 1;
        });
        const geoArr = Object.entries(locationsMap).map(([location, count]) => ({
          location,
          count
        })).sort((a, b) => b.count - a.count).slice(0, 5);
        setGeoStats(geoArr);

        // Conversion Rate: (WhatsApp unique clicks + unique Leads) / Total Unique Visitors
        const convertingVisitorIds = new Set<string>();
        whatsappClicks.forEach((w: any) => {
          if (w.visitorId) convertingVisitorIds.add(w.visitorId);
        });
        const uniqueConvertingCount = convertingVisitorIds.size;
        const convRate = totalUniqueVisitors ? ((uniqueConvertingCount + leads.length) / totalUniqueVisitors) * 100 : 0;

        // EA Performance Leaderboard
        const eaViews: { [key: string]: number } = {};
        visitorAnalytics.forEach((v: any) => {
          if (Array.isArray(v.pageViews)) {
            v.pageViews.forEach((pv: any) => {
              if (pv.path && pv.path.startsWith('/marketplace/')) {
                const slug = pv.path.split('/')[2];
                if (slug) {
                  eaViews[slug] = (eaViews[slug] || 0) + 1;
                }
              }
            });
          }
        });

        const eaClicks: { [key: string]: number } = {};
        whatsappClicks.forEach((w: any) => {
          if (w.eaId) {
            eaClicks[w.eaId] = (eaClicks[w.eaId] || 0) + 1;
          }
        });

        const eaLeads: { [key: string]: number } = {};
        leads.forEach((l: any) => {
          const key = l.eaId || l.eaName || '';
          if (key) {
            eaLeads[key] = (eaLeads[key] || 0) + 1;
          }
        });

        const popularEAsArr = eas.map((e: any) => {
          const views = eaViews[e.slug] || 0;
          const clicks = eaClicks[e.id] || 0;
          const leadCount = eaLeads[e.id] || eaLeads[e.name] || 0;
          return {
            id: e.id,
            name: e.name,
            views,
            clicks,
            leads: leadCount
          };
        }).sort((a: any, b: any) => (b.views + b.clicks * 2 + b.leads * 5) - (a.views + a.clicks * 2 + a.leads * 5)).slice(0, 5);
        setPopularEAs(popularEAsArr);

        setStats({
          totalEAs: totalEAsCount,
          ordersToday: todayOrders,
          revenueThisMonth: monthRevenue,
          pendingRequests: pendingReqs,
          totalReviews: totalReviewsCount,
          avgRating: avgRatingValue,
          wishlistCount: totalWishlistsCount,
          subscriberCount: totalSubscribersCount,
          mostViewedEA: mostViewed,
          mostPurchasedEA: mostPurchased,
          
          totalVisitors: totalUniqueVisitors,
          liveVisitors: activeVisitors.length,
          dailyTraffic: dailyVisits,
          totalLeads: leads.length,
          whatsappClicksCount: whatsappClicks.length,
          overallConversionRate: Number(convRate.toFixed(1))
        });

      } catch (err: any) {
        setError(err?.message || 'Error sync data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center space-y-3">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-vault-gold border-t-transparent" />
          <p className="font-body text-xs text-vault-text-secondary">Loading console stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-vault-loss/20 bg-vault-loss/5 p-6 text-sm text-vault-loss font-body">
        {error}
      </div>
    );
  }

  // Get recent 10 orders (sorted descending)
  const recentOrders = [...ordersList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Get recent 5 requests (sorted descending)
  const recentRequests = [...requestsList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Map EA name for orders helper
  const eaNameMap = new Map(easList.map((e) => [e.id, e.name]));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            Console Overview
          </h1>
          <p className="mt-1 font-body text-xs text-vault-text-secondary">
            System aggregates, live transaction feeds, and request queues.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-vault-border px-4 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors cursor-pointer"
          >
            🔄 Sync Live Data
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Total EAs */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="font-body text-xs text-vault-text-secondary font-medium">Total EAs Listed</span>
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-heading text-2xl font-extrabold text-vault-text">{stats.totalEAs}</span>
            <Link href="/admin/eas/new" className="font-body text-[10px] text-vault-gold font-bold hover:underline">
              + Add
            </Link>
          </div>
        </div>

        {/* Stat 2: Orders Today */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="font-body text-xs text-vault-text-secondary font-medium">Orders Today</span>
            <span className="text-xl">📦</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-heading text-2xl font-extrabold text-vault-text">{stats.ordersToday}</span>
            <span className="font-body text-[10px] text-vault-text-muted">Live logs</span>
          </div>
        </div>

        {/* Stat 3: Revenue This Month */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="font-body text-xs text-vault-text-secondary font-medium">Revenue This Month</span>
            <span className="text-xl">💰</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-heading text-2xl font-extrabold text-vault-text">
              ${stats.revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="font-body text-[10px] text-vault-profit font-bold">100% Volume</span>
          </div>
        </div>

        {/* Stat 4: Pending Requests */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <span className="font-body text-xs text-vault-text-secondary font-medium">Pending Requests</span>
            <span className="text-xl">📥</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-heading text-2xl font-extrabold text-vault-text">{stats.pendingRequests}</span>
            <Link href="/admin/requests" className="font-body text-[10px] text-vault-gold font-bold hover:underline">
              View All
            </Link>
          </div>
        </div>
      </div>
      {/* Visitor Telemetry & Conversion Analytics */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-vault-text">
            Visitor Telemetry & Conversion Analytics
          </h2>
          <span className="flex items-center gap-1.5 rounded-full bg-vault-gold/10 px-2.5 py-0.5 text-[9px] font-heading font-extrabold uppercase text-vault-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-vault-gold animate-pulse" />
            Telemetry Live
          </span>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {/* Card 1: Unique Visitors */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-4 flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
              <span className="font-body text-[10px] text-vault-text-secondary font-bold uppercase tracking-wider">Unique Visitors</span>
              <span className="text-sm">👥</span>
            </div>
            <div>
              <span className="font-heading text-xl font-extrabold text-vault-text">{stats.totalVisitors}</span>
              <span className="font-body text-[9px] text-vault-text-muted block mt-1">All-time count</span>
            </div>
          </div>

          {/* Card 2: Live Now */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-4 flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
              <span className="font-body text-[10px] text-vault-text-secondary font-bold uppercase tracking-wider font-medium">Live Now</span>
              <span className="relative flex h-2 w-2 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-profit opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-vault-profit"></span>
              </span>
            </div>
            <div>
              <span className="font-heading text-xl font-extrabold text-vault-text">{stats.liveVisitors}</span>
              <span className="font-body text-[9px] text-vault-text-muted block mt-1">Active within 30s</span>
            </div>
          </div>

          {/* Card 3: Daily Traffic */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-4 flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
              <span className="font-body text-[10px] text-vault-text-secondary font-bold uppercase tracking-wider">Daily Traffic</span>
              <span className="text-sm">📈</span>
            </div>
            <div>
              <span className="font-heading text-xl font-extrabold text-vault-text">{stats.dailyTraffic}</span>
              <span className="font-body text-[9px] text-vault-text-muted block mt-1">Last 24 hours</span>
            </div>
          </div>

          {/* Card 4: WhatsApp Clicks */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-4 flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
              <span className="font-body text-[10px] text-vault-text-secondary font-bold uppercase tracking-wider">WhatsApp Clicks</span>
              <span className="text-sm">💬</span>
            </div>
            <div>
              <span className="font-heading text-xl font-extrabold text-vault-text">{stats.whatsappClicksCount}</span>
              <span className="font-body text-[9px] text-vault-text-muted block mt-1">Click conversions</span>
            </div>
          </div>

          {/* Card 5: Smart Leads */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-4 flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
              <span className="font-body text-[10px] text-vault-text-secondary font-bold uppercase tracking-wider">Smart Leads</span>
              <span className="text-sm">🎯</span>
            </div>
            <div className="flex justify-between items-baseline min-w-0 w-full">
              <div>
                <span className="font-heading text-xl font-extrabold text-vault-text">{stats.totalLeads}</span>
                <span className="font-body text-[9px] text-vault-text-muted block mt-1">Captured leads</span>
              </div>
              <Link href="/admin/leads" className="font-body text-[9px] text-vault-gold font-bold hover:underline select-none">
                CRM
              </Link>
            </div>
          </div>

          {/* Card 6: Conversion Rate */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-4 flex flex-col justify-between h-[110px]">
            <div className="flex justify-between items-start">
              <span className="font-body text-[10px] text-vault-text-secondary font-bold uppercase tracking-wider">Conv. Rate</span>
              <span className="text-sm">📊</span>
            </div>
            <div>
              <span className="font-heading text-xl font-extrabold text-vault-gold">{stats.overallConversionRate}%</span>
              <span className="font-body text-[9px] text-vault-text-muted block mt-1">Inquiry / visitors</span>
            </div>
          </div>
        </div>

        {/* Telemetry Graphs / Progress Lists Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Device Breakdown */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
            <h3 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider">Device Breakdown</h3>
            <div className="space-y-3.5">
              {deviceStats.length === 0 ? (
                <p className="font-body text-xs text-vault-text-muted">No device data logged.</p>
              ) : (
                deviceStats.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-vault-text-secondary">{item.device}</span>
                      <span className="text-vault-text font-bold">{item.percent}% <span className="text-vault-text-muted text-[10px] font-normal">({item.count})</span></span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-vault-bg overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-vault-gold' : idx === 1 ? 'bg-vault-gold/60' : 'bg-vault-gold/30'
                        }`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
            <h3 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider">Top Traffic Sources</h3>
            <div className="space-y-3.5">
              {sourceStats.length === 0 ? (
                <p className="font-body text-xs text-vault-text-muted">No traffic source data logged.</p>
              ) : (
                sourceStats.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-vault-text-secondary truncate max-w-[150px]">{item.source}</span>
                      <span className="text-vault-text font-bold">{item.percent}% <span className="text-vault-text-muted text-[10px] font-normal">({item.count})</span></span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-vault-bg overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-vault-gold"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Geolocations */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
            <h3 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider">Top Geolocations</h3>
            <div className="space-y-3 font-body text-xs text-vault-text-secondary">
              {geoStats.length === 0 ? (
                <p className="font-body text-xs text-vault-text-muted">No geolocation data logged.</p>
              ) : (
                geoStats.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-vault-border/40 last:border-none">
                    <div className="flex items-center gap-2">
                      <span className="text-vault-text-muted text-[10px] font-bold">#{idx + 1}</span>
                      <span className="text-vault-text truncate">{item.location}</span>
                    </div>
                    <span className="font-bold text-vault-text font-heading">{item.count} <span className="text-[10px] text-vault-text-muted font-normal">visits</span></span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Popular EAs Performance Leaderboard */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
          <h3 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider">Popular EAs (Visits vs WhatsApp vs Leads)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs">
              <thead>
                <tr className="border-b border-vault-border text-vault-text-muted uppercase text-[9px] font-bold">
                  <th className="pb-3">Expert Advisor</th>
                  <th className="pb-3 text-center">Catalogue Views</th>
                  <th className="pb-3 text-center">WhatsApp inquiries</th>
                  <th className="pb-3 text-center">Form Leads</th>
                  <th className="pb-3 text-right">Activity Score</th>
                </tr>
              </thead>
              <tbody className="text-vault-text-secondary">
                {popularEAs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-vault-text-muted">No catalog interactions recorded yet.</td>
                  </tr>
                ) : (
                  popularEAs.map((ea, idx) => {
                    const score = ea.views + ea.clicks * 2 + ea.leads * 5;
                    return (
                      <tr key={ea.id || idx} className="border-b border-vault-border/30 last:border-none hover:bg-vault-bg/30">
                        <td className="py-3 font-heading font-bold text-vault-text">{ea.name}</td>
                        <td className="py-3 text-center">{ea.views}</td>
                        <td className="py-3 text-center text-vault-gold font-bold">{ea.clicks}</td>
                        <td className="py-3 text-center text-vault-profit font-bold">{ea.leads}</td>
                        <td className="py-3 text-right font-heading font-extrabold text-vault-text">{score}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* "Live Now" Monitor Widget */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs font-bold text-vault-text uppercase tracking-wider flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-vault-profit animate-ping" />
              Live User Sessions ({liveVisitors.length})
            </h3>
            <span className="text-[10px] text-vault-text-muted font-body">Refreshes dynamically</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-vault-border bg-vault-bg/50">
            <table className="w-full text-left border-collapse font-body text-xs">
              <thead>
                <tr className="border-b border-vault-border bg-vault-bg/85 font-heading text-[9px] font-bold text-vault-text-muted uppercase">
                  <th className="p-3">Visitor ID</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Active Duration</th>
                  <th className="p-3">Current Location (URL Path)</th>
                  <th className="p-3 text-right">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody className="text-vault-text-secondary">
                {liveVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-vault-text-muted">
                      No active sessions. Listening for incoming telemetry...
                    </td>
                  </tr>
                ) : (
                  liveVisitors.map((visitor, idx) => {
                    const lastPage = Array.isArray(visitor.pageViews) && visitor.pageViews.length > 0 
                      ? visitor.pageViews[visitor.pageViews.length - 1].path 
                      : 'Home (/)';
                    
                    const min = Math.floor((visitor.heartbeatDuration || 0) / 60);
                    const sec = (visitor.heartbeatDuration || 0) % 60;
                    const durationStr = min > 0 ? `${min}m ${sec}s` : `${sec}s`;
                    
                    const lastActive = new Date(visitor.updatedAt);

                    return (
                      <tr key={visitor.id || idx} className="border-b border-vault-border last:border-none hover:bg-vault-surface-high/30">
                        <td className="p-3 font-mono text-[10px] text-vault-text-secondary select-all">{visitor.visitorId?.substring(0, 12)}...</td>
                        <td className="p-3 capitalize">{visitor.deviceType || 'Desktop'}</td>
                        <td className="p-3">{visitor.location || 'Unknown'}</td>
                        <td className="p-3 font-bold text-vault-text">{durationStr}</td>
                        <td className="p-3 font-mono text-[10px] text-vault-gold truncate max-w-[200px]" title={lastPage}>{lastPage}</td>
                        <td className="p-3 text-right text-[10px] text-vault-text-muted">
                          {lastActive.toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
        <h3 className="font-heading text-sm font-bold text-vault-text">Console Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/eas/new"
            className="rounded-xl bg-vault-gold px-5 py-3 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity select-none"
          >
            + Add New EA Software
          </Link>
          <Link
            href="/admin/requests"
            className="rounded-xl border border-vault-border bg-vault-bg px-5 py-3 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors select-none"
          >
            View Custom Requests
          </Link>
          <Link
            href="/admin/leads"
            className="rounded-xl bg-vault-profit/10 px-5 py-3 font-heading text-xs font-bold text-vault-profit hover:bg-vault-profit hover:text-vault-bg transition-all select-none"
          >
            View Smart CRM Leads
          </Link>
        </div>
      </div>

      {/* Main Grid: Orders & Requests */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Recent Orders Section (Col span 8) */}
        <div className="xl:col-span-8 rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-vault-text">Recent Orders</h2>
            <Link href="/admin/orders" className="font-body text-xs text-vault-gold hover:underline">
              Manage All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-vault-border bg-vault-bg/30 p-8 text-center font-body text-xs text-vault-text-muted">
              No orders have been recorded in the database.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-vault-border bg-vault-bg/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-vault-border bg-vault-bg/85 font-heading text-[10px] font-bold text-vault-text-secondary uppercase">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer ID</th>
                    <th className="p-4">EA Name</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="font-body text-xs text-vault-text-secondary">
                  {recentOrders.map((order, idx) => {
                    const isExpanded = expandedOrderId === order.orderId;
                    return (
                      <Fragment key={order.orderId || order.id || idx}>
                        <tr
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                          className="border-b border-vault-border last:border-none hover:bg-vault-surface-high/30 transition-colors cursor-pointer select-none"
                        >
                          <td className="p-4 font-heading font-semibold text-vault-text">
                            {order.orderId}
                          </td>
                          <td className="p-4 font-mono text-[11px] truncate max-w-[80px] text-vault-text-muted">
                            {order.userId}
                          </td>
                          <td className="p-4 font-heading font-bold text-vault-text max-w-[150px] truncate">
                            {eaNameMap.get(order.eaId) || 'Unknown EA'}
                          </td>
                          <td className="p-4 font-heading font-bold text-vault-text">
                            ${Number(order.amount).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-heading font-extrabold uppercase ${
                              order.status === 'completed' ? 'bg-vault-profit/10 text-vault-profit' :
                              order.status === 'pending' ? 'bg-vault-gold/10 text-vault-gold' :
                              'bg-vault-loss/10 text-vault-loss'
                            }`}>
                              {order.status === 'completed' ? 'Paid' : order.status}
                            </span>
                          </td>
                          <td className="p-4 text-vault-text-muted text-[11px]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-vault-bg/40 border-b border-vault-border">
                            <td colSpan={6} className="p-4 space-y-3 font-body text-xs text-vault-text-secondary">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block font-bold uppercase tracking-wider">Transaction DB Ref:</span>
                                  <span className="font-mono mt-1 block select-all text-vault-text">{order.id}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block font-bold uppercase tracking-wider">Exact Timestamp:</span>
                                  <span className="mt-1 block text-vault-text">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block font-bold uppercase tracking-wider">Payment Method:</span>
                                  <span className="mt-1 block uppercase text-vault-text">{order.paymentMethod || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-vault-text-muted block font-bold uppercase tracking-wider">Product Ref ID:</span>
                                  <span className="font-mono mt-1 block select-all text-vault-text">{order.eaId}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Custom Requests Section (Col span 4) */}
        <div className="xl:col-span-4 rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-vault-text">Recent Requests</h2>
            <Link href="/admin/requests" className="font-body text-xs text-vault-gold hover:underline">
              View All
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-vault-border bg-vault-bg/30 p-8 text-center font-body text-xs text-vault-text-muted">
              No custom sourcing requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((req, idx) => (
                <div key={idx} className="rounded-xl border border-vault-border bg-vault-bg/50 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="font-heading text-xs font-bold text-vault-text truncate">{req.eaName}</h4>
                      <p className="font-body text-[10px] text-vault-text-muted truncate mt-0.5">{req.email}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-heading font-extrabold uppercase ${
                      req.status === 'new' || req.status === 'pending' ? 'bg-vault-gold/10 text-vault-gold' :
                      req.status === 'reviewing' || req.status === 'quoted' ? 'bg-blue-500/10 text-blue-400' :
                      req.status === 'completed' || req.status === 'accepted' ? 'bg-vault-profit/10 text-vault-profit' :
                      'bg-vault-loss/10 text-vault-loss'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1.5 border-t border-vault-border/50 text-[10px]">
                    <span className="text-vault-text-secondary font-medium">
                      {req.whatsapp ? 'WhatsApp: ' : 'Budget: '}
                      <strong className="text-vault-text">{req.whatsapp || req.budget || 'N/A'}</strong>
                    </span>
                    <span className="text-vault-text-muted">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Health & Telemetry Section */}
      <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-6">
        <div>
          <h3 className="font-heading text-base font-bold text-vault-text flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-vault-profit animate-ping" />
            Vault Engine Status & Telemetry
          </h3>
          <p className="font-body text-xs text-vault-text-secondary mt-1">
            Real-time status metrics of local JSON filesystem storage volume, security rule engines, and API endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* DB Health */}
          <div className="rounded-xl bg-vault-bg border border-vault-border p-4 space-y-3">
            <div className="flex justify-between items-center text-[10px] text-vault-text-muted uppercase font-bold tracking-wider">
              <span>Database Node</span>
              <span className="text-vault-profit flex items-center gap-1 font-heading text-[9px] lowercase font-extrabold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-vault-profit" />
                optimal
              </span>
            </div>
            <div>
              <span className="block font-heading text-base font-bold text-vault-text select-all">src/lib/db.json</span>
              <span className="text-[10px] text-vault-text-secondary mt-1 block">Local persistent file-based node</span>
            </div>
            <div className="flex justify-between text-[10px] pt-2 border-t border-vault-border/50 text-vault-text-muted font-mono">
              <span>Read latency:</span>
              <span className="text-vault-text">1.2ms</span>
            </div>
          </div>

          {/* Disk Health */}
          <div className="rounded-xl bg-vault-bg border border-vault-border p-4 space-y-3">
            <div className="flex justify-between items-center text-[10px] text-vault-text-muted uppercase font-bold tracking-wider">
              <span>Storage Volume</span>
              <span className="text-vault-profit flex items-center gap-1 font-heading text-[9px] lowercase font-extrabold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-vault-profit" />
                optimal
              </span>
            </div>
            <div>
              <span className="block font-heading text-base font-bold text-vault-text select-all">/public/downloads</span>
              <span className="text-[10px] text-vault-text-secondary mt-1 block">EA Binary assets path</span>
            </div>
            <div className="flex justify-between text-[10px] pt-2 border-t border-vault-border/50 text-vault-text-muted font-mono">
              <span>Storage status:</span>
              <span className="text-vault-profit">98.4% Available</span>
            </div>
          </div>

          {/* CSRF / JWT */}
          <div className="rounded-xl bg-vault-bg border border-vault-border p-4 space-y-3">
            <div className="flex justify-between items-center text-[10px] text-vault-text-muted uppercase font-bold tracking-wider">
              <span>Security Engine</span>
              <span className="text-vault-profit flex items-center gap-1 font-heading text-[9px] lowercase font-extrabold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-vault-profit" />
                active
              </span>
            </div>
            <div>
              <span className="block font-heading text-base font-bold text-vault-text select-all">JWT & CSRF Guard</span>
              <span className="text-[10px] text-vault-text-secondary mt-1 block">Validating Referer, Origin & Cookies</span>
            </div>
            <div className="flex justify-between text-[10px] pt-2 border-t border-vault-border/50 text-vault-text-muted font-mono">
              <span>Strict mode:</span>
              <span className="text-vault-text">Enforced</span>
            </div>
          </div>

          {/* Rate limits */}
          <div className="rounded-xl bg-vault-bg border border-vault-border p-4 space-y-3">
            <div className="flex justify-between items-center text-[10px] text-vault-text-muted uppercase font-bold tracking-wider">
              <span>Access Gatekeeper</span>
              <span className="text-vault-profit flex items-center gap-1 font-heading text-[9px] lowercase font-extrabold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-vault-profit" />
                monitoring
              </span>
            </div>
            <div>
              <span className="block font-heading text-base font-bold text-vault-text select-all">Rate Limit Register</span>
              <span className="text-[10px] text-vault-text-secondary mt-1 block">Tracking login / download windows</span>
            </div>
            <div className="flex justify-between text-[10px] pt-2 border-t border-vault-border/50 text-vault-text-muted font-mono">
              <span>Cooldown lockout:</span>
              <span className="text-vault-text">15 mins</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
