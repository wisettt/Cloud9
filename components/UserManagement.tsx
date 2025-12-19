import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { User, Role, UserStatus, PendingApproval, ApprovalStatus } from '../types';
import Table from './ui/Table';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Toast from './ui/Toast';
import { PlusCircle, Edit, Trash2, Mail, Hotel, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Send, Check, X } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../utils/formatDate';

const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const generateAvatarColors = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 'bg-amber-200 text-amber-800', 'bg-lime-200 text-lime-800', 'bg-blue-200 text-blue-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800'];
    return colors[Math.abs(hash % colors.length)];
};

const getRoleBadge = (role: Role) => {
    const roleClasses: { [key in Role]: string } = {
        'Super Admin': 'bg-purple-100 text-purple-800',
        'Manager': 'bg-blue-100 text-blue-800',
        'Receptionist': 'bg-green-100 text-green-800',
        'Cleaner': 'bg-gray-100 text-gray-700',
        'Accountant': 'bg-yellow-100 text-yellow-800',
    };
    const style = roleClasses[role] || 'bg-gray-200 text-gray-800';
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style}`}>{role}</span>;
};

const getStatusIndicator = (status: UserStatus) => {
    const statusClasses: {[key in UserStatus]: string} = {
        'Active': 'bg-green-500',
        'Pending Invite': 'bg-orange-500',
        'Inactive': 'bg-gray-400',
    };
    return (
        <div className="flex items-center">
            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${statusClasses[status]}`}></span>
            <span>{status}</span>
        </div>
    );
};


const UserManagement: React.FC = () => {
    const { users, setUsers, pendingApprovals, setPendingApprovals } = useData();
    const [activeTab, setActiveTab] = useState<'allUsers' | 'pendingApprovals'>('allUsers');

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ fullName: '', email: '', role: 'Receptionist' as Role });

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUser(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSendInvite = (e: React.FormEvent) => {
        e.preventDefault();
        const createdUser: User = {
            id: `U${Date.now()}`,
            name: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            status: 'Pending Invite',
            lastLogin: 'Never',
        };

        setUsers(prevUsers => [createdUser, ...prevUsers]);
        setToast({ message: `Invitation sent successfully to ${newUser.email}`, type: 'success' });
        
        setInviteModalOpen(false);
        setNewUser({ fullName: '', email: '', role: 'Receptionist' as Role });
    };
    
    const roleOptions: { value: Role, label: string }[] = [
        { value: 'Manager', label: 'Manager' },
        { value: 'Receptionist', label: 'Receptionist' },
        { value: 'Cleaner', label: 'Housekeeping' },
        { value: 'Accountant', label: 'Accountant' },
    ];
    
    const statusOptions: UserStatus[] = ['Active', 'Pending Invite', 'Inactive'];

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                const term = searchTerm.toLowerCase();
                return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
            })
            .filter(user => roleFilter === 'All Roles' || user.role === roleFilter)
            .filter(user => statusFilter === 'All Statuses' || user.status === statusFilter);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredUsers.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
    
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleApprovalAction = (id: string, action: 'approve' | 'reject') => {
        setPendingApprovals(prev => prev.filter(p => p.id !== id));
        alert(`User request ${id} has been ${action}d.`);
    };

    const allUsersColumns = [
        {
            header: 'USER',
            accessor: (user: User) => (
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 font-bold ${generateAvatarColors(user.name)}`}>
                        {getInitials(user.name)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                    </div>
                </div>
            ),
            align: 'left' as const,
        },
        { header: 'EMAIL ADDRESS', accessor: 'email' as keyof User, align: 'left' as const },
        { header: 'ROLE', accessor: (user: User) => getRoleBadge(user.role) },
        { header: 'STATUS', accessor: (user: User) => getStatusIndicator(user.status) },
        { header: 'LAST LOGIN', accessor: 'lastLogin' as keyof User },
    ];

    const pendingApprovalsColumns = [
        {
            header: 'REQUESTED BY',
            accessor: (item: PendingApproval) => (
                <div>
                    <div className="font-medium text-gray-900">{item.userName}</div>
                    <div className="text-gray-500">{item.email}</div>
                </div>
            ),
             align: 'left' as const,
        },
        { header: 'ROLE REQUESTED', accessor: (item: PendingApproval) => getRoleBadge(item.requestedRole) },
        { header: 'REGISTERED DATE', accessor: (item: PendingApproval) => formatDateToDDMMYYYY(item.dateApplied) },
        { 
            header: 'STATUS',
            accessor: (item: PendingApproval) => (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Waiting for Approval
                </span>
            )
        },
    ];

    return (
        <div className="relative">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                    <Button leftIcon={<PlusCircle />} onClick={() => setInviteModalOpen(true)}>
                        Invite New User
                    </Button>
                </div>
                
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('allUsers')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'allUsers'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            All Users
                        </button>
                        <button
                            onClick={() => setActiveTab('pendingApprovals')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                                activeTab === 'pendingApprovals'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Pending Approvals
                            {pendingApprovals.length > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                    {pendingApprovals.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {activeTab === 'allUsers' ? (
                    <>
                        <div className="flex flex-wrap items-center gap-4 py-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by User or Email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64 pl-10 pr-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select 
                                value={roleFilter} 
                                onChange={e => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                            >
                                <option value="All Roles">Filter by Role</option>
                                {['Super Admin', ...roleOptions.map(r => r.value)].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                            >
                                <option value="All Statuses">Filter by Status</option>
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>


                        <Table<User>
                            columns={allUsersColumns}
                            data={currentEntries}
                            isScrollable={false}
                            renderRowActions={() => (
                                <div className="flex items-center justify-center space-x-2">
                                    <button title="Edit User" className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                        <Edit size={18} />
                                    </button>
                                    <button title="Deactivate User" className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        />
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 mt-4 border-t border-gray-200 gap-4">
                            <div className="text-sm text-gray-600">
                                Showing {filteredUsers.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, filteredUsers.length)} of {filteredUsers.length} entries
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-4">
                        <Table<PendingApproval>
                            columns={pendingApprovalsColumns}
                            data={pendingApprovals}
                            isScrollable={false}
                            renderRowActions={(item) => (
                                <div className="flex items-center justify-center space-x-2">
                                    <button onClick={() => handleApprovalAction(item.id, 'approve')} title="Approve" className="text-green-600 bg-green-100 hover:bg-green-200 p-2 rounded-full transition-colors">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => handleApprovalAction(item.id, 'reject')} title="Reject" className="text-red-600 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                )}
                
                <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} title={
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Invite New Team Member</h3>
                        <p className="text-sm text-gray-500 mt-1">Send an invitation to set up their account.</p>
                    </div>
                }>
                    <form onSubmit={handleSendInvite} className="space-y-4">
                         <Input id="fullName" label="Full Name" type="text" value={newUser.fullName} onChange={handleInputChange} required autoFocus placeholder="e.g., Kittipath Poom" />
                        <Input id="email" label="Email Address" type="email" value={newUser.email} onChange={handleInputChange} required placeholder="e.g., staff@hotel.com" />
                        <Select id="role" label="Role Assignment" value={newUser.role} onChange={handleInputChange}>
                            {roleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </Select>

                        <div className="flex justify-end items-center pt-4 border-t mt-6">
                            <div className="flex space-x-2">
                                <button type="button" className="text-sm font-medium text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100" onClick={() => setInviteModalOpen(false)}>
                                    Cancel
                                </button>
                                <Button type="submit">Send Invitation</Button>
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default UserManagement;
