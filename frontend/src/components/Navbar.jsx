// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGraduationCap,
    faSignInAlt,
    faUserPlus,
    faSignOutAlt,
    faUpload,
    faUserCircle,
    faSearch
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu
    const navbarRef = useRef(null); // Ref to the navbar element

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    // Toggle the mobile menu state
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Effect to handle clicks outside the navbar
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the mobile menu is open and the click is outside the navbar, close it
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        // Add event listener when the component mounts
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navbarRef]); // Re-run effect if ref changes (optional, but good practice)

    const activeLinkStyle = ({ isActive }) => ({
        borderBottom: isActive ? '2px solid #fff' : 'none',
        paddingBottom: '2px',
        transition: 'border-bottom 0.2s ease-in-out'
    });

    return (
        <nav ref={navbarRef} className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container">
                {/* Brand */}
                <NavLink to="/" className="navbar-brand d-flex align-items-center">
                    <FontAwesomeIcon icon={faGraduationCap} size="2x" className="me-2" />
                    <span className="fs-5 d-none d-md-block">Digital Thesis Repository</span>
                </NavLink>

                {/* Mobile Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMobileMenu} // Use the custom toggle function
                    aria-expanded={isMobileMenuOpen ? "true" : "false"}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* The collapse div is conditionally shown based on our state */}
                <div
                    className={`navbar-collapse ${isMobileMenuOpen ? 'collapse show' : 'collapse'}`}
                    id="navbarNav"
                >
                    {/* Search Bar */}
                    <form className="d-flex mx-auto my-2 my-lg-0 w-50" onSubmit={handleSearch}>
                        <div className="input-group">
                            <span className="input-group-text bg-light text-primary border-0">
                                <FontAwesomeIcon icon={faSearch} />
                            </span>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search theses..."
                                aria-label="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>

                    {/* Nav Items */}
                    <ul className="navbar-nav ms-auto">
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item me-lg-2">
                                    <NavLink to="/dashboard" className="nav-link" style={activeLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>
                                        <FontAwesomeIcon icon={faUserCircle} className="me-1" />Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item me-lg-2">
                                    <NavLink to="/upload" className="nav-link" style={activeLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>
                                        <FontAwesomeIcon icon={faUpload} className="me-1" />Upload Thesis
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <button onClick={logout} className="btn btn-danger btn-sm">
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item me-lg-2">
                                    <NavLink to="/login" className="nav-link" style={activeLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-1" />Login
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/register" className="nav-link" style={activeLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>
                                        <FontAwesomeIcon icon={faUserPlus} className="me-1" />Register
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;