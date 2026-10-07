import React, { useState } from 'react';
import { Copy, Check, Hash, Building, Clock, ShieldAlert } from 'lucide-react';
import { TICKET_PRIORITY } from '../../constants/status';

const PRIORITY_BADGE_STYLES = {
  [TICKET_PRIORITY.P1_CRITICAL]: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  [TICKET_PRIORITY.P2_HIGH]: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  [TICKET_PRIORITY.P3_MODERATE]: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  [TICKET_PRIORITY.P4_LOW]: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const TelemetryStrip = ({ 
  complaint, 
  tokenNumber,
  ticketId,
  priority,
  slaHours,
  compact = false,
  showSlaBadge = true,
  showCopy = true, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const token = tokenNumber || complaint?.tokenNumber || 'TKN-000000';
  const tid = ticketId || complaint?.ticketId || (complaint?.id ? `CMS-${complaint.id.toString().slice(-4).toUpperCase()}` : 'CMS-0000');
  const tower = complaint?.location?.tower || (complaint?.resident?.flatNo?.startsWith('A') ? 'Tower A' : 'Tower B');
  const flatNo = complaint?.location?.flatNo || complaint?.resident?.flatNo || complaint?.resident_flat_no || 'Unit';
  const prio = priority || complaint?.priority || TICKET_PRIORITY.P3_MODERATE;
  const sla = slaHours || complaint?.slaHours || 24;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-mono select-none ${className}`}>
        <button
          type="button"
          data-testid="token-number-badge"
          onClick={handleCopy}
          title="Click to copy security token"
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold transition border ${
            copied
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Hash className="w-3 h-3 text-slate-400" />
          <span>{token}</span>
          {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
        </button>
        <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
          {tid}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono select-none ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Token Number with One-Click Copy */}
        <button
          type="button"
          data-testid="token-number-badge"
          onClick={handleCopy}
          title="Click to copy security token"
          className={`group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold transition-all border ${
            copied
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200 dark:border-slate-800'
          }`}
        >
          <Hash className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span>{token}</span>
          {showCopy && (
            copied ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </span>
            ) : (
              <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            )
          )}
        </button>

        {/* Ticket ID */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          <span>{tid}</span>
        </span>

        {/* Unit Location */}
        {complaint && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{tower}-{flatNo}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* SLA Target Window */}
        {showSlaBadge && (
          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>SLA: {sla}h</span>
          </span>
        )}

        {/* Priority Badge */}
        {showSlaBadge && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              PRIORITY_BADGE_STYLES[prio] || PRIORITY_BADGE_STYLES[TICKET_PRIORITY.P3_MODERATE]
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>{(prio || '').split(' - ')[0]}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default TelemetryStrip;
