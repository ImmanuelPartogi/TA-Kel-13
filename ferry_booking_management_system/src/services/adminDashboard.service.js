import { api } from './api';

class adminDashboardService {
  /**
   * Mendapatkan statistik dashboard
   * @returns {Promise}
   */
  async getStats() {
    try {
      const response = await api.get('/admin-panel/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan summary dashboard
   * @returns {Promise}
   */
  async getSummary() {
    try {
      const response = await api.get('/admin-panel/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Format currency
   * @param {number} amount - Amount
   * @returns {string}
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format percentage
   * @param {number} value - Percentage value
   * @returns {string}
   */
  formatPercentage(value) {
    return `${value > 0 ? '+' : ''}${value}%`;
  }

  /**
   * Get color for growth indicator
   * @param {number} value - Growth value
   * @returns {string}
   */
  getGrowthColor(value) {
    if (value > 0) return 'green';
    if (value < 0) return 'red';
    return 'gray';
  }

  /**
   * Get icon for growth indicator
   * @param {number} value - Growth value
   * @returns {string}
   */
  getGrowthIcon(value) {
    if (value > 0) return 'arrow-up';
    if (value < 0) return 'arrow-down';
    return 'minus';
  }

  /**
   * Format number with thousand separator
   * @param {number} number - Number to format
   * @returns {string}
   */
  formatNumber(number) {
    return new Intl.NumberFormat('id-ID').format(number);
  }

  /**
   * Get chart options for weekly bookings
   * @param {Object} data - Chart data
   * @returns {Object}
   */
  getWeeklyChartOptions(data) {
    return {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      series: [{
        name: 'Booking',
        data: data.data
      }],
      xaxis: {
        categories: data.labels
      },
      yaxis: {
        title: {
          text: 'Jumlah Booking'
        }
      },
      colors: ['#3B82F6'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      }
    };
  }

  /**
   * Get chart options for monthly bookings
   * @param {Object} data - Chart data
   * @returns {Object}
   */
  getMonthlyChartOptions(data) {
    return {
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        }
      },
      series: [{
        name: 'Booking',
        data: data.data
      }],
      xaxis: {
        categories: data.labels,
        labels: {
          rotate: -45
        }
      },
      yaxis: {
        title: {
          text: 'Jumlah Booking'
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 5
      },
      colors: ['#10B981']
    };
  }

  /**
   * Get booking status distribution
   * @param {Object} bookingStatus - Booking status data
   * @returns {Object}
   */
  getStatusDistribution(bookingStatus) {
    const total = Object.values(bookingStatus).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(bookingStatus).map(([key, value]) => ({
      label: this.getStatusLabel(key),
      value: value,
      percentage: total > 0 ? (value / total * 100).toFixed(1) : 0,
      color: this.getStatusColor(key)
    }));
  }

  /**
   * Get status label
   * @param {string} status - Status key
   * @returns {string}
   */
  getStatusLabel(status) {
    const labels = {
      'pending_payment': 'Menunggu Pembayaran',
      'not_checked_in': 'Belum Check-In',
      'checked_in': 'Sudah Check-In',
      'cancelled': 'Dibatalkan'
    };
    return labels[status] || status;
  }

  /**
   * Get status color
   * @param {string} status - Status key
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'pending_payment': '#F59E0B',
      'not_checked_in': '#3B82F6',
      'checked_in': '#10B981',
      'cancelled': '#EF4444'
    };
    return colors[status] || '#6B7280';
  }
}

export default new adminDashboardService();