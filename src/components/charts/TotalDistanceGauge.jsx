import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TotalDistanceGauge = ({ data = { totalDistance: 8500, targetDistance: 12000 } }) => {
  const percentage = (data.totalDistance / data.targetDistance) * 100;
  
  const gaugeData = [
    { name: 'Completed', value: percentage, color: getColor(percentage) },
    { name: 'Remaining', value: 100 - percentage, color: '#E5E7EB' }
  ];

  function getColor(percent) {
    if (percent <= 25) return '#EF4444'; // Red
    if (percent <= 50) return '#F59E0B'; // Yellow
    if (percent <= 75) return '#10B981'; // Green
    return '#3B82F6'; // Blue
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Total Distance</h3>
        <span className="text-sm text-gray-500">This Month</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-full max-w-[200px] h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="90%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mt-8">
              <div className="text-xl font-bold text-gray-800">{Math.round(percentage)}%</div>
              <div className="text-xs text-gray-500">completed</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-gray-800">
          {data.totalDistance.toLocaleString()} km
        </div>
        <div className="text-sm text-gray-500">
          Target: {data.targetDistance.toLocaleString()} km
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Remaining: {(data.targetDistance - data.totalDistance).toLocaleString()} km
        </div>
      </div>
    </div>
  );
};

export default TotalDistanceGauge;
