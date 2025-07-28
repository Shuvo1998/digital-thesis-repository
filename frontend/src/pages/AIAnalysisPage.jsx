// frontend/src/pages/AIAnalysisPage.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faTools } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const AIAnalysisPage = () => {
    return (
        <div className="container mt-5 py-5 text-center">
            <div className="card shadow-lg p-5 mx-auto" style={{ maxWidth: '700px' }}>
                <FontAwesomeIcon icon={faBrain} size="5x" className="text-primary mb-4" />
                <h1 className="mb-3 fw-bold text-dark">AI Analysis Tools</h1>
                <p className="lead text-muted mb-4">
                    This page is under development and will soon feature advanced AI-powered tools for thesis analysis,
                    summarization, and insights.
                </p>
                <p className="text-muted">
                    Stay tuned for exciting updates!
                </p>
                <div className="mt-4">
                    <Link to="/" className="btn btn-primary btn-lg me-3">
                        <FontAwesomeIcon icon={faTools} className="me-2" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisPage;