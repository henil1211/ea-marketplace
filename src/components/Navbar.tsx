'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { NAV_LINKS } from '@/lib/constants';
import { buttonHover, buttonTap, navDrop, premiumEase } from '@/lib/motion';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const reduceMotion = useReducedMotion();
  
  // Wishlist and Notifications State
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 12);
      setHidden(currentY > 96 && currentY > lastY && !mobileOpen);
      lastY = currentY;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileOpen]);

  // Authenticate user & load settings
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }
    
    async function loadSettings() {
      try {
        const res = await fetch(`/api/stitch/settings?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data?.data || []);
          if (list && list.length > 0 && list[0].whatsapp) {
            setWhatsapp(list[0].whatsapp);
          }
        }
      } catch {}
    }

    checkAuth();
    loadSettings();
  }, []);

  const fetchWishlist = async (userId: string) => {
    try {
      const res = await fetch(`/api/stitch/wishlists?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setWishlistCount(data.length);
      }
    } catch (err) {
      console.error('Error fetching wishlist count:', err);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(`/api/stitch/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sorted);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setWishlistCount(0);
      setNotifications([]);
      return;
    }

    fetchWishlist(user.id);
    fetchNotifications(user.id);

    const handleWishlistUpdate = () => fetchWishlist(user.id);
    const handleNotificationsUpdate = () => fetchNotifications(user.id);

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    window.addEventListener('notifications-updated', handleNotificationsUpdate);

    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      window.removeEventListener('notifications-updated', handleNotificationsUpdate);
    };
  }, [user?.id]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setDropdownOpen(false);
      setMobileOpen(false);
      setWishlistCount(0);
      setNotifications([]);
      router.refresh();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const markAsRead = async (notifId: string) => {
    try {
      const res = await fetch(`/api/stitch/notifications/${notifId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) =>
          fetch(`/api/stitch/notifications/${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <motion.header
      className={`sticky top-0 z-50 glass-strong transition-all duration-300 ${
        scrolled ? 'border-b border-vault-gold/10 shadow-[0_10px_35px_rgba(0,0,0,0.22)]' : ''
      }`}
      variants={navDrop}
      initial={reduceMotion ? false : 'hidden'}
      animate={hidden && !reduceMotion ? { y: -88, opacity: 0.88 } : 'visible'}
      transition={{ duration: 0.35, ease: premiumEase }}
    >
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vault-gold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#0D0F14" stroke="#0D0F14" strokeWidth="1.5" />
              <path d="M12 6L6 9V15L12 18L18 15V9L12 6Z" fill="#0D0F14" stroke="#F0B90B" strokeWidth="1" />
            </svg>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-vault-text">
            EA <span className="text-vault-gold">VAULT</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
            <Link
              key={link.href}
              href={link.href}
              id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="relative font-body text-sm font-medium text-vault-text-secondary transition-colors hover:text-vault-gold"
            >
              {link.label}
              {active && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="absolute -bottom-2 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-vault-gold"
                  transition={{ duration: 0.35, ease: premiumEase }}
                />
              )}
            </Link>
          )})}
        </div>

        {/* Auth Buttons & Badges / Profile Dropdown */}
        <div className="hidden items-center gap-4 md:flex">
          {user && user.role === 'admin' ? (
            <>

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-vault-border bg-vault-surface-high text-vault-text-secondary hover:text-vault-gold hover:border-vault-gold transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-vault-profit text-[8px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-vault-border bg-vault-surface py-2 shadow-xl animate-scale-up z-50">
                    <div className="flex items-center justify-between border-b border-vault-border px-4 py-2.5 mb-1">
                      <span className="font-heading text-xs font-bold text-vault-text">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="font-body text-[10px] text-vault-gold hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-vault-border">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center font-body text-[10px] text-vault-text-muted">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.read && markAsRead(notif.id!)}
                            className={`px-4 py-2.5 transition-colors hover:bg-vault-surface-high cursor-pointer ${
                              !notif.read ? 'bg-vault-gold/5' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={`font-heading text-[10px] font-bold ${!notif.read ? 'text-vault-gold' : 'text-vault-text'}`}>
                                {notif.title}
                              </p>
                              <span className="font-body text-[8px] text-vault-text-muted shrink-0">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-0.5 font-body text-[9.5px] text-vault-text-secondary leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full bg-vault-surface-high border border-vault-border px-3 py-1.5 transition-all hover:border-vault-gold cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vault-gold/15 text-[10px] font-heading font-extrabold text-vault-gold border border-vault-gold/20">
                    {userInitials}
                  </div>
                  <span className="font-heading text-xs font-bold text-vault-text truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-vault-border bg-vault-surface py-2 shadow-xl animate-scale-up z-50">
                    <div className="border-b border-vault-border px-4 py-2 mb-1">
                      <p className="font-heading text-xs font-bold text-vault-text truncate">{user.name}</p>
                      <p className="font-body text-[10px] text-vault-text-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/account/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 font-heading text-xs font-semibold text-vault-text-secondary hover:bg-vault-surface-high hover:text-vault-gold transition-colors"
                    >
                      My Account Overview
                    </Link>
                    <Link
                      href="/account/my-eas"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 font-heading text-xs font-semibold text-vault-text-secondary hover:bg-vault-surface-high hover:text-vault-gold transition-colors"
                    >
                      My Expert Advisors
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 font-heading text-xs font-semibold text-vault-text-secondary hover:bg-vault-surface-high hover:text-vault-gold transition-colors"
                    >
                      Order History
                    </Link>
                    <Link
                      href="/account/requests"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 font-heading text-xs font-semibold text-vault-text-secondary hover:bg-vault-surface-high hover:text-vault-gold transition-colors"
                    >
                      Custom Requests
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 font-heading text-xs font-semibold text-vault-profit hover:bg-vault-surface-high transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left border-t border-vault-border mt-1 pt-2 block px-4 py-2 font-heading text-xs font-semibold text-vault-loss hover:bg-vault-surface-high transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a
                href={whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%2C%20I%20have%20an%20inquiry%20about%20your%20Expert%20Advisors.` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                id="nav-action-whatsapp"
                className="flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white px-4 py-2 font-heading text-sm font-bold shadow-lg shadow-[#25D366]/10 hover:opacity-95 transition-opacity"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.336 4.989L2 22l5.139-1.348a9.943 9.943 0 0 0 4.873 1.28c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.059 13.985c-.266.75-1.293 1.345-2.094 1.512-.544.113-1.25.203-3.633-.78-3.047-1.258-5.016-4.364-5.168-4.567-.152-.203-1.22-1.625-1.22-3.104 0-1.48.775-2.207 1.05-2.503.275-.296.6-.37.8-.37.2 0 .4 0 .575.008.188.008.437-.074.684.521.254.613.869 2.122.944 2.274.075.152.125.33.025.53-.1.2-.2.32-.395.547-.196.228-.412.51-.59.684-.197.195-.403.407-.174.797.228.39 1.016 1.672 2.176 2.705 1.496 1.334 2.754 1.748 3.146 1.944.39.195.617.162.846-.1.228-.262.974-1.132 1.236-1.518.262-.385.524-.32.883-.187.36.134 2.28 1.07 2.673 1.266.393.195.656.29.722.404.066.113.066.656-.2.14z" />
                </svg>
                Contact on WhatsApp
              </a>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-vault-border md:hidden"
          id="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-5 bg-vault-text transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 bg-vault-text transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 bg-vault-text transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -18, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(10px)' }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto border-t border-vault-border bg-vault-surface/95 px-6 py-6 md:hidden space-y-2 backdrop-blur-2xl"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 font-body text-sm text-vault-text-secondary transition-colors hover:text-vault-gold"
            >
              {link.label}
            </Link>
          ))}

          {user && user.role === 'admin' ? (
            <div className="border-t border-vault-border pt-3 mt-3 space-y-2.5">
              <div className="px-1 py-1 text-vault-text font-heading text-xs font-bold truncate">
                Logged in as: <span className="text-vault-gold">{user.name}</span>
              </div>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 font-heading text-sm text-vault-profit"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 font-heading text-sm text-vault-loss cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-vault-border mt-3">
              <a
                href={whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%2C%20I%20have%20an%20inquiry%20about%20your%20Expert%20Advisors.` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#25D366] py-2.5 text-center font-heading text-sm font-bold text-white shadow-lg shadow-[#25D366]/10"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.336 4.989L2 22l5.139-1.348a9.943 9.943 0 0 0 4.873 1.28c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.059 13.985c-.266.75-1.293 1.345-2.094 1.512-.544.113-1.25.203-3.633-.78-3.047-1.258-5.016-4.364-5.168-4.567-.152-.203-1.22-1.625-1.22-3.104 0-1.48.775-2.207 1.05-2.503.275-.296.6-.37.8-.37.2 0 .4 0 .575.008.188.008.437-.074.684.521.254.613.869 2.122.944 2.274.075.152.125.33.025.53-.1.2-.2.32-.395.547-.196.228-.412.51-.59.684-.197.195-.403.407-.174.797.228.39 1.016 1.672 2.176 2.705 1.496 1.334 2.754 1.748 3.146 1.944.39.195.617.162.846-.1.228-.262.974-1.132 1.236-1.518.262-.385.524-.32.883-.187.36.134 2.28 1.07 2.673 1.266.393.195.656.29.722.404.066.113.066.656-.2.14z" />
                </svg>
                Contact on WhatsApp
              </a>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.header>
  );
}
