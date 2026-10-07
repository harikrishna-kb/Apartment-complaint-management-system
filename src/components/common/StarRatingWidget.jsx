import React, { useState } from 'react';
import { Star, MessageSquare, Check, Sparkles } from 'lucide-react';
import { submitComplaintRating } from '../../services/complaintService';

const StarRatingWidget = ({ complaint, onSubmitted }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(complaint.rating || 0);
  const [feedback, setFeedback] = useState(complaint.feedbackText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(complaint.rating));
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleSubmit = async (ratingVal) => {
    const finalRating = ratingVal || selectedRating;
    if (!finalRating) return;

    setIsSubmitting(true);
    try {
      await submitComplaintRating(complaint.id, {
        rating: finalRating,
        feedbackText: feedback,
      });
      setIsSaved(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (num) => {
    setSelectedRating(num);
    setShowCommentBox(true);
  };

  if (isSaved && complaint.rating) {
    return (
      <div className="mt-3 p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Service Feedback
            </span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= complaint.rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          {complaint.feedbackText && (
            <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">
              "{complaint.feedbackText}"
            </p>
          )}
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          Verified
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-3 p-3.5 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-2.5 transition-colors"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Rate Maintenance Resolution:
          </span>
        </div>

        {/* 5-Star Interactive Selector */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onMouseEnter={() => setHoverRating(num)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleStarClick(num)}
              disabled={isSubmitting}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <Star
                className={`w-4 h-4 transition-transform duration-150 ${
                  (hoverRating || selectedRating) >= num
                    ? 'text-amber-400 fill-amber-400 scale-110'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
          {selectedRating > 0 && (
            <span className="text-xs font-extrabold text-amber-500 ml-1.5">
              {selectedRating}/5
            </span>
          )}
        </div>
      </div>

      {showCommentBox && (
        <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
          <input
            type="text"
            placeholder="Optional comment on technician workmanship..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(selectedRating)}
              disabled={isSubmitting || !selectedRating}
              className="px-3.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarRatingWidget;
