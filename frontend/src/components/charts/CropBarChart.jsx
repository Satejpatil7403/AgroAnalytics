import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const CropBarChart = ({ data }) => {
    // Safety check for undefined or null data
    if (!data || !Array.isArray(data)) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    // Aggregate data by crop type
    const chartData = data.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.crop_type);
        if (existing) {
            existing.area += curr.area_acres;
            existing.count += 1;
        } else {
            acc.push({
                name: curr.crop_type,
                area: curr.area_acres,
                count: 1
            });
        }
        return acc;
    }, []).sort((a, b) => b.area - a.area); // Sort by area descending

    if (chartData.length === 0) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    return (
        <div className="chart-container" style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" label={{ value: 'Total Area (Acres)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="area" name="Total Area (Acres)" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CropBarChart;
