
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';
import PasswordInput from './ui/PasswordInput';
import { Hotel, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const { token } = useParams<{ token?: string }>();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [linkSent, setLinkSent] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendLink = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock sending link
        console.log(`Sending reset link to ${email}`);
        setLinkSent(true);
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        // Mock resetting password
        console.log(`Resetting password with token ${token}`);
        setSuccess('Password has been reset successfully!');
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    const renderRequestForm = () => (
        <>
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800">Forgot Your Password?</h2>
                <p className="text-gray-600 mt-2">
                    No problem. Enter your email address below and we'll send you a link to reset it.
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSendLink}>
                <Input
                    id="email-address"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                />
                <div>
                    <Button type="submit" className="w-full" size="lg">
                        Send Reset Link
                    </Button>
                </div>
            </form>
        </>
    );

    const renderLinkSentMessage = () => (
        <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-2xl font-semibold text-gray-800">Check Your Email</h2>
            <p className="text-gray-600">
                We've sent a password reset link to <span className="font-semibold text-gray-800">{email}</span>. Please check your inbox and follow the instructions.
            </p>
             <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                Back to Login
            </Link>
        </div>
    );

    const renderResetForm = () => (
        <>
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800">Set New Password</h2>
                <p className="text-gray-600 mt-2">
                    Please create a new, secure password for your account.
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-4">
                    <PasswordInput
                        id="new-password"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter your new password"
                    />
                    <PasswordInput
                        id="confirm-password"
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm your new password"
                    />
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}
                <div>
                    <Button type="submit" className="w-full" size="lg">
                        Reset Password
                    </Button>
                </div>
            </form>
        </>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="flex items-center justify-center mb-6">
                   <Hotel className="h-10 w-10 text-blue-600" />
                </div>
                {token ? renderResetForm() : (linkSent ? renderLinkSentMessage() : renderRequestForm())}
            </div>
        </div>
    );
};

export default ForgotPassword;