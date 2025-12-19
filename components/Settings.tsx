import React, { useState } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import UserManagement from './UserManagement'; // Import the new component
import ChangePasswordModal from './ui/ChangePasswordModal'; // Import the new modal
import { Image, Building, FileText, BedDouble, Users, Mail, Save, Lock, TestTubeDiagonal } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { SettingsCategory } from '../types';
import PasswordInput from './ui/PasswordInput';
import Toast from './ui/Toast';
import ToggleSwitch from './ui/ToggleSwitch';

const Settings: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('users');
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    // FIX: Destructure 'users' instead of 'allUsers' from the useData hook to match the property name in the returned context object.
    const { roles, setRoles, users } = useData();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


    const categories: { id: SettingsCategory; label: string; icon: React.ElementType }[] = [
        { id: 'general', label: 'General Information', icon: Building },
        { id: 'users', label: 'Users & Roles', icon: Users },
        { id: 'email', label: 'Email Configuration', icon: Mail },
        { id: 'security', label: 'Security', icon: Lock },
    ];
    
    // Mock data for forms
    const [generalInfo, setGeneralInfo] = useState({
        hotelName: 'Horizon Hotel & Suites',
        address: '123 Beachfront Ave, Phuket, Thailand',
        phone: '+66 76 123 456',
        email: 'contact@horizonhotel.com',
        website: 'https://www.horizonhotel.com',
    });
    
    const [emailConfig, setEmailConfig] = useState({
        senderName: 'Cloud9 Hotel Reservations',
        senderEmail: 'calgar.xiii@gmail.com',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        password: 'abdc efgh ijkl mnop',
    });

    const handleGeneralInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGeneralInfo({...generalInfo, [e.target.id]: e.target.value});
    };
    
    const handleEmailConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailConfig({...emailConfig, [e.target.id]: e.target.value});
    };
    
    const handleTestConnection = () => {
        setToast(null); // Clear previous toast
        // Simulate API call
        console.log('Testing connection with:', emailConfig);
        setTimeout(() => {
             // Mock success/failure
            const isSuccess = Math.random() > 0.3; // 70% chance of success
            if (isSuccess) {
                setToast({ message: 'Connection successful! Test email sent.', type: 'success' });
            } else {
                setToast({ message: 'Connection failed. Please check credentials.', type: 'error' });
            }
        }, 1500);
    };

    const handleSaveEmailSettings = () => {
        setToast(null);
        console.log('Saving email settings:', emailConfig);
        setTimeout(() => {
            setToast({ message: 'Email settings saved successfully.', type: 'success' });
        }, 1000);
    };

    const SectionWrapper: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );


    const renderContent = () => {
        switch (activeCategory) {
            case 'general':
                return (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">General Hotel Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Input id="hotelName" label="Hotel Name" value={generalInfo.hotelName} onChange={handleGeneralInfoChange} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Logo</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Building size={32} className="text-gray-400" />
                                    </div>
                                    <button
                                        type="button"
                                        className="relative overflow-hidden cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Image size={16} className="inline-block mr-2" />
                                        <span>Change Photo</span>
                                        <input type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/>
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Textarea id="address" label="Address" value={generalInfo.address} onChange={handleGeneralInfoChange} />
                            </div>
                            <Input id="phone" label="Phone Number" value={generalInfo.phone} onChange={handleGeneralInfoChange} />
                            <Input id="email" label="Contact Email" type="email" value={generalInfo.email} onChange={handleGeneralInfoChange} />
                            <Input id="website" label="Website" value={generalInfo.website} onChange={handleGeneralInfoChange} />
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                            <Button leftIcon={<Save size={18} />} onClick={() => alert('Settings saved!')}>Save Changes</Button>
                        </div>
                    </div>
                );
            case 'email':
                return (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Email Configuration</h2>
                        <div className="max-w-xl space-y-4">
                             <Input id="senderName" label="Sender Name" value={emailConfig.senderName} onChange={handleEmailConfigChange} />
                             <Input id="senderEmail" label="Sender Email (Username)" type="email" value={emailConfig.senderEmail} onChange={handleEmailConfigChange} />
                             <Input id="smtpHost" label="SMTP Host" value={emailConfig.smtpHost} onChange={handleEmailConfigChange} />
                             <Input id="smtpPort" label="SMTP Port" type="number" value={emailConfig.smtpPort} onChange={handleEmailConfigChange} />
                             <PasswordInput id="password" label="Password / App Key" value={emailConfig.password} onChange={handleEmailConfigChange} />
                        </div>
                         <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-2">
                            <Button variant="secondary" leftIcon={<TestTubeDiagonal size={18}/>} onClick={handleTestConnection}>Test Connection</Button>
                            <Button leftIcon={<Save size={18} />} onClick={handleSaveEmailSettings}>Save Settings</Button>
                        </div>
                    </div>
                );
            case 'users':
                return <UserManagement />; // Render the new component
            case 'security':
                return (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
                        <div className="max-w-md">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h3 className="font-semibold text-gray-700">Password</h3>
                                <p className="text-sm text-gray-500 mt-1">Change your account password.</p>
                                <Button className="mt-4" onClick={() => setChangePasswordModalOpen(true)}>
                                    Change Password
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="text-center text-gray-500 py-10">Select a category to view its settings.</div>;
        }
    };

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Sidebar */}
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <nav className="space-y-1">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                    activeCategory === category.id
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <category.icon className="h-5 w-5 mr-3" />
                                <span>{category.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Right Panel */}
                <main className="flex-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm min-h-[60vh] flex flex-col">
                        <div className="flex-1">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
            />
        </div>
    );
};

export default Settings;
