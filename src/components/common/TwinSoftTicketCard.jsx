import React from 'react';
import { 
  Wrench, 
  Zap, 
  ArrowUpDown, 
  Building, 
  Shield, 
  Layers, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { TICKET_STATUS, TICKET_PRIORITY, PRIORITY_SLA } from '../../constants/status';

const CATEGORY_STYLES = {
  Plumbing: {
    icon: Wrench,
    bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
  },
  Electrical: {
    icon: Zap,
    bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  },
  'HVAC & Lift': {
    icon: ArrowUpDown,
    bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  },
  Structural: {
    icon: Building,
    bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
  },
  Security: {
    icon: Shield,
    bg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  },
};

const TwinSoftTicketCard = ({ 
  complaint, 
  onInspect, 
  actionLabel = '+ Inspect Ticket Lifecycle',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  onCancel,
  className = ''
}) => {
  if (!complaint) return null;

  const styleConfig = CATEGORY_STYLES[complaint.category] || {
    icon: Layers,
    bg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50',
  };
  const CategoryIcon = styleConfig.icon;

  const token = complaint.tokenNumber || 'TKN-000000';
  const ticketId = complaint.ticketId || `CMS-${(complaint.id || '').toString().slice(-4).toUpperCase()}`;
  const tower = complaint.location?.tower || (complaint.resident?.flatNo?.startsWith('B') ? 'Tower B' : 'Tower A');
  const flatNo = complaint.location?.flatNo || complaint.resident?.flatNo || complaint.resident_flat_no || 'Unit';
  const priority = (complaint.priority || TICKET_PRIORITY.P3_MODERATE).split(' - ')[0];
  const slaHours = complaint.slaHours || 24;

  const isResolved = complaint.status === TICKET_STATUS.RESOLVED || complaint.status === 'Resolved';
  const isAssigned = complaint.status === TICKET_STATUS.ASSIGNED || complaint.status === 'Assigned';
  const isPending = !complaint.status || complaint.status.toLowerCase() === 'pending';
  
  let createdTime = Date.now();
  if (complaint.createdAt) {
    if (typeof complaint.createdAt === 'number') {
      createdTime = complaint.createdAt;
    } else if (complaint.createdAt.seconds) {
      createdTime = complaint.createdAt.seconds * 1000;
    } else if (typeof complaint.createdAt.toDate === 'function') {
      createdTime = complaint.createdAt.toDate().getTime();
    } else {
      const parsed = new Date(complaint.createdAt).getTime();
      if (!isNaN(parsed)) createdTime = parsed;
    }
  }
  const isWithin24Hours = (Date.now() - createdTime) < 24 * 60 * 60 * 1000;
  const canCancel = isPending && isWithin24Hours;

  const handleCardClick = () => {
    if (onInspect) onInspect(complaint);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onAction) {
      onAction(complaint);
    } else if (onInspect) {
      onInspect(complaint);
    }
  };

  const handleSecondaryClick = (e) => {
    e.stopPropagation();
    if (onSecondaryAction) {
      onSecondaryAction(complaint);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      data-testid="ticket-card"
      data-ticket-id={complaint.id || complaint.ticketId || ticketId}
      className={`rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white/70 dark:bg-black/60 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-black/30 dark:hover:border-white/30 flex flex-col justify-between cursor-pointer group ${className}`}
    >
      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Square icon container with minimalist styling */}
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shrink-0">
              <CategoryIcon className="w-5 h-5" />
            </div>

            {/* Ticket/Service Name + Subtitle ID */}
            <div className="min-w-0">
              <h4 className="font-bold text-black dark:text-white text-sm truncate group-hover:underline transition-colors">
                {complaint.title}
              </h4>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                v1.2 • {ticketId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status Badge */}
            <span
              data-testid="status-badge"
              data-status={complaint.status}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isResolved
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : isAssigned
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300 dark:border-amber-800'
              }`}
            >
              {complaint.status}
            </span>

            {/* Category pill tag */}
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300">
              {complaint.category}
            </span>
          </div>
        </div>

        {/* Body Description: 2-line clean summary */}
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed my-3 line-clamp-2 font-normal">
          {complaint.description}
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {/* Telemetry Metric Strip */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 pt-2 border-t border-black/[0.06] dark:border-white/[0.08] select-none">
          <span className="text-neutral-800 dark:text-neutral-200">
            Token: <span data-testid="token-number-badge" className="font-bold text-black dark:text-white">{token}</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span>
            Priority: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{priority}</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span>
            SLA: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isResolved ? 'Met' : `${slaHours}h`}</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="truncate">
            Unit: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{tower.replace('Tower ', '')}-{flatNo}</span>
          </span>
        </div>

        {/* Bottom Action Button: Minimalist High Contrast */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleActionClick}
            className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-neutral-100/90 dark:bg-neutral-900/90 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{actionLabel}</span>
          </button>

          {canCancel && onCancel && (
            <button
              type="button"
              id={`cancel-ticket-btn-${complaint.id}`}
              data-testid={`cancel-ticket-btn-${complaint.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onCancel(complaint);
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center gap-1.5 transition shrink-0"
              title="Delete / Cancel Request (< 24h window)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete / Cancel</span>
            </button>
          )}

          {secondaryActionLabel && (
            <button
              type="button"
              onClick={handleSecondaryClick}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black flex items-center justify-center gap-1 transition shadow-xs shrink-0"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwinSoftTicketCard;
