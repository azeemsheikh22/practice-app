import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DistanceTraveledChart = ({ 
  data = [
    { vehicle: 'Vehicle-001', distance: 1250, target: 1500 },
    { vehicle: 'Vehicle-002', distance: 980, target: 1200 },
    { vehicle: 'Vehicle-003', distance: 1680, target: 1800 },
    { vehicle: 'Vehicle-004', distance: 750, target: 1000 },
    { vehicle: 'Vehicle-005', distance: 1420, target: 1600 }
  ]
}) => {
  
  // Color based on target achievement
  const getBarColor = (distance, target) => {
    const percentage = (distance / target) * 100;
    if (percentage >= 90) return '#10B981'; // Green
    if (percentage >= 70) return '#3B82F6'; // Blue
    if (percentage >= 50) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.distance / data.target) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-1">{label}</p>
          <p className="text-blue-600">
            Distance: <span className="font-bold">{data.distance} km</span>
          </p>
          <p className="text-gray-500">
            Target: <span className="font-bold">{data.target} km</span>
          </p>
          <p className="text-green-600">
            Achievement: <span className="font-bold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Distance Traveled</h3>
        <span className="text-sm text-gray-500">Previous Month</span>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="vehicle" 
              stroke="#6B7280" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="distance" 
              radius={[4, 4, 0, 0]}
              name="Distance"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.distance, entry.target)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Avg: {Math.round(data.reduce((acc, item) => acc + item.distance, 0) / data.length)} km</span>
        <span>Total: {data.reduce((acc, item) => acc + item.distance, 0)} km</span>
      </div>
    </div>
  );
};

export default DistanceTraveledChart;
