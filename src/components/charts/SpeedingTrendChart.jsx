import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpeedingTrendChart = ({ 
  data = [
    { day: 'Mon', violations: 12 },
    { day: 'Tue', violations: 8 },
    { day: 'Wed', violations: 15 },
    { day: 'Thu', violations: 6 },
    { day: 'Fri', violations: 18 },
    { day: 'Sat', violations: 4 },
    { day: 'Sun', violations: 9 }
  ]
}) => {
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-red-600">
            Violations: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Speeding Violations Trend</h3>
        <span className="text-sm text-gray-500">This Week</span>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              stroke="#6B7280" 
              fontSize={12}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="violations" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]}
              name="Violations"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Peak: {Math.max(...data.map(d => d.violations))} violations</span>
        <span>Total: {data.reduce((acc, item) => acc + item.violations, 0)} violations</span>
      </div>
    </div>
  );
};

export default SpeedingTrendChart;
