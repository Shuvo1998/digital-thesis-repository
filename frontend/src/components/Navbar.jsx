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
    faSearch,
    faUserShield,
    faUsers,
    faCaretDown, // New icon for the dropdown caret
    faEdit // New icon for Edit Profile
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // NEW: State for the profile dropdown
    const navbarRef = useRef(null);
    const profileDropdownRef = useRef(null); // NEW: Ref for the profile dropdown

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsProfileDropdownOpen(false); // Close profile dropdown when mobile menu is toggled
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
        setIsMobileMenuOpen(false); // Close mobile menu when profile dropdown is toggled
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
            // NEW: Handle clicking outside the profile dropdown
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navbarRef, profileDropdownRef]);

    const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

    return (
        <nav ref={navbarRef} className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container">
                <NavLink to="/" className="navbar-brand d-flex align-items-center">
                    <FontAwesomeIcon icon={faGraduationCap} size="2x" className="me-2" />
                    <span className="fs-5 d-none d-md-block">Digital Thesis Repository</span>
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMobileMenu}
                    aria-expanded={isMobileMenuOpen ? "true" : "false"}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className={`navbar-collapse ${isMobileMenuOpen ? 'collapse show' : 'collapse'}`}
                    id="navbarNav"
                >
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

                    <ul className="navbar-nav ms-auto">
                        {isAuthenticated ? (
                            <>
                                {/* Conditional links for Admin/Supervisor */}
                                {isAdminOrSupervisor && (
                                    <>
                                        <li className="nav-item me-lg-2">
                                            <NavLink to="/admin-dashboard" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                                <FontAwesomeIcon icon={faUserShield} className="me-1" />Thesis Management
                                            </NavLink>
                                        </li>
                                        <li className="nav-item me-lg-2">
                                            <NavLink to="/manage-users" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                                <FontAwesomeIcon icon={faUsers} className="me-1" />User Management
                                            </NavLink>
                                        </li>
                                    </>
                                )}

                                {/* Links for regular users */}
                                {!isAdminOrSupervisor && (
                                    <li className="nav-item me-lg-2">
                                        <NavLink to="/upload-thesis" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                            <FontAwesomeIcon icon={faUpload} className="me-1" />Upload Thesis
                                        </NavLink>
                                    </li>
                                )}

                                {/* Profile dropdown button */}
                                <li className="nav-item dropdown" ref={profileDropdownRef}>
                                    <button
                                        className="nav-link btn btn-link dropdown-toggle"
                                        onClick={toggleProfileDropdown}
                                        aria-expanded={isProfileDropdownOpen ? "true" : "false"}
                                    >
                                        <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                                        {user?.username}
                                        <FontAwesomeIcon icon={faCaretDown} className="ms-2" />
                                    </button>
                                    <div className={`dropdown-menu dropdown-menu-end ${isProfileDropdownOpen ? 'show' : ''}`}>
                                        <NavLink
                                            to="/profile"
                                            className="dropdown-item"
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faUserCircle} className="me-2" />View Profile
                                        </NavLink>
                                        <NavLink
                                            to="/edit-profile"
                                            className="dropdown-item"
                                            onClick={() => {
                                                setIsProfileDropdownOpen(false);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="me-2" />Edit Profile
                                        </NavLink>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                logout();
                                                setIsProfileDropdownOpen(false);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />Logout
                                        </button>
                                    </div>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item me-lg-2">
                                    <NavLink to="/login" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-1" />Login
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/register" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
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