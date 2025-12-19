
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Room, RoomStatus, RoomType, BookingStatus, Customer, BedType } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import ConfirmationModal from './ui/ConfirmationModal';
import RoomDetailsModal from './RoomDetailsModal';
import Table from './ui/Table';
import { PlusCircle, Trash2, Eye, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const RoomManagement: React.FC = () => {
    const { rooms, customers, setRooms } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(20);
    const [highlightedRoomCode, setHighlightedRoomCode] = useState<string | null>(null);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
    
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [floorFilter, setFloorFilter] = useState('All Floors');
    const [roomTypeFilter, setRoomTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const newRoomTypes: RoomType[] = ['Standard', 'Superior', 'Deluxe', 'Connecting'];

    const initialNewRoomState = {
        roomCode: '',
        floor: '1st Floor',
        type: 'Standard' as RoomType,
        maxOccupancy: 2,
    };
    const [newRoom, setNewRoom] = useState(initialNewRoomState);
    
    // FIX: Explicitly type sort callback parameters to fix type inference issue with Array.from(new Set(...)).
    const floorOptions = useMemo(() => ['All Floors', ...Array.from(new Set(rooms.map(r => r.floor))).sort((a: string, b: string) => parseInt(a) - parseInt(b))], [rooms]);
    const roomTypeOptions = useMemo(() => ['All Types', ...newRoomTypes], []);
    const statusOptions = useMemo(() => ['All Status', ...Object.values(RoomStatus)], []);
    
    const guestInfoMap = useMemo(() => {
        const map = new Map<string, Customer>();
        customers.forEach(customer => {
            customer.roomStays.forEach(rs => {
                if (rs.bookingStatus === BookingStatus.CheckedIn) {
                    map.set(rs.roomNumber, customer);
                }
            });
        });
        return map;
    }, [customers]);

    const getStatusBadgeClasses = (status: RoomStatus) => {
        const statusClasses = {
            [RoomStatus.Available]: "bg-green-100 text-green-800",
            [RoomStatus.Occupied]: "bg-red-100 text-red-800",
            [RoomStatus.Cleaning]: "bg-blue-100 text-blue-800",
            [RoomStatus.Maintenance]: "bg-gray-100 text-gray-800",
        };
        return statusClasses[status];
    };
    
    const handleConfirmDelete = () => {
        if (roomToDelete) {
            setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
            setRoomToDelete(null);
        }
    };
    
    const handleGuestDoubleClick = (customer: Customer) => {
        if (customer && customer.email) {
            navigate('/customers', { state: { highlight: customer.email } });
        }
    };

    const filteredRooms = useMemo(() => {
        return rooms
            .filter(room => 
                searchTerm.trim() === '' || 
                room.roomCode.toLowerCase().includes(searchTerm.toLowerCase().trim())
            )
            .filter(room => floorFilter === 'All Floors' || room.floor === floorFilter)
            .filter(room => roomTypeFilter === 'All Types' || room.type === roomTypeFilter)
            .filter(room => statusFilter === 'All Status' || room.status === statusFilter);
    }, [rooms, searchTerm, floorFilter, roomTypeFilter, statusFilter]);
    
    const sortedRooms = useMemo(() => {
        return [...filteredRooms].sort((a, b) => a.roomCode.localeCompare(b.roomCode, undefined, { numeric: true }));
    }, [filteredRooms]);

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const paginatedRooms = sortedRooms.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(sortedRooms.length / entriesPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    useEffect(() => {
        const highlight = location.state?.highlight;
        if (highlight) {
            setHighlightedRoomCode(highlight);
            
            const roomIndex = sortedRooms.findIndex(r => r.roomCode === highlight);
            if (roomIndex !== -1) {
                const pageNumber = Math.ceil((roomIndex + 1) / entriesPerPage);
                setCurrentPage(pageNumber);
            }

            navigate(location.pathname, { replace: true, state: null });

            const timer = setTimeout(() => {
                setHighlightedRoomCode(null);
            }, 3000);
    
            return () => clearTimeout(timer);
        }
    }, [location, sortedRooms, entriesPerPage, navigate]);

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

    const handleNewRoomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setNewRoom(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveRoom = (e: React.FormEvent) => {
        e.preventDefault();
        // Simplified creation logic
        const newRoomData: Room = {
            id: `R${Date.now()}`,
            roomCode: `RM${newRoom.roomCode}`,
            floor: newRoom.floor,
            type: newRoom.type,
            maxOccupancy: Number(newRoom.maxOccupancy),
            status: RoomStatus.Available, // Default status
            // Default other required fields
            bedType: 'King Bed',
            price: 0,
            description: '',
            floorAndview: '',
            internalNotes: '',
        };
        setRooms(prev => [...prev, newRoomData].sort((a,b) => a.roomCode.localeCompare(b.roomCode, undefined, { numeric: true })));
        setCreateModalOpen(false);
        setNewRoom(initialNewRoomState);
    };

    const activeRoomCustomer = activeRoom ? guestInfoMap.get(activeRoom.roomCode) : undefined;
    const currentGuest = activeRoomCustomer?.fullName;
    const checkOutDateForModal = activeRoomCustomer?.checkOutDate;
    
    const columns = [
        { header: 'ROOM NUMBER', 
          accessor: (room: Room) => <span className="font-bold text-black">{room.roomCode}</span>,
          align: 'center' as const 
        },
        { header: 'ROOM TYPE', accessor: 'type' as keyof Room, align: 'center' as const },
        {
            header: 'STATUS',
            accessor: (room: Room) => (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full min-w-[100px] inline-block ${getStatusBadgeClasses(room.status)}`}>
                    {room.status}
                </span>
            ),
            align: 'center' as const,
        },
        {
            header: 'CURRENT GUEST',
            accessor: (room: Room) => {
                const customer = guestInfoMap.get(room.roomCode);
                if (room.status === RoomStatus.Occupied && customer) {
                    if (room.roomCode === 'RM302') {
                         return '(Linked to 301)';
                    }
                    return (
                        <div onDoubleClick={() => handleGuestDoubleClick(customer)} className="cursor-pointer" title="Double-click to view customer">
                            {customer.fullName}
                        </div>
                    );
                }
                return '—';
            },
            align: 'center' as const,
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Room Management</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                     <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Room No..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                                className="w-48 pl-10 pr-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="flex items-center gap-2">
                        <select value={floorFilter} onChange={e => handleFilterChange(setFloorFilter, e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                            {floorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select value={roomTypeFilter} onChange={e => handleFilterChange(setRoomTypeFilter, e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                             {roomTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select value={statusFilter} onChange={e => handleFilterChange(setStatusFilter, e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                             {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                         <Button leftIcon={<PlusCircle />} onClick={() => setCreateModalOpen(true)}>
                            Create Room
                        </Button>
                    </div>
                </div>
            
                <Table<Room>
                    columns={columns}
                    data={paginatedRooms}
                    isScrollable={false}
                    getRowClassName={(room) => room.roomCode === highlightedRoomCode ? 'bg-blue-100' : ''}
                    renderRowActions={(room) => (
                        <div className="flex items-center justify-center space-x-1">
                            <button onClick={() => { setActiveRoom(room); setIsModalOpen(true); }} title="View Details" className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <Eye size={18} />
                            </button>
                            <button onClick={() => setRoomToDelete(room)} title="Delete" className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                />

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200 gap-4">
                    <div className="text-sm text-gray-600">
                        Showing {sortedRooms.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, sortedRooms.length)} of {sortedRooms.length} entries
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

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Room">
                <form onSubmit={handleSaveRoom} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="roomCode" label="Room Number" value={newRoom.roomCode} onChange={handleNewRoomChange} required placeholder="e.g. 101" />
                        <Input id="floor" label="Floor" value={newRoom.floor} onChange={handleNewRoomChange} required placeholder="e.g. 1st Floor" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select id="type" label="Room Type" value={newRoom.type} onChange={handleNewRoomChange}>
                            {newRoomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </Select>
                        <Input id="maxOccupancy" label="Max Occupancy" type="number" min="1" value={newRoom.maxOccupancy} onChange={handleNewRoomChange} required />
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Room</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={!!roomToDelete}
                onClose={() => setRoomToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete Room ${roomToDelete?.roomCode}? This will permanently remove it from the system.`}
            />

            <RoomDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                room={activeRoom}
                currentGuest={currentGuest}
                checkOutDate={checkOutDateForModal}
            />
        </div>
    );
};

export default RoomManagement;
