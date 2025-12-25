import { useState, useEffect } from 'react';
import api from '../utils/api';
import './FarmerForm.css';

const FarmerForm = ({ farmerToEdit, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        farmer_name: '',
        village_name: '',
        crop_type: '',
        area_acres: '',
        yield_kg: '',
        latitude: '',
        longitude: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (farmerToEdit) {
            setFormData({
                farmer_name: farmerToEdit.farmer_name,
                village_name: farmerToEdit.village_name,
                crop_type: farmerToEdit.crop_type,
                area_acres: farmerToEdit.area_acres,
                yield_kg: farmerToEdit.yield_kg,
                latitude: farmerToEdit.latitude,
                longitude: farmerToEdit.longitude
            });
        }
    }, [farmerToEdit]);

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

        try {
            const payload = {
                ...formData,
                area_acres: parseFloat(formData.area_acres),
                yield_kg: parseFloat(formData.yield_kg),
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            };

            if (farmerToEdit) {
                await api.put(`/api/farmers/${farmerToEdit.id}`, payload);
            } else {
                await api.post('/api/farmers', payload);
            }

            setFormData({
                farmer_name: '',
                village_name: '',
                crop_type: '',
                area_acres: '',
                yield_kg: '',
                latitude: '',
                longitude: ''
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save farmer data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="farmer-form-container glass-card">
            <div className="form-header">
                <h3>{farmerToEdit ? '✏️ Edit Farmer Record' : '➕ Add New Farmer'}</h3>
                {farmerToEdit && onCancel && (
                    <button onClick={onCancel} className="btn btn-secondary btn-sm">
                        Cancel
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="farmer-form">
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Farmer Name</label>
                        <input
                            type="text"
                            name="farmer_name"
                            value={formData.farmer_name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter farmer name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Village Name</label>
                        <input
                            type="text"
                            name="village_name"
                            value={formData.village_name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter village name"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Crop Type</label>
                        <input
                            type="text"
                            name="crop_type"
                            value={formData.crop_type}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., Rice, Wheat, Cotton"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Area (Acres)</label>
                        <input
                            type="number"
                            name="area_acres"
                            value={formData.area_acres}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter area in acres"
                            step="0.1"
                            min="0.1"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Yield (kg)</label>
                        <input
                            type="number"
                            name="yield_kg"
                            value={formData.yield_kg}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter yield in kg"
                            step="1"
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Latitude</label>
                        <input
                            type="number"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., 18.5204"
                            step="0.0001"
                            min="-90"
                            max="90"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Longitude</label>
                        <input
                            type="number"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., 73.8567"
                            step="0.0001"
                            min="-180"
                            max="180"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (farmerToEdit ? 'Update Farmer' : 'Add Farmer')}
                </button>
            </form>
        </div>
    );
};

export default FarmerForm;
