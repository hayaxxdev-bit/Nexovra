import { Modal } from '@components/ui/modal.js'

/**
 * Confirm Dialog - Wrapper around Modal.confirm
 * Usage:
 *   const confirmed = await ConfirmDialog.delete('transaksi ini')
 *   if (confirmed) { ... }
 */
export const ConfirmDialog = {
  /**
   * Delete confirmation
   * @param {string} itemName
   * @returns {Promise<boolean>}
   */
  async delete(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Hapus Data',
      message: `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      variant: 'danger',
    })
  },

  /**
   * Archive confirmation
   * @param {string} itemName
   * @returns {Promise<boolean>}
   */
  async archive(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Arsipkan Data',
      message: `Apakah Anda yakin ingin mengarsipkan ${itemName}?`,
      confirmText: 'Ya, Arsipkan',
      variant: 'warning',
    })
  },

  /**
   * Logout confirmation
   * @returns {Promise<boolean>}
   */
  async logout() {
    return Modal.confirm({
      title: 'Keluar',
      message: 'Apakah Anda yakin ingin keluar dari akun Anda?',
      confirmText: 'Ya, Keluar',
      variant: 'info',
    })
  },

  /**
   * Custom confirmation
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  async custom(options = {}) {
    return Modal.confirm(options)
  },
}