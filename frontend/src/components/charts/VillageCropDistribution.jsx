import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const VillageCropDistribution = ({ data }) => {


    // Safety check for undefined or null data
    if (!data || !Array.isArray(data)) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    // Get unique villages and crops
    const villages = [...new Set(data.map(item => item.village_name))];
    const crops = [...new Set(data.map(item => item.crop_type))];

    // Create data structure for stacked bar chart
    const chartData = villages.map(village => {
        const villageData = { village };
        crops.forEach(crop => {
            const count = data.filter(item =>
                item.village_name === village && item.crop_type === crop
            ).length;
            villageData[crop] = count;
        });
        return villageData;
    }).sort((a, b) => {
        const totalA = crops.reduce((sum, crop) => sum + (a[crop] || 0), 0);
        const totalB = crops.reduce((sum, crop) => sum + (b[crop] || 0), 0);
        return totalB - totalA;
    });

    if (chartData.length === 0) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    return (
        <div className="chart-container" style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="village"
                        stroke="#6b7280"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                    />
                    <YAxis stroke="#6b7280" label={{ value: 'Number of Farmers', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    {crops.map((crop, index) => (
                        <Bar
                            key={crop}
                            dataKey={crop}
                            stackId="a"
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VillageCropDistribution;
