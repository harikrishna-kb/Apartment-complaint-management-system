import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertCircle, 
  Wrench, 
  Zap, 
  ArrowUpDown, 
  Shield, 
  Building, 
  Mic, 
  MicOff, 
  Clock, 
  HelpCircle, 
  AlertOctagon 
} from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../../constants/categories';
import { TICKET_PRIORITY, PRIORITY_SLA, DEFAULT_COST_ESTIMATES } from '../../constants/status';
import { createComplaint } from '../../services/complaintService';

const CATEGORY_ICONS = {
  Plumbing: Wrench,
  Electrical: Zap,
  'HVAC & Lift': ArrowUpDown,
  Structural: Building,
  Security: Shield,
};

const CreateComplaintModal = ({ isOpen, onClose, user, onCreated }) => {
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [priority, setPriority] = useState(TICKET_PRIORITY.P3_MODERATE);
  const [tower, setTower] = useState('Tower A');
  const [flatNo, setFlatNo] = useState(user?.flat_no || 'A-101');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Voice-to-Text State
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRecognition));
  }, []);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsRecording(false);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech initialization failed:', err);
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both an issue title and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const createdTicket = await createComplaint({
        resident_id: user.uid,
        resident_name: user.name,
        resident_flat_no: flatNo,
        flatNo,
        tower,
        category,
        priority,
        costEstimate: DEFAULT_COST_ESTIMATES[category] || 'Society Covered',
        title: title.trim(),
        description: description.trim(),
      });

      if (onCreated) onCreated(createdTicket);

      // Reset
      setTitle('');
      setDescription('');
      setCategory(COMPLAINT_CATEGORIES[0]);
      setPriority(TICKET_PRIORITY.P3_MODERATE);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

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
          className="relative w-full max-w-lg bg-white/95 dark:bg-black/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden transition-colors max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div>
              <h3 className="text-xl font-black text-black dark:text-white">Lodge Maintenance Ticket</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Unit {flatNo} • Dispatched to Central Facility Desk
              </p>
            </div>
            <button
              id="modal-close-btn"
              data-testid="modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="ticket-category-select" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Service Domain
                </label>
                <select
                  id="ticket-category-select"
                  data-testid="ticket-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                >
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat] || HelpCircle;
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 text-black dark:text-white ring-1 ring-black dark:ring-white'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-400 hover:border-black/30 dark:hover:border-white/30'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="truncate w-full text-center text-[10px] font-bold">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority & Target SLA Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="ticket-priority-select" className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Priority & Target SLA
                </label>
                <select
                  id="ticket-priority-select"
                  data-testid="ticket-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                >
                  {Object.values(TICKET_PRIORITY).map((pLevel) => (
                    <option key={pLevel} value={pLevel}>
                      {pLevel} ({PRIORITY_SLA[pLevel]}h)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(TICKET_PRIORITY).map((pLevel) => {
                  const isSelected = priority === pLevel;
                  const sla = PRIORITY_SLA[pLevel];
                  return (
                    <button
                      type="button"
                      key={pLevel}
                      onClick={() => setPriority(pLevel)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 text-black dark:text-white ring-1 ring-black dark:ring-white'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
                      }`}
                    >
                      <span className="block text-[11px] font-bold leading-tight truncate">{pLevel.split(' - ')[0]}</span>
                      <span className="block text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{sla}h Window</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unit Location Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Tower / Wing
                </label>
                <select
                  id="ticket-tower-select"
                  data-testid="ticket-tower-select"
                  value={tower}
                  onChange={(e) => setTower(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                >
                  <option value="Tower A">Tower A (East Wing)</option>
                  <option value="Tower B">Tower B (West Wing)</option>
                  <option value="Tower C">Tower C (Clubhouse)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Flat Number
                </label>
                <input
                  type="text"
                  id="ticket-flat-input"
                  data-testid="ticket-flat-input"
                  placeholder="e.g., A-302"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Issue Summary / Title
              </label>
              <input
                type="text"
                id="ticket-title-input"
                data-testid="ticket-title-input"
                placeholder="e.g., Kitchen PVC drain pipe leakage"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                maxLength={150}
                required
              />
            </div>

            {/* Detailed Description with Voice Dictation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Detailed Description
                </label>
                
                {/* Voice-to-Text Web Speech API Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:text-black dark:hover:text-white'
                    }`}
                    title="Click to dictate using speech recognition"
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
                  </button>
                )}
              </div>

              <textarea
                id="ticket-desc-input"
                data-testid="ticket-desc-input"
                rows={3}
                placeholder="Describe where the issue is located, its severity, and access availability..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none transition-colors"
                required
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                data-testid="modal-cancel-btn"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="ticket-submit-btn"
                data-testid="ticket-submit-btn"
                disabled={loading}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-300 text-white dark:text-black font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Dispatch Ticket'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateComplaintModal;
