// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { getPublicTheses } from '../api/thesisApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTheses = async () => {
            try {
                const data = await getPublicTheses();
                setTheses(data || []); // Ensure data is an array or an empty array
            } catch (err) {
                console.error('Error fetching public theses:', err);
                setError('Failed to fetch theses. Please try again later.');
                setTheses([]); // <-- ADDED: Reset theses to an empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchTheses();
    }, []);

    const handleUploadClick = () => {
        if (isAuthenticated) {
            navigate('/upload');
        } else {
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <p className="text-secondary fs-5">Loading public theses...</p>
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
            {/* Hero Section */}
            <div className="card shadow-sm p-4 text-center bg-primary text-white mb-5">
                <h1 className="display-5 fw-bold mb-3">
                    Digital Thesis Repository
                </h1>
                <p className="lead">
                    Explore a vast collection of academic theses or submit your own work for review.
                </p>
                <button className="btn btn-outline-light btn-lg mt-3" onClick={handleUploadClick}>
                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                    Submit Your Work Here
                </button>
            </div>

            {/* Theses List Section */}
            <div className="card shadow-sm p-4 text-center">
                <h2 className="h4 text-primary mb-3">
                    <FontAwesomeIcon icon={faGraduationCap} className="me-3" />
                    Public Theses
                </h2>
                {theses && theses.length > 0 ? ( // <-- UPDATED LOGIC HERE
                    <div className="list-group">
                        {theses.map((thesis) => (
                            <div key={thesis._id} className="list-group-item list-group-item-action mb-2">
                                <h4 className="h5 fw-bold text-dark">{thesis.title}</h4>
                                <p className="text-muted mb-1">
                                    <span className="fw-semibold">Author:</span> {thesis.authorName}
                                </p>
                                <p className="text-muted mb-0">
                                    <span className="fw-semibold">Department:</span> {thesis.department} |
                                    <span className="fw-semibold ms-2">Year:</span> {thesis.submissionYear}
                                </p>
                                <p className="text-secondary mt-2 text-truncate-3">
                                    {thesis.abstract}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-secondary text-center">No public theses available yet.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;