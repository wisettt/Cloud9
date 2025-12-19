
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Customer, Guest, BookingStatus } from '../types';
import Button from './ui/Button';
import { Printer, Calendar, FileSpreadsheet, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../utils/formatDate';

// Define the flattened guest type for the report
interface ReportGuest {
    checkInDateTime: string;
    roomNumber: string;
    fullName: string;
    nationality: string;
    idNumber: string;
    issuedBy: string;
    currentAddress: string;
    occupation: string;
    arrivingFrom: string;
    goingTo: string;
    checkOutDateTime: string | null;
    remarks: string;
}

// Helper function to get the start and end of the current week
const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday
    const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust for Sunday
    const start = new Date(now.setDate(now.getDate() + diffToMonday));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
};


const GovernmentReports: React.FC = () => {
    const { customers } = useData();
    const initialWeek = getWeekRange();
    const [dateRange, setDateRange] = useState({ start: initialWeek.start, end: initialWeek.end });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const reportData = useMemo(() => {
        let flattenedGuests: ReportGuest[] = [];
        
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if(startDate) startDate.setHours(0,0,0,0);
        if(endDate) endDate.setHours(23,59,59,999);
        
        const filteredCustomersByDate = customers.filter(c => {
            const checkInDate = new Date(c.checkInDate);
            return (!startDate || checkInDate >= startDate) && (!endDate || checkInDate <= endDate);
        });

        // FIX: Iterate through each roomStay for every customer to correctly flatten the data for the report.
        filteredCustomersByDate.forEach(customer => {
            customer.roomStays.forEach(roomStay => {
                // Main booker
                flattenedGuests.push({
                    checkInDateTime: formatDateToDDMMYYYY(customer.checkInDate),
                    roomNumber: roomStay.roomNumber,
                    fullName: customer.fullName,
                    nationality: customer.nationality,
                    idNumber: customer.passportId,
                    issuedBy: customer.issuedBy,
                    currentAddress: customer.currentAddress,
                    occupation: customer.occupation,
                    arrivingFrom: customer.arrivingFrom,
                    goingTo: customer.goingTo,
                    checkOutDateTime: roomStay.bookingStatus === BookingStatus.CheckedOut ? formatDateToDDMMYYYY(customer.checkOutDate) : null,
                    remarks: customer.remarks,
                });

                // Accompanying guests
                customer.guestList.forEach(guest => {
                    flattenedGuests.push({
                        checkInDateTime: formatDateToDDMMYYYY(customer.checkInDate),
                        roomNumber: roomStay.roomNumber,
                        fullName: guest.name,
                        nationality: guest.nationality,
                        idNumber: guest.passportId,
                        issuedBy: guest.issuedBy,
                        currentAddress: guest.currentAddress,
                        occupation: guest.occupation,
                        arrivingFrom: guest.arrivingFrom,
                        goingTo: guest.goingTo,
                        checkOutDateTime: roomStay.bookingStatus === BookingStatus.CheckedOut ? formatDateToDDMMYYYY(customer.checkOutDate) : null,
                        remarks: guest.remarks,
                    });
                });
            });
        });

        const searchFilteredGuests = flattenedGuests.filter(guest => 
            guest.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return searchFilteredGuests.sort((a,b) => new Date(a.checkInDateTime).getTime() - new Date(b.checkInDateTime).getTime());
    }, [customers, dateRange, searchTerm]);
    
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = reportData.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(reportData.length / entriesPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
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


    const handlePrint = () => {
        window.print();
    };


    return (
        <div id="report-page">
            <style>
                {`
                    @media print {
                        body {
                            background-color: white !important;
                        }
                        #root > div {
                           display: none;
                        }
                        #report-page-container {
                           display: block !important;
                           position: absolute;
                           top: 0;
                           left: 0;
                           width: 100%;
                           height: 100%;
                           margin: 0;
                           padding: 1rem;
                        }
                        .no-print {
                            display: none !important;
                        }
                        @page {
                           size: A4 landscape;
                           margin: 0.5in;
                        }
                        .print-table {
                            font-size: 8pt; /* Smaller font for printing */
                        }
                         .print-table th, .print-table td {
                            padding: 2px 4px; /* Tighter padding */
                        }
                    }
                `}
            </style>
            
            <div className="no-print mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Government Reports</h1>
            </div>

            <div id="report-page-container">
                 <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4 no-print">
                        <h2 className="text-xl font-semibold text-gray-700">R.R.4 Registry (ทะเบียนผู้พัก)</h2>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6 no-print">
                        {/* Left Side */}
                        <div className="flex items-center gap-4">
                             <div className="relative">
                                <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by Guest Name..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-64 pl-10 pr-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    value={entriesPerPage}
                                    onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
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

                        {/* Right Side */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                                <Calendar size={16} className="text-gray-600" />
                                <input 
                                    type="text" 
                                    placeholder="dd/mm/yyyy"
                                    onFocus={(e) => e.currentTarget.type = 'date'}
                                    onBlur={(e) => e.currentTarget.type = 'text'}
                                    aria-label="Start Date"
                                    value={dateRange.start} 
                                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                                    className="text-sm bg-white text-black focus:outline-none placeholder-gray-500"
                                />
                            </div>
                            <span className="text-gray-500 text-sm">to</span>
                            <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                                <Calendar size={16} className="text-gray-600" />
                                <input 
                                    type="text" 
                                    placeholder="dd/mm/yyyy"
                                    onFocus={(e) => e.currentTarget.type = 'date'}
                                    onBlur={(e) => e.currentTarget.type = 'text'}
                                    aria-label="End Date"
                                    value={dateRange.end} 
                                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                                    className="text-sm bg-white text-black focus:outline-none placeholder-gray-500"
                                />
                            </div>
                           <Button className="!bg-green-600 hover:!bg-green-700 focus:!ring-green-500" leftIcon={<FileSpreadsheet size={16}/>}>Export to Excel</Button>
                           <Button variant="secondary" leftIcon={<Printer size={16}/>} onClick={handlePrint}>Print / Export PDF</Button>
                        </div>
                    </div>
                    
                    {/* Report Table */}
                    <div className="overflow-x-auto print-table">
                        <h3 className="text-center font-bold text-lg mb-4">ทะเบียนผู้พัก (ร.ร.๔)</h3>
                        <table className="min-w-full text-xs border-collapse border border-black">
                            <thead>
                                <tr className="bg-gray-100 text-black">
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '3%'}}>เลขลำดับ</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '7%'}}>วันเวลาที่เข้ามาพัก</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '5%'}}>ห้องพักเลขที่</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '10%'}}>ชื่อตัวและชื่อสกุล</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '6%'}}>สัญชาติ</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '12%'}}>เลขประจำตัวประชาชนหรือใบสำคัญประจำตัวคนต่างด้าว หรือหนังสือเดินทางเลขที่... ออกให้โดย</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '15%'}}>ที่อยู่ปัจจุบัน อยู่ที่ ตำบล อำเภอ จังหวัด หรือประเทศใด</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '6%'}}>อาชีพ</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '10%'}}>มาจากตำบล อำเภอ จังหวัด หรือประเทศใด</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '10%'}}>จะไปที่ ตำบล อำเภอ จังหวัด หรือประเทศใด</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: '7%'}}>วันเวลาที่ออกไป</th>
                                    <th className="border border-black p-1 text-center font-bold" style={{width: 'auto'}}>หมายเหตุ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white text-black">
                                {currentEntries.map((guest, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-1 text-center align-top">{indexOfFirstEntry + index + 1}</td>
                                        <td className="border border-black p-1 text-center align-top">{guest.checkInDateTime}</td>
                                        <td className="border border-black p-1 text-center align-top">{guest.roomNumber}</td>
                                        <td className="border border-black p-1 align-top">{guest.fullName}</td>
                                        <td className="border border-black p-1 text-center align-top">{guest.nationality}</td>
                                        <td className="border border-black p-1 align-top">
                                            <div>{guest.idNumber}</div>
                                            <div className="text-black">Issued by {guest.issuedBy}</div>
                                        </td>
                                        <td className="border border-black p-1 align-top">{guest.currentAddress}</td>
                                        <td className="border border-black p-1 text-center align-top">{guest.occupation}</td>
                                        <td className="border border-black p-1 align-top">{guest.arrivingFrom}</td>
                                        <td className="border border-black p-1 align-top">{guest.goingTo}</td>
                                        <td className="border border-black p-1 text-center align-top">{guest.checkOutDateTime || ''}</td>
                                        <td className="border border-black p-1 align-top">{guest.remarks}</td>
                                    </tr>
                                ))}
                                 {reportData.length === 0 && (
                                    <tr><td colSpan={12} className="text-center p-4 border border-black">No guest data for the selected date range.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200 gap-4 no-print">
                        <div className="text-sm text-gray-600">
                            Showing {reportData.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, reportData.length)} of {reportData.length} entries
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
            </div>
        </div>
    );
};

export default GovernmentReports;
