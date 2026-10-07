import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useComplaints } from '../hooks/useComplaints';
import { useTechnicians } from '../hooks/useTechnicians';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import TelemetryStrip from '../components/common/TelemetryStrip';
import TwinSoftTicketCard from '../components/common/TwinSoftTicketCard';
import AssignStaffModal from '../components/forms/AssignStaffModal';
import AuditHistoryModal from '../components/modals/AuditHistoryModal';
import { updateComplaintStatus, clearAllComplaints } from '../services/complaintService';
import { formatTimestamp } from '../utils/dateUtils';
import { TICKET_STATUS, TICKET_PRIORITY, PRIORITY_SLA } from '../constants/status';
import { COMPLAINT_CATEGORIES } from '../constants/categories';
import { 
  ShieldCheck, 
  RefreshCw, 
  UserCheck, 
  CheckCircle, 
  Clock, 
  Search, 
  ArrowUpRight, 
  Printer, 
  Eye, 
  History, 
  Activity, 
  AlertOctagon,
  Building,
  Wrench,
  Layers,
  LayoutGrid,
  List,
  Trash2
} from 'lucide-react';

const FILTER_TAGS = [
  { id: 'ALL', label: 'All Tickets' },
  { id: TICKET_STATUS.PENDING, label: 'Pending' },
  { id: TICKET_STATUS.ASSIGNED, label: 'In Progress' },
  { id: TICKET_STATUS.RESOLVED, label: 'Resolved' },
  { id: TICKET_PRIORITY.P1_CRITICAL, label: '🚨 P1 - Critical' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { complaints, loading: complaintsLoading } = useComplaints(user);
  const { technicians, loading: techsLoading } = useTechnicians();

  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState(null);
  const [selectedTicketForAudit, setSelectedTicketForAudit] = useState(null);
  const [viewLayout, setViewLayout] = useState('table'); // 'table' | 'grid'
  const [activeFilterTag, setActiveFilterTag] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComplaints = complaints.filter((item) => {
    // Tag filter
    let matchesTag = true;
    if (activeFilterTag === 'ALL') {
      matchesTag = true;
    } else if (activeFilterTag === TICKET_PRIORITY.P1_CRITICAL) {
      matchesTag = item.priority === TICKET_PRIORITY.P1_CRITICAL;
    } else {
      matchesTag = item.status === activeFilterTag;
    }

    // Category filter
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    // Search query
    const query = searchQuery.toLowerCase().trim();
    const residentName = (item.resident?.name || item.resident_name || '').toLowerCase();
    const residentFlat = (item.resident?.flatNo || item.location?.flatNo || item.resident_flat_no || '').toLowerCase();
    const tower = (item.location?.tower || '').toLowerCase();
    const token = (item.tokenNumber || '').toLowerCase();
    const ticket = (item.ticketId || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    const matchesSearch =
      !query ||
      residentName.includes(query) ||
      residentFlat.includes(query) ||
      tower.includes(query) ||
      token.includes(query) ||
      ticket.includes(query) ||
      title.includes(query) ||
      desc.includes(query) ||
      item.id?.toString().includes(query);

    return matchesTag && matchesCategory && matchesSearch;
  });

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === TICKET_STATUS.PENDING).length;
  const assignedCount = complaints.filter((c) => c.status === TICKET_STATUS.ASSIGNED).length;
  const resolvedCount = complaints.filter((c) => c.status === TICKET_STATUS.RESOLVED).length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
  
  const criticalCount = complaints.filter((c) => c.priority === TICKET_PRIORITY.P1_CRITICAL).length;

  const handlePrintReport = () => {
    window.print();
  };

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
                <ShieldCheck className="w-3.5 h-3.5" />
                Facility Management & Secretary Operations
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              Central Maintenance Console
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl font-normal">
              Real-time complaint intake, staff dispatch scheduling, and society-wide SLA resolution tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-neutral-100 dark:bg-black/60 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 font-bold text-xs rounded-xl shadow-xs transition"
              title="Print Official Maintenance Audit Summary"
            >
              <Printer className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Ribbon - Minimalist Glassmorphic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Society Tickets</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-black dark:text-white">{totalCount}</span>
              {criticalCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" />
                  {criticalCount} P1 Critical
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Total registered in ledger</p>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Pending Dispatch
            </p>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{pendingCount}</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Awaiting staff assignment</p>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
              In Progress
            </p>
            <p className="text-3xl font-black text-black dark:text-white mt-2">{assignedCount}</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Technicians actively on-site</p>
          </div>

          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              SLA Resolution Rate
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{resolutionRate}%</span>
              <span className="text-xs text-neutral-500">({resolvedCount} resolved)</span>
            </div>
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${resolutionRate}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Master Complaints Registry */}
        <div className="bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-3xl overflow-hidden shadow-sm transition-colors">
          
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col gap-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-black dark:text-white">Dispatch Queue</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 font-bold">
                  {filteredComplaints.length} Records
                </span>

                {/* View Layout Toggle */}
                <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => setViewLayout('table')}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                      viewLayout === 'table'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewLayout('grid')}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                      viewLayout === 'grid'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                    title="TwinSoft Node Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search token, flat, name, keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-neutral-500 font-medium hidden sm:inline">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none font-medium"
                  >
                    <option value="ALL">All Categories</option>
                    {COMPLAINT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  id="admin-clear-all-btn"
                  data-testid="admin-clear-all-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all tickets from the system for a fresh start?')) {
                      clearAllComplaints();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition"
                  title="Wipe all tickets to start with an empty database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Tickets</span>
                </button>
              </div>
            </div>

            {/* Quick Multi-Tag Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {FILTER_TAGS.map((tag) => {
                const isActive = activeFilterTag === tag.id;
                const testId =
                  tag.id === 'ALL'
                    ? 'filter-tab-all'
                    : tag.id === TICKET_STATUS.PENDING
                    ? 'filter-tab-pending'
                    : tag.id === TICKET_STATUS.RESOLVED
                    ? 'filter-tab-resolved'
                    : `filter-tab-${tag.id.toString().toLowerCase()}`;

                return (
                  <button
                    key={tag.id}
                    data-testid={testId}
                    onClick={() => setActiveFilterTag(tag.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'bg-neutral-100/90 dark:bg-neutral-900/90 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Master Table or Node Grid View */}
          {complaintsLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-sm font-medium">Syncing dispatch queue...</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No complaints found matching the current filters.
            </div>
          ) : viewLayout === 'grid' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((item) => (
                <TwinSoftTicketCard
                  key={item.id}
                  complaint={item}
                  onInspect={(ticket) => setSelectedTicketForAudit(ticket)}
                  actionLabel="+ Inspect Lifecycle"
                  secondaryActionLabel={
                    item.status === TICKET_STATUS.PENDING ? 'Assign Staff' : item.status === TICKET_STATUS.ASSIGNED ? 'Reassign' : null
                  }
                  onSecondaryAction={() => setSelectedTicketForAssign(item)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50/80 dark:bg-black/60 text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4">Telemetry / Token</th>
                    <th className="py-3.5 px-4">Resident & Location</th>
                    <th className="py-3.5 px-4">Issue Details</th>
                    <th className="py-3.5 px-4">Priority / SLA</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Staff Allocation</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                  <AnimatePresence>
                    {filteredComplaints.map((item) => {
                      const residentName = item.resident?.name || item.resident_name || 'Resident';
                      const tower = item.location?.tower || 'Tower A';
                      const flatNo = item.location?.flatNo || item.resident_flat_no || 'Unit';
                      const technicianName = item.technician?.name || item.technician_name || null;
                      const priority = item.priority || TICKET_PRIORITY.P3_MODERATE;
                      const slaHours = item.slaHours || PRIORITY_SLA[priority] || 24;

                      return (
                        <motion.tr
                          key={item.id}
                          layout
                          data-testid="ticket-card"
                          data-ticket-id={item.id || item.ticketId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                          onClick={() => setSelectedTicketForAudit(item)}
                        >
                          {/* Telemetry / Token */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <TelemetryStrip 
                              tokenNumber={item.tokenNumber} 
                              ticketId={item.ticketId || `CMS-${item.id.toString().slice(-4).toUpperCase()}`}
                              priority={item.priority}
                              slaHours={slaHours}
                              compact={true}
                              showSlaBadge={false}
                            />
                            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                              {formatTimestamp(item.createdAt)}
                            </div>
                          </td>

                          {/* Resident & Location */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-black dark:text-white">{residentName}</div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1">
                              <Building className="w-3 h-3 text-neutral-400" />
                              <span>{tower} • Flat {flatNo}</span>
                            </div>
                          </td>

                          {/* Issue Details */}
                          <td className="py-4 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                                {item.category}
                              </span>
                            </div>
                            <div className="font-bold text-black dark:text-white truncate">{item.title}</div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-sm">{item.description}</div>
                          </td>

                          {/* Priority / SLA */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <PriorityBadge priority={item.priority} />
                              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-neutral-400" />
                                <span>Target: {slaHours}h SLA</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1.5 items-start">
                              <StatusBadge status={item.status} />
                              <select
                                id={`admin-status-select-${item.id}`}
                                data-testid={`admin-status-select-${item.id}`}
                                value={item.status}
                                onChange={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await updateComplaintStatus(item.id, e.target.value);
                                  } catch (err) {
                                    alert(err.message || 'Failed to update status');
                                  }
                                }}
                                className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In-Progress">In-Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </div>
                          </td>

                          {/* Staff Allocation */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs">
                            {technicianName ? (
                              <div className="text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 font-semibold">
                                <span className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
                                  <Wrench className="w-3.5 h-3.5" />
                                </span>
                                <span>{technicianName}</span>
                              </div>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 italic font-medium px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px]">
                                Unallocated
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedTicketForAudit(item)}
                                className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
                                title="View Step Audit Timeline"
                              >
                                <History className="w-4 h-4" />
                              </button>

                              {item.status === TICKET_STATUS.PENDING ? (
                                <button
                                  onClick={() => setSelectedTicketForAssign(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold transition shadow-xs"
                                >
                                  <span>Assign</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              ) : item.status === TICKET_STATUS.ASSIGNED ? (
                                <button
                                  onClick={() => setSelectedTicketForAssign(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 transition"
                                >
                                  <span>Reassign</span>
                                </button>
                              ) : (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                  Closed
                                </span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Staff Allocation Modal */}
        <AssignStaffModal
          isOpen={!!selectedTicketForAssign}
          complaint={selectedTicketForAssign}
          technicians={technicians}
          onClose={() => setSelectedTicketForAssign(null)}
        />

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

export default AdminDashboard;
