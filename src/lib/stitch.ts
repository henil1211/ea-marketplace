/**
 * EA VAULT — Stitch MCP Client
 * 
 * This module provides TypeScript types and CRUD helper functions
 * for all database collections managed via Stitch MCP.
 * 
 * Stitch Project ID: 9219436561619522988
 * Design System Asset: assets/00b3b8b3d70c4ebb97fa9c41aa58d43f
 */

// ============================================
//  Type Definitions
// ============================================

export type Platform = 'mt4' | 'mt5' | 'both';
export type EACategory = 'scalper' | 'trend' | 'grid' | 'martingale' | 'hedging' | 'news' | 'breakout' | 'swing' | 'other';
export type EAStatus = 'active' | 'draft' | 'archived';
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'crypto' | 'paypal' | 'bank';
export type UserRole = 'user' | 'admin';
export type CustomRequestStatus = 'new' | 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'completed' | 'rejected';

export interface BacktestDataPoint {
  date: string;
  balance: number;
  equity: number;
  drawdown: number;
}

export interface MonthlyReturn {
  month: string;      // e.g. "2024-01"
  returnPct: number;  // e.g. 5.3
  trades: number;
}

export interface EA {
  id?: string;
  name: string;
  slug: string;
  platform: Platform;
  category: EACategory;
  shortDesc: string;
  fullDesc: string;
  mql5Price: number;
  ourPrice: number;
  winRate: number;          // percentage 0-100
  maxDrawdown: number;      // percentage 0-100
  profitFactor: number;     // e.g. 1.8
  backtestData: BacktestDataPoint[];
  monthlyReturns: MonthlyReturn[];
  thumbnail: string;        // URL or file path
  backtestImage?: string;   // Single legacy backtest image path
  backtestImages?: string[]; // Array of up to 2 backtest image paths
  eaFile: string;           // download URL
  tags: string[];
  featured: boolean;
  status: EAStatus;
  faqs?: { question: string; answer: string }[];
  createdAt: string;        // ISO date
  riskLevel?: 'conservative' | 'balanced' | 'aggressive';
  minDeposit?: number;
  brokerCompatibility?: string;
  propFirmCompatible?: boolean;
  lastUpdated?: string;
  downloads?: number;
  trending?: boolean;
  viewsCount?: number;
  downloadsCount?: number;
  wishlistCount?: number;
  recentlyUpdated?: boolean;
  recentlyAdded?: boolean;
}

