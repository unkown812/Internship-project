import React from 'react';

const PerformanceWidget: React.FC = () => {
  const performanceData = [
    { course: '10th Science', avgScore: 82, improvement: 5.2 },
    { course: '12th PCM', avgScore: 78, improvement: 3.4 },
    { course: 'JEE Foundation', avgScore: 75, improvement: 6.8 },
    { course: 'NEET Foundation', avgScore: 81, improvement: 4.7 }
  ];

  return (
    <div className="space-y-4">
      {performanceData.map((item, index) => (
        <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-medium">{item.course}</h3>
            <p className="text-sm text-gray-500">Avg. Score: {item.avgScore}%</p>
          </div>
          <div className="text-sm text-green-600">
            +{item.improvement}% improvement
          </div>
        </div>
      ))}
      <div className="mt-2">
        <button className="text-sm text-primary font-medium hover:underline">
          View detailed report →
        </button>
      </div>
    </div>
  );
};

export default PerformanceWidget;