import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

// Dummy data for different chart types
const getDummyData = (chartType) => {
  switch (chartType) {
    case 'bar':
      return [
        { name: 'Vehicle A', value: 400, color: '#8884d8' },
        { name: 'Vehicle B', value: 300, color: '#82ca9d' },
        { name: 'Vehicle C', value: 200, color: '#ffc658' },
        { name: 'Vehicle D', value: 278, color: '#ff7300' },
        { name: 'Vehicle E', value: 189, color: '#8dd1e1' }
      ];

    case 'line':
    case 'trend':
      return [
        { name: 'Mon', value: 120 },
        { name: 'Tue', value: 190 },
        { name: 'Wed', value: 300 },
        { name: 'Thu', value: 250 },
        { name: 'Fri', value: 200 },
        { name: 'Sat', value: 278 },
        { name: 'Sun', value: 189 }
      ];

    case 'pie':
    case 'doughnut':
      return [
        { name: 'High Speed', value: 35, color: '#ff6b6b' },
        { name: 'Normal', value: 45, color: '#4ecdc4' },
        { name: 'Low Speed', value: 20, color: '#45b7d1' }
      ];

    case 'guage':
      return [
        { name: 'Performance', value: 82, max: 100 }
      ];

    case 'stack':
      return [
        { name: 'Jan', high: 20, medium: 30, low: 50 },
        { name: 'Feb', high: 25, medium: 35, low: 40 },
        { name: 'Mar', high: 30, medium: 25, low: 45 },
        { name: 'Apr', high: 22, medium: 28, low: 50 }
      ];

    default:
      return [];
  }
};

// Colors for pie charts
const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

export default function ChartRenderer({ chartType, chartTitle }) {
  const data = getDummyData(chartType);

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'guage':
        const currentValue = data[0]?.value || 82;
        const needleAngle = -90 + (currentValue / 100) * 180;
        
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-full h-32 mx-auto mb-4">
                {/* Clean SVG Gauge */}
                <svg 
                  width="192" 
                  height="128" 
                  viewBox="0 0 192 128" 
                  className="overflow-visible"
                >
                  {/* Background semicircle */}
                  <path
                    d="M 20 100 A 76 76 0 0 1 172 100"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  
                  {/* Red segment (0-33%) */}
                  <path
                    d="M 20 100 A 76 76 0 0 1 65.6 32.8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  
                  {/* Orange segment (33-66%) */}
                  <path
                    d="M 65.6 32.8 A 76 76 0 0 1 126.4 32.8"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  
                  {/* Green segment (66-100%) */}
                  <path
                    d="M 126.4 32.8 A 76 76 0 0 1 172 100"
                    fill="none"
                    stroke="#84cc16"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  
                  {/* Scale labels */}
                  <text x="20" y="115" textAnchor="middle" className="text-sm font-medium fill-gray-600">0</text>
                  <text x="65" y="25" textAnchor="middle" className="text-sm font-medium fill-gray-600">25</text>
                  <text x="96" y="18" textAnchor="middle" className="text-sm font-medium fill-gray-600">50</text>
                  <text x="127" y="25" textAnchor="middle" className="text-sm font-medium fill-gray-600">75</text>
                  <text x="172" y="115" textAnchor="middle" className="text-sm font-medium fill-gray-600">100</text>
                  
                  {/* Needle */}
                  <g transform={`rotate(${needleAngle} 96 100)`}>
                    <line
                      x1="96"
                      y1="100"
                      x2="96"
                      y2="30"
                      stroke="#1f2937"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Needle tip (arrow) */}
                    <polygon
                      points="96,25 100,35 92,35"
                      fill="#1f2937"
                    />
                  </g>
                  
                  {/* Center dot */}
                  <circle
                    cx="96"
                    cy="100"
                    r="5"
                    fill="#1f2937"
                  />
                </svg>
                
                {/* Value Display Box */}
                <div className="absolute top-1 right-30 transform -translate-x-1/2">
                  <div>
                    <div className="text-center">
                      <span className="text-lg font-bold text-blue-600">
                        {currentValue}
                      </span>
                      <span className="text-md text-gray-500">%</span>
                      <div className="text-xs text-gray-500 mt-1">
                        High Performance
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart Title */}
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{chartTitle}</h3>
              
              {/* Legend */}
              <div className="flex justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-gray-600">0-33%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                  <span className="text-gray-600">34-66%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-gray-600">67-100%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stack':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Legend />
              <Bar dataKey="high" stackId="a" fill="#ff6b6b" />
              <Bar dataKey="medium" stackId="a" fill="#feca57" />
              <Bar dataKey="low" stackId="a" fill="#4ecdc4" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="mb-2">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <p className="text-sm">Unsupported Chart Type</p>
              <p className="text-xs mt-1">Type: {chartType}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full p-2">
      {renderChart()}
    </div>
  );
}
