import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const CropYieldPerAcre = ({ data }) => {


    // Safety check for undefined or null data
    if (!data || !Array.isArray(data)) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    // Calculate yield per acre for each crop type
    const chartData = data.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.crop_type);
        const yieldPerAcre = curr.yield_kg / curr.area_acres;

        if (existing) {
            existing.totalYield += curr.yield_kg;
            existing.totalArea += curr.area_acres;
            existing.count += 1;
        } else {
            acc.push({
                name: curr.crop_type,
                totalYield: curr.yield_kg,
                totalArea: curr.area_acres,
                count: 1
            });
        }
        return acc;
    }, []).map(item => ({
        name: item.name,
        yieldPerAcre: (item.totalYield / item.totalArea).toFixed(2)
    })).sort((a, b) => b.yieldPerAcre - a.yieldPerAcre);

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
                    <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis stroke="#6b7280" label={{ value: 'Yield (kg/acre)', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="yieldPerAcre" name="Yield per Acre (kg)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CropYieldPerAcre;
