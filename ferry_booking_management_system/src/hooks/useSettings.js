import { useState, useEffect } from 'react';
import { getSettings } from '../utils/api';

export const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        setSettings(response.data.data || {});
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err);
        // Use default settings if fetch fails
        setSettings(getDefaultSettings());
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};

// Default settings untuk fallback
const getDefaultSettings = () => ({
  site_name: 'FerryTicket',
  hero_image: 'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?q=80&w=2070',
  hero_title: 'Jelajahi Keindahan Danau dengan Layanan Ferry Kami',
  hero_subtitle: 'Pesan tiket ferry Anda secara online untuk pengalaman perjalanan yang mulus.',
  primary_button_text: 'Telusuri Rute Pilihan Anda',
  secondary_button_text: 'Panduan Mudah Memesan Tiket',
  routes_title: 'Rute yang Tersedia',
  routes_subtitle: 'Jelajahi semua rute feri kami yang menghubungkan pulau-pulau',
  features_title: 'Mengapa Memilih Layanan Ferry Kami',
  features_subtitle: 'Nikmati perjalanan terbaik di Danau Toba dengan berbagai keuntungan berikut',
  howto_title: 'Bagaimana cara memesan tiket kapal feri Anda',
  howto_subtitle: 'Ikuti langkah-langkah sederhana ini untuk memesan perjalanan Anda',
  about_title: 'Tentang Layanan Ferry Kami',
  about_content: 'Platform tiket ferry kami telah memainkan peran penting...',
  cta_title: 'Siap untuk Memulai Perjalanan Anda?',
  cta_subtitle: 'Pesan tiket feri Anda secara online untuk pengalaman perjalanan yang mulus.',
  footer_description: 'Mitra terpercaya Anda untuk perjalanan di kawasan Danau Toba.',
  footer_copyright: `© ${new Date().getFullYear()} Ferry Ticket System. All rights reserved.`,
});