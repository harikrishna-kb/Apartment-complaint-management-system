import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import TwinSoftTicketCard from '../components/common/TwinSoftTicketCard';
import StarRatingWidget from '../components/common/StarRatingWidget';
import AuditHistoryModal from '../components/modals/AuditHistoryModal';
import CreateComplaintModal from '../components/forms/CreateComplaintModal';
import { formatTimestamp } from '../utils/dateUtils';
import { TICKET_STATUS, TICKET_PRIORITY } from '../constants/status';
import { seedSampleIncidentCards, cancelComplaint } from '../services/complaintService';
import { 
  Plus, 
  Home, 
  FileText, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Wrench, 
  Zap, 
  ArrowUpDown, 
  Building, 
  Shield, 
  ChevronRight, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

const FILTER_TAGS = [
  { id: 'ALL', label: 'All Tickets' },
  { id: TICKET_STATUS.PENDING, label: 'Pending' },
  { id: TICKET_STATUS.ASSIGNED, label: 'In Progress' },
  { id: TICKET_STATUS.RESOLVED, label: 'Resolved' },
  { id: TICKET_PRIORITY.P1_CRITICAL, label: '🚨 P1 - Critical' },
];

const ResidentDashboard = () => {
  const { user } = useAuth();
  const { complaints, loading } = useComplaints(user);
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const handleCancelComplaint = async (complaint) => {
    if (!window.confirm(`Are you sure you want to cancel ticket #${complaint.id?.toString().slice(-6)}?`)) {
      return;
    }
    try {
      await cancelComplaint(complaint.id);
      setSuccessToast(`Ticket #${complaint.id?.toString().slice(-6)} has been cancelled.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to cancel complaint');
    }
  };

  const handleSeedSamples = async () => {
    setSeeding(true);
    try {
      await seedSampleIncidentCards(user);
    } catch (err) {
      console.error('Failed to seed sample cards:', err);
    } finally {
      setSeeding(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    let matchesFilter = true;
    if (activeFilter === 'ALL') {
      matchesFilter = true;
    } else if (activeFilter === TICKET_PRIORITY.P1_CRITICAL) {
      matchesFilter = c.priority === TICKET_PRIORITY.P1_CRITICAL;
    } else {
      matchesFilter = c.status === activeFilter;
    }

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.title?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.tokenNumber?.toLowerCase().includes(query) ||
      c.ticketId?.toLowerCase().includes(query) ||
      c.id?.toString().includes(query);

    return matchesFilter && matchesSearch;
  });

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === TICKET_STATUS.PENDING).length;
  const assignedCount = complaints.filter((c) => c.status === TICKET_STATUS.ASSIGNED).length;
  const resolvedCount = complaints.filter((c) => c.status === TICKET_STATUS.RESOLVED).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full flex-1 bg-twinsoft-grid"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-black/5 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Unit {user?.flat_no || 'Resident'}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Resident Operations Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl font-normal">
              Track filed maintenance grievances in real time, view technician telemetry, or lodge a new service ticket.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-300 text-white dark:text-black font-bold text-sm rounded-2xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Lodge Maintenance Ticket</span>
            </motion.button>
          </div>
        </div>

        {/* Real-Time Telemetry Counters - Minimalist Glassmorphic */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Registered</p>
              <p className="text-2xl font-black text-black dark:text-white mt-1">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Review</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Field Dispatched</p>
              <p className="text-2xl font-black text-black dark:text-white mt-1">{assignedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved & Closed</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {successToast && (
          <div
            id="cancel-success-toast"
            data-testid="cancel-success-toast"
            className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Search & Multi-Tag Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-black dark:text-white">Maintenance Incident Tickets</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Select any card to inspect full telemetry audit lifecycle</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search token, title, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-2 text-xs bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white w-full sm:w-64 transition-colors"
                />
              </div>

              {/* Multi-Tag Filter Tabs */}
              <div className="flex items-center gap-1 bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 p-1 rounded-xl text-xs overflow-x-auto">
                {FILTER_TAGS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                      activeFilter === tab.id
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards List in TwinSoft 2-Column Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-neutral-500">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-700 dark:text-neutral-300" />
              <span className="ml-2 text-sm font-medium">Syncing telemetry data...</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 border-dashed rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">No maintenance tickets found</h3>
              {complaints.length === 0 ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    You haven't filed any maintenance requests yet. You can lodge a new ticket or populate sample incident cards for Unit {user?.flat_no || 'A-104'}.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs rounded-xl transition shadow-sm"
                    >
                      Lodge New Ticket
                    </button>
                    <button
                      onClick={handleSeedSamples}
                      disabled={seeding}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 transition disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{seeding ? 'Seeding Incident Cards...' : 'Seed Sample Incident Cards'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  No tickets matched your active filter or search query.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredComplaints.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TwinSoftTicketCard
                      complaint={item}
                      onInspect={(ticket) => setSelectedComplaint(ticket)}
                      onCancel={handleCancelComplaint}
                      actionLabel="+ Inspect Ticket Lifecycle"
                    />

                    {/* Resident Rating Widget (if resolved) */}
                    {item.status === TICKET_STATUS.RESOLVED && !item.rating && (
                      <div className="mt-2 p-3 bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs">
                        <StarRatingWidget
                          complaint={item}
                          onSubmitted={() => {}}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Controlled Create Complaint Modal */}
        <CreateComplaintModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          user={user}
        />

        {/* Detailed Audit History Modal */}
        <AuditHistoryModal
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
          onDeleted={(ticket) => handleCancelComplaint(ticket)}
        />
      </div>
    </motion.div>
  );
};

export default ResidentDashboard;
