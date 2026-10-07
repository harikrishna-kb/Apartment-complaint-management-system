import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  User, 
  Building, 
  ShieldAlert, 
  DollarSign, 
  Star, 
  FileText, 
  Hash, 
  Calendar,
  Trash2,
  Activity
} from 'lucide-react';
import { formatTimestamp } from '../../utils/dateUtils';
import { TICKET_STATUS, TICKET_PRIORITY, PRIORITY_SLA } from '../../constants/status';
import { updateComplaintStatus, cancelComplaint } from '../../services/complaintService';
import StatusBadge from '../common/StatusBadge';
import TelemetryStrip from '../common/TelemetryStrip';

const AuditHistoryModal = ({ isOpen, onClose, complaint, onStatusChanged, onDeleted }) => {
  if (!isOpen || !complaint) return null;

  const handlePrint = (e) => {
    e.stopPropagation();
    window.print();
  };

  const isPending = complaint.status === TICKET_STATUS.PENDING;
  const isAssigned = complaint.status === TICKET_STATUS.ASSIGNED;
  const isResolved = complaint.status === TICKET_STATUS.RESOLVED;

  const token = complaint.tokenNumber || 'TKN-000000';
  const ticketId = complaint.ticketId || `CMS-${(complaint.id || '').toString().slice(-4).toUpperCase()}`;
  const tower = complaint.location?.tower || 'Tower A';
  const flatNo = complaint.location?.flatNo || complaint.resident_flat_no || 'Unit';
  const residentName = complaint.resident?.name || complaint.resident_name || 'Resident';
  const technicianName = complaint.technician?.name || complaint.technician_name || null;
  const priority = complaint.priority || TICKET_PRIORITY.P3_MODERATE;
  const slaHours = complaint.slaHours || PRIORITY_SLA[priority] || 24;
  const costEstimate = complaint.costEstimate || 'Society Covered';

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

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        data-modal-open="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          data-modal-open="true"
          className="relative w-full max-w-2xl bg-white/95 dark:bg-black/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto transition-colors"
        >
          {/* Top Actions: Black Icon Square + Modal Title & Subtitle + Print & Close */}
          <div className="flex items-start justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm shrink-0 border border-black/10 dark:border-white/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-black dark:text-white tracking-tight">
                    Incident Lifecycle & Telemetry
                  </h3>
                  <StatusBadge status={complaint.status} />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                  {ticketId} • Token: #{token}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition"
                title="Print official maintenance job sheet"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-500" />
                <span>Print PDF</span>
              </button>
              <button
                type="button"
                id="modal-close-btn"
                data-testid="modal-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ticket Header & Description */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                {complaint.category}
              </span>
              <span className="text-xs font-mono text-neutral-500">Security Token: #{token}</span>
            </div>

            <h2 className="text-xl font-black text-black dark:text-white leading-tight">
              {complaint.title}
            </h2>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
              <p className="font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Issue Description:</p>
              {complaint.description}
            </div>

            {/* Telemetry Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Unit Location</span>
                <span className="font-bold text-black dark:text-white">{tower}-{flatNo}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Priority Level</span>
                <span className="font-bold text-black dark:text-white">{priority}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Target SLA</span>
                <span className="font-bold text-black dark:text-white">{slaHours} Hours</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Cost Allocation</span>
                <span className="font-bold text-black dark:text-white">{costEstimate}</span>
              </div>
            </div>
          </div>

          {/* Vertical Step Timeline */}
          <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Lifecycle Audit Timeline</span>
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
              
              {/* Step 1: Logged */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-black shadow-sm" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-black dark:text-white">
                      1. Ticket Logged & Dispatched
                    </p>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {formatTimestamp(complaint.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Lodged by <span className="font-semibold text-neutral-900 dark:text-neutral-100">{residentName}</span> (Flat {flatNo}). Token <span className="font-mono text-black dark:text-white font-semibold">{token}</span> generated for tracking.
                  </p>
                </div>
              </div>

              {/* Step 2: Assigned */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-black shadow-sm ${
                    technicianName || isAssigned || isResolved
                      ? 'bg-black dark:bg-white'
                      : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-black dark:text-white">
                      2. Field Staff Allocation
                    </p>
                    {complaint.technician?.assignedAt || complaint.assignedAt ? (
                      <span className="text-[11px] font-mono text-neutral-500">
                        {formatTimestamp(complaint.technician?.assignedAt || complaint.assignedAt)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-500 italic">
                        {isPending ? 'Pending allocation' : 'Not assigned'}
                      </span>
                    )}
                  </div>
                  {technicianName ? (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Dispatched to field specialist <span className="font-semibold text-black dark:text-white">🔧 {technicianName}</span>. Estimated cost: {costEstimate}. Target SLA window: {slaHours}h.
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">
                      Waiting for Society Secretary / Facility Manager to allocate a technician.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Resolved */}
              <div className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-black shadow-sm ${
                    isResolved
                      ? 'bg-emerald-500'
                      : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-black dark:text-white">
                      3. Resolution & Customer Feedback
                    </p>
                    {complaint.resolvedAt ? (
                      <span className="text-[11px] font-mono text-neutral-500">
                        {formatTimestamp(complaint.resolvedAt)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-neutral-400 italic">
                        In progress
                      </span>
                    )}
                  </div>
                  {isResolved ? (
                    <div className="space-y-2">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Repairs completed and validated by on-site staff.
                      </p>
                      {complaint.rating && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">Resident Rating:</span>
                            <div className="flex items-center gap-0.5 ml-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= complaint.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-neutral-300 dark:text-neutral-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {complaint.feedbackText && (
                            <p className="text-neutral-600 dark:text-neutral-300 italic text-[11px]">
                              "{complaint.feedbackText}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">
                      Work order active in field. Will be finalized upon technician completion.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Interactive Status & Cancellation Bar */}
          <div className="mt-6 pt-5 border-t border-black/[0.08] dark:border-white/[0.1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-100/70 dark:bg-neutral-900/70 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div>
                <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Change Ticket Status</p>
                <p className="text-[11px] text-neutral-500">Update ticket state in real time</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id={`modal-btn-inprogress-${complaint.id}`}
                  onClick={async () => {
                    await updateComplaintStatus(complaint.id, TICKET_STATUS.IN_PROGRESS);
                    if (onStatusChanged) onStatusChanged(TICKET_STATUS.IN_PROGRESS);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Set In-Progress</span>
                </button>

                <button
                  type="button"
                  id={`modal-btn-resolved-${complaint.id}`}
                  onClick={async () => {
                    await updateComplaintStatus(complaint.id, TICKET_STATUS.RESOLVED);
                    if (onStatusChanged) onStatusChanged(TICKET_STATUS.RESOLVED);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>

                <select
                  id={`modal-status-select-${complaint.id}`}
                  data-testid={`modal-status-select-${complaint.id}`}
                  value={complaint.status}
                  onChange={async (e) => {
                    await updateComplaintStatus(complaint.id, e.target.value);
                    if (onStatusChanged) onStatusChanged(e.target.value);
                    onClose();
                  }}
                  className="py-1.5 px-2 bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {canCancel && (
                  <button
                    type="button"
                    id={`modal-cancel-btn-${complaint.id}`}
                    data-testid={`modal-cancel-btn-${complaint.id}`}
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to cancel and delete ticket #${complaint.id.toString().slice(-6)}?`)) {
                        await cancelComplaint(complaint.id);
                        if (onDeleted) onDeleted(complaint);
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1 transition"
                    title="Cancel request within 24h window"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Ticket</span>
                  </button>
                )}
              </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuditHistoryModal;
