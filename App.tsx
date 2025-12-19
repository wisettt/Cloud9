
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RoomManagement from './components/RoomManagement';
import CustomerList from './components/CustomerList';
import RolesAndPermissions from './components/RolesAndPermissions';
import BookingManagement from './components/BookingManagement';
import CreateBooking from './components/CreateBooking';
import TM30Verification from './components/TM30Verification';
import GovernmentReports from './components/GovernmentReports';
import Settings from './components/Settings';
import AccountSetup from './components/AccountSetup';
import ForgotPassword from './components/ForgotPassword';
import { DataContext } from './contexts/DataContext';
import { useMockDataHook } from './hooks/useMockData';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const data = useMockDataHook();

    const handleLogin = () => {
        setIsAuthenticated(true);
    };
    
    const handleLogout = () => {
        setIsAuthenticated(false);
    }

    return (
        <DataContext.Provider value={data}>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
                    <Route path="/setup-account" element={<AccountSetup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/forgot-password/:token" element={<ForgotPassword />} />
                    
                    <Route path="/" element={isAuthenticated ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/login" />} >
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="bookings" element={<BookingManagement />} />
                        <Route path="bookings/create" element={<CreateBooking />} />
                        <Route path="rooms" element={<RoomManagement />} />
                        <Route path="customers" element={<CustomerList />} />
                        <Route path="tm30" element={<TM30Verification />} />
                        <Route path="reports" element={<GovernmentReports />} />
                        <Route path="roles" element={<RolesAndPermissions />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                </Routes>
            </HashRouter>
        </DataContext.Provider>
    );
};

export default App;