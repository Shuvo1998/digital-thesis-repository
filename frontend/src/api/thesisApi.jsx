// frontend/src/api/thesisApi.js
import axios from 'axios';

export const getPublicTheses = async () => {
    try {
        const response = await axios.get('/api/theses/public');
        return response.data;
    } catch (error) {
        console.error('Error fetching public theses:', error);
        throw error;
    }
};

// New function to fetch theses for the logged-in user
export const getUsersTheses = async () => {
    try {
        const response = await axios.get('/api/theses/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching user theses:', error);
        throw error;
    }
};