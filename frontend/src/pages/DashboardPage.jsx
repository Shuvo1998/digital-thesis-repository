// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faFileAlt, faClock, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const [userTheses, setUserTheses] = useState([]);
    const [isFetchingTheses, setIsFetchingTheses] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated, token, loading } = useAuth();

    const fetchUserTheses = async () => {
        setIsFetchingTheses(true);
        try {
            const response = await axios.get('http://localhost:5000/api/theses/me');
            setUserTheses(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching user theses:', err);
            setError('Failed to fetch your theses. Please try again later.');
            setUserTheses([]); // Ensure userTheses is an empty array on error
        } finally {
            setIsFetchingTheses(false);
        }
    };

    useEffect(() => {
        // Only run this effect if authentication state has been determined and the user is authenticated
        if (!loading && isAuthenticated) {
            fetchUserTheses();
        }

        // If not authenticated, ensure states are reset
        if (!loading && !isAuthenticated) {
            setUserTheses([]);
            setIsFetchingTheses(false);
        }
    }, [isAuthenticated, loading]); // <-- THE DEPENDENCY ARRAY IS NOW CORRECT

    if (loading || isFetchingTheses) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <p className="text-secondary fs-5">Loading your theses...</p>
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
        <div className="container mt-5">
            <div className="card shadow-sm p-4">
                <h2 className="card-title text-center mb-4">
                    <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                    {user?.username}'s Dashboard
                </h2>
                {userTheses && userTheses.length === 0 ? (
                    <div className="card-body text-center">
                        <p className="text-muted">You have not submitted any theses yet.</p>
                        <Link to="/upload" className="btn btn-primary mt-3">
                            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                            Upload Your First Thesis
                        </Link>
                    </div>
                ) : (
                    <div className="row g-4">
                        {userTheses?.map((thesis) => (
                            <div key={thesis._id} className="col-lg-6">
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="card-body d-flex flex-column">
                                        <Link to={`/thesis/${thesis._id}`} className="text-decoration-none">
                                            <h5 className="card-title fw-bold text-primary mb-2">{thesis.title}</h5>
                                        </Link>
                                        <p className="card-text mb-1">
                                            <span className="fw-semibold">Author:</span> {thesis.authorName}
                                        </p>
                                        <p className="card-text mb-1">
                                            <span className="fw-semibold">Department:</span> {thesis.department}
                                        </p>
                                        <p className={`card-text fw-bold ${getStatusColor(thesis.status)} mt-auto`}>
                                            {getStatusIcon(thesis.status)}
                                            Status: {thesis.status.charAt(0).toUpperCase() + thesis.status.slice(1)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;

// Helper functions for status icons and colors
const getStatusIcon = (status) => {
    switch (status) {
        case 'pending':
            return <FontAwesomeIcon icon={faClock} className="text-warning me-2" />;
        case 'approved':
            return <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />;
        case 'rejected':
            return <FontAwesomeIcon icon={faTimesCircle} className="text-danger me-2" />;
        default:
            return <FontAwesomeIcon icon={faFileAlt} className="text-secondary me-2" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'text-warning';
        case 'approved':
            return 'text-success';
        case 'rejected':
            return 'text-danger';
        default:
            return 'text-secondary';
    }
};