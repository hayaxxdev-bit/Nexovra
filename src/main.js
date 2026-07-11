// @main.js

import "@css/main.css";
import "@css/themes.css";

// Import Chart.js dan assign ke global window
import Chart from "chart.js/auto";
window.Chart = Chart;

import { Router } from "@core/router.js";
import { SchedulerService } from '@services/scheduler.services.js'
import { Store } from "@core/store.js";
import { EventBus } from "@core/events.js";
import { supabase } from "@services/supabase.js";
import { GlobalErrorHandler } from "@core/globalErrorHandler.js";

// ============================================================
// Constants
// ============================================================
const ROUTES = {
  auth: {
    login: { path: "/login", component: () => import("@pages/auth/login.js"), public: true },
    register: { path: "/register", component: () => import("@pages/auth/register.js"), public: true },
    callback: { path: "/auth/callback", component: () => import("@pages/auth/callback.js"), public: true },
  },
  main: {
    dashboard: { path: "/", component: () => import("@pages/dashboard/dashboard.js"), protected: true },
    accounts: { path: "/accounts", component: () => import("@pages/accounts/accounts.js"), protected: true },
    accountDetail: { path: "/accounts/:id", component: () => import("@pages/accounts/account-detail.js"), protected: true },
    transactions: { path: "/transactions", component: () => import("@pages/transactions/transactions.js"), protected: true },
    transactionNew: { path: "/transactions/new", component: () => import("@pages/transactions/transaction-form.js"), protected: true },
    transactionEdit: { path: "/transactions/:id/edit", component: () => import("@pages/transactions/transaction-form.js"), protected: true },
    transfer: { path: "/transfer", component: () => import("@pages/transactions/transfer.js"), protected: true },
    cashbook: { path: "/cashbook", component: () => import("@pages/cashbook/cashbook.js"), protected: true },
    reports: { path: "/reports", component: () => import("@pages/reports/reports.js"), protected: true },
    planner: { path: "/planner", component: () => import("@pages/planner/planner.js"), protected: true },
    settings: { path: "/settings", component: () => import("@pages/settings/settings.js"), protected: true },
  },
  errors: {
    notFound: { path: "/404", component: () => import("@pages/errors/404.js"), public: true },
    error: { path: "/error/:code", component: () => import("@pages/errors/error.js"), public: true },
    maintenance: { path: "/maintenance", component: () => import("@pages/errors/maintenance.js"), public: true },
  },
};

const STORAGE_KEYS = {
  THEME: "theme",
  OFFLINE_DATA: "offlineData",
};

const DB_CONFIG = {
  NAME: "nexovra",
  VERSION: 1,
  STORE_NAME: "offlineData",
};

// ============================================================
// Theme Manager
// ============================================================
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (prefersDark ? "dark" : "dark");

    this.applyTheme(theme);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
        this.applyTheme(e.matches ? "dark" : "light");
      }
    });

    console.log("✅ Theme initialized:", this.getCurrent());
  },

  applyTheme(theme) {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(theme);
    html.setAttribute("data-theme", theme);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "dark" ? "#0a0a0f" : "#ffffff");
    }
  },

  toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";

    this.applyTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    window.__app?.events?.emit("theme:changed", { theme: newTheme });

    return newTheme;
  },

  getCurrent() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  },
};

// ============================================================
// Network Handler
// ============================================================
const NetworkHandler = {
  init() {
    window.addEventListener("offline", () => {
      this.showOfflineBanner();
      window.__app?.events?.emit("network:offline");
    });

    window.addEventListener("online", () => {
      this.hideOfflineBanner();
      window.__app?.events?.emit("network:online");
    });
  },

  showOfflineBanner() {
    this.hideOfflineBanner();

    const banner = document.createElement("div");
    banner.id = "offline-banner";
    banner.className = "fixed top-0 left-0 right-0 bg-warning-500 text-white text-center py-2 text-sm font-medium z-50 animate-slide-down";
    banner.textContent = "📡 Anda sedang offline. Beberapa fitur mungkin tidak tersedia.";
    document.body.prepend(banner);
  },

  hideOfflineBanner() {
    const banner = document.getElementById("offline-banner");
    if (banner) {
      banner.classList.add("animate-slide-up");
      setTimeout(() => banner.remove(), 300);
    }
  },
};

