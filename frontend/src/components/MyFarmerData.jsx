import { useState } from 'react';
import api from '../utils/api';
import './MyFarmerData.css';

const MyFarmerData = ({ farmers, onEdit, onDelete }) => {
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/api/farmers/${id}`);
                onDelete();
            } catch (error) {
                alert('Failed to delete record');
            }
        }
    };

    if (!farmers || farmers.length === 0) {
        return (
            <div className="empty-state glass-card">
                <span className="empty-icon">📭</span>
                <h3>No Data Found</h3>
                <p>You haven't added any farmer data yet. Click "Add Farmer" to get started!</p>
            </div>
        );
    }

    return (
        <div className="my-data-container">
            <h3 className="my-data-title">My Farmer Data ({farmers.length} {farmers.length === 1 ? 'record' : 'records'})</h3>
            <div className="data-cards-grid">
                {farmers.map((farmer) => (
                    <div key={farmer.id} className="data-card glass-card">
                        <div className="card-header">
                            <h4>{farmer.farmer_name}</h4>
                            <span className="badge badge-primary">{farmer.crop_type}</span>
                        </div>

                        <div className="card-body">
                            <div className="data-row">
                                <span className="label">Village:</span>
                                <span className="value">{farmer.village_name}</span>
                            </div>
                            <div className="data-row">
                                <span className="label">Area:</span>
                                <span className="value">{farmer.area_acres} acres</span>
                            </div>
                            <div className="data-row">
                                <span className="label">Yield:</span>
                                <span className="value">{farmer.yield_kg} kg</span>
                            </div>
                            <div className="data-row">
                                <span className="label">Location:</span>
                                <span className="value location-text">
                                    {farmer.latitude.toFixed(4)}, {farmer.longitude.toFixed(4)}
                                </span>
                            </div>
                        </div>

                        <div className="card-actions">
                            <button
                                onClick={() => onEdit(farmer)}
                                className="btn btn-secondary btn-sm"
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => handleDelete(farmer.id)}
                                className="btn btn-danger btn-sm"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyFarmerData;
