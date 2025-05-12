import React, { useState, useEffect } from 'react';
import { Clock, Ship } from 'lucide-react';
import { getRoutes } from '../../utils/api';

const RoutesSection = ({ settings }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAppModal, setShowAppModal] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await getRoutes();
        setRoutes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching routes:', error);
        // Use fallback data if needed
        setRoutes(getFallbackRoutes());
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleBookNow = (e) => {
    e.preventDefault();
    // Trigger app download modal
    const event = new CustomEvent('showAppModal');
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <section id="routes" className="py-12 sm:py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="routes" className="py-12 sm:py-16 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {settings.routes_title || 'Rute yang Tersedia'}
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
            {settings.routes_subtitle || 'Jelajahi semua rute feri kami yang menghubungkan pulau-pulau'}
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {routes.length > 0 ? (
            routes.map((route) => (
              <RouteCard key={route.id} route={route} onBookNow={handleBookNow} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-8 text-center">
              <div className="mx-auto max-w-md">
                <Ship className="mx-auto text-3xl sm:text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada rute yang tersedia saat ini
                </h3>
                <p className="text-gray-500">Silakan periksa kembali nanti untuk rute feri yang tersedia.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <a
            href="#download-app"
            onClick={handleBookNow}
            className="inline-flex items-center px-5 sm:px-6 py-2 sm:py-3 border border-primary-600 text-sm sm:text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Lihat Semua Detail
            <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

const RouteCard = ({ route, onBookNow }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      <div className="relative h-40 sm:h-48">
        <img
          className="h-full w-full object-cover"
          src={route.image_url || 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1978'}
          alt={`${route.origin} - ${route.destination}`}
        />
        {route.is_popular && (
          <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Populer
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {route.origin} - {route.destination}
          </h3>
        </div>
        <div className="flex items-center mb-2">
          <Clock className="text-gray-500 mr-2 flex-shrink-0 h-4 w-4" />
          <span className="text-gray-600 text-sm sm:text-base">
            Durasi: ~{route.duration || '2'} jam
          </span>
        </div>
        <div className="flex items-center mb-4">
          <Ship className="text-gray-500 mr-2 flex-shrink-0 h-4 w-4" />
          <span className="text-gray-600 text-sm sm:text-base">
            {route.schedule_description || `${route.schedules?.length || 0} jadwal tersedia`}
          </span>
        </div>
        <div className="flex justify-between items-center mt-auto pt-4">
          <div>
            <span className="text-gray-500 text-xs sm:text-sm">Mulai dari</span>
            <p className="text-base sm:text-lg font-bold text-primary-600">
              Rp {route.base_price ? route.base_price.toLocaleString('id-ID') : '60.000'}
            </p>
          </div>
          <a
            href="#download-app"
            onClick={onBookNow}
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Pesan Sekarang
          </a>
        </div>
      </div>
    </div>
  );
};

// Fallback data jika API gagal
const getFallbackRoutes = () => [
  {
    id: 1,
    origin: 'Merak',
    destination: 'Bakauheni',
    duration: 2,
    base_price: 60000,
    is_popular: true,
    schedule_description: 'Setiap 30 menit',
  },
  {
    id: 2,
    origin: 'Ketapang',
    destination: 'Gilimanuk',
    duration: 1,
    base_price: 45000,
    is_popular: false,
    schedule_description: 'Setiap jam',
  },
];

export default RoutesSection;