const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

try {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

  // Initialize collections if they don't exist
  if (!db.reviews) db.reviews = [];
  if (!db.wishlists) db.wishlists = [];
  if (!db.notifications) db.notifications = [];
  if (!db.subscribers) db.subscribers = [];
  if (!db.contactMessages) db.contactMessages = [];

  // Update EAs with analytics counts and labels
  if (db.eas && Array.isArray(db.eas)) {
    const mockStats = [
      { viewsCount: 1420, downloadsCount: 380, wishlistCount: 65, recentlyUpdated: true, recentlyAdded: false },
      { viewsCount: 980, downloadsCount: 210, wishlistCount: 42, recentlyUpdated: false, recentlyAdded: true },
      { viewsCount: 1250, downloadsCount: 290, wishlistCount: 50, recentlyUpdated: true, recentlyAdded: false },
      { viewsCount: 860, downloadsCount: 180, wishlistCount: 30, recentlyUpdated: false, recentlyAdded: false },
      { viewsCount: 1100, downloadsCount: 240, wishlistCount: 48, recentlyUpdated: false, recentlyAdded: false },
      { viewsCount: 750, downloadsCount: 150, wishlistCount: 25, recentlyUpdated: false, recentlyAdded: false }
    ];

    db.eas = db.eas.map((ea, idx) => {
      const stats = mockStats[idx] || { viewsCount: 300, downloadsCount: 50, wishlistCount: 10, recentlyUpdated: false, recentlyAdded: false };
      return {
        ...ea,
        viewsCount: ea.viewsCount || stats.viewsCount,
        downloadsCount: ea.downloadsCount || stats.downloadsCount,
        wishlistCount: ea.wishlistCount || stats.wishlistCount,
        recentlyUpdated: ea.recentlyUpdated !== undefined ? ea.recentlyUpdated : stats.recentlyUpdated,
        recentlyAdded: ea.recentlyAdded !== undefined ? ea.recentlyAdded : stats.recentlyAdded
      };
    });
  }

  // Pre-populate some approved mock reviews if empty
  if (db.reviews.length === 0 && db.eas && db.eas.length > 0) {
    const ea1Id = db.eas[0].id || 'ea-1';
    const ea2Id = db.eas[1].id || 'ea-2';
    
    db.reviews = [
      {
        id: 'rev-1',
        eaId: ea1Id,
        userId: 'user-100',
        userName: 'David K.',
        userCountry: 'US',
        rating: 5,
        comment: 'Gold Scalper Pro has been absolutely solid on my live account. Drawdown was kept very low during the recent news events. Setup was extremely straightforward with the manual provided.',
        createdAt: '2026-05-15T08:30:00Z',
        approved: true,
        verifiedPurchase: true
      },
      {
        id: 'rev-2',
        eaId: ea1Id,
        userId: 'user-101',
        userName: 'Sven M.',
        userCountry: 'DE',
        rating: 4,
        comment: 'Very good performance on XAUUSD. Backtests align almost perfectly with my forward tests on IC Markets raw spread account. Highly recommend setting it up on a low-latency VPS.',
        createdAt: '2026-05-20T14:15:00Z',
        approved: true,
        verifiedPurchase: true
      },
      {
        id: 'rev-3',
        eaId: ea1Id,
        userId: 'user-102',
        userName: 'Ahmad Z.',
        userCountry: 'MY',
        rating: 5,
        comment: 'Outstanding customer service and the EA itself works exactly as advertised. Already up 6% in my first month with minimal risk settings.',
        createdAt: '2026-05-28T10:00:00Z',
        approved: true,
        verifiedPurchase: true
      },
      {
        id: 'rev-4',
        eaId: ea2Id,
        userId: 'user-103',
        userName: 'Liam O.',
        userCountry: 'ZA',
        rating: 5,
        comment: 'TrendMaster AI has a great strategy. It does not trade constantly but when it enters, the accuracy is impressive. Very clean code.',
        createdAt: '2026-05-29T16:45:00Z',
        approved: true,
        verifiedPurchase: true
      }
    ];
  }

  // Pre-populate some notifications if empty
  if (db.notifications.length === 0) {
    db.notifications = [
      {
        id: 'notif-1',
        userId: 'user-1', // Assuming there's a default user with id 'user-1'
        title: 'Welcome to EAVault!',
        message: 'Thank you for creating your account. Browse our catalog of Expert Advisors to begin automated trading.',
        type: 'order_completed',
        read: false,
        createdAt: '2026-06-01T12:00:00Z'
      }
    ];
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Database updated successfully!');
} catch (err) {
  console.error('Error updating database:', err);
}
