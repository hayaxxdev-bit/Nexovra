import "@css/main.css";
import "@css/themes.css";

// Import Chart.js dan assign ke global window
import Chart from "chart.js/auto";
window.Chart = Chart;

import { Router } from "@core/router.js";
import { Store } from "@core/store.js";
import { EventBus } from "@core/events.js";
import { supabase } from "@services/supabase.js";
import { GlobalErrorHandler } from "@core/globalErrorHandler.js";

// ============================================================
// Theme Manager
// ============================================================
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
      this.applyTheme(savedTheme);
    } else if (prefersDark) {
      this.applyTheme("dark");
    } else {
      this.applyTheme("dark");
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });

    console.log("✅ Theme initialized:", this.getCurrent());
  },

  applyTheme(theme) {
    const html = document.documentElement;
    html.classList.remove("dark", "light");

    if (theme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else {
      html.classList.add("light");
      html.setAttribute("data-theme", "light");
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0a0a0f" : "#ffffff",
      );
    }
  },

  toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";

    this.applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    window.__app?.events?.emit("theme:changed", { theme: newTheme });

    return newTheme;
  },

  getCurrent() {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  },
};

// ============================================================
// Global instances
// ============================================================
window.__app = {
  store: new Store(),
  events: new EventBus(),
  router: null,
  supabase,
  theme: ThemeManager,
};

// ============================================================
// Initialize Theme
// ============================================================
ThemeManager.init();

// ============================================================
// Initialize Global Error Handler
// ============================================================
GlobalErrorHandler.init();

// ============================================================
// Network Status Handler
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
    
    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-warning-500 text-white text-center py-2 text-sm font-medium z-50 animate-slide-down';
    banner.innerHTML = '📡 Anda sedang offline. Beberapa fitur mungkin tidak tersedia.';
    document.body.prepend(banner);
  },

  hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.classList.add('animate-slide-up');
      setTimeout(() => banner.remove(), 300);
    }
  }
};

NetworkHandler.init();

// ============================================================
// Global Error Handlers
// ============================================================
window.addEventListener('error', (event) => {
  if (event.target !== window) return;
  
  console.error('Global error:', event.error);
  window.__app?.events?.emit('app:error', {
    type: 'global',
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  window.__app?.events?.emit('app:error', {
    type: 'promise',
    error: event.reason
  });
  
  event.preventDefault();
});

// ============================================================
// Initialize app
// ============================================================
async function bootstrap() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("❌ App container not found");
    return;
  }

  // Initialize router
  const router = new Router(app);
  window.__app.router = router;

  // ✅ DEFINE ROUTES - Pastikan 404 terdaftar
  router
    // Auth routes (public)
    .addRoute("/login", () => import("@pages/auth/login.js"), { public: true })
    .addRoute("/register", () => import("@pages/auth/register.js"), { public: true })
    
    // Main routes (protected)
    .addRoute("/", () => import("@pages/dashboard/dashboard.js"), { protected: true })
    .addRoute("/accounts", () => import("@pages/accounts/accounts.js"), { protected: true })
    .addRoute("/accounts/:id", () => import("@pages/accounts/account-detail.js"), { protected: true })
    .addRoute("/transactions", () => import("@pages/transactions/transactions.js"), { protected: true })
    .addRoute("/transactions/new", () => import("@pages/transactions/transaction-form.js"), { protected: true })
    .addRoute("/transactions/:id/edit", () => import("@pages/transactions/transaction-form.js"), { protected: true })
    .addRoute("/transfer", () => import("@pages/transactions/transfer.js"), { protected: true })
    .addRoute("/cashbook", () => import("@pages/cashbook/cashbook.js"), { protected: true })
    .addRoute("/reports", () => import("@pages/reports/reports.js"), { protected: true })
    .addRoute("/planner", () => import("@pages/planner/planner.js"), { protected: true })
    .addRoute("/settings", () => import("@pages/settings/settings.js"), { protected: true })
    
    // ✅ Error routes (public) - WAJIB terdaftar untuk 404 handling
    .addRoute("/404", () => import("@pages/errors/404.js"), { public: true })
    .addRoute("/error/:code", () => import("@pages/errors/error.js"), { public: true })
    .addRoute("/maintenance", () => import("@pages/errors/maintenance.js"), { public: true })
    
    // ✅ FALLBACK: Set ke /404 agar URL ngawur tidak kembali ke home
    .setFallback("/404");

  // Check session before routing
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      window.__app.store.setState("auth.user", session.user);
      window.__app.store.setState("auth.session", session);
    }
  } catch (error) {
    console.error("Session check failed:", error);
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      window.__app.store.setState("auth.user", session.user);
      window.__app.store.setState("auth.session", session);
      window.__app.events.emit("auth:signedIn", session.user);
    } else if (event === "SIGNED_OUT") {
      window.__app.store.setState("auth.user", null);
      window.__app.store.setState("auth.session", null);
      window.__app.events.emit("auth:signedOut");
    } else if (event === "TOKEN_REFRESHED") {
      window.__app.store.setState("auth.session", session);
    } else if (event === "USER_UPDATED" && session) {
      window.__app.store.setState("auth.user", session.user);
    }
  });

  // ✅ Listen for route not found events
  window.__app.events.on("route:notfound", (data) => {
    console.warn(`404 - Route not found: ${data.path}`);
    // Bisa tambahkan logging atau analytics di sini
  });

  // Listen for app errors
  window.__app.events.on("app:error", (errorData) => {
    console.error("App Error:", errorData);
    
    if (errorData.type === 'critical') {
      router._renderErrorPage('error', {
        code: '500',
        title: 'Critical Error',
        message: errorData.error?.message || 'Terjadi kesalahan kritis',
        showRetry: true
      });
    }
  });

  // Listen for auth errors
  window.__app.events.on("auth:error", (errorData) => {
    console.warn("Auth Error:", errorData);
    window.__app.store.setState("auth.user", null);
    window.__app.store.setState("auth.session", null);
  });

  // ✅ Listen for network status changes
  window.__app.events.on("network:offline", () => {
    console.warn("App is offline");
  });

  window.__app.events.on("network:online", () => {
    console.log("App is back online");
    // Auto-reload current route when back online
    router.reload().catch(console.error);
  });

  // Initialize router
  try {
    await router.init();
    console.log("🚀 Nexovra ready!");
    console.log("📋 Registered routes:", [...router._routes.keys()]);
  } catch (error) {
    console.error("Failed to initialize router:", error);
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-[#0a0a0f] p-4">
        <div class="text-center">
          <div class="text-7xl mb-6">💥</div>
          <h2 class="text-2xl font-bold text-gradient mb-3">Gagal Memulai Aplikasi</h2>
          <p class="text-surface-600 dark:text-surface-400 mb-4">${error.message}</p>
          <button onclick="window.location.reload()" class="btn-primary">
            🔄 Muat Ulang
          </button>
        </div>
      </div>
    `;
  }
}

// Start app
bootstrap().catch(error => {
  console.error("Bootstrap failed:", error);
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-[#0a0a0f] p-4">
        <div class="text-center">
          <div class="text-7xl mb-6">💥</div>
          <h2 class="text-2xl font-bold text-gradient mb-3">Aplikasi Gagal Dimuat</h2>
          <p class="text-surface-600 dark:text-surface-400 mb-4">${error.message}</p>
          <button onclick="window.location.reload()" class="btn-primary">
            🔄 Muat Ulang Aplikasi
          </button>
        </div>
      </div>
    `;
  }
});