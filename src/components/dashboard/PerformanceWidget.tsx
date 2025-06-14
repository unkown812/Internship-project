import React, { useEffect, useState } from 'react';
import { performanceService } from '../../services/performanceService';

interface PerformanceData {
  id: string;
  course: string;
  avg_score: number;
  // improvement: number;
}

const PerformanceWidget: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const data = await performanceService.getAll();
        setPerformanceData(data || []);
      } catch {
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return <div>Loading performance data...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {performanceData.map((item) => (
        <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-medium">{item.course}</h3>
            <p className="text-sm text-gray-500">Avg. Score: {item.avg_score}%</p>
          </div>
          <div className="text-sm text-green-600">
            {/* +{item.improvement}% improvement */}
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
