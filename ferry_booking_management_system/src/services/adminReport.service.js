import { api } from './api';

class adminReportService {
  /**
   * Mendapatkan data dashboard
   * @returns {Promise}
   */
  async getDashboardData() {
    try {
      const response = await api.get('/admin-panel/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan laporan booking
   * @param {Object} params - Report parameters
   * @returns {Promise}
   */
  async getBookingReport(params) {
    try {
      const response = await api.get('/admin-panel/reports/booking', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching booking report:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan laporan pendapatan
   * @param {Object} params - Report parameters
   * @returns {Promise}
   */
  async getRevenueReport(params) {
    try {
      const response = await api.get('/admin-panel/reports/revenue', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan laporan jadwal
   * @param {Object} params - Report parameters
   * @returns {Promise}
   */
  async getScheduleReport(params) {
    try {
      const response = await api.get('/admin-panel/reports/schedule', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule report:', error);
      throw error;
    }
  }

  /**
 * Export laporan booking
 * @param {Object} params - Export parameters
 * @returns {Promise}
 */
  async exportBookingReport(params) {
    try {
      // Pastikan hanya menggunakan API endpoint standar tanpa mengarahkan ulang browser
      const response = await api.get('/admin-panel/reports/booking', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting booking report:', error);
      throw error;
    }
  }

  /**
   * Export laporan pendapatan
   * @param {Object} params - Export parameters
   * @returns {Promise}
   */
  async exportRevenueReport(params) {
    try {
      // Pastikan hanya menggunakan API endpoint standar tanpa mengarahkan ulang browser
      const response = await api.get('/admin-panel/reports/revenue', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting revenue report:', error);
      throw error;
    }
  }

  /**
 * Export laporan jadwal
 * @param {Object} params - Export parameters
 * @returns {Promise}
 */
  async exportScheduleReport(params) {
    try {
      // Pastikan hanya menggunakan API endpoint standar tanpa mengarahkan ulang browser
      const response = await api.get('/admin-panel/reports/schedule', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting schedule report:', error);
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
   * Format date
   * @param {string} date - Date string
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Format percentage
   * @param {number} value - Percentage value
   * @returns {string}
   */
  formatPercentage(value) {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Get status color
   * @param {string} status - Status
   * @returns {string}
   */
  getStatusColor(status) {
    const colors = {
      'PENDING': 'yellow',
      'CONFIRMED': 'green',
      'CANCELLED': 'red',
      'COMPLETED': 'blue',
      'REFUNDED': 'purple',
      'RESCHEDULED': 'orange'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get status text
   * @param {string} status - Status
   * @returns {string}
   */
  getStatusText(status) {
    const texts = {
      'PENDING': 'Menunggu',
      'CONFIRMED': 'Dikonfirmasi',
      'CANCELLED': 'Dibatalkan',
      'COMPLETED': 'Selesai',
      'REFUNDED': 'Dikembalikan',
      'RESCHEDULED': 'Dijadwalkan Ulang'
    };
    return texts[status] || status;
  }

  /**
   * Build report filters
   * @param {Object} filters - Filter object
   * @returns {Object}
   */
  buildReportFilters(filters) {
    const params = {};

    if (filters.start_date) {
      params.start_date = filters.start_date;
    }

    if (filters.end_date) {
      params.end_date = filters.end_date;
    }

    if (filters.route_id) {
      params.route_id = filters.route_id;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.group_by) {
      params.group_by = filters.group_by;
    }

    if (filters.sort_field) {
      params.sort_field = filters.sort_field;
    }

    if (filters.sort_order) {
      params.sort_order = filters.sort_order;
    }

    if (filters.export) {
      params.export = filters.export;
    }

    return params;
  }

  /**
   * Download file from blob
   * @param {Blob} blob - File blob
   * @param {string} filename - File name
   */
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get chart options for booking trend
   * @param {Array} bookingTrend - Booking trend data
   * @returns {Object}
   */
  getBookingTrendChartOptions(bookingTrend) {
    return {
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: false
        }
      },
      series: [{
        name: 'Jumlah Booking',
        data: bookingTrend.map(item => item.count)
      }],
      xaxis: {
        categories: bookingTrend.map(item => this.formatDate(item.date)),
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
      colors: ['#3B82F6']
    };
  }

  /**
   * Get chart options for revenue
   * @param {Array} revenues - Revenue data
   * @returns {Object}
   */
  getRevenueChartOptions(revenues) {
    return {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      series: [{
        name: 'Pendapatan',
        data: revenues.map(item => item.total_amount)
      }],
      xaxis: {
        categories: revenues.map(item => item.formatted_period),
        labels: {
          rotate: -45
        }
      },
      yaxis: {
        title: {
          text: 'Pendapatan (Rp)'
        },
        labels: {
          formatter: (value) => this.formatCurrency(value)
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (value) => this.formatCurrency(value),
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758']
        }
      },
      colors: ['#10B981']
    };
  }

  /**
   * Get chart options for status distribution
   * @param {Array} statusCount - Status count data
   * @returns {Object}
   */
  getStatusDistributionChartOptions(statusCount) {
    return {
      chart: {
        type: 'donut',
        height: 350
      },
      series: statusCount.map(item => item.count),
      labels: statusCount.map(item => this.getStatusText(item.status)),
      colors: statusCount.map(item => this.getStatusColor(item.status)),
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                label: 'Total',
                fontSize: '22px',
                fontWeight: 600,
                color: '#373d3f',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                }
              }
            }
          }
        }
      }
    };
  }
}

export default new adminReportService();