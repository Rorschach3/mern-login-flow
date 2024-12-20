import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import { getToken, setToken, clearToken } from '../../utils/authUtils';
import { toast } from 'sonner';

// Define the shape of AuthContext
interface AuthContextType {
    isAuthenticated: boolean; // Tracks authentication status
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setAuthStatus: (status: boolean) => void; // Allow manual update of auth state
    isLoading: boolean; // Tracks loading state during API calls
}

// Create AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: async () => {},
    logout: () => {},
    setAuthStatus: () => {},
    isLoading: false,
});

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check if a token exists on app load
    useEffect(() => {
        const token = getToken();
        if (token) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    // Login function: connects to backend API
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:7000/api/user/login', {
                email,
                password,
            });

            if (response.data.success) {
                const token = response.data.token; // Extract token from response
                setToken(token); // Store token in localStorage
                setIsAuthenticated(true);
                toast.success(response.data.message || "Signup successful!");
                console.log('Login successful:', response.data.message);
            } else {
                console.error('Login failed:', response.data.message);
            }
        } catch (error: any) {
            console.error('Error during login:', error.response?.data?.message || error.message);
            throw error; // Propagate error for UI handling
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function: clears token and resets authentication state
    const logout = () => {
        clearToken(); // Remove token from storage
        setIsAuthenticated(false);
        console.log('Logged out successfully');
    };

    // Manually update authentication status
    const setAuthStatus = (status: boolean) => {
        setIsAuthenticated(status);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, setAuthStatus, isLoading }}>
            {!isLoading && children} {/* Prevent rendering children until loading is complete */}
        </AuthContext.Provider>
    );
};

export default AuthContext;
