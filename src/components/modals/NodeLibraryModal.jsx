import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Layers, 
  Search, 
  ArrowRight, 
  Plus, 
  ShieldAlert,
  Sparkles,
  Filter
} from 'lucide-react';
import TwinSoftTicketCard from '../common/TwinSoftTicketCard';
import { COMPLAINT_CATEGORIES } from '../../constants/categories';

const NodeLibraryModal = ({ 
  isOpen, 
  onClose, 
  complaints = [], 
  onInspectTicket,
  onCreateTicket 
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (!isOpen) return null;

  const filtered = complaints.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.tokenNumber?.toLowerCase().includes(q) ||
      c.ticketId?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

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
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          data-modal-open="true"
          className="relative w-full max-w-4xl bg-white/95 dark:bg-black/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-colors"
        >
          {/* Header Row */}
          <div className="p-6 sm:p-7 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between gap-4 shrink-0 bg-neutral-50/50 dark:bg-neutral-950/40">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm shrink-0 border border-black/10 dark:border-white/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-black dark:text-white tracking-tight">
                  Maintenance Node Library & Incident Catalog
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Inspect active operational nodes across facilities, telemetry streams, and technician pipelines.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="modal-close-btn"
              data-testid="modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="px-6 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-black/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter nodes by token, title..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'ALL'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                All Categories
              </button>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Grid of Cards */}
          <div className="p-6 overflow-y-auto flex-1 bg-neutral-50/40 dark:bg-black/40">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                No component nodes found matching the query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <TwinSoftTicketCard
                    key={item.id}
                    complaint={item}
                    onInspect={() => {
                      onClose();
                      if (onInspectTicket) onInspectTicket(item);
                    }}
                    actionLabel="+ Inspect Ticket Lifecycle"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:px-7 sm:py-4.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-black/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Need emergency escalation? <span className="text-black dark:text-white font-semibold">Contact Security Gate 1 immediately.</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onCreateTicket) onCreateTicket();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-300 text-white dark:text-black font-bold text-xs rounded-xl shadow-md transition"
            >
              <span>Create Incident Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NodeLibraryModal;