export interface Order {
  id?: string;
  orderId: string;          // human-readable order ID e.g. "ORD-00001"
  userId: string;
  eaId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface User {
  id?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  createdAt: string;
}

export interface CustomRequest {
  id?: string;
  eaName: string;
  mql5Url: string;
  platform: Platform;
  budget?: string;
  whatsapp?: string;
  email: string;
  notes: string;
  status: CustomRequestStatus;
  createdAt: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  contactEmail: string;
  whatsapp: string;
  announcementBar: string;
  hidePublicPrices?: boolean;
}

export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'converted' | 'closed';

export interface Lead {
  id?: string;
  eaId: string;
  eaName: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  contactHandle?: string; // Telegram/WhatsApp handle
  formType?: string;      // e.g. "Get EA Details", "Request Setup Guide", "Get Broker Recommendation"
  source: string;
  createdAt: string;
  status: LeadStatus;
  notes?: string;
  visitorId?: string;
  trafficSource?: string;
  country?: string;
  notesLog?: { text: string; createdAt: string }[];
  timeline?: { event: string; timestamp: string }[];
}

export interface VisitorPageView {
  path: string;
  title?: string;
  timestamp: string;
}

export interface VisitorAnalytics {
  id?: string;
  visitorId: string;
  isReturning: boolean;
  deviceType: string;
  trafficSource: string;
  country: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  sessionDuration: number; // in seconds
  pageViews: VisitorPageView[];
  whatsappClicks: number;
}

export interface WhatsAppClick {
  id?: string;
  visitorId: string;
  eaId: string;
  eaName: string;
  page: string;
  buttonType: string; // e.g. "buy-btn-top", "sticky-mobile", "floating-support"
  device: string;
  timestamp: string;
}

export interface Review {
  id?: string;
  eaId: string;
  userId: string;
  userName: string;
  userCountry: string; // e.g. "DE", "US", "ZA", "MY"
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  approved: boolean;
  verifiedPurchase: boolean;
}

export interface WishlistItem {
  id?: string;
  userId: string;
  eaId: string;
  createdAt: string;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_completed' | 'wishlist_sale' | 'custom_request_update' | 'review_approved';
  read: boolean;
  createdAt: string;
}

export interface Subscriber {
  id?: string;
  email: string;
  createdAt: string;
  source: string;
}

export interface DownloadLog {
  id?: string;
  userId: string;
  eaId: string;
  ipAddress: string;
  downloadedAt: string;
  status: 'success' | 'failed' | 'unauthorized';
}

export interface ActivityLog {
  id?: string;
  type: string;
  userId: string;
  action: string;
  metadata: any;
  createdAt: string;
}

// ============================================
//  Stitch MCP Configuration
// ============================================

export const STITCH_CONFIG = {
  projectId: '9219436561619522988',
  designSystemAsset: 'assets/00b3b8b3d70c4ebb97fa9c41aa58d43f',
  collections: {
    eas: 'eas',
    orders: 'orders',
    users: 'users',
    customRequests: 'customRequests',
    settings: 'settings',
    reviews: 'reviews',
    wishlists: 'wishlists',
    notifications: 'notifications',
    subscribers: 'subscribers',
    downloadLogs: 'downloadLogs',
    activityLogs: 'activityLogs',
    leads: 'leads',
    visitorAnalytics: 'visitorAnalytics',
    whatsappClicks: 'whatsappClicks',
  },
} as const;

// ============================================
//  Generic CRUD Helpers
// ============================================

/**
 * Generic create function for any collection.
 * In production, this will call the Stitch MCP API.
 */
export async function createDocument<T extends object>(
  collection: string,
  data: T
): Promise<T & { id: string }> {
  // TODO: Replace with actual Stitch MCP API call
  // POST /api/stitch/{collection}
  const response = await fetch(`/api/stitch/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create document in ${collection}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generic read function — fetch a single document by ID.
 */
export async function getDocument<T>(
  collection: string,
  id: string
): Promise<T> {
  const response = await fetch(`/api/stitch/${collection}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch document from ${collection}/${id}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generic list function — fetch all documents from a collection.
 * Supports optional query parameters for filtering/sorting.
 */
export async function listDocuments<T>(
  collection: string,
  params?: Record<string, string>
): Promise<T[]> {
  const queryString = params
    ? '?' + new URLSearchParams(params).toString()
    : '';

  const response = await fetch(`/api/stitch/${collection}${queryString}`);

  if (!response.ok) {
    throw new Error(`Failed to list documents from ${collection}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generic update function — update a document by ID.
 */
export async function updateDocument<T extends object>(
  collection: string,
  id: string,
  data: Partial<T>
): Promise<T> {
  const response = await fetch(`/api/stitch/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update document in ${collection}/${id}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generic delete function — delete a document by ID.
 */
export async function deleteDocument(
  collection: string,
  id: string
): Promise<void> {
  const response = await fetch(`/api/stitch/${collection}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete document from ${collection}/${id}: ${response.statusText}`);
  }
}

// ============================================
//  Collection-Specific Helpers
// ============================================

// ─── EAs ───

export const eaHelpers = {
  create: (data: Omit<EA, 'id'>) =>
    createDocument<Omit<EA, 'id'>>(STITCH_CONFIG.collections.eas, data),

  getById: (id: string) =>
    getDocument<EA>(STITCH_CONFIG.collections.eas, id),

  getBySlug: async (slug: string): Promise<EA | null> => {
    const results = await listDocuments<EA>(STITCH_CONFIG.collections.eas, { slug });
    return results.length > 0 ? results[0] : null;
  },

  list: (params?: { category?: EACategory; platform?: Platform; featured?: string; status?: EAStatus }) =>
    listDocuments<EA>(STITCH_CONFIG.collections.eas, params as Record<string, string>),

  update: (id: string, data: Partial<EA>) =>
    updateDocument<EA & Record<string, unknown>>(STITCH_CONFIG.collections.eas, id, data as Partial<EA & Record<string, unknown>>),

  delete: (id: string) =>
    deleteDocument(STITCH_CONFIG.collections.eas, id),

  listFeatured: () =>
    listDocuments<EA>(STITCH_CONFIG.collections.eas, { featured: 'true', status: 'active' }),
};

// ─── Orders ───

export const orderHelpers = {
  create: (data: Omit<Order, 'id'>) =>
    createDocument<Omit<Order, 'id'>>(STITCH_CONFIG.collections.orders, data),

  getById: (id: string) =>
    getDocument<Order>(STITCH_CONFIG.collections.orders, id),

  list: (params?: { userId?: string; status?: OrderStatus }) =>
    listDocuments<Order>(STITCH_CONFIG.collections.orders, params as Record<string, string>),

  update: (id: string, data: Partial<Order>) =>
    updateDocument<Order & Record<string, unknown>>(STITCH_CONFIG.collections.orders, id, data as Partial<Order & Record<string, unknown>>),

  getByUserId: (userId: string) =>
    listDocuments<Order>(STITCH_CONFIG.collections.orders, { userId }),
};

// ─── Users ───

export const userHelpers = {
  create: (data: Omit<User, 'id'>) =>
    createDocument<Omit<User, 'id'>>(STITCH_CONFIG.collections.users, data),

  getById: (id: string) =>
    getDocument<User>(STITCH_CONFIG.collections.users, id),

  getByEmail: async (email: string): Promise<User | null> => {
    const results = await listDocuments<User>(STITCH_CONFIG.collections.users, { email });
    return results.length > 0 ? results[0] : null;
  },

  list: (params?: { role?: UserRole }) =>
    listDocuments<User>(STITCH_CONFIG.collections.users, params as Record<string, string>),

  update: (id: string, data: Partial<User>) =>
    updateDocument<User & Record<string, unknown>>(STITCH_CONFIG.collections.users, id, data as Partial<User & Record<string, unknown>>),

  delete: (id: string) =>
    deleteDocument(STITCH_CONFIG.collections.users, id),
};

// ─── Custom Requests ───

export const customRequestHelpers = {
  create: (data: Omit<CustomRequest, 'id'>) =>
    createDocument<Omit<CustomRequest, 'id'>>(STITCH_CONFIG.collections.customRequests, data),

  getById: (id: string) =>
    getDocument<CustomRequest>(STITCH_CONFIG.collections.customRequests, id),

  list: (params?: { status?: CustomRequestStatus; email?: string }) =>
    listDocuments<CustomRequest>(STITCH_CONFIG.collections.customRequests, params as Record<string, string>),

  update: (id: string, data: Partial<CustomRequest>) =>
    updateDocument<CustomRequest & Record<string, unknown>>(STITCH_CONFIG.collections.customRequests, id, data as Partial<CustomRequest & Record<string, unknown>>),

  delete: (id: string) =>
    deleteDocument(STITCH_CONFIG.collections.customRequests, id),
};

// ─── Settings ───

export const settingsHelpers = {
  get: async (): Promise<SiteSettings | null> => {
    const results = await listDocuments<SiteSettings>(STITCH_CONFIG.collections.settings);
    return results.length > 0 ? results[0] : null;
  },

  update: (id: string, data: Partial<SiteSettings>) =>
    updateDocument<SiteSettings & Record<string, unknown>>(STITCH_CONFIG.collections.settings, id, data as Partial<SiteSettings & Record<string, unknown>>),

  upsert: async (data: SiteSettings): Promise<SiteSettings> => {
    const existing = await settingsHelpers.get();
    if (existing?.id) {
      return settingsHelpers.update(existing.id, data);
    }
    return createDocument<SiteSettings>(STITCH_CONFIG.collections.settings, data) as Promise<SiteSettings>;
  },
};

// ─── Reviews ───

export const reviewHelpers = {
  create: (data: Omit<Review, 'id'>) =>
    createDocument<Omit<Review, 'id'>>(STITCH_CONFIG.collections.reviews, data),

  getById: (id: string) =>
    getDocument<Review>(STITCH_CONFIG.collections.reviews, id),

  list: (params?: { eaId?: string; approved?: string; userId?: string }) =>
    listDocuments<Review>(STITCH_CONFIG.collections.reviews, params as Record<string, string>),

  update: (id: string, data: Partial<Review>) =>
    updateDocument<Review & Record<string, unknown>>(STITCH_CONFIG.collections.reviews, id, data as Partial<Review & Record<string, unknown>>),

  delete: (id: string) =>
    deleteDocument(STITCH_CONFIG.collections.reviews, id),
};

// ─── Wishlists ───

export const wishlistHelpers = {
  create: (data: Omit<WishlistItem, 'id'>) =>
    createDocument<Omit<WishlistItem, 'id'>>(STITCH_CONFIG.collections.wishlists, data),

  list: (params?: { userId?: string; eaId?: string }) =>
    listDocuments<WishlistItem>(STITCH_CONFIG.collections.wishlists, params as Record<string, string>),

  delete: (id: string) =>
    deleteDocument(STITCH_CONFIG.collections.wishlists, id),
};

// ─── Notifications ───

export const notificationHelpers = {
  create: (data: Omit<Notification, 'id'>) =>
    createDocument<Omit<Notification, 'id'>>(STITCH_CONFIG.collections.notifications, data),

  list: (params?: { userId?: string; read?: string }) =>
    listDocuments<Notification>(STITCH_CONFIG.collections.notifications, params as Record<string, string>),

  update: (id: string, data: Partial<Notification>) =>
    updateDocument<Notification & Record<string, unknown>>(STITCH_CONFIG.collections.notifications, id, data as Partial<Notification & Record<string, unknown>>),

  delete: (id: string) =>
    deleteDocument(STITCH_CONFIG.collections.notifications, id),
};

// ─── Subscribers ───

export const subscriberHelpers = {
  create: (data: Omit<Subscriber, 'id'>) =>
    createDocument<Omit<Subscriber, 'id'>>(STITCH_CONFIG.collections.subscribers, data),

  list: (params?: { email?: string }) =>
    listDocuments<Subscriber>(STITCH_CONFIG.collections.subscribers, params as Record<string, string>),
};

// ─── Download Logs ───

export const downloadLogHelpers = {
  create: (data: Omit<DownloadLog, 'id'>) =>
    createDocument<Omit<DownloadLog, 'id'>>(STITCH_CONFIG.collections.downloadLogs, data),

  list: (params?: { userId?: string; eaId?: string }) =>
    listDocuments<DownloadLog>(STITCH_CONFIG.collections.downloadLogs, params as Record<string, string>),
};

// ─── Activity Logs ───

export const activityLogHelpers = {
  create: (data: Omit<ActivityLog, 'id'>) =>
    createDocument<Omit<ActivityLog, 'id'>>(STITCH_CONFIG.collections.activityLogs, data),

  list: (params?: { type?: string; userId?: string }) =>
    listDocuments<ActivityLog>(STITCH_CONFIG.collections.activityLogs, params as Record<string, string>),
};

// ─── Leads ───

export const leadHelpers = {
  create: (data: Omit<Lead, 'id'>) =>
    createDocument<Omit<Lead, 'id'>>(STITCH_CONFIG.collections.leads, data),

  getById: (id: string) =>
    getDocument<Lead>(STITCH_CONFIG.collections.leads, id),

  list: (params?: { eaId?: string; status?: LeadStatus }) =>
    listDocuments<Lead>(STITCH_CONFIG.collections.leads, params as Record<string, string>),

  update: (id: string, data: Partial<Lead>) =>
    updateDocument<Lead & Record<string, unknown>>(STITCH_CONFIG.collections.leads, id, data as Partial<Lead & Record<string, unknown>>),

  delete: (id: string) =>
    deleteDocument(STITCH_CONFIG.collections.leads, id),
};

// ─── Visitor Analytics ───

export const visitorAnalyticsHelpers = {
  create: (data: Omit<VisitorAnalytics, 'id'>) =>
    createDocument<Omit<VisitorAnalytics, 'id'>>(STITCH_CONFIG.collections.visitorAnalytics, data),

  getById: (id: string) =>
    getDocument<VisitorAnalytics>(STITCH_CONFIG.collections.visitorAnalytics, id),

  list: (params?: Record<string, string>) =>
    listDocuments<VisitorAnalytics>(STITCH_CONFIG.collections.visitorAnalytics, params),

  update: (id: string, data: Partial<VisitorAnalytics>) =>
    updateDocument<VisitorAnalytics & Record<string, unknown>>(STITCH_CONFIG.collections.visitorAnalytics, id, data as Partial<VisitorAnalytics & Record<string, unknown>>),
};

// ─── WhatsApp Click Tracking ───

export const whatsappClickHelpers = {
  create: (data: Omit<WhatsAppClick, 'id'>) =>
    createDocument<Omit<WhatsAppClick, 'id'>>(STITCH_CONFIG.collections.whatsappClicks, data),

  list: (params?: Record<string, string>) =>
    listDocuments<WhatsAppClick>(STITCH_CONFIG.collections.whatsappClicks, params),
};
