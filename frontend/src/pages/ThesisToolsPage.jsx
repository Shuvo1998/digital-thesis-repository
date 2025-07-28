// frontend/src/pages/ThesisToolsPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const ThesisToolsPage = () => {
    // FIX: Get the token directly from the useAuth hook
    const { user, token } = useAuth();
    const [text, setText] = useState('');
    const [grammarResult, setGrammarResult] = useState(null);
    const [plagiarismResult, setPlagiarismResult] = useState(null);
    const [loadingGrammar, setLoadingGrammar] = useState(false);
    const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);
    const [error, setError] = useState('');

    const handleGrammarCheck = async () => {
        if (!text.trim()) {
            setError('Please enter text to perform the grammar check.');
            return;
        }
        setError('');
        setLoadingGrammar(true);
        setGrammarResult(null);

        try {
            // FIX: Use the token from the useAuth hook and set the correct Authorization header
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            };

            const response = await axios.post('/api/theses/check-grammar', { text }, config);
            setGrammarResult(response.data.issues);
        } catch (err) {
            console.error('Grammar check failed:', err);
            setError(err.response?.data?.msg || 'Grammar check failed.');
        } finally {
            setLoadingGrammar(false);
        }
    };

    const handlePlagiarismScan = async () => {
        if (!text.trim()) {
            setError('Please enter text to perform the plagiarism scan.');
            return;
        }
        setError('');
        setLoadingPlagiarism(true);
        setPlagiarismResult(null);

        try {
            // FIX: Use the token from the useAuth hook and set the correct Authorization header
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            };

            const response = await axios.post('/api/theses/check-plagiarism', { text }, config);
            setPlagiarismResult(response.data);
        } catch (err) {
            console.error('Plagiarism scan failed:', err);
            setError(err.response?.data?.msg || 'Plagiarism scan failed.');
        } finally {
            setLoadingPlagiarism(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <h2 className="card-title text-primary fw-bold mb-4">Writing Quality Tools</h2>
                <p className="text-muted">
                    Use this tool to analyze text for grammar issues and potential plagiarism.
                </p>
                <hr className="my-4" />

                <div className="mb-3">
                    <h5 className="fw-bold">Text to Analyze</h5>
                    <textarea
                        className="form-control"
                        id="thesisText"
                        rows="10"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter the abstract or text you want to check here..."
                    ></textarea>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="d-flex gap-2 mb-4">
                    <button
                        className="btn btn-primary"
                        onClick={handleGrammarCheck}
                        disabled={loadingGrammar || loadingPlagiarism}
                    >
                        {loadingGrammar ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Checking...
                            </>
                        ) : (
                            'Run Editorial Assistant'
                        )}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handlePlagiarismScan}
                        disabled={loadingGrammar || loadingPlagiarism}
                    >
                        {loadingPlagiarism ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Scanning...
                            </>
                        ) : (
                            'Run Plagiarism Scan'
                        )}
                    </button>
                </div>

                {/* Display Grammar Checker Results */}
                {grammarResult && (
                    <div className="mt-4 p-4 rounded bg-light border">
                        <h4 className="fw-bold text-primary">Editorial Assistant Report:</h4>
                        {grammarResult.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {grammarResult.map((issue, index) => (
                                    <li key={index} className="list-group-item bg-transparent">
                                        <strong className="text-danger">Issue:</strong> {issue.message} <br />
                                        <strong className="text-secondary">Suggestions:</strong> {issue.replacements.length > 0 ? issue.replacements.join(', ') : 'No suggestions'} <br />
                                        <small className="text-muted">
                                            **Context:** "{issue.context.trim()}"
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="alert alert-success mt-3">No grammar or spelling issues found.</div>
                        )}
                    </div>
                )}

                {/* Display Plagiarism Scan Results */}
                {plagiarismResult && (
                    <div className="mt-4 p-4 rounded bg-light border">
                        <h4 className="fw-bold text-primary">Plagiarism Scan Report:</h4>
                        <div className={`alert ${plagiarismResult.plagiarism_score > 70 ? 'alert-danger' : 'alert-info'} mt-3`}>
                            <strong>Status:</strong> {plagiarismResult.status} <br />
                            <strong>Plagiarism Score:</strong> {plagiarismResult.plagiarism_score}% <br />
                            <small className="text-muted">
                                {plagiarismResult.note}
                            </small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThesisToolsPage;