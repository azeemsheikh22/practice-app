import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SpeedingSeverityChart = ({ 
  data = [
    { vehicle: 'Vehicle-001', light: 8, moderate: 4, severe: 2 },
    { vehicle: 'Vehicle-002', light: 12, moderate: 2, severe: 1 },
    { vehicle: 'Vehicle-003', light: 6, moderate: 6, severe: 4 },
    { vehicle: 'Vehicle-004', light: 15, moderate: 3, severe: 0 },
    { vehicle: 'Vehicle-005', light: 9, moderate: 5, severe: 3 }
  ]
}) => {
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Speeding Severity</h3>
        <span className="text-sm text-gray-500">By Vehicle</span>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="horizontal"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#6B7280" fontSize={12} />
            <YAxis 
              dataKey="vehicle" 
              type="category" 
              stroke="#6B7280" 
              fontSize={12}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="light" stackId="a" fill="#10B981" name="Light" radius={[0, 2, 2, 0]} />
            <Bar dataKey="moderate" stackId="a" fill="#F59E0B" name="Moderate" />
            <Bar dataKey="severe" stackId="a" fill="#EF4444" name="Severe" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpeedingSeverityChart;
