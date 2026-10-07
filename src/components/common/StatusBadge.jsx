import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Wrench, CheckCircle2, AlertOctagon, ShieldAlert, Activity, XCircle } from 'lucide-react';
import { TICKET_STATUS, TICKET_PRIORITY } from '../../constants/status';

const statusConfig = {
  [TICKET_STATUS.PENDING]: {
    classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20 shadow-glow-amber',
    icon: Clock,
    label: 'Pending',
    dot: (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
    ),
  },
  [TICKET_STATUS.ASSIGNED]: {
    classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 dark:border-indigo-500/20 shadow-glow-indigo',
    icon: Wrench,
    label: 'Assigned',
    dot: (
      <span className="relative flex h-2 w-2">
        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-80" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
      </span>
    ),
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/20 shadow-glow-blue',
    icon: Activity,
    label: 'In-Progress',
    dot: (
      <span className="relative flex h-2 w-2">
        <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-blue-500 border-t-transparent" />
      </span>
    ),
  },
  [TICKET_STATUS.RESOLVED]: {
    classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20 shadow-glow-emerald',
    icon: CheckCircle2,
    label: 'Resolved',
    dot: (
      <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-emerald-400 ring-2 ring-emerald-400/30" />
    ),
  },
  [TICKET_STATUS.CANCELLED]: {
    classes: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/30 dark:border-neutral-500/20',
    icon: XCircle,
    label: 'Cancelled',
    dot: (
      <span className="inline-flex rounded-full h-2 w-2 bg-neutral-400" />
    ),
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig[TICKET_STATUS.PENDING];
  const Icon = config.icon;

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      data-testid="status-badge"
      data-status={config.label}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {config.dot}
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </motion.span>
  );
};

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case TICKET_PRIORITY.P1_CRITICAL:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
          <AlertOctagon className="w-3 h-3 text-red-500" />
          <span>P1 - Critical</span>
        </span>
      );
    case TICKET_PRIORITY.P2_HIGH:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <ShieldAlert className="w-3 h-3 text-amber-500" />
          <span>P2 - High</span>
        </span>
      );
    case TICKET_PRIORITY.P3_MODERATE:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
          <span>P3 - Moderate</span>
        </span>
      );
    case TICKET_PRIORITY.P4_LOW:
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span>P4 - Low</span>
        </span>
      );
  }
};

export default StatusBadge;
