import React, { useState, useMemo } from 'react';
import Button from './ui/Button';
import PasswordInput from './ui/PasswordInput';
import PasswordStrengthIndicator from './ui/PasswordStrengthIndicator'; // Import new component
import { Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountSetup: React.FC = () => {
    const navigate = useNavigate();
    
    // In a real app, you'd get the user's name/email from a token in the URL.
    const userEmail = "sarah.wong@hotel.com";

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const passwordStrengthScore = useMemo(() => {
        let score = -1;
        if (newPassword.length > 0) score++;
        if (newPassword.length >= 8) score++;
        if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) && /\d/.test(newPassword)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
        if (score > 3) score = 3;
        return score;
    }, [newPassword]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (passwordStrengthScore < 1) { // Require at least 'Fair' strength (8+ chars)
             setError('Password must be at least 8 characters long.');
             return;
        }

        // In a real app, you'd submit the new password and then log the user in.
        alert('Account activated successfully! You will now be redirected to the login page.');
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                       <Hotel className="h-10 w-10 mr-3 text-blue-600" />
                       <h1 className="text-2xl font-bold text-gray-800 tracking-wider">Horizon Hotel System</h1>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Create Your Password</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Account: <span className="font-medium">{userEmail}</span>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                        <div>
                            <PasswordInput
                                id="new-password"
                                label="New Password"
                                autoComplete="new-password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter a secure password"
                            />
                            <PasswordStrengthIndicator password={newPassword} />
                        </div>
                        <PasswordInput
                            id="confirm-password"
                            label="Confirm New Password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="pt-2">
                        <Button type="submit" className="w-full" size="lg">
                            Activate Account & Login
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSetup;
