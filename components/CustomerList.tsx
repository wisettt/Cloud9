
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Table from './ui/Table';
import { useData } from '../contexts/DataContext';
import { Customer, Gender } from '../types';
import ConfirmationModal from './ui/ConfirmationModal';
import CustomerDetailsModal from './CustomerDetailsModal';
import { Eye, Trash2, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface UniqueCustomer {
    id: string; // use email as id
    fullName: string;
    email: string;
    passportId: string;
    nationality: string;
    gender: Gender;
    latestCustomerRecord: Customer;
}

const CustomerList: React.FC = () => {
    const { customers, setCustomers } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [highlightedEmail, setHighlightedEmail] = useState<string | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<UniqueCustomer | null>(null);

    const [activeCustomer, setActiveCustomer] = useState<UniqueCustomer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const uniqueCustomers = useMemo(() => {
        const customerMap = new Map<string, { details: Customer[] }>();
        
        customers.forEach(customer => {
            if (customerMap.has(customer.email)) {
                customerMap.get(customer.email)!.details.push(customer);
            } else {
                customerMap.set(customer.email, { details: [customer] });
            }
        });

        const result: UniqueCustomer[] = [];
        customerMap.forEach((value, key) => {
            const sortedBookings = [...value.details].sort((a,b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
            const latestRecord = sortedBookings[0];
            
            result.push({
                id: key, // email is unique id
                fullName: latestRecord.fullName,
                email: latestRecord.email,
                passportId: latestRecord.passportId,
                nationality: latestRecord.nationality,
                gender: latestRecord.gender,
                latestCustomerRecord: latestRecord
            });
        });

        return result;
    }, [customers]);
    
    const filteredCustomers = useMemo(() => {
        const searchTermLower = searchTerm.toLowerCase().trim();
        if (!searchTermLower) return uniqueCustomers;
        
        return uniqueCustomers.filter(customer =>
            customer.fullName.toLowerCase().includes(searchTermLower) ||
            customer.passportId.toLowerCase().includes(searchTermLower)
        );
    }, [uniqueCustomers, searchTerm]);
    
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredCustomers.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredCustomers.length / entriesPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };
    
    useEffect(() => {
        const highlight = location.state?.highlight;
        if (highlight) {
            setHighlightedEmail(highlight);

            const customerIndex = filteredCustomers.findIndex(c => c.email === highlight);
            if (customerIndex !== -1) {
                const pageNumber = Math.ceil((customerIndex + 1) / entriesPerPage);
                setCurrentPage(pageNumber);
            }
    
            const timer = setTimeout(() => {
                setHighlightedEmail(null);
                navigate(location.pathname, { replace: true, state: null });
            }, 3000);
    
            return () => clearTimeout(timer);
        }
    }, [location.state, filteredCustomers, entriesPerPage, navigate]);


    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
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
    
    const handleOpenDetailsModal = (customer: UniqueCustomer) => {
        setActiveCustomer(customer);
        setIsModalOpen(true);
    };
    
    const handleUpdateCustomer = (updatedRecord: Customer) => {
        setCustomers(currentCustomers =>
            currentCustomers.map(c => (c.id === updatedRecord.id ? updatedRecord : c))
        );
    };

    const handleConfirmDelete = () => {
        if (customerToDelete) {
            setCustomers(prevCustomers => prevCustomers.filter(c => c.email !== customerToDelete.id));
            setCustomerToDelete(null);
        }
    };

    const columns = [
        { 
            header: 'GUEST NAME', 
            accessor: (customer: UniqueCustomer) => {
                return (
                    <button 
                        onClick={() => handleOpenDetailsModal(customer)} 
                        className="font-medium text-blue-600 hover:underline focus:outline-none"
                    >
                        {customer.fullName}
                    </button>
                );
            },
            align: 'left' as const 
        },
        { header: 'EMAIL ADDRESS', accessor: 'email' as keyof UniqueCustomer, align: 'left' as const },
        { header: 'PHONE NUMBER', accessor: (c: UniqueCustomer) => c.latestCustomerRecord.phone, align: 'center' as const },
        { header: 'PASSPORT NO.', accessor: 'passportId' as keyof UniqueCustomer, align: 'center' as const },
        { header: 'NATIONALITY', accessor: 'nationality' as keyof UniqueCustomer, align: 'center' as const },
        { header: 'GENDER', accessor: 'gender' as keyof UniqueCustomer, align: 'center' as const },
    ];

    const getRowClassName = (customer: UniqueCustomer) => {
        if (customer.email === highlightedEmail) {
            return 'bg-blue-100';
        }
        return '';
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Customer List</h1>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row justify-start items-center gap-4 mb-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative">
                           <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                           <input
                               type="text"
                               placeholder="Search by Name or Passport..."
                               value={searchTerm}
                               onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                               className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Show</span>
                            <select
                                value={entriesPerPage}
                                onChange={(e) => handleFilterChange(setEntriesPerPage, Number(e.target.value))}
                                className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                                aria-label="Entries per page"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span>entries</span>
                        </div>
                   </div>
                </div>

                <Table<UniqueCustomer>
                  columns={columns}
                  data={currentEntries}
                  isScrollable={false}
                  getRowClassName={getRowClassName}
                  renderRowActions={(customer) => (
                    <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => handleOpenDetailsModal(customer)} title="View Details" className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                            <Eye size={18} />
                        </button>
                        <button onClick={() => setCustomerToDelete(customer)} title="Delete Customer" className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                  )}
                />
                
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200 gap-4">
                    <div className="text-sm text-gray-600">
                        Showing {filteredCustomers.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, filteredCustomers.length)} of {filteredCustomers.length} entries
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
                isOpen={!!customerToDelete}
                onClose={() => setCustomerToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${customerToDelete?.fullName}? All their bookings will be permanently removed.`}
            />

            <CustomerDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customerProfile={activeCustomer ? { latestCustomerRecord: activeCustomer.latestCustomerRecord } : null}
                onUpdateCustomer={handleUpdateCustomer}
                allCustomers={customers}
            />
        </div>
    );
};

export default CustomerList;
