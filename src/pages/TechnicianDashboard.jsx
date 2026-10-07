import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import { markComplaintResolved, updateComplaintStatus } from '../services/complaintService';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import TelemetryStrip from '../components/common/TelemetryStrip';
import AuditHistoryModal from '../components/modals/AuditHistoryModal';
import { formatTimestamp } from '../utils/dateUtils';
import { TICKET_STATUS, TICKET_PRIORITY, PRIORITY_SLA } from '../constants/status';
import { 
  Wrench, 
  CheckCircle2, 
  Home, 
  RefreshCw, 
  Check, 
  Clock, 
  AlertTriangle, 
  Search, 
  History, 
  DollarSign, 
  Building,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

const FILTER_TABS = [
  { id: 'ACTIVE', label: 'Active In Progress' },
  { id: 'RESOLVED', label: 'Completed Repairs' },
  { id: 'ALL', label: 'All Assigned Jobs' },
];

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const { complaints, loading } = useComplaints(user);
  const [resolvingId, setResolvingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketForAudit, setSelectedTicketForAudit] = useState(null);

  const handleStartWork = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await updateComplaintStatus(id, TICKET_STATUS.IN_PROGRESS);
      setSuccessToast(`Work order #${id.toString().slice(-6)} set to In-Progress!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update work order');
    }
  };

  const handleResolve = async (id, e) => {
    if (e) e.stopPropagation();
    setResolvingId(id);
    try {
      await markComplaintResolved(id);
      setSuccessToast(`Work order #${id.toString().slice(-6)} marked as resolved!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update work order');
    } finally {
      setResolvingId(null);
    }
  };

  const filteredComplaints = complaints.filter((item) => {
    // Tab filter: ACTIVE includes both Assigned and In-Progress
    const isAssignedOrInProgress =
      item.status === TICKET_STATUS.ASSIGNED ||
      item.status === TICKET_STATUS.IN_PROGRESS ||
      item.status === 'Assigned' ||
      item.status === 'In-Progress';
    const isResolved =
      item.status === TICKET_STATUS.RESOLVED ||
      item.status === 'Resolved';

    if (activeTab === 'ACTIVE' && !isAssignedOrInProgress) {
      return false;
    }
    if (activeTab === 'RESOLVED' && !isResolved) {
      return false;
    }

    // Search query
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const residentName = (item.resident?.name || item.resident_name || '').toLowerCase();
    const flatNo = (item.location?.flatNo || item.resident_flat_no || '').toLowerCase();
    const tower = (item.location?.tower || '').toLowerCase();
    const token = (item.tokenNumber || '').toLowerCase();
    const ticket = (item.ticketId || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    return (
      residentName.includes(query) ||
      flatNo.includes(query) ||
      tower.includes(query) ||
      token.includes(query) ||
      ticket.includes(query) ||
      title.includes(query) ||
      desc.includes(query)
    );
  });

  const totalAssigned = complaints.length;
  const activeCount = complaints.filter(
    (c) =>
      c.status === TICKET_STATUS.ASSIGNED ||
      c.status === TICKET_STATUS.IN_PROGRESS ||
      c.status === 'Assigned' ||
      c.status === 'In-Progress'
  ).length;
  const completedCount = complaints.filter(
    (c) => c.status === TICKET_STATUS.RESOLVED || c.status === 'Resolved'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full flex-1 bg-twinsoft-grid"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-black/5 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Field Operations Portal
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {user?.specialty || 'General Maintenance'} Specialist
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Work Orders: {user?.name || 'Technician'}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl font-normal">
              Live queue of maintenance tasks allocated directly to you. Verify on-site repairs and click "Mark as Resolved" to close work orders.
            </p>
          </div>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Operational Counters - Minimalist Glassmorphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Work Orders</p>
            <p className="text-3xl font-black text-black dark:text-white mt-2">{totalAssigned}</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">All tickets assigned to your queue</p>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              Active In Progress
            </p>
            <p className="text-3xl font-black text-black dark:text-white mt-2">{activeCount}</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Pending physical resolution</p>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Completed Repairs
            </p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{completedCount}</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Successfully closed out</p>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-white/80 dark:bg-black/80 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search token, unit, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white shadow-xs"
            />
          </div>
        </div>

        {/* Work Orders List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-600 dark:text-amber-400" />
              <span className="ml-2 text-sm font-medium">Syncing work orders...</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Clear! No Matching Work Orders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {activeTab === 'ACTIVE' 
                  ? 'You have completed all active maintenance tickets currently assigned to you.' 
                  : 'No tickets found matching the selected filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence>
                {filteredComplaints.map((item) => {
                  const residentName = item.resident?.name || item.resident_name || 'Resident';
                  const flatNo = item.location?.flatNo || item.resident_flat_no || 'Unit';
                  const tower = item.location?.tower || 'Tower A';
                  const priority = item.priority || TICKET_PRIORITY.P3_MODERATE;
                  const slaHours = item.slaHours || PRIORITY_SLA[priority] || 24;
                  const costEstimate = item.costEstimate || 'Society Covered';
                  const isResolved = item.status === TICKET_STATUS.RESOLVED || item.status === 'Resolved';

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      data-testid="ticket-card"
                      data-ticket-id={item.id || item.ticketId}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedTicketForAudit(item)}
                      className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] hover:border-black/30 dark:hover:border-white/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5 transition-all cursor-pointer group"
                    >
                      <div className="space-y-4">
                        {/* Monospace Telemetry Strip */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <TelemetryStrip 
                            tokenNumber={item.tokenNumber} 
                            ticketId={item.ticketId || `CMS-${item.id.toString().slice(-4).toUpperCase()}`}
                            priority={item.priority}
                            slaHours={slaHours}
                            compact={false}
                            showSlaBadge={true}
                          />
                          <StatusBadge status={item.status} />
                        </div>

                        {/* Location & Resident Box */}
                        <div className="flex items-center justify-between gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-950/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
                              <Home className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                              <p className="text-neutral-500 dark:text-neutral-400 font-medium">Unit Location:</p>
                              <p className="text-black dark:text-white font-black text-sm">
                                {tower} • Flat {flatNo}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-neutral-400 text-[11px]">Resident</span>
                            <p className="font-bold text-neutral-800 dark:text-neutral-200">{residentName}</p>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                              {item.category}
                            </span>
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                              Reported: {formatTimestamp(item.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-black dark:text-white mb-1.5">{item.title}</h3>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50/60 dark:bg-neutral-950/40 p-3 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/40">
                            {item.description}
                          </p>
                        </div>

                        {/* Estimated Budget / Cost */}
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                          <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Budget: {costEstimate}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicketForAudit(item);
                            }}
                            className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 font-bold transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Step Audit</span>
                          </button>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          {/* Quick Status Override Selector */}
                          <select
                            id={`tech-status-select-${item.id}`}
                            data-testid={`tech-status-select-${item.id}`}
                            value={item.status}
                            onChange={async (e) => {
                              try {
                                await updateComplaintStatus(item.id, e.target.value);
                                setSuccessToast(`Ticket status updated to ${e.target.value}!`);
                                setTimeout(() => setSuccessToast(''), 4000);
                              } catch (err) {
                                alert(err.message || 'Failed to update status');
                              }
                            }}
                            className="py-2 px-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white shrink-0"
                            title="Direct Status Transition"
                          >
                            <option value="Assigned">Assigned</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>

                          {(item.status === TICKET_STATUS.ASSIGNED || item.status === 'Assigned') && (
                            <button
                              type="button"
                              id={`start-work-btn-${item.id}`}
                              data-testid={`start-work-btn-${item.id}`}
                              onClick={(e) => handleStartWork(item.id, e)}
                              className="w-full flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs rounded-xl transition shadow-xs"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Start Work</span>
                            </button>
                          )}

                          {item.status !== TICKET_STATUS.RESOLVED && item.status !== 'Resolved' ? (
                            <button
                              type="button"
                              id={`mark-resolved-btn-${item.id}`}
                              data-testid={`mark-resolved-btn-${item.id}`}
                              onClick={(e) => handleResolve(item.id, e)}
                              disabled={resolvingId === item.id}
                              className="w-full flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{resolvingId === item.id ? 'Updating Ticket...' : 'Mark as Resolved'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await updateComplaintStatus(item.id, TICKET_STATUS.IN_PROGRESS);
                                setSuccessToast('Ticket reopened to In-Progress!');
                                setTimeout(() => setSuccessToast(''), 4000);
                              }}
                              className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reopen Work Order</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Step Audit History Modal */}
        <AuditHistoryModal
          isOpen={!!selectedTicketForAudit}
          complaint={selectedTicketForAudit}
          onClose={() => setSelectedTicketForAudit(null)}
        />

      </div>
    </motion.div>
  );
};

export default TechnicianDashboard;
