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

    axios.defaults.baseURL = 'http://localhost:5000';

    // This function now only runs on initial load to check for an existing token
    useEffect(() => {
        const checkTokenAndLoadUser = async () => {
            const storedToken = Cookies.get('token');
            if (storedToken) {
                axios.defaults.headers.common['x-auth-token'] = storedToken;
                try {
                    const res = await axios.get('/api/auth');
                    setUser(res.data);
                    setToken(storedToken);
                } catch (err) {
                    console.error('Error loading user:', err.response ? err.response.data : err.message);
                    setToken(null);
                    setUser(null);
                    Cookies.remove('token');
                    delete axios.defaults.headers.common['x-auth-token'];
                }
            }
            setLoading(false);
        };
        checkTokenAndLoadUser();
    }, []);

    // Function to handle user login
    const login = async (email, password) => {
        try {
            // Step 1: Log in to get the token
            const loginRes = await axios.post('/api/auth', { email, password });
            const newToken = loginRes.data.token;

            // Step 2: Set the token and axios header immediately
            Cookies.set('token', newToken, { expires: 7 });
            axios.defaults.headers.common['x-auth-token'] = newToken;

            // Step 3: Use the new token to fetch the user data directly
            const userRes = await axios.get('/api/auth');

            // Step 4: Update state with both the token and the user
            setToken(newToken);
            setUser(userRes.data);

            return { success: true };
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            // Clear any invalid tokens or headers
            Cookies.remove('token');
            delete axios.defaults.headers.common['x-auth-token'];
            return { success: false, error: err.response ? err.response.data.errors[0].msg : 'Login failed' };
        }
    };

    // Function to handle user registration
    const register = async (username, email, password) => {
        try {
            // Step 1: Register to get the token
            const registerRes = await axios.post('/api/users', { username, email, password });
            const newToken = registerRes.data.token;

            // Step 2: Set the token and axios header immediately
            Cookies.set('token', newToken, { expires: 7 });
            axios.defaults.headers.common['x-auth-token'] = newToken;

            // Step 3: Use the new token to fetch the user data directly
            const userRes = await axios.get('/api/auth');

            // Step 4: Update state with both the token and the user
            setToken(newToken);
            setUser(userRes.data);

            return { success: true };
        } catch (err) {
            console.error('Register error:', err.response ? err.response.data : err.message);
            Cookies.remove('token');
            delete axios.defaults.headers.common['x-auth-token'];
            return { success: false, error: err.response ? err.response.data.errors[0].msg : 'Registration failed' };
        }
    };

    // Function to handle user logout
    const logout = () => {
        setToken(null);
        setUser(null);
        Cookies.remove('token');
        delete axios.defaults.headers.common['x-auth-token'];
    };

    // Value provided to consumers of the context
    const authContextValue = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
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