import api from './api.js';

/**
 * Service untuk mengelola operasi booking pada panel operator
 * Menyediakan fungsi-fungsi untuk berinteraksi dengan API booking
 */
export const operatorBookingsService = {
  /**
   * Mendapatkan daftar booking dengan filter
   * @param {Object} params - Parameter filter (booking_code, user_name, route_id, status, dll)
   * @returns {Promise} - Promise hasil request
   */
  getAll: (params = {}) => {
    return api.get('/operator-panel/bookings', { params });
  },

  /**
   * Mendapatkan detail booking berdasarkan ID
   * @param {number|string} id - ID booking
   * @returns {Promise} - Promise hasil request
   */
  getById: (id) => {
    return new Promise((resolve, reject) => {
      api.get(`/operator-panel/bookings/${id}`)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.error(`Error fetching booking ${id}:`, error);
          reject(error);
        });
    });
  },

  /**
   * Mengubah status booking
   * @param {number|string} id - ID booking
   * @param {Object} data - Data perubahan status {status, cancellation_reason, notes}
   * @returns {Promise} - Promise hasil request
   */
  updateStatus: (id, data) => {
    return api.put(`/operator-panel/bookings/${id}/status`, data);
  },

  /**
   * Service untuk proses check-in
   */
  checkIn: {
    // Validate ticket/booking code dengan parameter yang ditingkatkan
    validate: (data) => {
      return api.post('/operator-panel/bookings/check-in/validate', data)
        .catch(error => {
          console.error('Error validating check-in:', error);
          // Pastikan error diproses dengan benar sebelum dilempar kembali
          throw error; // Tetap lempar error agar bisa ditangkap oleh komponen React
        });
    },

    // Process check-in dengan data tambahan
    process: (data) => {
      return api.post('/operator-panel/bookings/check-in/process', data);
    },

    // Mendapatkan riwayat check-in terbaru
    getRecentActivity: () => {
      return api.get('/operator-panel/bookings/check-in/recent');
    },

    // Mendapatkan statistik check-in
    getStats: () => {
      return api.get('/operator-panel/bookings/check-in/stats');
    },

    // Memverifikasi keabsahan tiket dari nomor ID
    verifyIdentity: (ticketCode, idNumber) => {
      return api.post('/operator-panel/bookings/check-in/verify-identity', {
        ticket_code: ticketCode,
        id_number: idNumber
      });
    },

    // Mengirim konfirmasi check-in ke email/SMS penumpang
    sendConfirmation: (ticketCode, method = 'email') => {
      return api.post('/operator-panel/bookings/check-in/send-confirmation', {
        ticket_code: ticketCode,
        method: method // 'email' atau 'sms'
      });
    }
  },

  /**
   * Utility: Format currency untuk tampilan
   * @param {number} amount - Jumlah yang akan diformat
   * @returns {string} - String jumlah yang sudah diformat
   */
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Utility: Format tanggal untuk tampilan
   * @param {string} dateString - String tanggal yang akan diformat
   * @returns {string} - String tanggal yang sudah diformat
   */
  formatDate: (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  },

  /**
   * Utility: Format waktu untuk tampilan
   * @param {string} dateString - String tanggal yang akan diformat
   * @returns {string} - String waktu yang sudah diformat
   */
  formatTime: (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Waktu tidak valid';
      }
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Waktu tidak valid';
    }
  },

  /**
   * Utility: Format datetime untuk tampilan
   * @param {string} dateString - String tanggal yang akan diformat
   * @returns {string} - String datetime yang sudah diformat
   */
  formatDateTime: (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Waktu tidak valid';
      }
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Waktu tidak valid';
    }
  },

  /**
   * Utility: Mendapatkan class badge berdasarkan status booking
   * @param {string} status - Status booking (PENDING, CONFIRMED, COMPLETED, CANCELLED)
   * @returns {string} - Class CSS untuk styling badge
   */
  getStatusBadgeClass: (status) => {
    const badgeClasses = {
      'PENDING': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
      'CONFIRMED': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
      'COMPLETED': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      'CANCELLED': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
    };
    return badgeClasses[status] || 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
  },

  /**
   * Utility: Mendapatkan teks status booking dalam Bahasa Indonesia
   * @param {string} status - Status booking (PENDING, CONFIRMED, COMPLETED, CANCELLED)
   * @returns {string} - Teks status dalam Bahasa Indonesia
   */
  getStatusText: (status) => {
    const statusText = {
      'PENDING': 'Menunggu',
      'CONFIRMED': 'Dikonfirmasi',
      'COMPLETED': 'Selesai',
      'CANCELLED': 'Dibatalkan',
    };
    return statusText[status] || status;
  },

  /**
   * Utility: Mendapatkan badge untuk status pembayaran
   * @param {string} status - Status pembayaran (PENDING, SUCCESS, FAILED)
   * @returns {Object} - Objek berisi class, icon, dan text
   */
  getPaymentStatusConfig: (status) => {
    return {
      'PENDING': {
        class: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300',
        icon: '⏳',
        text: 'Menunggu'
      },
      'SUCCESS': {
        class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
        icon: '✅',
        text: 'Sukses'
      },
      'FAILED': {
        class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
        icon: '❌',
        text: 'Gagal'
      }
    }[status] || {
      class: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: '❓',
      text: status || 'Tidak Diketahui'
    };
  },

  /**
   * Utility: Mendapatkan badge untuk jenis kendaraan
   * @param {string} type - Jenis kendaraan (MOTORCYCLE, CAR, BUS, TRUCK)
   * @returns {Object} - Objek berisi label, class, dan icon
   */
  getVehicleTypeConfig: (type) => {
    return {
      'MOTORCYCLE': {
        label: 'Motor',
        class: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300',
        icon: '🏍️'
      },
      'CAR': {
        label: 'Mobil',
        class: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
        icon: '🚗'
      },
      'BUS': {
        label: 'Bus',
        class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
        icon: '🚌'
      },
      'TRUCK': {
        label: 'Truk',
        class: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300',
        icon: '🚚'
      }
    }[type] || {
      label: type || 'Lainnya',
      class: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: '🚙'
    };
  },

  /**
   * Utility: Mendapatkan badge untuk status tiket
   * @param {string} status - Status tiket (ACTIVE, USED, CANCELLED)
   * @returns {Object} - Objek berisi class dan teks
   */
  getTicketStatusConfig: (status) => {
    return {
      'ACTIVE': {
        class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
        text: '✅ Aktif'
      },
      'USED': {
        class: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
        text: '✔️ Digunakan'
      },
      'CANCELLED': {
        class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
        text: '❌ Dibatalkan'
      }
    }[status] || {
      class: 'bg-slate-100 text-slate-800 border-slate-300',
      text: status || 'Tidak Diketahui'
    };
  },

  /**
   * Utility: Menghitung jumlah kendaraan dari booking
   * @param {Object} booking - Data booking
   * @returns {number} - Jumlah kendaraan
   */
  getVehicleCount: (booking) => {
    if (!booking.vehicles) return 0;
    if (Array.isArray(booking.vehicles)) return booking.vehicles.length;
    if (typeof booking.vehicles === 'object') return Object.keys(booking.vehicles).length;
    return 0;
  },

  /**
   * Utility: Handling error secara umum
   * @param {Error} error - Objek error
   * @param {string} defaultMessage - Pesan default jika tidak ada detail error
   * @returns {string} - Pesan error yang sudah diformat
   */
  handleError: (error, defaultMessage = 'Terjadi kesalahan saat memproses permintaan') => {
    console.error('API Error:', error);

    if (error.response) {
      // Error response dari server
      const errorData = error.response.data;
      if (errorData && errorData.message) {
        return errorData.message;
      }
      return `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      return 'Tidak ada respons dari server. Periksa koneksi internet Anda.';
    } else {
      // Error lainnya
      return error.message || defaultMessage;
    }
  },

  /**
   * Utility: Menghasilkan string QR code untuk tiket
   * @param {string} ticketCode - Kode tiket
   * @returns {string} - URL QR code
   */
  generateQRCodeUrl: (ticketCode) => {
    // Menggunakan API QR Code Generator
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketCode)}`;
  },

  /**
   * Utility: Format waktu keberangkatan yang ramah
   * @param {string} departureTime - Waktu keberangkatan (format: HH:MM:SS)
   * @param {string} departureDate - Tanggal keberangkatan (format: YYYY-MM-DD)
   * @returns {string} - Teks waktu yang user-friendly
   */
  getFriendlyDepartureTime: (departureTime, departureDate) => {
    try {
      if (!departureTime || !departureDate) return 'Tidak tersedia';

      const now = new Date();
      const depDate = new Date(departureDate);

      // Ambil jam dan menit dari string waktu
      const [hours, minutes] = departureTime.split(':');
      depDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);

      // Hitung perbedaan waktu
      const diffMs = depDate - now;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      // Format waktu yang ramah
      if (diffDays > 0) {
        return `${diffDays} hari lagi`;
      } else if (diffHours > 0) {
        return `${diffHours} jam lagi`;
      } else if (diffMins > 0) {
        return `${diffMins} menit lagi`;
      } else if (diffMins > -30) { // Masih dalam rentang 30 menit setelah keberangkatan
        return 'Sedang boarding';
      } else {
        return 'Sudah berangkat';
      }
    } catch (error) {
      console.error('Error calculating friendly departure time:', error);
      return departureTime;
    }
  },

  /**
   * Utility: Generate boarding pass PDF
   * @param {Object} ticket - Data tiket
   * @returns {Promise} - Promise untuk mendownload file PDF
   */
  generateBoardingPass: (ticket) => {
    return api.post('/operator-panel/bookings/check-in/generate-boarding-pass', {
      ticket_code: ticket.ticket_code
    }, {
      responseType: 'blob'
    });
  }
};

export default operatorBookingsService;