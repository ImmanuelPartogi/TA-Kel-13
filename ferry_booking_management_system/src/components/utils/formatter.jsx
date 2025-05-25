/**
 * Format angka ke format Rupiah (Rp)
 * @param {number} amount - Jumlah yang akan diformat
 * @returns {string} String yang sudah diformat (contoh: Rp 1.000.000)
 */
export const formatRupiah = (amount) => {
  if (amount === null || amount === undefined) {
    return 'Rp 0';
  }
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount).replace('IDR', 'Rp');
};

/**
 * Format tanggal ke format Indonesia
 * @param {string} dateString - String tanggal dari API
 * @returns {string} String tanggal yang sudah diformat (contoh: 24 Mei 2023, 15:30)
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    return '-';
  }
  
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
};

/**
 * Format tanggal ke format singkat
 * @param {string} dateString - String tanggal dari API
 * @returns {string} String tanggal yang sudah diformat (contoh: 24/05/2023)
 */
export const formatShortDate = (dateString) => {
  if (!dateString) {
    return '-';
  }
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', options);
};

/**
 * Format tanggal dan waktu terpisah
 * @param {string} dateString - String tanggal dari API
 * @returns {object} Object berisi tanggal dan waktu yang sudah diformat
 */
export const formatDateAndTime = (dateString) => {
  if (!dateString) {
    return { date: '-', time: '-' };
  }
  
  const date = new Date(dateString);
  
  const dateOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return {
    date: date.toLocaleDateString('id-ID', dateOptions),
    time: date.toLocaleTimeString('id-ID', timeOptions)
  };
};

/**
 * Format status booking ke bahasa Indonesia
 * @param {string} status - Status dari API
 * @returns {string} Status dalam bahasa Indonesia
 */
export const formatBookingStatus = (status) => {
  const statusMap = {
    'pending': 'Menunggu Pembayaran',
    'confirmed': 'Terkonfirmasi',
    'cancelled': 'Dibatalkan',
    'completed': 'Selesai',
    'expired': 'Kedaluwarsa',
    'refunded': 'Direfund'
  };
  
  return statusMap[status] || status;
};

/**
 * Format status pembayaran ke bahasa Indonesia
 * @param {string} status - Status dari API
 * @returns {string} Status dalam bahasa Indonesia
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    'pending': 'Menunggu Pembayaran',
    'paid': 'Sudah Dibayar',
    'cancelled': 'Dibatalkan',
    'expired': 'Kedaluwarsa',
    'refunded': 'Direfund'
  };
  
  return statusMap[status] || status;
};

/**
 * Format angka dengan pemisah ribuan
 * @param {number} number - Angka yang akan diformat
 * @returns {string} String angka yang sudah diformat
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) {
    return '0';
  }
  
  return new Intl.NumberFormat('id-ID').format(number);
};

/**
 * Format ukuran file (byte ke KB, MB, GB)
 * @param {number} bytes - Ukuran file dalam byte
 * @returns {string} Ukuran file yang sudah diformat
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Mendapatkan warna berdasarkan status
 * @param {string} status - Status
 * @returns {object} Object berisi warna background dan text
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'confirmed': { bg: 'bg-green-100', text: 'text-green-800' },
    'cancelled': { bg: 'bg-red-100', text: 'text-red-800' },
    'completed': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'expired': { bg: 'bg-gray-100', text: 'text-gray-800' },
    'refunded': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'paid': { bg: 'bg-green-100', text: 'text-green-800' },
    'active': { bg: 'bg-green-100', text: 'text-green-800' },
    'inactive': { bg: 'bg-red-100', text: 'text-red-800' }
  };
  
  return statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
};