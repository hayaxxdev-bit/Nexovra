import { Modal } from '@components/ui/modal.js'

/**
 * Confirm Dialog - Wrapper around Modal.confirm
 * Nexovra Next-Gen Finance
 * 
 * Usage:
 *   const confirmed = await ConfirmDialog.delete('transaksi ini')
 *   if (confirmed) { ... }
 */
export const ConfirmDialog = {
  /**
   * Delete confirmation
   * @param {string} itemName - Nama item yang akan dihapus
   * @returns {Promise<boolean>}
   */
  async delete(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Hapus Data',
      message: `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    })
  },

  /**
   * Archive confirmation
   * @param {string} itemName - Nama item yang akan diarsipkan
   * @returns {Promise<boolean>}
   */
  async archive(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Arsipkan Data',
      message: `Apakah Anda yakin ingin mengarsipkan ${itemName}? Data yang diarsipkan masih dapat diakses nanti.`,
      confirmText: 'Ya, Arsipkan',
      cancelText: 'Batal',
      variant: 'warning',
    })
  },

  /**
   * Logout confirmation
   * @returns {Promise<boolean>}
   */
  async logout() {
    return Modal.confirm({
      title: 'Keluar dari Akun',
      message: 'Apakah Anda yakin ingin keluar dari akun Anda? Anda perlu masuk kembali untuk mengakses dashboard.',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      variant: 'info',
    })
  },

  /**
   * Discard changes confirmation
   * @returns {Promise<boolean>}
   */
  async discard() {
    return Modal.confirm({
      title: 'Batalkan Perubahan',
      message: 'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkannya?',
      confirmText: 'Ya, Batalkan',
      cancelText: 'Lanjutkan Edit',
      variant: 'warning',
    })
  },

  /**
   * Reset confirmation
   * @param {string} itemName - Nama item yang akan direset
   * @returns {Promise<boolean>}
   */
  async reset(itemName = 'pengaturan') {
    return Modal.confirm({
      title: 'Reset Data',
      message: `Apakah Anda yakin ingin mereset ${itemName} ke pengaturan awal? Semua perubahan akan hilang.`,
      confirmText: 'Ya, Reset',
      cancelText: 'Batal',
      variant: 'warning',
    })
  },

  /**
   * Deactivate confirmation
   * @param {string} itemName - Nama item yang akan dinonaktifkan
   * @returns {Promise<boolean>}
   */
  async deactivate(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Nonaktifkan',
      message: `Apakah Anda yakin ingin menonaktifkan ${itemName}? Item ini tidak akan muncul di daftar aktif.`,
      confirmText: 'Ya, Nonaktifkan',
      cancelText: 'Batal',
      variant: 'warning',
    })
  },

  /**
   * Force delete confirmation (for cascading deletes)
   * @param {string} itemName - Nama item yang akan dihapus
   * @param {string} consequences - Konsekuensi tambahan
   * @returns {Promise<boolean>}
   */
  async forceDelete(itemName = 'item ini', consequences = '') {
    const consequenceText = consequences 
      ? `\n\n${consequences}` 
      : '\n\nSemua data terkait juga akan dihapus secara permanen.'
    
    return Modal.confirm({
      title: 'Hapus Permanen',
      message: `Apakah Anda yakin ingin menghapus permanen ${itemName}? Tindakan ini TIDAK DAPAT dibatalkan.${consequenceText}`,
      confirmText: 'Hapus Permanen',
      cancelText: 'Batal',
      variant: 'danger',
    })
  },

  /**
   * Publish confirmation
   * @param {string} itemName - Nama item yang akan dipublikasi
   * @returns {Promise<boolean>}
   */
  async publish(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Publikasikan',
      message: `Apakah Anda yakin ingin mempublikasikan ${itemName}? Item ini akan terlihat oleh semua pengguna.`,
      confirmText: 'Ya, Publikasikan',
      cancelText: 'Batal',
      variant: 'info',
    })
  },

  /**
   * Duplicate confirmation
   * @param {string} itemName - Nama item yang akan diduplikasi
   * @returns {Promise<boolean>}
   */
  async duplicate(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Duplikasi Data',
      message: `Apakah Anda yakin ingin menduplikasi ${itemName}? Salinan baru akan dibuat dengan data yang sama.`,
      confirmText: 'Ya, Duplikasi',
      cancelText: 'Batal',
      variant: 'info',
    })
  },

  /**
   * Send confirmation
   * @param {string} itemName - Nama item yang akan dikirim
   * @returns {Promise<boolean>}
   */
  async send(itemName = 'item ini') {
    return Modal.confirm({
      title: 'Kirim Data',
      message: `Apakah Anda yakin ingin mengirim ${itemName}? Pastikan data sudah benar sebelum dikirim.`,
      confirmText: 'Ya, Kirim',
      cancelText: 'Periksa Kembali',
      variant: 'info',
    })
  },

  /**
   * Custom confirmation
   * @param {Object} options - Custom options untuk Modal.confirm
   * @param {string} options.title
   * @param {string} options.message
   * @param {string} options.confirmText
   * @param {string} options.cancelText
   * @param {string} options.variant - 'danger' | 'warning' | 'info'
   * @returns {Promise<boolean>}
   */
  async custom(options = {}) {
    const {
      title = 'Konfirmasi',
      message = 'Apakah Anda yakin?',
      confirmText = 'Ya',
      cancelText = 'Batal',
      variant = 'info',
    } = options

    return Modal.confirm({
      title,
      message,
      confirmText,
      cancelText,
      variant,
    })
  },
}