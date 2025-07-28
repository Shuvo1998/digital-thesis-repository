// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner,
    faUser,
    faBuilding,
    faCalendar,
    faUpload
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';

const HomePage = () => {
    const { user } = useAuth();
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heroText, setHeroText] = useState('Explore and Contribute');
    const heroPhrases = ['Discover Knowledge', 'Share Your Research', 'Connect with Academia'];
    let phraseIndex = 0;

    useEffect(() => {
        const fetchTheses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/theses');
                setTheses(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching theses:', err);
                setError('Failed to fetch theses. Please try again later.');
                setLoading(false);
            }
        };

        fetchTheses();

        const intervalId = setInterval(() => {
            phraseIndex = (phraseIndex + 1) % heroPhrases.length;
            setHeroText(heroPhrases[phraseIndex]);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center">{error}</div>
            </div>
        );
    }

    return (
        <>
            <div className="hero-section text-center py-5">
                <h1 className="hero-title">Academic Thesis Repository</h1>
                <p className="hero-subtitle mb-4">
                    {heroText}
                </p>
                <div className="d-flex justify-content-center">
                    <Link
                        to={user ? "/upload-thesis" : "/login"}
                        className="btn btn-outline-light btn-lg hero-btn shadow-lg"
                    >
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        {user ? "Submit Your Work" : "Login to Submit"}
                    </Link>
                </div>
            </div>

            <div className="container my-5">
                <h2 className="text-center mb-4 text-primary">Recent Submissions</h2>
                <div className="thesis-list-container">
                    {theses.length > 0 ? (
                        theses.map((thesis) => (
                            <Link to={`/thesis/${thesis._id}`} key={thesis._id} className="thesis-list-item d-block text-decoration-none">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="mb-0">{thesis.title}</h5>
                                    <small className="text-muted">
                                        <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                        {thesis.submissionYear}
                                    </small>
                                </div>
                                <small className="text-muted d-block mb-1">
                                    <FontAwesomeIcon icon={faUser} className="me-1" />
                                    By: {thesis.authorName}
                                </small>
                                <small className="text-muted d-block">
                                    <FontAwesomeIcon icon={faBuilding} className="me-1" />
                                    Department: {thesis.department}
                                </small>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-muted p-5">
                            <p>No theses have been uploaded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HomePage;