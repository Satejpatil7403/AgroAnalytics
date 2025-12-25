import api from '../utils/api';
import './FarmerTable.css';

const FarmerTable = ({ farmers, onEdit, onDelete, sortBy, sortOrder, onSort, pagination, onPageChange }) => {
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this farmer record?')) {
            try {
                await api.delete(`/api/farmers/${id}`);
                onDelete();
            } catch (error) {
                alert('Failed to delete farmer record');
            }
        }
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const handleSort = (column) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(column, newOrder);
    };

    // Safety check for undefined or null farmers
    if (!farmers || !Array.isArray(farmers) || farmers.length === 0) {
        return (
            <div className="empty-state glass-card">
                <span className="empty-icon">📭</span>
                <h3>No Farmer Records Found</h3>
                <p>Add farmers using the form above or upload a CSV file</p>
            </div>
        );
    }

    return (
        <div className="farmer-table-container">
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('farmer_name')} style={{ cursor: 'pointer' }}>
                                Farmer Name {renderSortIcon('farmer_name')}
                            </th>
                            <th onClick={() => handleSort('village_name')} style={{ cursor: 'pointer' }}>
                                Village {renderSortIcon('village_name')}
                            </th>
                            <th onClick={() => handleSort('crop_type')} style={{ cursor: 'pointer' }}>
                                Crop {renderSortIcon('crop_type')}
                            </th>
                            <th onClick={() => handleSort('area_acres')} style={{ cursor: 'pointer' }}>
                                Area (acres) {renderSortIcon('area_acres')}
                            </th>
                            <th onClick={() => handleSort('yield_kg')} style={{ cursor: 'pointer' }}>
                                Yield (kg) {renderSortIcon('yield_kg')}
                            </th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farmers.map((farmer) => (
                            <tr key={farmer.id}>
                                <td>{farmer.farmer_name}</td>
                                <td>{farmer.village_name}</td>
                                <td>
                                    <span className="badge badge-primary">{farmer.crop_type}</span>
                                </td>
                                <td>{farmer.area_acres.toFixed(2)}</td>
                                <td>{farmer.yield_kg.toFixed(0)}</td>
                                <td className="location-cell">
                                    {farmer.latitude.toFixed(4)}, {farmer.longitude.toFixed(4)}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => onEdit(farmer)}
                                            className="btn btn-secondary btn-sm"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(farmer.id)}
                                            className="btn btn-danger btn-sm"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.total_pages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>

                    <span className="pagination-info">
                        Page {pagination.page} of {pagination.total_pages} ({pagination.total} records)
                    </span>

                    <button
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.total_pages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default FarmerTable;
