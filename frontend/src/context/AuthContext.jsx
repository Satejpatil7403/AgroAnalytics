import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/api/auth/login', { username, password });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Login Error:', error);
            const targetUrl = error.config?.url || 'unknown URL';
            const baseURL = error.config?.baseURL || 'unknown BaseURL';
            const errorMessage = error.response?.data?.detail || error.message || `Login failed at ${baseURL}${targetUrl}`;
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const register = async (username, password, role) => {
        try {
            await api.post('/api/auth/register', { username, password, role });
            return { success: true };
        } catch (error) {
            console.error('Registration Error:', error);
            const targetUrl = error.config?.url || 'unknown URL';
            const baseURL = error.config?.baseURL || 'unknown BaseURL';
            let detail = error.response?.data?.detail;
            if (typeof detail === 'object') detail = JSON.stringify(detail);
            const errorMessage = detail || error.message || `Registration failed at ${baseURL}${targetUrl}`;
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isOfficer = () => user?.role === 'officer';
    const isFarmer = () => user?.role === 'farmer';

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isOfficer,
        isFarmer
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
