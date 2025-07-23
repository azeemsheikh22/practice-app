import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const SafetyScoreChart = ({
    data = [
        { vehicle: 'Vehicle-001', score: 85, maxScore: 100 },
        { vehicle: 'Vehicle-002', score: 92, maxScore: 100 },
        { vehicle: 'Vehicle-003', score: 68, maxScore: 100 },
        { vehicle: 'Vehicle-004', score: 95, maxScore: 100 },
        { vehicle: 'Vehicle-005', score: 78, maxScore: 100 }
    ]
}) => {

    const getScoreColor = (score) => {
        if (score >= 90) return '#10B981'; // Green
        if (score >= 70) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    // Calculate average score
    const avgScore = Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length);

    // Transform data for radial chart - simplified with fewer rings
    const radialData = data.slice(0, 3).map((item, index) => ({
        name: item.vehicle.replace('Vehicle-', 'V-'),
        score: item.score,
        fill: getScoreColor(item.score),
        innerRadius: 30 + (index * 15),
        outerRadius: 45 + (index * 15),
    }));

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Safety Scores</h3>
                <span className="text-xs text-gray-500">Current Month</span>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center min-h-0">
                {/* Radial Chart */}
                <div className="flex-1 relative h-full">
                    <div className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                                cx="50%" 
                                cy="50%" 
                                innerRadius="20%" 
                                outerRadius="80%" 
                                data={radialData}
                                startAngle={90}
                                endAngle={-270}
                            >
                                <RadialBar 
                                    dataKey="score" 
                                    cornerRadius={3}
                                    fill="#8884d8"
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Center Score Display - Fixed positioning */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-800">{avgScore}</div>
                            <div className="text-xs text-gray-500">Avg</div>
                        </div>
                    </div>
                </div>

                {/* Score List - Compact */}
                <div className="w-24 ml-2 flex-shrink-0">
                    <div className="space-y-1">
                        {data.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center min-w-0">
                                    <div 
                                        className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                                        style={{ backgroundColor: getScoreColor(item.score) }}
                                    ></div>
                                    <span className="text-gray-600 truncate text-xs">
                                        {item.vehicle.replace('Vehicle-', 'V')}
                                    </span>
                                </div>
                                <span className="font-bold text-gray-800 ml-1 flex-shrink-0 text-xs">
                                    {item.score}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Stats - Compact */}
            <div className="mt-2 grid grid-cols-3 gap-1 text-xs flex-shrink-0">
                <div className="text-center p-1 bg-red-50 rounded">
                    <div className="text-red-600 font-medium text-xs">Poor</div>
                    <div className="text-red-800 font-bold text-xs">
                        {data.filter(item => item.score < 70).length}
                    </div>
                </div>
                <div className="text-center p-1 bg-yellow-50 rounded">
                    <div className="text-yellow-600 font-medium text-xs">Good</div>
                    <div className="text-yellow-800 font-bold text-xs">
                        {data.filter(item => item.score >= 70 && item.score < 90).length}
                    </div>
                </div>
                <div className="text-center p-1 bg-green-50 rounded">
                    <div className="text-green-600 font-medium text-xs">Great</div>
                    <div className="text-green-800 font-bold text-xs">
                        {data.filter(item => item.score >= 90).length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyScoreChart;
