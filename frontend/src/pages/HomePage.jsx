// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner,
    faUser,
    faBuilding,
    faCalendar,
    faUpload,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext.jsx';
import SearchResultPage from './SearchResultPage';
import '../styles/HomePage.css'; // Ensure this is imported

// Define how many theses to show per page for public list
const THESES_PER_PAGE_HOME = 5;

const HomePage = () => {
    const { user } = useAuth();
    const { searchQuery } = useSearch();

    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heroText, setHeroText] = useState('Explore and Contribute');
    const heroPhrases = ['Discover Knowledge', 'Share Your Research', 'Connect with Academia'];

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!searchQuery) {
            const fetchTheses = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/theses');
                    setTheses(response.data);
                    setLoading(false);
                    setCurrentPage(1);
                } catch (err) {
                    console.error('Error fetching theses:', err);
                    setError('Failed to fetch theses. Please try again later.');
                    setLoading(false);
                }
            };
            fetchTheses();
        } else {
            setLoading(false);
            setError(null);
            setCurrentPage(1);
        }

        const intervalId = setInterval(() => {
            setHeroText(prevText => {
                const currentPhraseIndex = heroPhrases.indexOf(prevText);
                const nextPhraseIndex = (currentPhraseIndex + 1) % heroPhrases.length;
                return heroPhrases[nextPhraseIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, [searchQuery]);

    const indexOfLastThesis = currentPage * THESES_PER_PAGE_HOME;
    const indexOfFirstThesis = indexOfLastThesis - THESES_PER_PAGE_HOME;
    const currentThesesToDisplay = theses.slice(indexOfFirstThesis, indexOfLastThesis);
    const totalPages = Math.ceil(theses.length / THESES_PER_PAGE_HOME);

    const goToNextPage = () => {
        setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    };

    const goToPrevPage = () => {
        setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    };

    if (loading && !searchQuery) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
            </div>
        );
    }

    if (error && !searchQuery) {
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
                {searchQuery ? (
                    <SearchResultPage />
                ) : (
                    <>
                        <h2 className="text-center mb-4 text-primary">Recent Submissions</h2>
                        <div className="list-group thesis-list-vertical"> {/* New container for vertical list */}
                            {currentThesesToDisplay.length > 0 ? (
                                currentThesesToDisplay.map((thesis) => (
                                    <Link
                                        to={`/thesis/${thesis._id}`}
                                        key={thesis._id}
                                        className="list-group-item list-group-item-action public-thesis-line-item"
                                    >
                                        {/* Details displayed in line using spans */}
                                        <span className="thesis-title">{thesis.title}</span>
                                        <span className="thesis-author d-none d-md-inline"> {/* Hide on small screens */}
                                            <FontAwesomeIcon icon={faUser} className="me-1" />
                                            By: {thesis.authorName}
                                        </span>
                                        <span className="thesis-department d-none d-lg-inline"> {/* Hide on medium/small screens */}
                                            <FontAwesomeIcon icon={faBuilding} className="me-1" />
                                            Dept: {thesis.department}
                                        </span>
                                        <span className="thesis-year ms-auto"> {/* Pushes to the right */}
                                            <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                            {thesis.submissionYear}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center text-muted p-5 w-100">
                                    <p>No theses have been uploaded yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {theses.length > THESES_PER_PAGE_HOME && (
                            <div className="d-flex justify-content-between align-items-center mt-4 p-3 border-top">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} className="me-2" /> Previous Page
                                </button>
                                <span className="text-muted fw-bold">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    Next Page <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default HomePage;