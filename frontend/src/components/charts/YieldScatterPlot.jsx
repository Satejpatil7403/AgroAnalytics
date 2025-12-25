import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

const YieldScatterPlot = ({ data }) => {
    // Safety check for undefined or null data
    if (!data || !Array.isArray(data)) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    const chartData = data.map(item => ({
        x: item.area_acres,
        y: item.yield_kg,
        z: 1,
        name: item.farmer_name,
        crop: item.crop_type
    }));

    if (chartData.length === 0) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <p className="font-bold">{data.name}</p>
                    <p>Crop: {data.crop}</p>
                    <p>Area: {data.x} acres</p>
                    <p>Yield: {data.y} kg</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-container" style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" dataKey="x" name="Area" unit=" acres" stroke="#6b7280">
                        <Label value="Area (Acres)" offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis type="number" dataKey="y" name="Yield" unit=" kg" stroke="#6b7280">
                        <Label value="Yield (kg)" angle={-90} position="insideLeft" />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter name="Farmers" data={chartData} fill="#22c55e" fillOpacity={0.6} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export default YieldScatterPlot;
