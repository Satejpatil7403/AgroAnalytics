import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

const CropPercentageDistribution = ({ data }) => {
    // Safety check for undefined or null data
    if (!data || !Array.isArray(data)) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    // Calculate percentage distribution
    const cropCounts = data.reduce((acc, curr) => {
        acc[curr.crop_type] = (acc[curr.crop_type] || 0) + 1;
        return acc;
    }, {});

    const total = data.length;
    const chartData = Object.entries(cropCounts).map(([name, count]) => ({
        name,
        value: count,
        percentage: ((count / total) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    if (chartData.length === 0) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percentage < 5) return null;

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="bold"
            >
                {`${percentage}%`}
            </text>
        );
    };

    return (
        <div className="chart-container" style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name, props) => [`${value} farmers (${props.payload.percentage}%)`, name]}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CropPercentageDistribution;
