// frontend/src/pages/UploadThesisPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUpload,
    faHeading,
    faUser,
    faBuilding,
    faCalendar,
    faFilePdf,
    faAlignLeft,
} from '@fortawesome/free-solid-svg-icons';

const UploadThesisPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [authorName, setAuthorName] = useState(user?.username || '');
    const [department, setDepartment] = useState('');
    const [submissionYear, setSubmissionYear] = useState('');
    const [abstract, setAbstract] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('authorName', authorName);
        formData.append('department', department);
        formData.append('submissionYear', submissionYear);
        formData.append('abstract', abstract);
        formData.append('file', file);

        try {
            const response = await axios.post('/api/theses/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Thesis submitted successfully! Redirecting you to the dashboard...');

            // Redirect to the dashboard after a short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000); // Redirect after 2 seconds

        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Failed to submit thesis. Please ensure your backend is running.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm p-4">
                        <h2 className="card-title text-center mb-4">
                            <FontAwesomeIcon icon={faUpload} className="me-2 text-primary" />
                            Upload Your Thesis
                        </h2>
                        <p className="text-center text-muted mb-4">
                            Please fill in the details below to submit your work for review.
                        </p>

                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">
                                    Thesis Title
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text"><FontAwesomeIcon icon={faHeading} /></span>
                                    <input
                                        type="text"
                                        id="title"
                                        className="form-control"
                                        placeholder="Enter the title of your thesis"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="authorName" className="form-label">
                                        Author's Name
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                                        <input
                                            type="text"
                                            id="authorName"
                                            className="form-control"
                                            placeholder="Enter the author's name"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="department" className="form-label">
                                        Department
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faBuilding} /></span>
                                        <input
                                            type="text"
                                            id="department"
                                            className="form-control"
                                            placeholder="e.g., Computer Science"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="submissionYear" className="form-label">
                                    Submission Year
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text"><FontAwesomeIcon icon={faCalendar} /></span>
                                    <input
                                        type="number"
                                        id="submissionYear"
                                        className="form-control"
                                        placeholder="e.g., 2024"
                                        value={submissionYear}
                                        onChange={(e) => setSubmissionYear(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="abstract" className="form-label">
                                    Abstract
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text"><FontAwesomeIcon icon={faAlignLeft} /></span>
                                    <textarea
                                        id="abstract"
                                        className="form-control"
                                        rows="5"
                                        placeholder="Provide a summary of your thesis"
                                        value={abstract}
                                        onChange={(e) => setAbstract(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="file" className="form-label">
                                    Upload Thesis File (PDF)
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text"><FontAwesomeIcon icon={faFilePdf} /></span>
                                    <input
                                        type="file"
                                        id="file"
                                        className="form-control"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Thesis'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadThesisPage;