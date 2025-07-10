import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

const BookingCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [vehicleCategories, setVehicleCategories] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [searchingUser, setSearchingUser] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchError, setSearchError] = useState('');
    const [formStage, setFormStage] = useState(1); // 1: Pilih rute, 2: Pilih jadwal, 3: Input data penumpang

    // State validasi form
    const [formErrors, setFormErrors] = useState({
        route: false,
        date: false,
        passengers: false,
        vehicles: false,
        user: false,
        customer: false
    });

    // Form data dengan struktur yang lebih baik
    const [bookingData, setBookingData] = useState({
        // Step 1: Pemilihan rute dan tanggal
        route_id: '',
        date: new Date().toISOString().split('T')[0], // Default ke hari ini
        passenger_count: 1,
        vehicle_categories: [],
        vehicle_count: 0,

        // Step 2: Pemilihan jadwal
        schedule_id: '',
        schedule_date_id: '',
        ferry_name: '',
        route_info: '',
        departure_time: '',
        arrival_time: '',

        // Step 3: Data penumpang dan kendaraan
        user_id: '',
        user: null,
        passengers: [{
            name: '',
            id_number: '',
            id_type: 'KTP'
        }],
        vehicles: [],

        // Data untuk pelanggan loket
        customerType: 'counter', // Default ke pembelian di loket
        customer_name: '',
        customer_contact: '',

        // Informasi pembayaran
        payment_method: 'CASH',
        payment_status: 'PENDING',
        total_amount: 0,

        // Metadata
        created_by: 'ADMIN',
        booking_channel: 'COUNTER',
        notes: ''
    });

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/admin-panel/bookings/create');

                if (response.data.success) {
                    setRoutes(response.data.data.routes);
                    setVehicleCategories(response.data.data.vehicle_categories);
                } else {
                    toast.error(response.data.message || 'Gagal memuat data');
                }
            } catch (error) {
                console.error('Error fetching booking form data:', error);
                toast.error('Gagal memuat data formulir booking. Silakan refresh halaman');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Debounce function for user search
    const debouncedSearch = useCallback(
        debounce(async (searchValue) => {
            if (searchValue.length < 3) {
                setSearchResults([]);
                return;
            }

            setSearchingUser(true);
            setSearchError('');

            try {
                const response = await api.get('/admin-panel/bookings/search-users', {
                    params: { search: searchValue }
                });

                if (response.data.success) {
                    if (response.data.data.length === 0) {
                        setSearchError(`Tidak ada pengguna ditemukan dengan kata kunci "${searchValue}"`);
                    }
                    setSearchResults(response.data.data);
                } else {
                    setSearchError(response.data.message || 'Gagal mencari pengguna');
                }
            } catch (error) {
                console.error('Error searching users:', error);
                setSearchError(error.response?.data?.message || 'Terjadi kesalahan saat mencari pengguna');
            } finally {
                setSearchingUser(false);
            }
        }, 500),
        []
    );

    // Call debounced search when search term changes
    useEffect(() => {
        if (searchTerm) {
            debouncedSearch(searchTerm);
        } else {
            setSearchResults([]);
        }

        // Cleanup function to cancel debounced search on unmount
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, debouncedSearch]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Handle route and date selection
    const handleStage1Submit = async (e) => {
        e.preventDefault();

        // Validasi form tahap 1
        const errors = {};
        if (!bookingData.route_id) errors.route = 'Harap pilih rute';
        if (!bookingData.date) errors.date = 'Harap pilih tanggal';
        if (bookingData.passenger_count < 1) errors.passenger_count = 'Jumlah penumpang minimal 1';

        if (Object.keys(errors).length > 0) {
            setFormErrors({ ...formErrors, ...errors });

            // Tampilkan pesan error pertama
            const firstError = Object.values(errors)[0];
            toast.error(firstError);
            return;
        }

        setLoadingSchedules(true);

        try {
            // Persiapkan parameter untuk mendapatkan jadwal
            const params = {
                route_id: bookingData.route_id,
                date: bookingData.date,
                passenger_count: bookingData.passenger_count
            };

            // Tambahkan vehicle_categories dengan format yang benar
            if (bookingData.vehicle_categories.length > 0) {
                const vehicleCategoriesData = bookingData.vehicle_categories
                    .filter(vc => vc.count > 0)
                    .map(vc => ({
                        id: vc.id,
                        count: vc.count
                    }));

                params.vehicle_categories = JSON.stringify(vehicleCategoriesData);
            }

            console.log('Mencari jadwal dengan parameter:', params);

            const response = await api.get('/admin-panel/bookings/get-schedules', { params });

            console.log('Schedule response:', response.data);

            if (response.data.success) {
                setSchedules(response.data.data);
                setFormStage(2);
            } else {
                toast.error(response.data.message || 'Gagal mendapatkan jadwal yang tersedia');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);

            // Tampilkan pesan error yang lebih informatif
            const errorMessage = error.response?.data?.message ||
                'Gagal memuat jadwal tersedia. Silakan coba lagi.';
            toast.error(errorMessage);

            // Log detail error untuk debugging
            if (error.response?.data?.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }
        } finally {
            setLoadingSchedules(false);
        }
    };

    // Handle schedule selection dengan validasi dan penyimpanan data lebih lengkap
    const handleSelectSchedule = (schedule) => {
        if (!schedule || !schedule.id) {
            toast.error('Jadwal tidak valid, silakan pilih jadwal lain');
            return;
        }

        // Pastikan jadwal memiliki informasi penting
        if (!schedule.schedule_date_id) {
            toast.error('Data jadwal tidak lengkap. Silakan refresh halaman dan coba lagi');
            return;
        }

        // Periksa ketersediaan kapasitas
        if (schedule.available_passenger < bookingData.passenger_count) {
            toast.error(`Kapasitas penumpang tidak mencukupi. Tersedia: ${schedule.available_passenger}, dibutuhkan: ${bookingData.passenger_count}`);
            return;
        }

        // Verifikasi ketersediaan kendaraan jika ada
        const vehicleCategories = bookingData.vehicle_categories.filter(vc => vc.count > 0);
        let vehicleError = false;

        vehicleCategories.forEach(vc => {
            const category = vehicleCategories.find(c => c.id === vc.id);
            if (!category) return;

            // Periksa ketersediaan berdasarkan tipe kendaraan
            switch (category.vehicle_type) {
                case 'MOTORCYCLE':
                    if (schedule.available_motorcycle < vc.count) {
                        toast.error(`Kapasitas motor tidak mencukupi. Tersedia: ${schedule.available_motorcycle}, dibutuhkan: ${vc.count}`);
                        vehicleError = true;
                    }
                    break;
                case 'CAR':
                    if (schedule.available_car < vc.count) {
                        toast.error(`Kapasitas mobil tidak mencukupi. Tersedia: ${schedule.available_car}, dibutuhkan: ${vc.count}`);
                        vehicleError = true;
                    }
                    break;
                // Tambahkan kasus untuk jenis kendaraan lainnya
                case 'BUS':
                    if (schedule.available_bus < vc.count) {
                        toast.error(`Kapasitas bus tidak mencukupi. Tersedia: ${schedule.available_bus}, dibutuhkan: ${vc.count}`);
                        vehicleError = true;
                    }
                    break;
                case 'TRUCK':
                case 'PICKUP':
                case 'TRONTON':
                    if (schedule.available_truck < vc.count) {
                        toast.error(`Kapasitas truk tidak mencukupi. Tersedia: ${schedule.available_truck}, dibutuhkan: ${vc.count}`);
                        vehicleError = true;
                    }
                    break;
            }
        });

        if (vehicleError) return;

        // Simpan data jadwal dengan informasi lengkap
        setSelectedSchedule(schedule);
        setBookingData({
            ...bookingData,
            schedule_id: schedule.id,
            schedule_date_id: schedule.schedule_date_id,
            total_amount: schedule.total_price,
            ferry_name: schedule.ferry?.name || '',
            route_info: `${schedule.route?.origin || ''} - ${schedule.route?.destination || ''}`,
            departure_time: schedule.departure_time,
            arrival_time: schedule.arrival_time
        });

        // Log untuk debugging
        console.log('Jadwal dipilih:', schedule);
        console.log('Data booking diperbarui:', bookingData);

        setFormStage(3);
    };

    // Handle searching for users
    const handleSearchUser = (e) => {
        setSearchTerm(e.target.value);
    };

    // Select user from search results
    const handleSelectUser = (user) => {
        setBookingData({
            ...bookingData,
            user_id: user.id,
            user: user
        });
        setSearchResults([]);
        setSearchTerm('');
        setFormErrors({
            ...formErrors,
            user: false
        });
    };

    // Add passenger field
    const addPassenger = () => {
        if (bookingData.passengers.length < bookingData.passenger_count) {
            setBookingData({
                ...bookingData,
                passengers: [
                    ...bookingData.passengers,
                    { name: '', id_number: '', id_type: 'KTP' }
                ]
            });
        }
    };

    // Remove passenger field
    const removePassenger = (index) => {
        if (bookingData.passengers.length > 1) {
            const updatedPassengers = [...bookingData.passengers];
            updatedPassengers.splice(index, 1);
            setBookingData({
                ...bookingData,
                passengers: updatedPassengers
            });
        }
    };

    // Update passenger data
    const updatePassenger = (index, field, value) => {
        const updatedPassengers = [...bookingData.passengers];
        updatedPassengers[index] = {
            ...updatedPassengers[index],
            [field]: value
        };
        setBookingData({
            ...bookingData,
            passengers: updatedPassengers
        });

        // Reset error for passengers if necessary
        if (field === 'name' && value.trim() !== '') {
            setFormErrors({
                ...formErrors,
                passengers: false
            });
        }
    };

    // Add vehicle field
    const addVehicle = () => {
        const totalVehicles = bookingData.vehicle_categories.reduce((sum, vc) => sum + vc.count, 0);

        if (bookingData.vehicles.length < totalVehicles) {
            // Find the first vehicle category with remaining count
            const categories = bookingData.vehicle_categories.filter(vc => {
                const existingCount = bookingData.vehicles.filter(v =>
                    v.category_id === vc.id).length;
                return existingCount < vc.count;
            });

            const defaultCategory = categories.length > 0 ? categories[0] : null;

            setBookingData({
                ...bookingData,
                vehicles: [
                    ...bookingData.vehicles,
                    {
                        type: defaultCategory?.type || 'CAR',
                        category_id: defaultCategory?.id || '',
                        license_plate: '',
                        brand: '',
                        model: ''
                    }
                ]
            });
        } else {
            toast.warning(`Anda hanya dapat menambahkan maksimal ${totalVehicles} kendaraan sesuai dengan jumlah yang dipilih.`);
        }
    };

    // Remove vehicle field
    const removeVehicle = (index) => {
        const updatedVehicles = [...bookingData.vehicles];
        updatedVehicles.splice(index, 1);
        setBookingData({
            ...bookingData,
            vehicles: updatedVehicles
        });
    };

    // Update vehicle data
    const updateVehicle = (index, field, value) => {
        const updatedVehicles = [...bookingData.vehicles];

        // If changing type, try to find a matching category
        if (field === 'type') {
            const matchingCategory = vehicleCategories.find(
                cat => cat.vehicle_type === value
            );

            updatedVehicles[index] = {
                ...updatedVehicles[index],
                [field]: value,
                category_id: matchingCategory ? matchingCategory.id : ''
            };
        } else {
            updatedVehicles[index] = {
                ...updatedVehicles[index],
                [field]: value
            };
        }

        setBookingData({
            ...bookingData,
            vehicles: updatedVehicles
        });

        // Reset error for vehicles if necessary
        if ((field === 'license_plate' || field === 'category_id') && value.trim() !== '') {
            setFormErrors({
                ...formErrors,
                vehicles: false
            });
        }
    };

    // Handle vehicle category selection in stage 1 dengan pengelolaan state yang lebih baik
    const handleVehicleCategoryChange = (categoryId, count) => {
        // Pastikan count adalah integer non-negatif
        const validCount = Math.max(0, parseInt(count) || 0);

        // Buat salinan array agar tidak memodifikasi state langsung
        const updatedCategories = [...bookingData.vehicle_categories];
        const existingIndex = updatedCategories.findIndex(vc => vc.id === categoryId);

        // Temukan data kategori untuk menambahkan informasi tambahan
        const categoryData = vehicleCategories.find(cat => cat.id === categoryId);

        if (existingIndex >= 0) {
            if (validCount > 0) {
                // Update data yang sudah ada dengan informasi tambahan
                updatedCategories[existingIndex] = {
                    ...updatedCategories[existingIndex],
                    id: categoryId,
                    count: validCount,
                    type: categoryData?.vehicle_type || '',
                    name: categoryData?.name || '',
                    price: categoryData?.base_price || 0
                };
            } else {
                // Hapus kategori jika count = 0
                updatedCategories.splice(existingIndex, 1);
            }
        } else if (validCount > 0) {
            // Tambahkan kategori baru dengan informasi lengkap
            updatedCategories.push({
                id: categoryId,
                count: validCount,
                type: categoryData?.vehicle_type || '',
                name: categoryData?.name || '',
                price: categoryData?.base_price || 0
            });
        }

        // Hitung total kendaraan untuk digunakan dalam UI
        const totalVehicles = updatedCategories.reduce((sum, vc) => sum + vc.count, 0);

        // Update state
        setBookingData({
            ...bookingData,
            vehicle_categories: updatedCategories,
            vehicle_count: totalVehicles
        });

        // Jika kendaraan dihapus, hapus juga data kendaraan yang terkait
        if (totalVehicles < bookingData.vehicles.length) {
            // Pertahankan hanya sejumlah kendaraan yang dibutuhkan
            const updatedVehicles = bookingData.vehicles.slice(0, totalVehicles);
            setBookingData(prev => ({
                ...prev,
                vehicles: updatedVehicles
            }));
        }
    };

    // Validasi form booking
    const validateBooking = () => {
        const errors = {};

        // Validasi pengguna atau data pelanggan loket
        if (bookingData.customerType === 'registered' && !bookingData.user_id) {
            errors.user = 'Harap pilih pengguna terlebih dahulu';
        } else if (bookingData.customerType === 'counter' && !bookingData.customer_name) {
            errors.customer = 'Harap isi nama pelanggan';
        }

        // Validasi jadwal
        if (!bookingData.schedule_id || !bookingData.schedule_date_id) {
            errors.schedule = 'Harap pilih jadwal keberangkatan';
        }

        // Validasi jumlah penumpang
        if (bookingData.passengers.length !== parseInt(bookingData.passenger_count)) {
            errors.passengers = `Jumlah data penumpang (${bookingData.passengers.length}) tidak sesuai dengan jumlah penumpang yang dipilih (${bookingData.passenger_count})`;
        }

        // Validasi data penumpang
        const invalidPassengers = bookingData.passengers.filter(p => !p.name.trim());
        if (invalidPassengers.length > 0) {
            errors.passengers = `Harap isi nama semua penumpang (${invalidPassengers.length} penumpang belum diisi)`;
        }

        // Validasi kendaraan
        if (bookingData.vehicle_categories.some(vc => vc.count > 0) && bookingData.vehicles.length === 0) {
            errors.vehicles = 'Anda telah memilih kendaraan tetapi belum mengisi data kendaraan';
        }

        // Validasi detail kendaraan
        const invalidVehicles = bookingData.vehicles.filter(v => !v.category_id || !v.license_plate.trim());
        if (invalidVehicles.length > 0) {
            errors.vehicles = `Harap lengkapi semua data kendaraan (${invalidVehicles.length} kendaraan belum lengkap)`;
        }

        // Validasi jumlah kendaraan sesuai dengan kategori yang dipilih
        const totalVehicleCount = bookingData.vehicle_categories.reduce((sum, vc) => sum + vc.count, 0);
        if (totalVehicleCount !== bookingData.vehicles.length) {
            errors.vehicles = `Jumlah kendaraan (${bookingData.vehicles.length}) tidak sesuai dengan jumlah yang dipilih (${totalVehicleCount})`;
        }

        // Update state error
        setFormErrors({
            ...formErrors,
            ...errors
        });

        // Jika ada error, tampilkan error pertama
        if (Object.keys(errors).length > 0) {
            toast.error(Object.values(errors)[0]);
            return false;
        }

        return true;
    };

    // Create booking dengan validasi dan penanganan error yang lebih baik
    const handleCreateBooking = async (e) => {
        e.preventDefault();

        // Validasi form sebelum submit
        if (!validateBooking()) {
            return;
        }

        setLoading(true);

        try {
            // Persiapkan data yang akan dikirim dengan format yang benar
            const bookingPayload = {
                schedule_id: bookingData.schedule_id,
                schedule_date_id: bookingData.schedule_date_id,
                departure_date: bookingData.date,
                passenger_count: bookingData.passenger_count,
                passengers: bookingData.passengers.map(p => ({
                    name: p.name.trim(),
                    id_number: p.id_number ? p.id_number.trim() : null,
                    id_type: p.id_type
                })),
                vehicles: bookingData.vehicles.map(v => ({
                    type: v.type,
                    category_id: v.category_id,
                    license_plate: v.license_plate.trim(),
                    brand: v.brand ? v.brand.trim() : null,
                    model: v.model ? v.model.trim() : null
                })),
                payment_method: bookingData.payment_method,
                total_amount: bookingData.total_amount
            };

            // Tambahkan user_id hanya jika menggunakan pengguna terdaftar
            if (bookingData.customerType === 'registered' && bookingData.user_id) {
                bookingPayload.user_id = bookingData.user_id;
            } else if (bookingData.customerType === 'counter') {
                bookingPayload.customer_name = bookingData.customer_name;
                if (bookingData.customer_contact) {
                    bookingPayload.customer_contact = bookingData.customer_contact;
                }
            }

            // Logging untuk debugging
            console.log("Mengirim data booking:", bookingPayload);

            const response = await api.post('/admin-panel/bookings', bookingPayload);

            if (response.data.success) {
                toast.success('Booking berhasil dibuat!');
                // Simpan ID booking dalam session storage untuk referensi
                if (response.data.data.booking && response.data.data.booking.id) {
                    sessionStorage.setItem('last_booking_id', response.data.data.booking.id);
                }
                navigate(`/admin/bookings/${response.data.data.booking.id}`);
            } else {
                toast.error(response.data.message || 'Gagal membuat booking');
            }
        } catch (error) {
            console.error('Error creating booking:', error);

            // Tangani berbagai jenis error dengan lebih baik
            if (error.response) {
                // Error dengan respons dari server
                if (error.response.status === 422) {
                    // Error validasi
                    if (error.response.data.errors) {
                        // Tampilkan error validasi dengan format yang lebih baik
                        const errorMessages = Object.entries(error.response.data.errors)
                            .map(([field, messages]) => {
                                return `${field}: ${messages.join(', ')}`;
                            })
                            .join('\n');
                        toast.error(errorMessages);
                    } else {
                        toast.error(error.response.data.message || 'Validasi gagal');
                    }
                } else if (error.response.status === 403) {
                    toast.error('Anda tidak memiliki izin untuk membuat booking');
                } else if (error.response.status === 401) {
                    toast.error('Sesi Anda telah berakhir. Silakan login kembali');
                    // Arahkan ke halaman login jika diperlukan
                } else {
                    toast.error(error.response.data.message || `Error (${error.response.status}): Gagal membuat booking`);
                }
            } else if (error.request) {
                // Error jaringan - request dibuat tetapi tidak ada respons
                toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda');
            } else {
                // Error lainnya
                toast.error('Terjadi kesalahan: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Render form based on stage
    const renderForm = () => {
        switch (formStage) {
            case 1:
                return (
                    <form onSubmit={handleStage1Submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                                <select
                                    id="route_id"
                                    name="route_id"
                                    className={`block w-full px-3 py-2 border ${formErrors.route ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    value={bookingData.route_id}
                                    onChange={(e) => {
                                        setBookingData({ ...bookingData, route_id: e.target.value });
                                        setFormErrors({ ...formErrors, route: false });
                                    }}
                                    required
                                >
                                    <option value="">Pilih Rute</option>
                                    {routes.map(route => (
                                        <option key={route.id} value={route.id}>
                                            {route.origin} - {route.destination} ({formatCurrency(route.base_price)}/orang)
                                        </option>
                                    ))}
                                </select>
                                {formErrors.route && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.route}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Keberangkatan</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    className={`block w-full px-3 py-2 border ${formErrors.date ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    value={bookingData.date}
                                    onChange={(e) => {
                                        setBookingData({ ...bookingData, date: e.target.value });
                                        setFormErrors({ ...formErrors, date: false });
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {formErrors.date && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="passenger_count" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Penumpang</label>
                                <input
                                    type="number"
                                    id="passenger_count"
                                    name="passenger_count"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={bookingData.passenger_count}
                                    onChange={(e) => setBookingData({
                                        ...bookingData,
                                        passenger_count: parseInt(e.target.value) || 1,
                                        // Adjust passengers array based on new count
                                        passengers: Array(parseInt(e.target.value) || 1).fill().map((_, i) =>
                                            bookingData.passengers[i] || { name: '', id_number: '', id_type: 'KTP' }
                                        ).slice(0, parseInt(e.target.value) || 1)
                                    })}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">Kendaraan (Opsional)</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {vehicleCategories.map(category => {
                                        const selectedCategory = bookingData.vehicle_categories.find(vc => vc.id === category.id);
                                        const count = selectedCategory ? selectedCategory.count : 0;

                                        return (
                                            <div key={category.id} className="border border-gray-200 rounded-md p-3 bg-white shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-gray-800">{category.name}</span>
                                                    <span className="text-sm text-gray-600">{formatCurrency(category.base_price)}</span>
                                                </div>
                                                <div className="flex items-center mt-2">
                                                    <label htmlFor={`category_${category.id}`} className="block text-sm text-gray-700 mr-3">Jumlah:</label>
                                                    <input
                                                        type="number"
                                                        id={`category_${category.id}`}
                                                        className="block w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        value={count}
                                                        onChange={(e) => handleVehicleCategoryChange(category.id, parseInt(e.target.value) || 0)}
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={loadingSchedules}
                            >
                                {loadingSchedules ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mencari Jadwal...
                                    </>
                                ) : 'Cari Jadwal Tersedia'}
                            </button>
                        </div>
                    </form>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        {formatDate(bookingData.date)} • {bookingData.passenger_count} Penumpang
                                        {bookingData.vehicle_categories.length > 0 && ' • '}
                                        {bookingData.vehicle_categories.map((vc, idx) => {
                                            const category = vehicleCategories.find(c => c.id === vc.id);
                                            return category ? `${vc.count} ${category.name}${idx < bookingData.vehicle_categories.length - 1 ? ', ' : ''}` : '';
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-medium text-gray-800">Jadwal Tersedia</h3>

                        <div className="space-y-4">
                            {schedules.map(schedule => (
                                <div
                                    key={schedule.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <h4 className="font-semibold text-lg text-gray-900">{schedule.route.origin} - {schedule.route.destination}</h4>
                                                <p className="text-sm text-gray-600">Kapal: {schedule.ferry.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Harga Tiket:</p>
                                                <p className="font-bold text-lg text-green-600">{formatCurrency(schedule.total_price)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center space-x-2">
                                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <span className="text-gray-700">
                                                    {new Date(`2000-01-01T${schedule.departure_time}`).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -
                                                    {new Date(`2000-01-01T${schedule.arrival_time}`).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleSelectSchedule(schedule)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                Pilih Jadwal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {schedules.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada jadwal tersedia</h3>
                                    <p className="mt-1 text-sm text-gray-500">Silakan pilih rute atau tanggal lain.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={() => setFormStage(1)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Kembali
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <form onSubmit={handleCreateBooking} className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        {formatDate(bookingData.date)} • {selectedSchedule.departure_time.substring(0, 5)} - {selectedSchedule.arrival_time.substring(0, 5)} •
                                        {' '}{selectedSchedule.ferry.name} • {formatCurrency(selectedSchedule.total_price)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-800">Data Pelanggan</h3>

                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                                <div className="flex items-center mb-2">
                                    <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                                    <p className="text-sm font-medium text-blue-700">Pilih salah satu metode:</p>
                                </div>
                                <ul className="text-sm text-blue-600 list-disc list-inside">
                                    <li>Cari pengguna yang sudah terdaftar dari database <b>(opsional)</b></li>
                                    <li>Atau masukkan data pelanggan langsung untuk pembelian di loket</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${bookingData.customerType === 'registered'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setBookingData({ ...bookingData, customerType: 'registered', customer_name: '', customer_contact: '' })}
                                >
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="radio"
                                                id="option_registered"
                                                name="customer_type"
                                                value="registered"
                                                checked={bookingData.customerType === 'registered'}
                                                onChange={() => { }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="option_registered" className="font-medium text-gray-900">Pengguna Terdaftar</label>
                                            <p className="text-gray-500">Pilih opsi ini untuk mencari dan memilih pengguna yang sudah terdaftar dalam sistem. Tiket akan terhubung dengan akun pengguna.</p>
                                            <div className="mt-2 flex items-center text-blue-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-sm font-medium">Dapat mengakses tiket dari aplikasi</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${bookingData.customerType === 'counter'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    onClick={() => setBookingData({ ...bookingData, customerType: 'counter', user_id: '', user: null })}
                                >
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="radio"
                                                id="option_counter"
                                                name="customer_type"
                                                value="counter"
                                                checked={bookingData.customerType === 'counter'}
                                                onChange={() => { }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="option_counter" className="font-medium text-gray-900">Pembelian di Loket</label>
                                            <p className="text-gray-500">Pilih opsi ini untuk pembelian langsung di loket oleh pelanggan yang tidak memiliki akun terdaftar.</p>
                                            <div className="mt-2 flex items-center text-green-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">Cetak tiket fisik di loket</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {bookingData.customerType === 'registered' && (
                                <div className="bg-white shadow-sm rounded-md p-4 border border-gray-200">
                                    <div className="flex items-center mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <h4 className="text-md font-medium text-gray-700">Cari Pengguna Terdaftar</h4>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Cari berdasarkan nama, email, atau telepon"
                                            className={`block w-full pl-10 pr-12 py-2 border ${formErrors.user || searchError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                            onChange={handleSearchUser}
                                            value={searchTerm}
                                            disabled={bookingData.user_id !== ''}
                                        />

                                        {searchingUser && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Ketik minimal 3 karakter untuk memulai pencarian</span>
                                    </div>

                                    {searchError && !searchingUser && (
                                        <p className="mt-1 text-sm text-red-600">{searchError}</p>
                                    )}

                                    {searchTerm.length > 0 && searchTerm.length < 3 && (
                                        <p className="mt-1 text-sm text-gray-500">Masukkan minimal 3 karakter untuk memulai pencarian</p>
                                    )}

                                    {formErrors.user && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.user}</p>
                                    )}

                                    {searchResults.length > 0 && !bookingData.user_id && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden">
                                            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                                                {searchResults.map(user => (
                                                    <li
                                                        key={user.id}
                                                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleSelectUser(user)}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                                {user.phone && <p className="text-sm text-gray-500 truncate">{user.phone}</p>}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {bookingData.customerType === 'registered' && bookingData.user && (
                                <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-2">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{bookingData.user.name}</p>
                                            <p className="text-sm text-gray-600">{bookingData.user.email}</p>
                                            {bookingData.user.phone && <p className="text-sm text-gray-600">{bookingData.user.phone}</p>}
                                        </div>
                                        <button
                                            type="button"
                                            className="text-sm text-red-600 hover:text-red-800"
                                            onClick={() => setBookingData({ ...bookingData, user_id: '', user: null })}
                                        >
                                            Ganti
                                        </button>
                                    </div>
                                </div>
                            )}

                            {bookingData.customerType === 'counter' && (
                                <div className="bg-white shadow-sm rounded-md p-4 border border-gray-200">
                                    <div className="flex items-center mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <h4 className="text-md font-medium text-gray-700">Data Pelanggan Loket</h4>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                                        <div className="flex items-center text-sm text-blue-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Masukkan data pembeli untuk pembelian di loket. Tiket akan diterbitkan atas nama ini dan <strong>tidak terhubung dengan akun pengguna</strong>.</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nama Pelanggan <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={bookingData.customer_name || ''}
                                                    onChange={(e) => setBookingData({ ...bookingData, customer_name: e.target.value })}
                                                    className={`block w-full pl-10 px-3 py-2 border ${formErrors.customer ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                    required={bookingData.customerType === 'counter'}
                                                    placeholder="Masukkan nama lengkap"
                                                />
                                            </div>
                                            {formErrors.customer && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    {formErrors.customer}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nomor Kontak <span className="text-gray-500">(Opsional)</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={bookingData.customer_contact || ''}
                                                    onChange={(e) => setBookingData({ ...bookingData, customer_contact: e.target.value })}
                                                    className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Nomor telepon/HP"
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Digunakan untuk menghubungi pelanggan jika diperlukan</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-800">Data Penumpang</h3>
                                {bookingData.passengers.length < bookingData.passenger_count && (
                                    <button
                                        type="button"
                                        onClick={addPassenger}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Tambah Penumpang
                                    </button>
                                )}
                            </div>

                            {formErrors.passengers && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{formErrors.passengers}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bookingData.passengers.map((passenger, index) => (
                                <div key={index} className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-gray-700">Penumpang {index + 1}</h4>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removePassenger(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={passenger.name}
                                                onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Identitas</label>
                                            <select
                                                value={passenger.id_type}
                                                onChange={(e) => updatePassenger(index, 'id_type', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="KTP">KTP</option>
                                                <option value="SIM">SIM</option>
                                                <option value="PASSPORT">Passport</option>
                                                <option value="LAINNYA">Lainnya</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Identitas (Opsional)</label>
                                            <input
                                                type="text"
                                                value={passenger.id_number || ''}
                                                onChange={(e) => updatePassenger(index, 'id_number', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-800">Kendaraan (Opsional)</h3>
                                {bookingData.vehicle_categories.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={addVehicle}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Tambah Kendaraan
                                    </button>
                                )}
                            </div>

                            {formErrors.vehicles && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{formErrors.vehicles}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bookingData.vehicles.map((vehicle, index) => (
                                <div key={index} className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-gray-700">Kendaraan {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeVehicle(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kendaraan</label>
                                            <select
                                                value={vehicle.type}
                                                onChange={(e) => updateVehicle(index, 'type', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="MOTORCYCLE">Sepeda Motor</option>
                                                <option value="CAR">Mobil</option>
                                                <option value="BUS">Bus</option>
                                                <option value="TRUCK">Truk</option>
                                                <option value="PICKUP">Pickup</option>
                                                <option value="TRONTON">Tronton</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Kendaraan</label>
                                            <select
                                                value={vehicle.category_id}
                                                onChange={(e) => updateVehicle(index, 'category_id', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Pilih Kategori</option>
                                                {vehicleCategories
                                                    .filter(cat => cat.vehicle_type === vehicle.type)
                                                    .map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name} - {formatCurrency(category.base_price)}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                                            <input
                                                type="text"
                                                value={vehicle.license_plate}
                                                onChange={(e) => updateVehicle(index, 'license_plate', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Merk (Opsional)</label>
                                            <input
                                                type="text"
                                                value={vehicle.brand || ''}
                                                onChange={(e) => updateVehicle(index, 'brand', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Model (Opsional)</label>
                                            <input
                                                type="text"
                                                value={vehicle.model || ''}
                                                onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {bookingData.vehicle_categories.length > 0 && bookingData.vehicles.length === 0 && (
                                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                Anda telah memilih kendaraan pada tahap sebelumnya. Silakan tambahkan data kendaraan dengan menekan tombol "Tambah Kendaraan".
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-800">Metode Pembayaran</h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="flex p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="CASH"
                                            checked={bookingData.payment_method === 'CASH'}
                                            onChange={() => setBookingData({ ...bookingData, payment_method: 'CASH' })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Tunai</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="TRANSFER"
                                            checked={bookingData.payment_method === 'TRANSFER'}
                                            onChange={() => setBookingData({ ...bookingData, payment_method: 'TRANSFER' })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Transfer</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="DEBIT"
                                            checked={bookingData.payment_method === 'DEBIT'}
                                            onChange={() => setBookingData({ ...bookingData, payment_method: 'DEBIT' })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Debit</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="CREDIT"
                                            checked={bookingData.payment_method === 'CREDIT'}
                                            onChange={() => setBookingData({ ...bookingData, payment_method: 'CREDIT' })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Kartu Kredit</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Ringkasan Pemesanan */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Ringkasan Pemesanan</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Informasi Jadwal</h4>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Rute:</span> {bookingData.route_info}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Tanggal:</span> {formatDate(bookingData.date)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Waktu:</span> {bookingData.departure_time} - {bookingData.arrival_time}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Kapal:</span> {bookingData.ferry_name}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Informasi Penumpang & Kendaraan</h4>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Jumlah Penumpang:</span> {bookingData.passenger_count}
                                    </p>
                                    {bookingData.vehicle_categories.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Kendaraan:</p>
                                            <ul className="text-sm text-gray-600 list-disc list-inside">
                                                {bookingData.vehicle_categories.map((vc, idx) => (
                                                    <li key={idx}>{vc.count}x {vc.name} ({formatCurrency(vc.price * vc.count)})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Subtotal Penumpang ({bookingData.passenger_count}x):</span>
                                    <span className="font-medium">{formatCurrency(selectedSchedule?.passenger_price * bookingData.passenger_count || 0)}</span>
                                </div>

                                {bookingData.vehicle_categories.length > 0 && (
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-gray-700">Subtotal Kendaraan:</span>
                                        <span className="font-medium">{formatCurrency(selectedSchedule?.vehicle_price || 0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-2 text-lg font-bold">
                                    <span className="text-gray-800">Total:</span>
                                    <span className="text-blue-600">{formatCurrency(bookingData.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormStage(2)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Kembali
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : 'Buat Booking'}
                                </button>
                            </div>
                        </div>
                    </form>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Buat Booking Baru</h1>
                            <p className="mt-1 text-blue-100">Buat pemesanan tiket untuk pelanggan di loket atau pengguna terdaftar</p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">Booking yang dibuat oleh admin akan langsung berstatus <strong>CONFIRMED</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-center">
                        <div className="flex items-center mb-2 md:mb-0">
                            <div className={`flex items-center justify-center rounded-full h-10 w-10 ${formStage >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                1
                            </div>
                            <div className="ml-3">
                                <span className={`text-sm font-medium ${formStage >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Pilih Rute</span>
                                <p className="text-xs text-gray-500 hidden md:block">Tentukan rute dan tanggal</p>
                            </div>
                        </div>
                        <div className={`hidden md:block flex-1 h-0.5 mx-4 ${formStage >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className="flex items-center mb-2 md:mb-0">
                            <div className={`flex items-center justify-center rounded-full h-10 w-10 ${formStage >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                2
                            </div>
                            <div className="ml-3">
                                <span className={`text-sm font-medium ${formStage >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Pilih Jadwal</span>
                                <p className="text-xs text-gray-500 hidden md:block">Pilih jadwal keberangkatan</p>
                            </div>
                        </div>
                        <div className={`hidden md:block flex-1 h-0.5 mx-4 ${formStage >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center rounded-full h-10 w-10 ${formStage >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                3
                            </div>
                            <div className="ml-3">
                                <span className={`text-sm font-medium ${formStage >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Data Penumpang</span>
                                <p className="text-xs text-gray-500 hidden md:block">Masukkan data penumpang dan pembayaran</p>
                            </div>
                        </div>
                    </div>

                    {/* Deskripsi tahap saat ini */}
                    <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">
                                {formStage === 1 && "Langkah 1: Pilih rute, tanggal keberangkatan, jumlah penumpang, dan kendaraan (opsional)."}
                                {formStage === 2 && "Langkah 2: Pilih jadwal keberangkatan yang tersedia berdasarkan kriteria yang Anda pilih sebelumnya."}
                                {formStage === 3 && "Langkah 3: Masukkan data penumpang, kendaraan, dan metode pembayaran untuk menyelesaikan booking."}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && formStage === 1 && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                )}

                {/* Form content based on stage */}
                {!loading && renderForm()}
            </div>
        </div>
    );
};

export default BookingCreate;