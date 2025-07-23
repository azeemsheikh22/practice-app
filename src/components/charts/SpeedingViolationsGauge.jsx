import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const SpeedingViolationsGauge = ({ data = { violations: 15, maxViolations: 50 } }) => {
  const percentage = (data.violations / data.maxViolations) * 100;
  
  // Create data for semi-circle gauge
  const gaugeData = [
    { name: 'Used', value: percentage, color: getColor(percentage) },
    { name: 'Remaining', value: 100 - percentage, color: '#E5E7EB' }
  ];

  function getColor(percent) {
    if (percent <= 30) return '#10B981'; // Green
    if (percent <= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Speeding Violations</h3>
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
              <div className="text-2xl font-bold text-gray-800">{data.violations}</div>
              <div className="text-xs text-gray-500">violations</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 p-2 rounded">
          <div className="text-xs text-green-600 font-medium">Safe</div>
          <div className="text-sm font-bold text-green-700">0-15</div>
        </div>
        <div className="bg-yellow-50 p-2 rounded">
          <div className="text-xs text-yellow-600 font-medium">Warning</div>
          <div className="text-sm font-bold text-yellow-700">16-30</div>
        </div>
        <div className="bg-red-50 p-2 rounded">
          <div className="text-xs text-red-600 font-medium">Critical</div>
          <div className="text-sm font-bold text-red-700">31+</div>
        </div>
      </div>
    </div>
  );
};

export default SpeedingViolationsGauge;
