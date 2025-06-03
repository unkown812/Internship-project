import React from 'react';
// import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgcolor:string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgcolor }) => {
  
  return (
    <div className={`card transition-shadow hover:shadow-md ${bgcolor} ${color} border-none `}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="ml-5">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold ">{value}</p>
            {/* <div className={`ml-2 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              <span>{Math.abs(change)}%</span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;