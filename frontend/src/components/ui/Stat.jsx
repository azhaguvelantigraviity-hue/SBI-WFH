import React from 'react';
import { cn } from '../../utils/cn';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function Stat({ label, value, delta, color = 'accent', icon: Icon, className }) {
  const colors = {
    accent: 'text-accent',
    green: 'text-success',
    red: 'text-danger',
    amber: 'text-warning',
    blue: 'text-info',
    teal: 'text-teal',
    purple: 'text-purple',
  };

  const bgColors = {
    accent: 'bg-accent/10',
    green: 'bg-success/10',
    red: 'bg-danger/10',
    amber: 'bg-warning/10',
    blue: 'bg-info/10',
    teal: 'bg-teal/10',
    purple: 'bg-purple/10',
  };

  const isPositive = delta?.startsWith('+');

  return (
    <Card hover className={cn("relative overflow-hidden group", className)}>
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 opacity-80 transition-all group-hover:h-1", 
        color === 'accent' ? 'bg-accent' : 
        color === 'green' ? 'bg-success' : 
        color === 'red' ? 'bg-danger' : 
        color === 'amber' ? 'bg-warning' : 
        color === 'blue' ? 'bg-info' : 
        color === 'teal' ? 'bg-teal' : 'bg-purple'
      )} />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-text-muted dark:text-text-dark-muted uppercase tracking-widest">
            {label}
          </p>
          <h3 className={cn("text-3xl font-fraunces font-bold", colors[color] || 'text-accent')}>
            {value}
          </h3>
          {delta && (
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-bold mt-1",
              isPositive ? "text-success" : "text-danger"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{delta}</span>
              <span className="text-text-muted dark:text-text-dark-muted font-normal ml-0.5">vs last week</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn("p-2.5 rounded-xl shrink-0 opacity-80 group-hover:scale-110 transition-transform duration-300", bgColors[color] || 'bg-accent/10', colors[color] || 'text-accent')}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
