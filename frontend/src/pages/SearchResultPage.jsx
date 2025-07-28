// frontend/src/pages/SearchResultPage.jsx
import React from 'react';
import { useSearch } from '../context/SearchContext.jsx'; // Adjust the path if necessary
import { useNavigate } from 'react-router-dom'; // NEW: Import useNavigate
import '../styles/SearchResultPage.css'; // Import your styles for this page

const SearchResultPage = () => {
    // Consume the search state from the SearchContext
    const { searchQuery, searchResults, isSearching, searchError } = useSearch();
    const navigate = useNavigate(); // NEW: Initialize useNavigate

    // Function to handle click on a thesis result
    const handleThesisClick = (thesisId) => {
        navigate(`/thesis/${thesisId}`); // Navigate to the ThesisDetailPage with the thesis ID
    };

    // Only render this component if a search has been performed
    // and there's either a query, results, or an active search/error.
    if (!searchQuery && searchResults.length === 0 && !isSearching && !searchError) {
        return null; // Don't render anything if no search has been initiated
    }

    return (
        <div className="search-results-page container mt-4">
            {isSearching && (
                <div className="alert alert-info text-center" role="alert">
                    Searching for "{searchQuery}"...
                </div>
            )}

            {searchError && (
                <div className="alert alert-danger" role="alert">
                    Error: {searchError}
                </div>
            )}

            {!isSearching && !searchError && searchQuery && searchResults.length === 0 && (
                <div className="alert alert-warning text-center" role="alert">
                    No results found for "{searchQuery}".
                </div>
            )}

            {!isSearching && searchResults.length > 0 && (
                <>
                    <h2 className="mb-3">Results for "{searchQuery}"</h2>
                    <div className="list-group">
                        {searchResults.map((thesis) => (
                            <div
                                key={thesis.id}
                                className="list-group-item list-group-item-action mb-3 rounded shadow-sm"
                                onClick={() => handleThesisClick(thesis.id)} // NEW: Add onClick handler
                                style={{ cursor: 'pointer' }} // NEW: Add cursor style to indicate clickability
                            >
                                <h5 className="mb-1 text-primary">{thesis.title}</h5>
                                <p className="mb-1 text-muted"><strong>Author:</strong> {thesis.author}</p>
                                <small className="text-success">
                                    Relevance Score: {thesis.relevance_score.toFixed(4)} (Lower is more relevant)
                                </small>
                                {/* The original commented out link is no longer needed as we use onClick */}
                                {/* <a href={`/thesis/${thesis.id}`} className="btn btn-sm btn-outline-primary mt-2">View Details</a> */}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchResultPage;