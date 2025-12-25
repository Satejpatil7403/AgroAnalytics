import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const VillageYieldDistribution = ({ data }) => {
    // Safety check for undefined or null data
    if (!data || !Array.isArray(data)) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    // Calculate average yield per village
    const chartData = data.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.village_name);
        if (existing) {
            existing.totalYield += curr.yield_kg;
            existing.count += 1;
        } else {
            acc.push({
                name: curr.village_name,
                totalYield: curr.yield_kg,
                count: 1
            });
        }
        return acc;
    }, []).map(item => ({
        name: item.name,
        avgYield: (item.totalYield / item.count).toFixed(0),
        totalYield: item.totalYield.toFixed(0)
    })).sort((a, b) => Number(b.avgYield) - Number(a.avgYield));

    if (chartData.length === 0) {
        return <div className="text-center p-4">No data available for chart</div>;
    }

    return (
        <div className="chart-container" style={{ height: '500px', width: '100%' }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12, width: 150 }}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#16a34a"
                        label={{ value: 'Total Yield (kg)', angle: -90, position: 'insideLeft', fill: '#16a34a', offset: 0 }}
                        domain={[0, 'auto']}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#ea580c"
                        label={{ value: 'Average Yield (kg)', angle: 90, position: 'insideRight', fill: '#ea580c', offset: 0 }}
                        domain={[0, 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar yAxisId="left" dataKey="totalYield" name="Total Yield (kg)" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30}>
                        <LabelList dataKey="totalYield" position="top" fill="#166534" fontSize={11} formatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} />
                    </Bar>
                    {/* Average Yield Line */}
                    <Line yAxisId="right" type="monotone" dataKey="avgYield" name="Average Yield (kg)" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} >
                        <LabelList dataKey="avgYield" position="top" fill="#ea580c" fontSize={11} offset={10} />
                    </Line>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VillageYieldDistribution;
