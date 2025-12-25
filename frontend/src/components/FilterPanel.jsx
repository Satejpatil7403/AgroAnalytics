import { useState, useEffect } from 'react';
import api from '../utils/api';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange, onClear }) => {
    const [crops, setCrops] = useState([]);
    const [villages, setVillages] = useState([]);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        try {
            const response = await api.get('/api/farmers?page=1&page_size=1000');
            const data = response.data.data;

            const uniqueCrops = [...new Set(data.map(f => f.crop_type))].sort();
            const uniqueVillages = [...new Set(data.map(f => f.village_name))].sort();

            setCrops(uniqueCrops);
            setVillages(uniqueVillages);
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value || null });
    };

    return (
        <div className="filter-panel glass-card">
            <div className="filter-header">
                <h3>🔍 Filters</h3>
                <button onClick={onClear} className="btn btn-secondary btn-sm">
                    Clear All
                </button>
            </div>

            <div className="filter-grid">
                <div className="form-group">
                    <label className="form-label">Crop Type</label>
                    <select
                        name="crop_type"
                        value={filters.crop_type || ''}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">All Crops</option>
                        {crops.map(crop => (
                            <option key={crop} value={crop}>{crop}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Village</label>
                    <select
                        name="village_name"
                        value={filters.village_name || ''}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">All Villages</option>
                        {villages.map(village => (
                            <option key={village} value={village}>{village}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Min Area (acres)</label>
                    <input
                        type="number"
                        name="min_area"
                        value={filters.min_area || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="0"
                        step="0.1"
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Max Area (acres)</label>
                    <input
                        type="number"
                        name="max_area"
                        value={filters.max_area || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="100"
                        step="0.1"
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Min Yield (kg)</label>
                    <input
                        type="number"
                        name="min_yield"
                        value={filters.min_yield || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="0"
                        step="1"
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Max Yield (kg)</label>
                    <input
                        type="number"
                        name="max_yield"
                        value={filters.max_yield || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="10000"
                        step="1"
                        min="0"
                    />
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
