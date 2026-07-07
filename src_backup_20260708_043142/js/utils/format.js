// src/utils/format.js

/**
 * Format angka ke format mata uang Indonesia
 * @param {number} amount - Jumlah yang akan diformat
 * @param {Object} options - Opsi format
 * @returns {string}
 */
export function formatCurrency(amount, options = {}) {
  const {
    currency = 'IDR',
    locale = 'id-ID',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false
  } = options;

  // Handle invalid input
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }

  // Compact format untuk angka besar
  if (compact) {
    if (Math.abs(amount) >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
    } else if (Math.abs(amount) >= 1000) {
      return `Rp ${(amount / 1000).toFixed(1)}Rb`;
    }
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    }).format(amount);
  } catch (error) {
    console.error('Format currency error:', error);
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
}

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal
 * @param {Object} options - Opsi format
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const {
    locale = 'id-ID',
    format = 'full' // 'full', 'long', 'medium', 'short'
  } = options;

  if (!date) return '-';

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';

  const formatOptions = {
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  };

  try {
    return dateObj.toLocaleDateString(locale, formatOptions[format] || formatOptions.full);
  } catch (error) {
    console.error('Format date error:', error);
    return dateObj.toISOString().split('T')[0];
  }
}

/**
 * Format tanggal dengan waktu
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '-';

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';

  try {
    const dateStr = dateObj.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr}, ${timeStr}`;
  } catch (error) {
    return dateObj.toISOString();
  }
}

/**
 * Format angka ke persen
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format angka dengan separator ribuan
 * @param {number} number
 * @returns {string}
 */
export function formatNumber(number) {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(number);
}

/**
 * Parse string mata uang ke number
 * @param {string} currencyString
 * @returns {number}
 */
export function parseCurrency(currencyString) {
  if (!currencyString) return 0;
  
  // Hapus semua karakter kecuali angka, minus, dan titik
  const cleaned = currencyString.replace(/[^0-9\-\.]/g, '');
  const number = parseFloat(cleaned);
  
  return isNaN(number) ? 0 : number;
}

/**
 * Format akun (mask nama akun)
 * @param {string} accountNumber
 * @returns {string}
 */
export function formatAccountNumber(accountNumber) {
  if (!accountNumber) return '';
  
  // Tampilkan 4 digit terakhir
  const last4 = accountNumber.slice(-4);
  const masked = accountNumber.slice(0, -4).replace(/\d/g, '*');
  
  return masked + last4;
}

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format durasi (dalam menit)
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!minutes) return '0 menit';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes} menit`;
  if (remainingMinutes === 0) return `${hours} jam`;
  return `${hours} jam ${remainingMinutes} menit`;
}

/**
 * Format relative time (waktu relatif)
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  if (diffWeeks < 4) return `${diffWeeks} minggu yang lalu`;
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
  return `${diffYears} tahun yang lalu`;
}

// Export sebagai default juga untuk kompatibilitas
export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  formatNumber,
  parseCurrency,
  formatAccountNumber,
  formatFileSize,
  formatDuration,
  formatRelativeTime
};