import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
  new: 'bg-info/10 text-info',
  assigned: 'bg-purple/10 text-purple',
  in_progress: 'bg-warning/10 text-warning',
  eligible: 'bg-success/10 text-success',
  not_eligible: 'bg-danger/10 text-danger',
  rejected: 'bg-danger/10 text-danger',
  qd_pending: 'bg-warning/10 text-warning',
  qd_submitted: 'bg-teal/10 text-teal',
  dispatched: 'bg-success/10 text-success',
  closed: 'bg-background-dark/10 dark:bg-background/10 text-text-muted',
  active: 'bg-success/10 text-success',
  suspended: 'bg-danger/10 text-danger',
  salaried: 'bg-info/10 text-info',
  self_employed: 'bg-teal/10 text-teal',
  paid: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  connected: 'bg-success/10 text-success',
  not_connected: 'bg-danger/10 text-danger',
  busy: 'bg-warning/10 text-warning',
  switched_off: 'bg-danger/10 text-danger',
  follow_up: 'bg-purple/10 text-purple',
  exception: 'bg-danger/10 text-danger',
  no_answer: 'bg-warning/10 text-warning',
  wrong_number: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

const dotColors = {
  new: 'bg-info',
  assigned: 'bg-purple',
  in_progress: 'bg-warning',
  eligible: 'bg-success',
  not_eligible: 'bg-danger',
  rejected: 'bg-danger',
  qd_pending: 'bg-warning',
  qd_submitted: 'bg-teal',
  dispatched: 'bg-success',
  closed: 'bg-text-muted',
  active: 'bg-success',
  suspended: 'bg-danger',
  salaried: 'bg-info',
  self_employed: 'bg-teal',
  paid: 'bg-success',
  pending: 'bg-warning',
  connected: 'bg-success',
  not_connected: 'bg-danger',
  busy: 'bg-warning',
  switched_off: 'bg-danger',
  follow_up: 'bg-purple',
  exception: 'bg-danger',
  no_answer: 'bg-warning',
  wrong_number: 'bg-danger',
  info: 'bg-info',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
};

export function Badge({ label, color, className }) {
  const key = color || label?.toLowerCase()?.replace(/\s+/g, '_');
  const variantClass = variants[key] || 'bg-background-dark/10 dark:bg-background/10 text-text-muted';
  const dotClass = dotColors[key] || 'bg-text-muted';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider',
        variantClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClass)} />
      {label}
    </span>
  );
}