// ============================================================
// Keyboard Handler
// ============================================================
const KeyboardHandler = {
  init() {
    document.addEventListener("keydown", (e) => {
      switch (true) {
        case e.key === "Escape":
          window.__app?.events?.emit("ui:closeAll");
          break;

        case e.ctrlKey && e.key === "/":
          e.preventDefault();
          window.__app?.events?.emit("ui:toggleShortcuts");
          break;

        case e.altKey && e.key >= "1" && e.key <= "9":
          e.preventDefault();
          this.navigateByShortcut(parseInt(e.key));
          break;
      }
    });
  },

  navigateByShortcut(index) {
    const routes = ["/", "/accounts", "/transactions", "/cashbook", "/reports"];
    const path = routes[index - 1];
    if (path) {
      window.__app?.router?.navigate(path);
    }
  },
};

// ============================================================
// Notification System
// ============================================================
const NotificationSystem = {
  show(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
};

// ============================================================
// Offline Store (IndexedDB)
// ============================================================
const OfflineStore = {
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DB_CONFIG.STORE_NAME)) {
          db.createObjectStore(DB_CONFIG.STORE_NAME);
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  },

  async saveData(key, data) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(DB_CONFIG.STORE_NAME, "readwrite");
      const store = tx.objectStore(DB_CONFIG.STORE_NAME);
      await store.put(data, key);
      return tx.complete;
    } catch (error) {
      console.error("Failed to save offline data:", error);
      throw error;
    }
  },

  async getData(key) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(DB_CONFIG.STORE_NAME, "readonly");
      const store = tx.objectStore(DB_CONFIG.STORE_NAME);
      return await store.get(key);
    } catch (error) {
      console.error("Failed to get offline data:", error);
      throw error;
    }
  },
};

// ============================================================
// Performance Monitor
// ============================================================
const PerformanceMonitor = {
  init() {
    if (!window.performance) return;

    const perfData = performance.getEntriesByType("navigation")[0];
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      console.log("⏱️ Waktu muat halaman:", loadTime, "ms");
    }

    this.reportWebVitals();
  },

  reportWebVitals() {
    // Core Web Vitals: LCP, FID, CLS
    // Implementation can be added with web-vitals library
  },
};

// ============================================================
// Error Tracker
// ============================================================
const ErrorTracker = {
  log(error, context = {}) {
    const errorData = {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    console.error("📊 Error tracked:", errorData);

    // Send to monitoring service (Sentry, LogRocket, etc.)
    // this.sendToService(errorData);
  },
};

// ============================================================
// Utility Functions
// ============================================================
const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`⚠️ Percobaan ${i + 1} gagal, mencoba lagi...`);
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

const validateEnv = () => {
  const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(`❌ Environment variabel hilang: ${missing.join(", ")}`);
  }
};

