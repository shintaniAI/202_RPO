import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ApplicantDemographics as ApplicantDemographicsType } from '../types';
import { Users, Globe2, PersonStanding } from 'lucide-react';

interface ApplicantDemographicsProps {
  data: ApplicantDemographicsType;
}

const COLORS = ['#1e3a8a', '#b45309', '#64748b', '#0f766e', '#7c3aed']; // Navy, Amber, Slate, Teal, Violet
const GENDER_COLORS = ['#1e3a8a', '#ec4899', '#94a3b8']; // Blue (Male), Pink (Female), Slate (Unknown)

export const ApplicantDemographics: React.FC<ApplicantDemographicsProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in duration-700">
      
      {/* Age Distribution */}
      <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-sm">
        <div className="flex items-center mb-4 border-b border-slate-50 pb-2">
            <Users size={14} className="text-blue-900 mr-2"/>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">年齢構成</h4>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.ageGroups} layout="vertical" margin={{top:0, right:30, left:0, bottom:0}}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{fontSize: 10, fill: '#475569'}} 
                width={50}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px'}}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={16}>
                {
                    data.ageGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Ratio */}
      <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-sm">
        <div className="flex items-center mb-4 border-b border-slate-50 pb-2">
            <PersonStanding size={14} className="text-blue-900 mr-2"/>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">性別比率 (推定)</h4>
        </div>
        <div className="h-40 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.genderRatio}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
              >
                {data.genderRatio.map((entry, index) => {
                    let color = GENDER_COLORS[2]; // Default Unknown
                    if (entry.name.includes('男')) color = GENDER_COLORS[0];
                    if (entry.name.includes('女')) color = GENDER_COLORS[1];
                    return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px'}}/>
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconSize={8}
                wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nationality Ratio */}
      <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-sm">
        <div className="flex items-center mb-4 border-b border-slate-50 pb-2">
            <Globe2 size={14} className="text-blue-900 mr-2"/>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">国籍区分 (推定)</h4>
        </div>
        <div className="h-40 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.nationalityRatio}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={50}
                dataKey="value"
              >
                {data.nationalityRatio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#0f766e' : '#f59e0b'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '12px'}}/>
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconSize={8}
                wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
