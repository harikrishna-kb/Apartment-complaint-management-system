import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Wrench, AlertCircle, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import { assignTechnicianToComplaint } from '../../services/complaintService';

const AssignStaffModal = ({ isOpen, onClose, complaint, technicians, onAssigned }) => {
  const [selectedTechId, setSelectedTechId] = useState('');
  const [costEstimate, setCostEstimate] = useState(complaint?.costEstimate || 'Society Covered');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!selectedTechId) {
      setError('Please select a maintenance staff member.');
      return;
    }

    const tech = technicians.find((t) => t.uid === selectedTechId);
    if (!tech) return;

    setLoading(true);
    setError('');

    try {
      await assignTechnicianToComplaint(complaint.id, {
        techId: tech.uid,
        techName: tech.name,
        techEmail: tech.email,
        costEstimate: costEstimate.trim() || 'Society Covered',
      });

      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign technician');
    } finally {
      setLoading(false);
    }
  };

  const ticketId = complaint.id || complaint.ticketId;

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        data-modal-open="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          data-modal-open="true"
          className="relative w-full max-w-md bg-white/95 dark:bg-black/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden transition-colors"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-black dark:text-white">Dispatch Technician</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Allocate ticket to maintenance personnel</p>
              </div>
            </div>
            <button
              id="modal-close-btn"
              data-testid="modal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ticket Context */}
          <div className="mt-4 p-3.5 bg-neutral-50 dark:bg-neutral-950/80 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                {complaint.ticketId || `#${complaint.id.toString().slice(-6)}`}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                {complaint.category}
              </span>
            </div>
            <p className="font-bold text-black dark:text-white truncate">{complaint.title}</p>
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mt-1.5 pt-1.5 border-t border-neutral-200 dark:border-neutral-800">
              <span>Unit {complaint.resident?.flatNo || complaint.resident_flat_no}</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-300">SLA: {complaint.slaHours || 24}h</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleConfirm} className="mt-4 space-y-4">
            {/* Technician List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={`tech-select-${ticketId}`} className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Select Staff ({technicians.length})
                </label>
                <select
                  id={`tech-select-${ticketId}`}
                  data-testid="tech-select"
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                >
                  <option value="">-- Choose Field Specialist --</option>
                  {technicians.map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.name} ({t.specialty || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              {technicians.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2">
                  No technician accounts currently registered.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {technicians.map((tech) => {
                    const isSelected = selectedTechId === tech.uid;
                    return (
                      <div
                        key={tech.uid}
                        onClick={() => setSelectedTechId(tech.uid)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 text-black dark:text-white ring-1 ring-black dark:ring-white'
                            : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight truncate">{tech.name}</p>
                            <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 truncate max-w-[240px]">
                              {tech.specialty || 'General Maintenance'}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-black dark:text-white shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cost Estimate Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                <span>Cost / Budget Allocation</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Society AMC Covered, ₹250 (Parts)"
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                data-testid="modal-cancel-btn"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                id={`assign-btn-${ticketId}`}
                data-testid="assign-submit-btn"
                disabled={loading || !selectedTechId}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-300 text-white dark:text-black font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Dispatching...' : 'Confirm Allocation'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignStaffModal;
