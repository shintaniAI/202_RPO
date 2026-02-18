import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { DailyData } from '../types';
import { TrendingUp, Users, MousePointerClick, Coins, Percent, Target } from 'lucide-react';

interface DashboardProps {
  data: DailyData[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const summary = useMemo(() => {
    const totalCost = data.reduce((acc, curr) => acc + curr.cost, 0);
    const totalApps = data.reduce((acc, curr) => acc + curr.applications, 0);
    const totalClicks = data.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalImpressions = data.reduce((acc, curr) => acc + curr.impressions, 0);
    
    const avgCPA = totalApps > 0 ? Math.round(totalCost / totalApps) : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cvr = totalClicks > 0 ? (totalApps / totalClicks) * 100 : 0;

    return { totalCost, totalApps, totalClicks, avgCPA, ctr, cvr };
  }, [data]);

  if (data.length === 0) return null;

  // "Executive Suite" Palette
  const colors = {
    primary: "#1e3a8a",    // Blue 900 (Navy)
    secondary: "#b45309",  // Amber 700 (Gold/Bronze)
    fill: "#eff6ff",       // Blue 50
    grid: "#e2e8f0",       // Slate 200
    text: "#64748b",       // Slate 500
    bar: "#1e293b",        // Slate 800
  };

  const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white text-slate-900 p-3 shadow-xl border border-slate-100 text-xs font-sans tracking-wide">
          <p className="text-slate-400 mb-1 text-[10px] uppercase font-sans">{label}</p>
          <p className="text-lg font-bold text-blue-900 font-sans">
            {payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-500">{unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Metric Cards - Expanded for RPO Professional View */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="group p-5 bg-slate-50 border-t-2 border-blue-900 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-900 transition-colors">利用金額</p>
            <Coins size={16} className="text-slate-300 group-hover:text-blue-900 transition-colors"/>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900">¥{summary.totalCost.toLocaleString()}</p>
        </div>
        <div className="group p-5 bg-slate-50 border-t-2 border-amber-600 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-700 transition-colors">応募数</p>
            <Users size={16} className="text-slate-300 group-hover:text-amber-700 transition-colors"/>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900">{summary.totalApps}<span className="text-xs font-sans font-normal text-slate-400 ml-1">件</span></p>
        </div>
        <div className="group p-5 bg-slate-50 border-t-2 border-slate-300 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPA</p>
            <TrendingUp size={16} className="text-slate-300"/>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900">¥{summary.avgCPA.toLocaleString()}</p>
        </div>
        <div className="group p-5 bg-slate-50 border-t-2 border-slate-300 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">クリック (CTR)</p>
            <MousePointerClick size={16} className="text-slate-300"/>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold font-sans text-slate-900">{summary.totalClicks.toLocaleString()}</p>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{summary.ctr.toFixed(2)}%</span>
          </div>
        </div>
        <div className="group p-5 bg-slate-50 border-t-2 border-slate-300 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">応募率 (CVR)</p>
            <Target size={16} className="text-slate-300"/>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900">{summary.cvr.toFixed(2)}<span className="text-xs font-sans font-normal text-slate-400 ml-1">%</span></p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-12">
        
        {/* Chart 1: Cost Efficiency */}
        <div>
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-6 flex items-center">
            <span className="w-8 h-px bg-blue-900 mr-3"></span>
            コストパフォーマンス推移
          </h3>
          <div className="h-64 w-full bg-white p-4 border border-slate-100 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.08}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 10, fill: colors.text, fontFamily: 'sans-serif'}} 
                  tickFormatter={(val) => val.slice(5)} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                   tick={{fontSize: 10, fill: colors.text, fontFamily: 'sans-serif'}}
                   axisLine={false}
                   tickLine={false}
                   tickFormatter={(val) => `¥${val/1000}k`}
                />
                <Tooltip content={<CustomTooltip unit="円" />} cursor={{stroke: colors.primary, strokeWidth: 1}} />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke={colors.primary} 
                  strokeWidth={1.5}
                  fill="url(#colorCost)" 
                  activeDot={{r: 4, strokeWidth: 0, fill: colors.primary}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Applications */}
        <div>
           <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-6 flex items-center">
            <span className="w-8 h-px bg-amber-700 mr-3"></span>
            日次応募獲得トレンド
          </h3>
          <div className="h-48 w-full bg-white p-4 border border-slate-100 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={0} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 10, fill: colors.text, fontFamily: 'sans-serif'}} 
                  tickFormatter={(val) => val.slice(5)} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <Tooltip content={<CustomTooltip unit="件" />} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="applications" fill={colors.bar} barSize={12} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};