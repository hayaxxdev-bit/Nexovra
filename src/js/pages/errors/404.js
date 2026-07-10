async _handleRoute(pathname) {
  // Cek maintenance mode
  if (this._isMaintenanceMode() && !pathname.startsWith('/maintenance')) {
    return this._renderErrorPage('maintenance')
  }

  // Find matching route
  let matchedRoute = null
  let matchedParams = {}

  for (const [path, route] of this._routes) {
    const match = pathname.match(route.pattern)
    if (match) {
      matchedRoute = route
      const paramNames = [...path.matchAll(/:(\w+)/g)].map(m => m[1])
      paramNames.forEach((name, i) => {
        matchedParams[name] = match[i + 1]
      })
      break
    }
  }

  // Handle 404 - No route found
  if (!matchedRoute) {
    console.warn(`⚠️ No route found for: ${pathname}`)
    
    // Emit route not found event
    window.__app?.events?.emit('route:notfound', { path: pathname })
    
    // Cek apakah ini halaman error yang valid
    if (pathname === '/404' || pathname === '/error/500' || pathname === '/maintenance') {
      const errorType = pathname === '/404' ? '404' : 
                       pathname === '/maintenance' ? 'maintenance' : 'error'
      return this._renderErrorPage(errorType)
    }
    
    // Redirect ke 404 atau fallback
    const target = this._fallback === '/404' ? '/404' : this._fallback
    
    // Hindari redirect loop
    if (pathname === target) {
      console.error('❌ Redirect loop detected, rendering fallback error')
      return this._renderErrorPage('404')
    }
    
    // Gunakan replace untuk mencegah build-up history
    return this.navigate(target, true)
  }

  // ... (rest of the method remains the same)
}