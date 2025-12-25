import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'farmer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        const result = await register(formData.username, formData.password, formData.role);

        if (result.success) {
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <div className="auth-icon">🌾</div>
                        <h1>Create Account</h1>
                        <p>Join FarmerViz to start managing your data</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Choose a username"
                                required
                                minLength={3}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="farmer">Farmer</option>
                                <option value="officer">Officer</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Create a password"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Login here</Link></p>
                    </div>
                </div>

                <div className="auth-info">
                    <div className="info-card glass-card">
                        <h3>✨ Features</h3>
                        <ul>
                            <li>📊 Data visualization with charts</li>
                            <li>🗺️ Interactive maps</li>
                            <li>📁 CSV upload support</li>
                            <li>📄 PDF export capability</li>
                            <li>🔍 Advanced filtering & sorting</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
