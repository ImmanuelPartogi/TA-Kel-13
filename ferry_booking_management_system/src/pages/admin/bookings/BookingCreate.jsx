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
    const [formStage, setFormStage] = useState(1); // 1: Pilih rute & jadwal, 2: Input data penumpang, 3: Pembayaran

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
        // Step 1: Pemilihan rute & jadwal
        route_id: '',
        date: new Date().toISOString().split('T')[0], // Default ke hari ini
        schedule_id: '',
        schedule_date_id: '',
        ferry_name: '',
        route_info: '',
        departure_time: '',
        arrival_time: '',

        // Step 2: Data penumpang dan kendaraan
        passenger_count: 1,
        adult_count: 1,
        child_count: 0,
        infant_count: 0,
        passengers: [{
            name: '',
            id_number: '',
            id_type: 'KTP',
            passenger_type: 'ADULT'
        }],
        vehicle_categories: [],
        vehicle_count: 0,
        vehicles: [],

        // Data untuk pelanggan
        user_id: '',
        user: null,
        customerType: 'counter', // Default ke pembelian di loket
        customer_name: '',
        customer_contact: '',

        // Step 3: Informasi pembayaran
        payment_method: 'CASH',
        payment_status: 'PENDING',
        total_amount: 0,
        passenger_price: 0, // Harga per penumpang
        vehicle_price: 0,    // Total harga kendaraan

        // Metadata
        created_by: 'ADMIN',
        booking_channel: 'COUNTER',
        notes: ''
    });

    // Fetch initial data with retry logic
    useEffect(() => {
        const fetchData = async (retryCount = 0) => {
            setLoading(true);
            try {
                const response = await api.get('/admin-panel/bookings/create');

                if (response.data.success) {
                    console.log("Routes data fetched:", response.data.data.routes);
                    setRoutes(response.data.data.routes || []);
                    setVehicleCategories(response.data.data.vehicle_categories || []);
                } else {
                    // Retry logic if no routes data
                    if ((!response.data.data?.routes || response.data.data.routes.length === 0) && retryCount < 3) {
                        console.log(`Retry attempt ${retryCount + 1} for fetching routes data...`);
                        setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
                        return;
                    }

                    toast.error(response.data.message || 'Gagal memuat data rute');
                }
            } catch (error) {
                console.error('Error fetching booking form data:', error);

                // Retry on network error
                if (retryCount < 3) {
                    console.log(`Retry attempt ${retryCount + 1} after error...`);
                    setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
                    return;
                }

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

    // Format time
    const formatTime = (timeString) => {
        if (!timeString) return '00:00';
        // Memastikan format waktu HH:MM
        return timeString.substring(0, 5);
    };

    // Fungsi untuk menghitung total harga kendaraan
    const calculateVehicleTotalPrice = (vehicleCategories) => {
        // Tambahkan logging untuk debug
        console.log("Menghitung total kendaraan dari kategori:", vehicleCategories);

        // Gunakan parseFloat dan Number untuk memastikan nilai adalah angka
        const total = vehicleCategories.reduce((total, category) => {
            const price = parseFloat(category.price) || 0;
            const count = parseInt(category.count) || 0;
            const subtotal = price * count;

            console.log(`Kategori ${category.name}: ${price} x ${count} = ${subtotal}`);
            return total + subtotal;
        }, 0);

        console.log("Total harga kendaraan:", total);
        return total;
    };

    // PERBAIKAN: Handle passenger count change
    const handlePassengerCountChange = (type, value) => {
        // Validasi nilai minimum
        let validValue = value;
        if (type === 'adult_count' && value < 1) validValue = 1;
        if ((type === 'child_count' || type === 'infant_count') && value < 0) validValue = 0;

        // Update state menggunakan functional update untuk memastikan state yang tepat
        setBookingData(prev => {
            // Hitung total penumpang baru berdasarkan perubahan tipe penumpang saat ini
            let newAdultCount = type === 'adult_count' ? validValue : prev.adult_count;
            let newChildCount = type === 'child_count' ? validValue : prev.child_count;
            let newInfantCount = type === 'infant_count' ? validValue : prev.infant_count;

            const totalPassengers = newAdultCount + newChildCount + newInfantCount;

            // Buat array passengers baru berdasarkan jumlah penumpang tiap kategori
            let newPassengers = [];

            // Dewasa
            for (let i = 0; i < newAdultCount; i++) {
                const existingPassenger = prev.passengers.find(p => p.passenger_type === 'ADULT' && prev.passengers.indexOf(p) === i);
                if (existingPassenger) {
                    newPassengers.push(existingPassenger);
                } else {
                    newPassengers.push({ name: '', id_number: '', id_type: 'KTP', passenger_type: 'ADULT' });
                }
            }

            // Anak-anak
            for (let i = 0; i < newChildCount; i++) {
                const existingPassenger = prev.passengers.find(p => p.passenger_type === 'CHILD' &&
                    prev.passengers.filter(ep => ep.passenger_type === 'CHILD').indexOf(p) === i);
                if (existingPassenger) {
                    newPassengers.push(existingPassenger);
                } else {
                    newPassengers.push({ name: '', id_number: '', id_type: 'KTP', passenger_type: 'CHILD' });
                }
            }

            // Bayi
            for (let i = 0; i < newInfantCount; i++) {
                const existingPassenger = prev.passengers.find(p => p.passenger_type === 'INFANT' &&
                    prev.passengers.filter(ep => ep.passenger_type === 'INFANT').indexOf(p) === i);
                if (existingPassenger) {
                    newPassengers.push(existingPassenger);
                } else {
                    newPassengers.push({ name: '', id_number: '', id_type: 'KTP', passenger_type: 'INFANT' });
                }
            }

            // Hitung ulang harga total jika ada jadwal yang dipilih
            let newTotalAmount = prev.total_amount;
            if (prev.passenger_price > 0) {
                const passengerTotalPrice = prev.passenger_price * totalPassengers;
                newTotalAmount = passengerTotalPrice + prev.vehicle_price;
            }

            return {
                ...prev,
                [type]: validValue,
                passenger_count: totalPassengers,
                passengers: newPassengers,
                total_amount: newTotalAmount
            };
        });

        // Jika sudah memilih route_id dan tanggal, cari jadwal lagi ketika jumlah penumpang berubah
        // Gunakan setTimeout untuk memastikan state sudah diupdate
        setTimeout(() => {
            if (bookingData.route_id && bookingData.date) {
                fetchSchedules();
            }
        }, 0);
    };

    // PERBAIKAN: useEffect untuk memperbarui total harga saat jumlah penumpang berubah
    useEffect(() => {
        // Ini akan dijalankan ketika jumlah penumpang berubah dan ada jadwal yang dipilih
        if (selectedSchedule && (bookingData.adult_count > 0 || bookingData.child_count > 0 || bookingData.infant_count > 0)) {
            const totalPassengers = bookingData.adult_count + bookingData.child_count + bookingData.infant_count;
            const passengerTotalPrice = selectedSchedule.passenger_price * totalPassengers;
            const vehicleTotalPrice = calculateVehicleTotalPrice(bookingData.vehicle_categories);
            const newTotalAmount = passengerTotalPrice + vehicleTotalPrice;

            console.log("Updating price based on passenger count change:", {
                passengerPrice: selectedSchedule.passenger_price,
                totalPassengers,
                passengerTotal: passengerTotalPrice,
                vehicleTotal: vehicleTotalPrice,
                newTotal: newTotalAmount,
                currentTotal: bookingData.total_amount
            });

            if (bookingData.total_amount !== newTotalAmount) {
                setBookingData(prev => ({
                    ...prev,
                    total_amount: newTotalAmount,
                    vehicle_price: vehicleTotalPrice // Pastikan vehicle_price diperbarui
                }));
            }
        }
    }, [bookingData.adult_count, bookingData.child_count, bookingData.infant_count, selectedSchedule, bookingData.vehicle_categories]);

    // PERBAIKAN: Fungsi fetchSchedules 
    const fetchSchedules = async () => {
        if (!bookingData.route_id || !bookingData.date) {
            return;
        }

        setLoadingSchedules(true);
        setSchedules([]);
        // Reset selected schedule ketika mencari jadwal baru
        setSelectedSchedule(null);

        try {
            // Dapatkan total penumpang terbaru
            const totalPassengers = bookingData.adult_count + bookingData.child_count + bookingData.infant_count;
            const params = {
                route_id: bookingData.route_id,
                date: bookingData.date,
                passenger_count: totalPassengers
            };

            console.log('Mencari jadwal dengan parameter:', params);

            const response = await api.get('/admin-panel/bookings/get-schedules', { params });

            console.log('Schedule response:', response.data);

            if (response.data.success) {
                setSchedules(response.data.data);
            } else {
                toast.error(response.data.message || 'Gagal mendapatkan jadwal yang tersedia');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            const errorMessage = error.response?.data?.message ||
                'Gagal memuat jadwal tersedia. Silakan coba lagi.';
            toast.error(errorMessage);
        } finally {
            setLoadingSchedules(false);
        }
    };

    // Handler untuk perubahan tanggal atau rute
    useEffect(() => {
        if (bookingData.route_id && bookingData.date) {
            fetchSchedules();
        }
    }, [bookingData.route_id, bookingData.date]);

    // PERBAIKAN: Handle schedule selection
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

        // Dapatkan total penumpang terbaru untuk validasi dan perhitungan harga
        const totalPassengers = bookingData.adult_count + bookingData.child_count + bookingData.infant_count;

        // Periksa ketersediaan kapasitas
        if (schedule.available_passenger < totalPassengers) {
            toast.error(`Kapasitas penumpang tidak mencukupi. Tersedia: ${schedule.available_passenger}, dibutuhkan: ${totalPassengers}`);
            return;
        }

        // Debug info
        console.log("Selected schedule data:", schedule);
        console.log("Current passenger counts:", {
            adult: bookingData.adult_count,
            child: bookingData.child_count,
            infant: bookingData.infant_count,
            total: totalPassengers
        });

        // Hitung total harga dengan benar
        const vehicleTotalPrice = calculateVehicleTotalPrice(bookingData.vehicle_categories);
        const passengerTotalPrice = schedule.passenger_price * totalPassengers;
        const totalAmount = passengerTotalPrice + vehicleTotalPrice;

        console.log("Price calculation:", {
            passengerPrice: schedule.passenger_price,
            totalPassengers,
            passengerTotal: passengerTotalPrice,
            vehicleTotal: vehicleTotalPrice,
            totalAmount
        });

        // Simpan data jadwal dengan informasi lengkap
        setSelectedSchedule(schedule);

        // Gunakan functional update untuk memastikan state yang konsisten
        setBookingData(prev => ({
            ...prev,
            schedule_id: schedule.id,
            schedule_date_id: schedule.schedule_date_id,
            total_amount: totalAmount,
            passenger_price: schedule.passenger_price || 0,
            vehicle_price: vehicleTotalPrice,
            ferry_name: schedule.ferry?.name || '',
            route_info: `${schedule.route?.origin || ''} - ${schedule.route?.destination || ''}`,
            departure_time: schedule.departure_time,
            arrival_time: schedule.arrival_time
        }));

        // Pindah ke langkah 2
        setFormStage(2);
    };

    // Handle stage 2 validation and proceed to payment
    const handleStage2Submit = () => {
        // Validasi data penumpang dan kendaraan
        const errors = {};

        // Validasi pengguna atau data pelanggan loket
        if (bookingData.customerType === 'registered' && !bookingData.user_id) {
            errors.user = 'Harap pilih pengguna terlebih dahulu';
        } else if (bookingData.customerType === 'counter' && !bookingData.customer_name) {
            errors.customer = 'Harap isi nama pelanggan';
        }

        // Validasi jumlah kendaraan sesuai dengan kategori yang dipilih
        const totalVehicleCount = bookingData.vehicle_categories.reduce((sum, vc) => sum + vc.count, 0);
        if (totalVehicleCount > 0 && totalVehicleCount !== bookingData.vehicles.length) {
            errors.vehicles = `Jumlah kendaraan (${bookingData.vehicles.length}) tidak sesuai dengan jumlah yang dipilih (${totalVehicleCount})`;
        }

        // Validasi detail kendaraan
        const invalidVehicles = bookingData.vehicles.filter(v => !v.category_id || !v.license_plate.trim());
        if (invalidVehicles.length > 0) {
            errors.vehicles = `Harap lengkapi semua data kendaraan (${invalidVehicles.length} kendaraan belum lengkap)`;
        }

        // Validasi kategori kendaraan
        const vehiclesWithoutCategory = bookingData.vehicles.filter(v => !v.category_id);
        if (vehiclesWithoutCategory.length > 0) {
            errors.vehicles = `Harap pilih kategori untuk semua kendaraan (${vehiclesWithoutCategory.length} kendaraan belum memiliki kategori)`;
        }

        // Update state error
        setFormErrors({
            ...formErrors,
            ...errors
        });

        // Jika ada error, tampilkan error pertama
        if (Object.keys(errors).length > 0) {
            toast.error(Object.values(errors)[0]);
            return;
        }

        // Hitung ulang total harga untuk memastikan akurasi
        if (selectedSchedule) {
            const totalPassengers = bookingData.adult_count + bookingData.child_count + bookingData.infant_count;
            const passengerPrice = selectedSchedule.passenger_price * totalPassengers;
            const vehiclePrice = calculateVehicleTotalPrice(bookingData.vehicle_categories);
            const totalAmount = passengerPrice + vehiclePrice;

            console.log("Stage 2 Submit - Perhitungan Akhir:", {
                passengerPrice,
                vehiclePrice,
                totalAmount,
                categories: bookingData.vehicle_categories
            });

            setBookingData(prev => ({
                ...prev,
                passenger_price: selectedSchedule.passenger_price,
                vehicle_price: vehiclePrice,
                total_amount: totalAmount
            }));
        }

        // Jika semua validasi sukses, pindah ke langkah 3
        setFormStage(3);
    };

    // Pastikan total harga sudah diperbarui pada stage 3
    useEffect(() => {
        if (formStage === 3 && selectedSchedule) {
            // PERBAIKAN: Hitung ulang total penumpang dan total harga dengan lebih eksplisit
            const totalPassengers = bookingData.adult_count + bookingData.child_count + bookingData.infant_count;
            const passengerPrice = selectedSchedule.passenger_price;
            const passengerTotalPrice = passengerPrice * totalPassengers;
            const vehiclePrice = calculateVehicleTotalPrice(bookingData.vehicle_categories);
            const newTotal = passengerTotalPrice + vehiclePrice;

            // PERBAIKAN: Log detail perhitungan untuk membantu debugging
            console.log("Stage 3 price calculation:", {
                stage: formStage,
                passengerPrice,
                totalPassengers,
                passengerTotal: passengerTotalPrice,
                vehiclePrice,
                newTotal,
                currentTotal: bookingData.total_amount
            });

            if (Math.abs(newTotal - bookingData.total_amount) > 0.01) {
                setBookingData(prev => ({
                    ...prev,
                    passenger_price: passengerPrice,
                    vehicle_price: vehiclePrice,
                    total_amount: newTotal
                }));
            }
        }
    }, [formStage, selectedSchedule, bookingData.adult_count, bookingData.child_count, bookingData.infant_count, bookingData.vehicle_categories]);

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

    // PERBAIKAN: Fungsi untuk menangani klik tombol Tambah Kendaraan
    const handleAddVehicleClick = () => {
        // Tambahkan kendaraan baru
        const newVehicle = {
            type: '',
            category_id: '',
            license_plate: '',
            brand: '',
            model: ''
        };

        // Update state dengan kendaraan baru
        setBookingData(prev => {
            // Tambahkan kendaraan baru
            const updatedVehicles = [...prev.vehicles, newVehicle];
            // Hitung ulang total kendaraan
            const vehicleCount = updatedVehicles.length;

            // Hitung ulang total harga (tetap gunakan categories yang ada)
            const vehicleTotalPrice = calculateVehicleTotalPrice(prev.vehicle_categories);
            const totalPassengers = prev.adult_count + prev.child_count + prev.infant_count;
            const passengerPrice = prev.passenger_price * totalPassengers;
            const totalAmount = passengerPrice + vehicleTotalPrice;

            return {
                ...prev,
                vehicles: updatedVehicles,
                vehicle_count: vehicleCount,
                vehicle_price: vehicleTotalPrice,
                total_amount: totalAmount
            };
        });
    };

    // PERBAIKAN: Fungsi untuk memperbarui data kendaraan yang sudah ada
    const updateVehicle = (index, field, value) => {
        setBookingData(prev => {
            const updatedVehicles = [...prev.vehicles];
            let updatedCategories = [...prev.vehicle_categories];

            // Logika khusus untuk jenis field tertentu
            if (field === 'type') {
                // Jika mengubah tipe, coba temukan kategori yang cocok
                const matchingCategory = vehicleCategories.find(
                    cat => cat.vehicle_type === value
                );

                updatedVehicles[index] = {
                    ...updatedVehicles[index],
                    [field]: value,
                    category_id: matchingCategory ? matchingCategory.id : ''
                };
            } else if (field === 'category_id') {
                // Jika memilih kategori, tambahkan ke array vehicle_categories jika belum ada
                const selectedCategory = vehicleCategories.find(cat => cat.id === value);

                if (selectedCategory) {
                    // Tambahkan log untuk debugging
                    console.log("Kategori kendaraan dipilih:", selectedCategory);

                    // Periksa kategori kendaraan saat ini (jika ada) untuk mengurangi count-nya
                    const currentVehicle = updatedVehicles[index];
                    const currentCategoryId = currentVehicle.category_id;

                    if (currentCategoryId && currentCategoryId !== value) {
                        // Kurangi count untuk kategori lama
                        const oldCategoryIndex = updatedCategories.findIndex(vc => vc.id === currentCategoryId);
                        if (oldCategoryIndex >= 0) {
                            if (updatedCategories[oldCategoryIndex].count > 1) {
                                // Kurangi count
                                updatedCategories[oldCategoryIndex] = {
                                    ...updatedCategories[oldCategoryIndex],
                                    count: updatedCategories[oldCategoryIndex].count - 1
                                };
                            } else {
                                // Hapus kategori jika count = 1
                                updatedCategories.splice(oldCategoryIndex, 1);
                            }
                        }
                    }

                    // Periksa apakah kategori baru sudah ada dalam vehicle_categories
                    const existingCategoryIndex = updatedCategories.findIndex(vc => vc.id === value);

                    if (existingCategoryIndex >= 0) {
                        // Update count jika kategori sudah ada
                        updatedCategories[existingCategoryIndex] = {
                            ...updatedCategories[existingCategoryIndex],
                            count: updatedCategories[existingCategoryIndex].count + 1
                        };
                    } else {
                        // Tambahkan kategori baru dan pastikan semua properti terisi
                        updatedCategories.push({
                            id: selectedCategory.id,
                            count: 1,
                            type: selectedCategory.vehicle_type,
                            name: selectedCategory.name,
                            price: parseFloat(selectedCategory.base_price)  // Pastikan ini angka bukan string
                        });
                    }

                    // Update vehicle dengan category_id baru
                    updatedVehicles[index] = {
                        ...updatedVehicles[index],
                        [field]: value
                    };

                    // Log untuk debugging
                    console.log("vehicle_categories setelah update:", updatedCategories);
                }
            } else {
                // Update untuk field lain (license_plate, brand, model, dll)
                updatedVehicles[index] = {
                    ...updatedVehicles[index],
                    [field]: value
                };
            }

            // Selalu hitung ulang total harga untuk setiap perubahan
            const vehicleTotalPrice = calculateVehicleTotalPrice(updatedCategories);
            const totalPassengers = prev.adult_count + prev.child_count + prev.infant_count;
            const passengerPrice = prev.passenger_price * totalPassengers;
            const totalAmount = passengerPrice + vehicleTotalPrice;

            console.log("Perhitungan harga setelah update vehicle:", {
                vehicleCategories: updatedCategories,
                vehicleTotalPrice,
                totalAmount
            });

            return {
                ...prev,
                vehicles: updatedVehicles,
                vehicle_categories: updatedCategories,
                vehicle_price: vehicleTotalPrice,
                total_amount: totalAmount
            };
        });

        // Reset error for vehicles if necessary
        if ((field === 'license_plate' || field === 'category_id') && value.trim) {
            if (value.trim && value.trim() !== '') {
                setFormErrors({
                    ...formErrors,
                    vehicles: false
                });
            }
        }
    };

    // PERBAIKAN: Fungsi untuk menghapus kendaraan
    const removeVehicle = (index) => {
        setBookingData(prev => {
            const updatedVehicles = [...prev.vehicles];

            // Simpan kategori kendaraan yang akan dihapus
            const vehicleToRemove = updatedVehicles[index];
            const categoryId = vehicleToRemove.category_id;

            // Hapus kendaraan
            updatedVehicles.splice(index, 1);

            // Update vehicle_categories dengan mengurangi count
            let updatedCategories = [...prev.vehicle_categories];

            if (categoryId) {
                const categoryIndex = updatedCategories.findIndex(vc => vc.id === categoryId);

                if (categoryIndex >= 0) {
                    console.log(`Mengurangi count untuk kategori ${updatedCategories[categoryIndex].name}`);

                    if (updatedCategories[categoryIndex].count > 1) {
                        // Kurangi count jika lebih dari 1
                        updatedCategories[categoryIndex] = {
                            ...updatedCategories[categoryIndex],
                            count: updatedCategories[categoryIndex].count - 1
                        };
                    } else {
                        // Hapus kategori jika count = 1
                        console.log(`Menghapus kategori ${updatedCategories[categoryIndex].name}`);
                        updatedCategories.splice(categoryIndex, 1);
                    }
                }
            }

            // Hitung ulang total harga
            const vehicleTotalPrice = calculateVehicleTotalPrice(updatedCategories);
            console.log("Harga kendaraan setelah penghapusan:", vehicleTotalPrice);

            const totalPassengers = prev.adult_count + prev.child_count + prev.infant_count;
            const passengerPrice = prev.passenger_price * totalPassengers;
            const totalAmount = passengerPrice + vehicleTotalPrice;

            return {
                ...prev,
                vehicles: updatedVehicles,
                vehicle_categories: updatedCategories,
                vehicle_count: updatedVehicles.length,
                vehicle_price: vehicleTotalPrice,
                total_amount: totalAmount
            };
        });
    };

    // Create booking dengan validasi dan penanganan error yang lebih baik
    const handleCreateBooking = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Hitung ulang sekali lagi untuk memastikan
            const totalPassengers = bookingData.adult_count + bookingData.child_count + bookingData.infant_count;
            const passengerTotalPrice = bookingData.passenger_price * totalPassengers;
            let vehicleTotalPrice = calculateVehicleTotalPrice(bookingData.vehicle_categories);
            let totalAmount = passengerTotalPrice + vehicleTotalPrice;

            // Periksa apakah ada kendaraan tetapi harga kendaraan 0
            if (bookingData.vehicles.length > 0 && vehicleTotalPrice === 0) {
                console.error("PERINGATAN: Ada kendaraan tetapi harga total kendaraan 0!");

                // Coba hitung ulang harga kendaraan dari data vehicles
                const missingCategories = [];
                bookingData.vehicles.forEach(vehicle => {
                    if (vehicle.category_id) {
                        const category = vehicleCategories.find(c => c.id === vehicle.category_id);
                        if (category) {
                            const existingCatIndex = missingCategories.findIndex(mc => mc.id === category.id);
                            if (existingCatIndex >= 0) {
                                missingCategories[existingCatIndex].count += 1;
                            } else {
                                missingCategories.push({
                                    id: category.id,
                                    count: 1,
                                    type: category.vehicle_type,
                                    name: category.name,
                                    price: parseFloat(category.base_price)
                                });
                            }
                        }
                    }
                });

                if (missingCategories.length > 0) {
                    const recalculatedPrice = calculateVehicleTotalPrice(missingCategories);
                    console.log("Kategori yang seharusnya ada:", missingCategories);
                    console.log("Harga kendaraan yang seharusnya:", recalculatedPrice);

                    // Gunakan harga yang dihitung ulang
                    vehicleTotalPrice = recalculatedPrice;
                    totalAmount = passengerTotalPrice + recalculatedPrice;

                    // Update state untuk memperbaiki kategori kendaraan
                    setBookingData(prev => ({
                        ...prev,
                        vehicle_categories: missingCategories,
                        vehicle_price: recalculatedPrice,
                        total_amount: totalAmount
                    }));
                }
            }

            // Log data vehicle_categories final
            const vehicleCategoryData = bookingData.vehicle_categories.map(vc => ({
                id: vc.id,
                name: vc.name,
                count: vc.count,
                price: vc.price,
                total: vc.count * vc.price
            }));
            console.log("Data kategori kendaraan final:", vehicleCategoryData);
            console.log("Harga total kendaraan final:", vehicleTotalPrice);

            // Persiapkan data yang akan dikirim dengan format yang benar
            const bookingPayload = {
                schedule_id: bookingData.schedule_id,
                schedule_date_id: bookingData.schedule_date_id,
                departure_date: bookingData.date,
                passenger_count: bookingData.passenger_count,
                vehicles: bookingData.vehicles.map(v => ({
                    type: v.type,
                    category_id: v.category_id,
                    license_plate: v.license_plate.trim(),
                    brand: v.brand ? v.brand.trim() : null,
                    model: v.model ? v.model.trim() : null
                })),
                payment_method: bookingData.payment_method,
                total_amount: totalAmount, // Gunakan nilai yang baru dihitung
                vehicle_price: vehicleTotalPrice, // Gunakan nilai yang baru dihitung
                passenger_price: bookingData.passenger_price * totalPassengers // Pastikan ini dihitung dengan benar
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

            // Validasi final untuk memastikan data kendaraan lengkap
            if (bookingData.vehicles.length > 0) {
                const invalidVehicles = bookingData.vehicles.filter(v => !v.category_id || !v.license_plate);
                if (invalidVehicles.length > 0) {
                    toast.error(`Terdapat ${invalidVehicles.length} kendaraan dengan data tidak lengkap`);
                    console.error("Kendaraan tidak valid:", invalidVehicles);
                    setLoading(false);
                    return;
                }

                // Pastikan harga kendaraan tidak 0 jika ada kendaraan
                if (vehicleTotalPrice <= 0) {
                    toast.error('Terjadi kesalahan pada perhitungan harga kendaraan. Silakan periksa kembali.');
                    console.error('Kesalahan perhitungan harga kendaraan:', {
                        vehicles: bookingData.vehicles,
                        vehicle_categories: bookingData.vehicle_categories,
                        calculated_price: vehicleTotalPrice
                    });
                    setLoading(false);
                    return;
                }
            }

            // Logging untuk debugging
            console.log("Data final yang dikirim ke server:", {
                vehicles: bookingPayload.vehicles,
                vehicle_categories: bookingData.vehicle_categories,
                vehicle_price: vehicleTotalPrice,
                passenger_price: bookingData.passenger_price * totalPassengers,
                total_amount: totalAmount
            });

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

    // PERBAIKAN: Render Stage 1 - Pilih Rute & Jadwal
    const renderStage1 = () => {
        // Pada awal fungsi renderStage1()
        if (!Array.isArray(routes) || routes.length === 0) {
            return (
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
                    <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-yellow-800">Data Rute Tidak Tersedia</h3>
                    <p className="mt-1 text-yellow-700">Sistem tidak dapat memuat data rute perjalanan. Silakan coba lagi dengan merefresh halaman.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                        Refresh Halaman
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-md p-4 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Pilih Rute & Jadwal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute Keberangkatan</label>
                            {loading ? (
                                <div className="flex items-center py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                                    <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                                </div>
                            ) : (
                                <select
                                    id="route_id"
                                    name="route_id"
                                    className={`block w-full px-3 py-2 border ${formErrors.route ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    value={bookingData.route_id}
                                    onChange={(e) => {
                                        setBookingData({ ...bookingData, route_id: e.target.value });
                                        setFormErrors({ ...formErrors, route: false });
                                        setSchedules([]); // Reset jadwal saat rute berubah
                                        setSelectedSchedule(null); // Reset jadwal yang dipilih
                                    }}
                                    required
                                >
                                    <option value="">Pilih Rute</option>
                                    {Array.isArray(routes) && routes.length > 0 ? (
                                        routes.map(route => (
                                            <option key={route.id} value={route.id}>
                                                {route.origin} - {route.destination} {route.route_code ? `(${route.route_code})` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Tidak ada rute tersedia</option>
                                    )}
                                </select>
                            )}
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
                                    setSelectedSchedule(null); // Reset jadwal yang dipilih
                                }}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            {formErrors.date && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between">
                            <label htmlFor="passenger_type" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Penumpang</label>
                            <span className="text-sm text-gray-500">Total: {bookingData.adult_count + bookingData.child_count + bookingData.infant_count}</span>
                        </div>

                        <div className="bg-white p-3 border border-gray-300 rounded-md">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <label htmlFor="adult_count" className="block text-xs font-medium text-gray-700">Dewasa</label>
                                    <input
                                        type="number"
                                        id="adult_count"
                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                        value={bookingData.adult_count}
                                        onChange={(e) => handlePassengerCountChange('adult_count', parseInt(e.target.value) || 0)}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="child_count" className="block text-xs font-medium text-gray-700">Anak-anak</label>
                                    <input
                                        type="number"
                                        id="child_count"
                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                        value={bookingData.child_count}
                                        onChange={(e) => handlePassengerCountChange('child_count', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="infant_count" className="block text-xs font-medium text-gray-700">Bayi</label>
                                    <input
                                        type="number"
                                        id="infant_count"
                                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                        value={bookingData.infant_count}
                                        onChange={(e) => handlePassengerCountChange('infant_count', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loadingSchedules && (
                    <div className="flex justify-center items-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-gray-600">Mencari jadwal tersedia...</span>
                    </div>
                )}

                {!loadingSchedules && schedules.length > 0 && (
                    <div className="space-y-4">
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
                                            {/* PERUBAHAN: Tampilkan harga tiket */}
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Harga per orang:</p>
                                                <p className="font-medium text-gray-800">{formatCurrency(schedule.passenger_price)}</p>
                                            </div>
                                        </div>

                                        {/* Tampilkan informasi kapasitas */}
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                            <div>
                                                <span className="font-medium">Kapasitas Tersedia:</span> {schedule.available_passenger} penumpang
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center space-x-2">
                                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <span className="text-gray-700">
                                                    {formatTime(schedule.departure_time)} - {formatTime(schedule.arrival_time)}
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
                        </div>
                    </div>
                )}

                {!loadingSchedules && bookingData.route_id && bookingData.date && schedules.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada jadwal tersedia</h3>
                        <p className="mt-1 text-sm text-gray-500">Silakan pilih tanggal keberangkatan lain.</p>
                    </div>
                )}
            </div>
        );
    };

    // PERBAIKAN: Render Stage 2 - Data Penumpang dan Kendaraan
    const renderStage2 = () => {
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
                                {formatDate(bookingData.date)} • {formatTime(bookingData.departure_time)} - {formatTime(bookingData.arrival_time)} •
                                {' '}{bookingData.ferry_name}
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

                {/* PERBAIKAN: Render Section Kendaraan */}
                <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-800">Kendaraan (Opsional)</h3>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-md p-4">
                        <h4 className="font-medium text-gray-700 mb-3">Kategori Kendaraan</h4>

                        {/* Tabel daftar kategori kendaraan - hanya informasi */}
                        <div className="overflow-hidden border border-gray-200 rounded-md mb-4">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipe
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Harga
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vehicleCategories.map(category => (
                                        <tr key={category.id}>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{category.vehicle_type}</div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                                <div className="text-sm text-gray-900">{formatCurrency(category.base_price)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tombol Tambah Kendaraan */}
                        <button
                            type="button"
                            onClick={handleAddVehicleClick}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Kendaraan
                        </button>
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

                    {/* Tampilkan form untuk data kendaraan yang sudah dipilih */}
                    {bookingData.vehicles.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-3">Data Kendaraan</h4>
                            {bookingData.vehicles.map((vehicle, index) => (
                                <div key={index} className="border border-gray-200 rounded-md p-4 bg-white shadow-sm mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="font-medium text-gray-700">Kendaraan {index + 1}</h5>
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
                                                <option value="">Pilih Jenis Kendaraan</option>
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
                                                    .filter(cat => !vehicle.type || cat.vehicle_type === vehicle.type)
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
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => setFormStage(1)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Kembali
                        </button>

                        <button
                            type="button"
                            onClick={handleStage2Submit}
                            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Lanjut ke Pembayaran
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // PERBAIKAN: Render Stage 3 - Pembayaran dan Ringkasan
    const renderStage3 = () => {
        // Inspeksi apakah vehicle_categories kosong sementara vehicles tidak
        if (bookingData.vehicles.length > 0 && bookingData.vehicle_categories.length === 0) {
            console.error("MASALAH TERDETEKSI: Ada kendaraan tetapi vehicle_categories kosong!");

            // Coba perbaiki data kategori kendaraan
            const fixedCategories = [];
            bookingData.vehicles.forEach(vehicle => {
                if (vehicle.category_id) {
                    const category = vehicleCategories.find(c => c.id === vehicle.category_id);
                    if (category) {
                        const existingCatIndex = fixedCategories.findIndex(fc => fc.id === category.id);
                        if (existingCatIndex >= 0) {
                            fixedCategories[existingCatIndex].count += 1;
                        } else {
                            fixedCategories.push({
                                id: category.id,
                                count: 1,
                                type: category.vehicle_type,
                                name: category.name,
                                price: parseFloat(category.base_price)
                            });
                        }
                    }
                }
            });

            if (fixedCategories.length > 0) {
                console.log("Memperbaiki vehicle_categories:", fixedCategories);
                // Update state dengan kategori yang diperbaiki
                setBookingData(prev => ({
                    ...prev,
                    vehicle_categories: fixedCategories,
                    vehicle_price: calculateVehicleTotalPrice(fixedCategories)
                }));

                // Kita perlu mengembalikan null di sini dan biarkan re-render berikutnya
                // menampilkan konten dengan kategori yang sudah diperbaiki
                return null;
            }
        }

        // Pastikan perhitungan total harga sudah benar
        const totalPassengers = bookingData.adult_count + bookingData.child_count + bookingData.infant_count;
        const passengerTotalPrice = bookingData.passenger_price * totalPassengers;

        // Hitung ulang total harga kendaraan untuk memastikan
        const vehicleTotalPrice = calculateVehicleTotalPrice(bookingData.vehicle_categories);
        const totalAmount = passengerTotalPrice + vehicleTotalPrice;

        // Log untuk debugging
        console.log("Ringkasan Pembayaran:", {
            passengerPrice: bookingData.passenger_price,
            totalPassengers,
            passengerTotal: passengerTotalPrice,
            vehicleCategories: bookingData.vehicle_categories,
            vehicleTotal: vehicleTotalPrice,
            totalAmount,
            currentTotal: bookingData.total_amount
        });

        // Perbarui total_amount jika berbeda
        if (Math.abs(totalAmount - bookingData.total_amount) > 0.01) {
            setBookingData(prev => ({
                ...prev,
                vehicle_price: vehicleTotalPrice,
                total_amount: totalAmount
            }));
        }

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
                                {formatDate(bookingData.date)} • {formatTime(bookingData.departure_time)} - {formatTime(bookingData.arrival_time)} •
                                {' '}{bookingData.ferry_name}
                            </p>
                        </div>
                    </div>
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
                                <span className="font-medium">Waktu:</span> {formatTime(bookingData.departure_time)} - {formatTime(bookingData.arrival_time)}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Kapal:</span> {bookingData.ferry_name}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Informasi Penumpang & Kendaraan</h4>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Penumpang:</span> {bookingData.adult_count} Dewasa, {bookingData.child_count} Anak-anak, {bookingData.infant_count} Bayi
                            </p>
                            {bookingData.vehicles.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Kendaraan:</p>
                                    <ul className="text-sm text-gray-600 list-disc list-inside">
                                        {bookingData.vehicles.map((vehicle, idx) => {
                                            const category = vehicleCategories.find(c => c.id === vehicle.category_id);
                                            return (
                                                <li key={idx}>
                                                    {category?.name || 'Kendaraan'} ({vehicle.license_plate}) -
                                                    {category ? formatCurrency(category.base_price) : 'Harga belum dipilih'}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Subtotal Penumpang ({totalPassengers} orang):</span>
                            <span className="font-medium">{formatCurrency(passengerTotalPrice)}</span>
                        </div>

                        {bookingData.vehicles.length > 0 && (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-700">Subtotal Kendaraan ({bookingData.vehicles.length} unit):</span>
                                <span className="font-medium">{formatCurrency(vehicleTotalPrice)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-2 text-lg font-bold">
                            <span className="text-gray-800">Total:</span>
                            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
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
    };

    // Render form based on stage
    const renderForm = () => {
        // Tampilkan loading jika data sedang dimuat
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Memuat data rute dan kategori kendaraan...</p>
                </div>
            );
        }

        // Tampilkan pesan error jika tidak ada rute yang tersedia
        if (!loading && (!Array.isArray(routes) || routes.length === 0)) {
            return (
                <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-red-800">Tidak dapat memuat data rute</h3>
                    <p className="mt-1 text-red-600">Silakan refresh halaman atau hubungi administrator sistem.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Refresh Halaman
                    </button>
                </div>
            );
        }

        switch (formStage) {
            case 1:
                return renderStage1();
            case 2:
                return renderStage2();
            case 3:
                return renderStage3();
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
                                <span className={`text-sm font-medium ${formStage >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Pilih Rute & Jadwal</span>
                                <p className="text-xs text-gray-500 hidden md:block">Pilih rute dan jadwal keberangkatan</p>
                            </div>
                        </div>
                        <div className={`hidden md:block flex-1 h-0.5 mx-4 ${formStage >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className="flex items-center mb-2 md:mb-0">
                            <div className={`flex items-center justify-center rounded-full h-10 w-10 ${formStage >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                2
                            </div>
                            <div className="ml-3">
                                <span className={`text-sm font-medium ${formStage >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Data Penumpang</span>
                                <p className="text-xs text-gray-500 hidden md:block">Masukkan data penumpang dan kendaraan</p>
                            </div>
                        </div>
                        <div className={`hidden md:block flex-1 h-0.5 mx-4 ${formStage >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center rounded-full h-10 w-10 ${formStage >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                3
                            </div>
                            <div className="ml-3">
                                <span className={`text-sm font-medium ${formStage >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Pembayaran</span>
                                <p className="text-xs text-gray-500 hidden md:block">Pilih metode pembayaran</p>
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
                                {formStage === 1 && "Langkah 1: Pilih rute, tanggal, dan jadwal keberangkatan yang tersedia."}
                                {formStage === 2 && "Langkah 2: Masukkan data pelanggan dan kendaraan (opsional)."}
                                {formStage === 3 && "Langkah 3: Pilih metode pembayaran dan selesaikan pemesanan."}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Render form content based on stage */}
                {renderForm()}
            </div>
        </div>
    );
};

export default BookingCreate;