const setupCSP = () => {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https: http:;
    connect-src 'self' ${import.meta.env.VITE_SUPABASE_URL} https://*.supabase.co wss://*.supabase.co;
    worker-src 'self' blob:;
  `;
  document.head.appendChild(meta);
};

const setupServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ SW registered:", reg))
      .catch((err) => console.error("❌ SW registration failed:", err));
  }
};

// ============================================================
// Global App State
// ============================================================
window.__app = {
  store: new Store(),
  events: new EventBus(),
  router: null,
  supabase,
  theme: ThemeManager,
};

// ============================================================
// Scheduler Integration - FIXED
// ============================================================

// Function to start scheduler
const startScheduler = () => {
  console.log('⏰ Starting scheduler...');
  try {
    SchedulerService.start();
    console.log('✅ Scheduler started successfully');
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
  }
};

// Function to stop scheduler
const stopScheduler = () => {
  console.log('⏰ Stopping scheduler...');
  try {
    SchedulerService.stop();
    console.log('✅ Scheduler stopped successfully');
  } catch (error) {
    console.error('❌ Failed to stop scheduler:', error);
  }
};

// ============================================================
// Event Handlers Setup - FIXED
// ============================================================
const setupGlobalErrorHandlers = () => {
  window.addEventListener("error", (event) => {
    if (event.target !== window) return;

    console.error("Global error:", event.error);
    window.__app?.events?.emit("app:error", {
      type: "global",
      error: event.error,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    window.__app?.events?.emit("app:error", {
      type: "promise",
      error: event.reason,
    });

    event.preventDefault();
  });
};

const setupAppEventListeners = () => {
  // Auth state changes from Supabase
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', event, session?.user?.email);
    
    switch (event) {
      case "SIGNED_IN":
        if (session) {
          window.__app.store.setState("auth.user", session.user);
          window.__app.store.setState("auth.session", session);
          
          // Emit event for login
          window.__app.events.emit("auth:loggedIn", { 
            user: session.user, 
            session: session 
          });
          window.__app.events.emit("auth:signedIn", session.user);
        }
        break;

      case "SIGNED_OUT":
        window.__app.store.setState("auth.user", null);
        window.__app.store.setState("auth.session", null);
        
        // Emit event for logout
        window.__app.events.emit("auth:loggedOut");
        window.__app.events.emit("auth:signedOut");
        break;

      case "TOKEN_REFRESHED":
        if (session) {
          window.__app.store.setState("auth.session", session);
        }
        break;

      case "USER_UPDATED":
        if (session) {
          window.__app.store.setState("auth.user", session.user);
        }
        break;
    }
  });

  // ============================================================
  // Scheduler Event Listeners - FIXED
  // ============================================================
  
  // Start scheduler when user logs in
  window.__app.events.on("auth:loggedIn", (data) => {
    console.log('👤 User logged in, starting scheduler...', data?.user?.email);
    startScheduler();
  });

  // Stop scheduler when user logs out
  window.__app.events.on("auth:loggedOut", () => {
    console.log('👤 User logged out, stopping scheduler...');
    stopScheduler();
  });

  // ============================================================
  // Other Event Listeners
  // ============================================================

  // Route not found
  window.__app.events.on("route:notfound", (data) => {
    console.warn(`404 - Route not found: ${data.path}`);
    ErrorTracker.log(new Error(`Route not found: ${data.path}`), { type: "routing" });
  });

  // App errors
  window.__app.events.on("app:error", (errorData) => {
    console.error("App Error:", errorData);
    ErrorTracker.log(errorData.error, errorData);

    if (errorData.type === "critical" && window.__app.router) {
      window.__app.router._renderErrorPage("error", {
        code: "500",
        title: "Critical Error",
        message: errorData.error?.message || "Terjadi kesalahan kritis",
        showRetry: true,
      });
    }
  });

  // Auth errors
  window.__app.events.on("auth:error", (errorData) => {
    console.warn("Auth Error:", errorData);
    window.__app.store.setState("auth.user", null);
    window.__app.store.setState("auth.session", null);
  });

  // Network status
  window.__app.events.on("network:offline", () => {
    console.warn("App is offline");
    NotificationSystem.show("Koneksi terputus. Mode offline diaktifkan.", "warning", 5000);
  });

  window.__app.events.on("network:online", () => {
    console.log("App is back online");
    NotificationSystem.show("Koneksi pulih. Menyegarkan data...", "success", 3000);
    window.__app.router?.reload().catch(console.error);
  });
};

// ============================================================
// Route Configuration
// ============================================================
const configureRoutes = (router) => {
  // Auth routes
  Object.values(ROUTES.auth).forEach((route) => {
    router.addRoute(route.path, route.component, { public: true });
  });

  // Main routes
  Object.values(ROUTES.main).forEach((route) => {
    router.addRoute(route.path, route.component, { protected: route.protected });
  });

  // Error routes
  Object.values(ROUTES.errors).forEach((route) => {
    router.addRoute(route.path, route.component, { public: true });
  });

  // Set fallback to 404
  router.setFallback("/404");
};

// ============================================================
// Expose to Window for Debugging
// ============================================================
window.__nexovra = {
  debug: {
    auth: async () => {
      const { data } = await supabase.auth.getSession();
      console.log('🔐 Auth Debug:', data);
      return data;
    },
    store: () => window.__app?.store?.getState(),
    events: () => window.__app?.events,
  },
  scheduler: {
    start: startScheduler,
    stop: stopScheduler,
    triggerMonthlyReport: () => SchedulerService.triggerMonthlyReportNow(),
    triggerApkUpdate: () => SchedulerService.triggerApkUpdateCheckNow(),
    status: () => console.log('Scheduler running:', SchedulerService._isRunning),
  },
  theme: {
    toggle: () => ThemeManager.toggle(),
    get: () => ThemeManager.getCurrent(),
  },
  supabase,
};

console.log('🛠️ Debug tools available: window.__nexovra');

// ============================================================
// Bootstrap Application
// ============================================================
async function bootstrap() {
  console.log('🚀 Bootstrapping Nexovra...');

  // Validate environment
  try {
    validateEnv();
  } catch (error) {
    console.error(error.message);
    renderFatalError("Konfigurasi Tidak Lengkap", error.message);
    return;
  }

  // Setup CSP
  setupCSP();

  // Initialize core modules
  ThemeManager.init();
  GlobalErrorHandler.init();
  NetworkHandler.init();
  KeyboardHandler.init();
  PerformanceMonitor.init();
  setupGlobalErrorHandlers();
  setupServiceWorker();

  // Get app container
  const app = document.getElementById("app");
  if (!app) {
    console.error("❌ App container not found");
    return;
  }

  // Initialize router
  const router = new Router(app);
  window.__app.router = router;

  // Configure routes
  configureRoutes(router);

  // Setup event listeners (includes scheduler listeners)
  setupAppEventListeners();

  // Check existing session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('👤 Existing session found for:', session.user.email);
      window.__app.store.setState("auth.user", session.user);
      window.__app.store.setState("auth.session", session);
      
      // Trigger login event for existing session
      window.__app.events.emit("auth:loggedIn", { 
        user: session.user, 
        session: session 
      });
    } else {
      console.log('👤 No existing session found');
    }
  } catch (error) {
    console.error("Session check failed:", error);
  }

  // Initialize router
  try {
    await router.init();
    console.log("🚀 Nexovra ready!");
    console.log("📋 Registered routes:", [...router._routes.keys()]);
  } catch (error) {
    console.error("Failed to initialize router:", error);
    renderFatalError("Gagal Memulai Aplikasi", error.message);
  }
}

// ============================================================
// Error Rendering
// ============================================================
function renderFatalError(title, message) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-[#0a0a0f] p-4">
      <div class="text-center max-w-md">
        <div class="text-7xl mb-6">💥</div>
        <h2 class="text-2xl font-bold text-gradient mb-3">${title}</h2>
        <p class="text-surface-600 dark:text-surface-400 mb-6">${message}</p>
        <button onclick="window.location.reload()" class="btn-primary">
          🔄 Muat Ulang Aplikasi
        </button>
      </div>
    </div>
  `;
}

// ============================================================
// Start Application
// ============================================================
bootstrap().catch((error) => {
  console.error("Bootstrap failed:", error);
  renderFatalError("Aplikasi Gagal Dimuat", error.message);
});