import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import CropYieldPerAcre from '../components/charts/CropYieldPerAcre';
import VillageCropDistribution from '../components/charts/VillageCropDistribution';
import VillageYieldDistribution from '../components/charts/VillageYieldDistribution';
import CropPercentageDistribution from '../components/charts/CropPercentageDistribution';
import DashboardPDFExport from '../components/DashboardPDFExport';
import './Dashboard.css';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [topCrops, setTopCrops] = useState([]);
    const [villageStats, setVillageStats] = useState([]);
    const [allFarmers, setAllFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const dashboardRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, cropsRes, villagesRes, farmersRes] = await Promise.all([
                api.get('/api/dashboard/stats'),
                api.get('/api/dashboard/top-crops'),
                api.get('/api/dashboard/village-stats'),
                api.get('/api/farmers?page=1&page_size=10000') // Fetch all farmers for charts
            ]);

            setStats(statsRes.data);
            setTopCrops(cropsRes.data);
            setVillageStats(villagesRes.data);
            setAllFarmers(farmersRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container page-wrapper flex-center">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container page-wrapper">
            <div className="page-header">
                <div>
                    <h1>Officer Dashboard</h1>
                    <p>Overview of agricultural statistics and aggregated metrics</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
                        🔄 Refresh Data
                    </button>
                    <DashboardPDFExport
                        dashboardRef={dashboardRef}
                        stats={stats}
                        villageStats={villageStats}
                    />
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-4 mb-2">
                <div className="stat-card">
                    <div className="stat-value">{stats.total_farmers}</div>
                    <div className="stat-label">Total Farmers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.total_area}</div>
                    <div className="stat-label">Total Area (Acres)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.average_yield}</div>
                    <div className="stat-label">Avg Yield (kg/acre)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.total_villages}</div>
                    <div className="stat-label">Villages Covered</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2" ref={dashboardRef}>
                {/* Top Crops Chart */}
                <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Top Crops by Area</h3>
                    <div style={{ height: '450px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={topCrops} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#6b7280" />
                                <YAxis dataKey="crop_type" type="category" stroke="#6b7280" width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none' }}
                                />
                                <Bar dataKey="total_area" name="Total Area (Acres)" fill="#22c55e" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Village Stats Table */}
                <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Village Statistics</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Village Name</th>
                                    <th>Farmer Count</th>
                                    <th>Total Area (Acres)</th>
                                    <th>Contribution</th>
                                </tr>
                            </thead>
                            <tbody>
                                {villageStats.map((village, index) => (
                                    <tr key={index}>
                                        <td>{village.village_name}</td>
                                        <td>{village.farmer_count}</td>
                                        <td>{village.total_area}</td>
                                        <td>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${(village.total_area / stats.total_area) * 100}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* New Advanced Visualizations */}
                <div className="glass-card">
                    <h3>Crop Yield per Acre</h3>
                    <CropYieldPerAcre data={allFarmers} />
                </div>

                <div className="glass-card">
                    <h3>Crop Percentage Distribution</h3>
                    <CropPercentageDistribution data={allFarmers} />
                </div>

                <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Village vs Crop Distribution</h3>
                    <VillageCropDistribution data={allFarmers} />
                </div>

                <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Village vs Yield Distribution</h3>
                    <VillageYieldDistribution data={allFarmers} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
