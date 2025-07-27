// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUsersTheses } from '../api/thesisApi'; // Import the new API function

const DashboardPage = () => {
    const { user, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [userTheses, setUserTheses] = useState([]);
    const [thesesLoading, setThesesLoading] = useState(true);
    const [thesesError, setThesesError] = useState(null);

    useEffect(() => {
        // Redirect to login if not authenticated and not loading
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    // Effect to fetch the user's theses
    useEffect(() => {
        if (isAuthenticated) {
            const fetchUserTheses = async () => {
                try {
                    const data = await getUsersTheses();
                    setUserTheses(data);
                } catch (err) {
                    setThesesError('Failed to fetch your theses. Please try again later.');
                } finally {
                    setThesesLoading(false);
                }
            };
            fetchUserTheses();
        }
    }, [isAuthenticated]);

    if (loading || thesesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        );
    }

    if (thesesError) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl text-center">
                    <p className="text-red-600 text-lg">{thesesError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl text-center">
                <h2 className="text-4xl font-extrabold text-blue-800 mb-6">User Dashboard</h2>
                {isAuthenticated ? (
                    <>
                        <p className="text-lg text-gray-700 mb-4">
                            Welcome, <span className="font-semibold text-blue-600">{user?.username || user?.email}</span>!
                        </p>
                        <p className="text-md text-gray-600">
                            Your role: <span className="font-semibold text-blue-600">{user?.role}</span>
                        </p>
                        <div className="mt-8 p-4 bg-green-50 rounded-md border border-green-200">
                            <h3 className="text-2xl font-semibold text-green-700 mb-3">My Submissions</h3>
                            {userTheses.length > 0 ? (
                                <div className="space-y-4">
                                    {userTheses.map((thesis) => (
                                        <div key={thesis._id} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm text-left">
                                            <h4 className="text-lg font-medium text-gray-800">{thesis.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-semibold">Status:</span> {thesis.status}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                                                {thesis.abstract}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center">You have not submitted any theses yet.</p>
                            )}
                        </div>
                        {user?.role === 'admin' || user?.role === 'supervisor' ? (
                            <div className="mt-8 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                                <h3 className="text-2xl font-semibold text-yellow-700 mb-3">Admin/Supervisor Actions</h3>
                                <p className="text-gray-600">
                                    (Placeholder for links to manage pending theses, user roles, or analytics.)
                                </p>
                                <button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-md transition duration-200 ease-in-out">
                                    View Pending Theses
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <p className="text-lg text-red-600">
                        You need to be logged in to view your dashboard. Please <a href="/login" className="text-blue-600 hover:underline">Login</a> or <a href="/register" className="text-blue-600 hover:underline">Register</a>.
                    </p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;