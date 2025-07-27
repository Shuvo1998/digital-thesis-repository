// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Create the Auth Context
export const AuthContext = createContext();

// Create the Auth Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(Cookies.get('token') || null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Helper function to set the Authorization header for all Axios requests
    const setAuthHeader = (authToken) => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Helper function to load user data from the backend
    // FIX: loadUser now accepts a token argument
    const loadUser = async (authToken) => {
        const currentToken = authToken || token;
        if (currentToken) {
            setAuthHeader(currentToken);
            try {
                const res = await axios.get('http://localhost:5000/api/auth');
                setUser(res.data);
                setIsAuthenticated(true);
                return res.data;
            } catch (err) {
                console.error('AuthContext: Error loading user with stored token:', err.response?.data?.msg || err.message);
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
                Cookies.remove('token');
                setAuthHeader(null);
                return null;
            }
        }
        setLoading(false);
        return null;
    };

    // This effect runs on component mount and whenever the token changes
    // It is now only responsible for initial load from cookies
    useEffect(() => {
        loadUser();
    }, [token]);

    // Function to handle user login
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth', { email, password });
            const newToken = res.data.token;

            Cookies.set('token', newToken, { expires: 7 });
            setToken(newToken);
            setAuthHeader(newToken);
            setIsAuthenticated(true);

            // FIX: Pass the newToken directly to loadUser
            const loadedUser = await loadUser(newToken);

            return { success: true, user: loadedUser };
        } catch (err) {
            console.error('AuthContext login: Login error:', err.response?.data?.msg || err.message);
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            Cookies.remove('token');
            setAuthHeader(null);
            return { success: false, error: err.response?.data?.msg || 'Login failed', user: null };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        try {
            const registerRes = await axios.post('http://localhost:5000/api/users', { username, email, password });
            const newToken = registerRes.data.token;

            Cookies.set('token', newToken, { expires: 7 });
            setToken(newToken);
            setAuthHeader(newToken);
            setIsAuthenticated(true);

            // FIX: Pass the newToken directly to loadUser
            const loadedUser = await loadUser(newToken);

            return { success: true, user: loadedUser };
        } catch (err) {
            console.error('AuthContext register: Register error:', err.response?.data?.msg || err.message);
            Cookies.remove('token');
            setAuthHeader(null);
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            return { success: false, error: err.response?.data?.errors?.[0]?.msg || 'Registration failed', user: null };
        }
    };

    // Function to handle user logout
    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove('token');
        setAuthHeader(null);
    };

    // Value provided to consumers of the context
    const authContextValue = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easier consumption of the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};