
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Table from './ui/Table';
import { useData } from '../contexts/DataContext';
import { Customer, BookingStatus, Guest } from '../types';
import ConfirmationModal from './ui/ConfirmationModal';
import BookingDetailsModal from './BookingDetailsModal';
import Toast from './ui/Toast';
import { Edit, Eye, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search, Calendar, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import Button from './ui/Button';
import { formatDateToDDMMYYYY } from '../utils/formatDate';

interface FlatBookingRow extends Customer {
    id: string; // Overwritten to be unique for the row: `${customerId}-${roomNumber}`
    roomNumber: string;
    bookingStatus: BookingStatus;
}


const BookingManagement: React.FC = () => {
    const { customers, setCustomers } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [statusFilter, setStatusFilter] = useState<'Current & Upcoming' | BookingStatus | 'All'>('Current & Upcoming');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    
    const [bookingToDelete, setBookingToDelete] = useState<Customer | null>(null);
    const [bookingForModal, setBookingForModal] = useState<Customer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [focusOnRoom, setFocusOnRoom] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const flattenedBookings = useMemo(() => {
        return customers.flatMap(customer => 
            customer.roomStays.map(roomStay => ({
                ...customer,
                id: `${customer.id}-${roomStay.roomNumber || 'unassigned'}`,
                roomNumber: roomStay.roomNumber,
                bookingStatus: roomStay.bookingStatus,
            }))
        );
    }, [customers]);

    const handleOpenModal = (bookingRow: FlatBookingRow, focusRoom: boolean = false) => {
        // Find the original customer object to pass to the modal
        const originalCustomerId = bookingRow.id.split('-')[0];
        const originalCustomer = customers.find(c => c.id === originalCustomerId);
        if (originalCustomer) {
            setBookingForModal(originalCustomer);
            setFocusOnRoom(focusRoom);
            setIsModalOpen(true);
        }
    };




    useEffect(() => {
        const bookingIdToOpen = location.state?.openBookingId;
        if (bookingIdToOpen) {
            const booking = customers.find(c => c.bookingId === bookingIdToOpen);
            if (booking) {
                // This is a bit of a hack to find the correct flat row to pass to handleOpenModal
                const flatBookingRow = flattenedBookings.find(fb => fb.id.startsWith(booking.id));
                if(flatBookingRow) handleOpenModal(flatBookingRow);

                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, customers, navigate, flattenedBookings]);

    const filteredBookings = useMemo(() => {
        let filtered = flattenedBookings;

        if (statusFilter === 'Current & Upcoming') {
            filtered = filtered.filter(b => b.bookingStatus === BookingStatus.Confirmed || b.bookingStatus === BookingStatus.CheckedIn);
        } else if (statusFilter !== 'All') {
            filtered = filtered.filter(b => b.bookingStatus === statusFilter);
        }

        const searchTermLower = searchTerm.trim().toLowerCase();
        if (searchTermLower) {
            filtered = filtered.filter(b => 
                b.fullName.toLowerCase().includes(searchTermLower)
            );
        }

        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        if (startDate || endDate) {
            filtered = filtered.filter(b => {
                const checkIn = new Date(b.checkInDate);
                if (startDate && endDate) {
                    return checkIn >= startDate && checkIn <= endDate;
                }
                if (startDate) {
                    return checkIn >= startDate;
                }
                if (endDate) {
                    return checkIn <= endDate;
                }
                return true;
            });
        }

        return filtered;
    }, [flattenedBookings, statusFilter, searchTerm, dateRange]);

    useEffect(() => {
        const newBookingInfo = location.state?.newBookingInfo;
        if (newBookingInfo) {
            const { rowId, guestName } = newBookingInfo;
            setToast({ message: `Success! Booking for ${guestName} has been created.`, type: 'success' });
            setHighlightedId(rowId);

            // Find the right page and go to it
            const newEntryIndex = filteredBookings.findIndex(b => b.id === rowId);
            if (newEntryIndex !== -1) {
                const newPage = Math.ceil((newEntryIndex + 1) / entriesPerPage);
                setCurrentPage(newPage);
            }
            
            const highlightTimer = setTimeout(() => setHighlightedId(null), 3000);
            const toastTimer = setTimeout(() => setToast(null), 5000);
    
            navigate(location.pathname, { replace: true, state: {} }); // Clear state
    
            return () => {
                clearTimeout(highlightTimer);
                clearTimeout(toastTimer);
            };
        }
    }, [location.state, navigate, filteredBookings, entriesPerPage]);
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setBookingForModal(null);
        setFocusOnRoom(false);
    };

    const handleConfirmDelete = () => {
        if (bookingToDelete) {
            setCustomers(prev => prev.filter(c => c.id !== bookingToDelete.id));
            setBookingToDelete(null);
        }
    };
    
    const handleUpdateBooking = (updatedBooking: Customer) => {
        setCustomers(currentCustomers =>
            currentCustomers.map(c => (c.id === updatedBooking.id ? updatedBooking : c))
        );
    };
    
    const getStatusBadge = (status: BookingStatus) => {
        const statusClasses: { [key in BookingStatus]: string } = {
            [BookingStatus.Confirmed]: "bg-blue-100 text-blue-800",
            [BookingStatus.CheckedIn]: "bg-green-100 text-green-800",
            [BookingStatus.Pending]: "bg-gray-100 text-gray-800",
            [BookingStatus.CheckedOut]: "bg-gray-100 text-gray-800",
            [BookingStatus.Cancelled]: "bg-red-100 text-red-800",
        };
        const statusStyles = statusClasses[status] || "bg-gray-200 text-gray-800";
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles}`}>{status}</span>;
    };

    // Helper function to check data completeness
    const isRegistrationComplete = (customer: Customer): boolean => {
        const requiredFields: (keyof Customer | keyof Guest)[] = ['passportId', 'occupation', 'currentAddress'];

        // Check main booker
        for (const field of requiredFields) {
            if (!(customer as any)[field]) {
                return false;
            }
        }

        // Check accompanying guests
        for (const guest of customer.guestList) {
            for (const field of requiredFields) {
                if (!(guest as any)[field]) {
                    return false;
                }
            }
        }

        return true;
    };
    
    const columns = [
        {
            header: 'BOOKING ID',
            accessor: (item: FlatBookingRow) => <span className="font-medium text-gray-600">{item.bookingId}</span>,
        },
        { 
            header: 'GUEST NAME', 
            accessor: (item: FlatBookingRow) => {
                const complete = isRegistrationComplete(item);
                const showIcon = item.bookingStatus !== BookingStatus.Cancelled;
                
                let icon = null;
                if (showIcon) {
                    // 'Checked-In' and 'Checked-Out' MUST have complete data due to smart lock system rules.
                    if (item.bookingStatus === BookingStatus.CheckedIn || item.bookingStatus === BookingStatus.CheckedOut) {
                        icon = (
                            <span title="Registration Complete">
                                <CheckCircle2 size={16} className="text-green-500" />
                            </span>
                        );
                    } 
                    // For 'Confirmed' and 'Pending', show status based on actual data completeness.
                    else {
                        if (complete) {
                            icon = (
                                <span title="Registration Complete">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                </span>
                            );
                        } else {
                            icon = (
                                <span title="Registration Incomplete">
                                    <AlertCircle size={16} className="text-red-500" />
                                </span>
                            );
                        }
                    }
                }

                return (
                    <button
                        onClick={() => navigate('/customers', { state: { highlight: item.email } })}
                        className="font-medium text-black hover:underline focus:outline-none focus:underline flex items-center gap-2 group"
                    >
                        <span>{item.fullName}</span>
                        {icon}
                    </button>
                );
            },
            align: 'left' as const,
        },
        { 
            header: 'ROOM NUMBER', 
            accessor: (item: FlatBookingRow) => {
                return (
                    <button
                        onClick={() => handleOpenModal(item)}
                        className="font-normal text-black hover:underline focus:outline-none focus:underline"
                        title={`View details for room ${item.roomNumber}`}
                    >
                        {item.roomNumber}
                    </button>
                );
            }
        },
        { header: 'CHECK-IN DATE', accessor: (item: FlatBookingRow) => formatDateToDDMMYYYY(item.checkInDate) },
        { header: 'CHECK-OUT DATE', accessor: (item: FlatBookingRow) => formatDateToDDMMYYYY(item.checkOutDate) },
        { header: 'NUMBER OF GUESTS', accessor: (item: FlatBookingRow) => `${item.adults + item.children}` },
        { header: 'BOOKING STATUS', accessor: (item: FlatBookingRow) => getStatusBadge(item.bookingStatus) },
    ];
    
    const statusFilterOptions: ('Current & Upcoming' | BookingStatus | 'All')[] = ['Current & Upcoming', 'All', BookingStatus.Confirmed, BookingStatus.Pending, BookingStatus.CheckedIn, BookingStatus.CheckedOut, BookingStatus.Cancelled];

    
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredBookings.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredBookings.length / entriesPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };
    
    const handleStatusFilterChange = (status: 'Current & Upcoming' | BookingStatus | 'All') => {
        setStatusFilter(status);
        setCurrentPage(1);
    };
    
    const handleControlChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        let startPage: number, endPage: number;

        if (totalPages <= maxPageButtons) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrent = Math.floor(maxPageButtons / 2);
            const maxPagesAfterCurrent = Math.ceil(maxPageButtons / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrent) {
                startPage = 1;
                endPage = maxPageButtons;
            } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                startPage = totalPages - maxPageButtons + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                        currentPage === i ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    return (
        <div className="relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Booking Management</h1>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Guest..."
                            value={searchTerm}
                            onChange={(e) => handleControlChange(setSearchTerm, e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Show</span>
                        <select
                            value={entriesPerPage}
                            onChange={(e) => handleControlChange(setEntriesPerPage, Number(e.target.value))}
                            className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                            aria-label="Entries per page"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-end">
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-2 bg-white text-black rounded-lg px-3 py-1.5 border border-gray-300">
                           <Calendar size={16} className="text-gray-600" />
                           <input 
                                type="text"
                                placeholder="dd/mm/yyyy"
                                onFocus={(e) => { e.currentTarget.type = 'date'; e.currentTarget.showPicker?.() }}
                                onBlur={(e) => { e.currentTarget.type = 'text'; }}
                                aria-label="Start Date"
                                value={dateRange.start} 
                                onChange={(e) => handleControlChange(setDateRange, {...dateRange, start: e.target.value})}
                                className="text-sm bg-transparent text-black focus:outline-none placeholder-gray-500 w-28"
                           />
                       </div>
                       <span className="text-gray-500 text-sm font-medium">to</span>
                       <div className="flex items-center gap-2 bg-white text-black rounded-lg px-3 py-1.5 border border-gray-300">
                           <Calendar size={16} className="text-gray-600" />
                           <input 
                                type="text"
                                placeholder="dd/mm/yyyy"
                                onFocus={(e) => { e.currentTarget.type = 'date'; e.currentTarget.showPicker?.() }}
                                onBlur={(e) => { e.currentTarget.type = 'text'; }}
                                aria-label="End Date"
                                value={dateRange.end} 
                                onChange={(e) => handleControlChange(setDateRange, {...dateRange, end: e.target.value})}
                                className="text-sm bg-transparent text-black focus:outline-none placeholder-gray-500 w-28"
                           />
                       </div>
                    </div>
                   <div className="flex items-center gap-2 flex-wrap">
                     {statusFilterOptions.map(status => (
                        <button
                            key={status}
                            onClick={() => handleStatusFilterChange(status)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 shrink-0 ${statusFilter === status ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                        >
                            {status}
                        </button>
                    ))}
                    </div>
                    <Button leftIcon={<PlusCircle />} onClick={() => navigate('/bookings/create')}>
                        Create Booking
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Table<FlatBookingRow>
                  columns={columns}
                  data={currentEntries}
                  isScrollable={false}
                   getRowClassName={(booking) => booking.id === highlightedId ? 'bg-green-100 transition-colors duration-1000' : ''}
                  renderRowActions={(bookingRow) => {
                      const originalCustomerId = bookingRow.id.split('-')[0];
                      const originalCustomer = customers.find(c => c.id === originalCustomerId);
                      return (
                        <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => handleOpenModal(bookingRow)} title="View Details" className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <Eye size={18} />
                            </button>
                             <button onClick={() => handleOpenModal(bookingRow)} title="Edit Booking" className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => setBookingToDelete(originalCustomer || null)} title="Delete Booking" className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                      )
                    }}
                />

                <div className="flex flex-col sm:flex-row justify-between items-center p-4">
                    <div className="text-sm text-gray-600">
                        Showing {filteredBookings.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, filteredBookings.length)} of {filteredBookings.length} entries
                    </div>

                    <nav aria-label="Pagination" className="flex items-center space-x-1">
                        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" title="First Page">
                            <ChevronsLeft size={16} />
                        </button>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" title="Previous Page">
                            <ChevronLeft size={16} />
                        </button>
                        
                        {renderPageNumbers()}

                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" title="Next Page">
                            <ChevronRight size={16} />
                        </button>
                        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" title="Last Page">
                            <ChevronsRight size={16} />
                        </button>
                    </nav>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!bookingToDelete}
                onClose={() => setBookingToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the booking for ${bookingToDelete?.fullName}? This action cannot be undone.`}
            />
            
            <BookingDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                customer={bookingForModal}
                onUpdateCustomer={handleUpdateBooking}
                setToast={setToast}
            />
        </div>
    );
};

export default BookingManagement;
