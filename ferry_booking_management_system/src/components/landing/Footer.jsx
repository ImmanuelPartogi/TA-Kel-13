import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getAssetUrl } from '../../utils/api';

const Footer = ({ settings }) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: settings.social_facebook || '#' },
    { icon: Twitter, href: settings.social_twitter || '#' },
    { icon: Instagram, href: settings.social_instagram || '#' },
    { icon: Youtube, href: settings.social_youtube || '#' }
  ];

  const quickLinks = [
    { href: '#home', label: 'Beranda' },
    { href: '#routes', label: 'Rute' },
    { href: '#howto', label: 'Cara Pemesanan' },
    { href: '#about', label: 'Tentang Kami' },
    { href: '#', label: 'Syarat & Ketentuan' },
    { href: '#', label: 'Kebijakan Privasi' },
    { href: '/operator/login', label: 'Login' }
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: settings.footer_address || 'Jln Siliwangi balige; Balige, Sumatera Utara, Indonesia 22315'
    },
    {
      icon: Phone,
      text: settings.footer_phone || '(0632) 322777'
    },
    {
      icon: Mail,
      text: settings.footer_email || 'info@ferryticket.com'
    },
    {
      icon: Clock,
      text: 'Dukungan Pelanggan: 24/7'
    }
  ];

  return (
    <section id="contact" className="bg-gray-900 text-white pt-16 sm:pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <img
                className="h-8 sm:h-10 w-auto"
                src={getAssetUrl('images/logo.png')}
                alt="Ferry Ticket Logo"
              />
              <span className="ml-2 text-lg sm:text-xl font-bold text-white">
                {settings.site_name || 'FerryTicket'}
              </span>
            </div>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              {settings.footer_description || 'Mitra terpercaya Anda untuk perjalanan di kawasan Danau Toba.'}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="text-gray-400 hover:text-white p-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 sm:mb-6">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm sm:text-base block py-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 sm:mb-6">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3">
              {contactInfo.map(({ icon: Icon, text }, index) => (
                <li key={index} className="flex items-start">
                  <Icon className="text-primary-500 mt-1 mr-3 flex-shrink-0 h-4 w-4" />
                  <span className="text-gray-400 text-sm sm:text-base">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Empty column for 4-column layout */}
          <div className="hidden lg:block"></div>
        </div>

        <div className="border-t border-gray-800 mt-10 sm:mt-16 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm sm:text-base">
            {settings.footer_copyright || `© ${currentYear} Ferry Ticket System. All rights reserved.`}
          </p>
          <div className="mt-4 md:mt-0 flex items-center justify-center">
            <img
              src={getAssetUrl('images/logo.png')}
              alt="Payment Methods"
              className="h-16 sm:h-24 md:h-32"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;