import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isOfficer } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">🌾</span>
                        <span className="brand-text">AgroAnalytics</span>
                    </Link>

                    <div className="navbar-links">
                        <Link to="/" className="nav-link">
                            Farmer Data
                        </Link>
                        {isOfficer() && (
                            <Link to="/dashboard" className="nav-link">
                                Dashboard
                            </Link>
                        )}
                    </div>

                    <div className="navbar-actions">
                        <div className="user-info">
                            <span className="user-icon">👤</span>
                            <div className="user-details">
                                <span className="user-name">{user.username}</span>
                                <span className="user-role">{user.role}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
