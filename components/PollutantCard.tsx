
import React from 'react';

interface PollutantCardProps {
  label: string;
  value: number;
  unit: string;
  fullName: string;
  threshold: number;
}

const PollutantCard: React.FC<PollutantCardProps> = ({ label, value, unit, fullName, threshold }) => {
  const percentage = Math.min((value / threshold) * 100, 100);
  
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2 truncate" title={fullName}>{fullName}</h4>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold text-slate-900">{value.toFixed(1)}</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${percentage > 80 ? 'bg-rose-500' : percentage > 50 ? 'bg-orange-400' : 'bg-emerald-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PollutantCard;
