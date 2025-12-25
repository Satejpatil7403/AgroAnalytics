import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CSVUpload from '../components/CSVUpload';
import FarmerForm from '../components/FarmerForm';
import FarmerTable from '../components/FarmerTable';
import FilterPanel from '../components/FilterPanel';
import CropBarChart from '../components/charts/CropBarChart';
import YieldScatterPlot from '../components/charts/YieldScatterPlot';
import CropYieldPerAcre from '../components/charts/CropYieldPerAcre';
import VillageCropDistribution from '../components/charts/VillageCropDistribution';
import VillageYieldDistribution from '../components/charts/VillageYieldDistribution';
import CropPercentageDistribution from '../components/charts/CropPercentageDistribution';
import FarmerMap from '../components/maps/FarmerMap';
import PDFExport from '../components/PDFExport';
import CSVExport from '../components/CSVExport';
import './FarmerManagement.css';

const FarmerManagement = () => {
    const { isOfficer } = useAuth();
    const [farmers, setFarmers] = useState([]);
    const [allFarmers, setAllFarmers] = useState([]); // For charts and maps
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0
    });
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showForm, setShowForm] = useState(false);
    const [farmerToEdit, setFarmerToEdit] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'charts', 'map'

    const chartsRef = useRef(null);

    useEffect(() => {
        fetchFarmers();
        fetchAllFarmers(); // Fetch all data for visualizations
    }, [pagination.page, filters, sortBy, sortOrder]);

    const fetchFarmers = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams({
                page: pagination.page,
                page_size: pagination.page_size,
                sort_by: sortBy,
                sort_order: sortOrder,
                ...filters
            });

            // Remove null/undefined params
            for (const [key, value] of params.entries()) {
                if (value === 'null' || value === 'undefined' || value === '') {
                    params.delete(key);
                }
            }

            const response = await api.get(`/api/farmers?${params.toString()}`);
            setFarmers(response.data.data || []);
            setPagination({
                ...pagination,
                total: response.data.total || 0,
                total_pages: response.data.total_pages || 0
            });
        } catch (error) {
            console.error('Failed to fetch farmers:', error);
            setFarmers([]); // Ensure farmers is always an array
            setPagination({
                ...pagination,
                total: 0,
                total_pages: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAllFarmers = async () => {
        try {
            // Fetch all data for charts and maps (with filters but no pagination)
            const params = new URLSearchParams({
                page: 1,
                page_size: 10000, // Large number to get all records
                ...filters
            });

            // Remove null/undefined params
            for (const [key, value] of params.entries()) {
                if (value === 'null' || value === 'undefined' || value === '') {
                    params.delete(key);
                }
            }

            const response = await api.get(`/api/farmers?${params.toString()}`);
            setAllFarmers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch all farmers:', error);
            setAllFarmers([]);
        }
    };

    const handleRefreshAll = () => {
        console.log('Refreshing all data (paginated + visualizations)...');
        fetchFarmers();
        fetchAllFarmers();
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination({ ...pagination, page: 1 }); // Reset to first page
    };

    const handleClearFilters = () => {
        setFilters({});
        setPagination({ ...pagination, page: 1 });
    };

    const handleSort = (column, order) => {
        setSortBy(column);
        setSortOrder(order);
    };

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
    };

    const handleEdit = (farmer) => {
        setFarmerToEdit(farmer);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setFarmerToEdit(null);
        handleRefreshAll(); // Use combined refresh
    };

    return (
        <div className="container page-wrapper">
            <div className="page-header">
                <div>
                    <h1>Farmer Management</h1>
                    <p>Manage Farmer Data, Visualize Trends, and Generate Reports</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => {
                            setShowForm(!showForm);
                            setFarmerToEdit(null);
                        }}
                    >
                        {showForm ? 'Cancel' : '➕ Add Farmer'}
                    </button>
                    <PDFExport farmers={allFarmers} chartsRef={chartsRef} />
                    <CSVExport data={allFarmers} />
                </div>
            </div>

            {showForm && (
                <div className="animate-slide-up">
                    <FarmerForm
                        farmerToEdit={farmerToEdit}
                        onSuccess={handleFormSuccess}
                        onCancel={() => {
                            setShowForm(false);
                            setFarmerToEdit(null);
                        }}
                    />
                </div>
            )}

            <div className="content-grid">
                <div className="sidebar">
                    {isOfficer() && <CSVUpload onUploadSuccess={handleRefreshAll} />}
                    <FilterPanel
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                </div>

                <div className="main-content">
                    <div className="tabs glass-card mb-2">
                        <button
                            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => setActiveTab('list')}
                        >
                            📋 Data List
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('charts')}
                        >
                            📊 Visualizations
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                            onClick={() => setActiveTab('map')}
                        >
                            🗺️ Map View
                        </button>
                    </div>

                    <div className="tab-content animate-fade-in">
                        {activeTab === 'list' && (
                            loading ? (
                                <div className="loading-container glass-card">
                                    <div className="spinner"></div>
                                    <p>Loading farmer data...</p>
                                </div>
                            ) : (
                                <FarmerTable
                                    farmers={farmers}
                                    onEdit={handleEdit}
                                    onDelete={handleRefreshAll}
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={handleSort}
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                />
                            )
                        )}

                        {activeTab === 'charts' && (
                            <div className="charts-view glass-card" ref={chartsRef}>
                                <div className="chart-section">
                                    <h3>Crop Distribution (by Area)</h3>
                                    <CropBarChart data={allFarmers} />
                                </div>
                                <div className="chart-section mt-2">
                                    <h3>Area vs Yield Analysis</h3>
                                    <YieldScatterPlot data={allFarmers} />
                                </div>
                                <div className="chart-section mt-2">
                                    <h3>Crop Yield per Acre</h3>
                                    <CropYieldPerAcre data={allFarmers} />
                                </div>
                                <div className="chart-section mt-2">
                                    <h3>Crop Percentage Distribution</h3>
                                    <CropPercentageDistribution data={allFarmers} />
                                </div>
                                <div className="chart-section mt-2">
                                    <h3>Village vs Crop Distribution</h3>
                                    <VillageCropDistribution data={allFarmers} />
                                </div>
                                <div className="chart-section mt-2">
                                    <h3>Village vs Yield Distribution</h3>
                                    <VillageYieldDistribution data={allFarmers} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div className="map-view glass-card">
                                <h3>Farmer Locations</h3>
                                <FarmerMap farmers={allFarmers} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerManagement;
