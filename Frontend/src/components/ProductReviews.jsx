import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getContextualSuggestions, getEmojiForRating } from '../utils/aiReviewHelper';

// ─── Utility: Render star icons ───────────────────────────────────────────────
export const StarDisplay = ({ rating, size = 'md', showEmpty = true }) => {
  const sizePx = size === 'sm' ? '0.85rem' : size === 'lg' ? '1.4rem' : '1.1rem';
  const filled = Math.floor(rating);
  const hasHalf = rating - filled >= 0.5;
  const empty = 5 - filled - (hasHalf ? 1 : 0);

  return (
    <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: sizePx, lineHeight: 1 }}>
      {Array.from({ length: filled }).map((_, i) => (
        <i key={`f${i}`} className="bi bi-star-fill text-warning" />
      ))}
      {hasHalf && <i className="bi bi-star-half text-warning" />}
      {showEmpty && Array.from({ length: empty }).map((_, i) => (
        <i key={`e${i}`} className="bi bi-star text-warning" />
      ))}
    </span>
  );
};

// ─── Utility: Interactive star picker ────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const activeVal = hovered || value;

  return (
    <div className="d-flex align-items-center gap-3">
      <div className="d-flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className="btn p-0 border-0"
            style={{ fontSize: '2rem', lineHeight: 1, transition: 'transform 0.15s ease' }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <i
              className={`bi ${activeVal >= star ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
              style={{ transform: activeVal >= star ? 'scale(1.2)' : 'scale(1)', display: 'inline-block', transition: 'transform 0.15s ease' }}
            />
          </button>
        ))}
      </div>
      {activeVal > 0 && (
        <div className="d-flex align-items-center gap-2 fw-semibold text-muted bg-white px-3 py-1 rounded-pill shadow-sm animate-fade-in">
          <span>{labels[activeVal]}</span>
          <span style={{ fontSize: '1.2rem' }}>{getEmojiForRating(activeVal)}</span>
        </div>
      )}
    </div>
  );
};

// ─── Rating Distribution Bar ──────────────────────────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="d-flex align-items-center gap-2 mb-1">
      <span className="text-muted" style={{ minWidth: 40, fontSize: '0.85rem' }}>{star} <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.75rem' }} /></span>
      <div className="progress flex-grow-1" style={{ height: 8, borderRadius: 4 }}>
        <div
          className="progress-bar bg-warning"
          style={{ width: `${pct}%`, borderRadius: 4, transition: 'width 0.5s ease' }}
        />
      </div>
      <span className="text-muted" style={{ minWidth: 28, fontSize: '0.85rem', textAlign: 'right' }}>{count}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
// onRatingUpdate(avgRating, totalReviews) — optional callback so the parent
// (Detail.jsx) can refresh its own selectedProduct state instantly.
const ProductReviews = ({ productId, productName, discount, category, onRatingUpdate }) => {
  const navigate = useNavigate();

  const [reviews, setReviews]               = useState([]);
  const [avgRating, setAvgRating]           = useState(0);
  const [totalReviews, setTotalReviews]     = useState(0);
  // Per-star distribution fetched from server (not derived from page slice)
  const [ratingsDistribution, setRatingsDistribution] = useState({ 5:0, 4:0, 3:0, 2:0, 1:0 });
  const [loading, setLoading]               = useState(true);
  const [sortBy, setSortBy]                 = useState('latest');
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);

  // Form state
  const [formRating, setFormRating]   = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // AI & Animation state
  const [isTypingAI, setIsTypingAI] = useState(false);
  const [aiSuggestionRotation, setAiSuggestionRotation] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const typingTimerRef = useRef(null);
  const suggestionIntervalRef = useRef(null);

  // Edit/delete state
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating]     = useState(0);
  const [editComment, setEditComment]   = useState('');
  const [myReview, setMyReview]         = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  // ── Store onRatingUpdate in a ref ────────────────────────────────────────
  // This is the KEY fix for the infinite loop:
  // An inline arrow function prop gets a NEW reference on every parent render.
  // If we put it in a useCallback dependency array, the callback recreates
  // → useEffect fires → fetch runs → parent state updates → re-render → loop.
  // Storing it in a ref gives us an always-current value with a STABLE identity.
  const onRatingUpdateRef = useRef(onRatingUpdate);
  useEffect(() => { onRatingUpdateRef.current = onRatingUpdate; }, [onRatingUpdate]);

  // Auth helpers
  const getSavedUser = () => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  };
  const getAuthHeaders = () => {
    const u = getSavedUser();
    return u?.tokens?.accessToken
      ? { headers: { Authorization: `Bearer ${u.tokens.accessToken}` } }
      : null;
  };

  const savedUser = getSavedUser();
  const isLoggedIn = !!savedUser?.tokens?.accessToken;

  // ── Restore drafted review ───────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      const draftKey = `draftReview_${productId}`;
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.rating) setFormRating(parsed.rating);
          if (parsed.comment) setFormComment(parsed.comment);
        } catch { /* ignore */ }
        localStorage.removeItem(draftKey);
      }
    }
  }, [isLoggedIn, productId]);

  // ── Fetch per-star distribution (separate, stable, no loop risk) ─────────
  const fetchDistribution = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${productId}?sort=latest&page=1&limit=1000`);
      if (data.success) {
        const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 };
        data.data.reviews.forEach(r => {
          if (dist[r.rating] !== undefined) dist[r.rating]++;
        });
        setRatingsDistribution(dist);
      }
    } catch { /* non-critical — silently ignore */ }
  }, [productId]); // only productId — stable across sorts/pages

  // ── Fetch paginated reviews ───────────────────────────────────────────────
  // IMPORTANT: onRatingUpdate is accessed via ref — NOT in the dependency array.
  // This prevents the inline arrow function prop from causing infinite re-renders.
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/reviews/${productId}?sort=${sortBy}&page=${page}&limit=5`);
      if (data.success) {
        const newAvg   = data.data.averageRating;
        const newTotal = data.data.totalReviews;

        setReviews(data.data.reviews);
        setAvgRating(newAvg);
        setTotalReviews(newTotal);
        setTotalPages(data.data.pagination.pages);

        // Call parent callback via ref — safe, no loop
        if (onRatingUpdateRef.current) onRatingUpdateRef.current(newAvg, newTotal);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy, page]); // onRatingUpdate deliberately NOT here — use ref instead

  // ── Check if current user already reviewed ───────────────────────────────
  const checkMyReview = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const auth = getAuthHeaders();
      const { data } = await axios.get(`/api/reviews/check/${productId}`, auth);
      if (data.success && data.hasReviewed) {
        setMyReview(data.review);
      }
    } catch { /* ignore */ }
  }, [productId, isLoggedIn]);

  // Runs whenever sort or page changes — fetches the current page of reviews
  useEffect(() => {
    fetchReviews();
    checkMyReview();
  }, [fetchReviews, checkMyReview]);

  // Runs only when the product itself changes — fetches full distribution counts
  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  // ── AI Suggestion Helpers ────────────────────────────────────────────────
  useEffect(() => {
    if (formRating > 0) {
      suggestionIntervalRef.current = setInterval(() => {
        setAiSuggestionRotation(prev => prev + 1);
      }, 4000);
    } else {
      clearInterval(suggestionIntervalRef.current);
    }
    return () => clearInterval(suggestionIntervalRef.current);
  }, [formRating]);

  const loadAITemplate = async (rating) => {
    try {
      setIsTypingAI(true);
      setFormComment('');
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);

      const params = new URLSearchParams({
        rating,
        productName: productName || 'Product',
        categoryName: category?.[0]?.name || '',
        discount: discount || 0
      });
      
      const { data } = await axios.get(`/api/reviews/ai-reply?${params.toString()}`);
      if (data.success && data.data.suggestion) {
        if (data.data.rating) {
          setFormRating(data.data.rating); // Auto-assign the star rating mapping
        }
        
        const fullText = data.data.suggestion;
        let p = 0;
        typingTimerRef.current = setInterval(() => {
          if (p < fullText.length) {
            setFormComment(prev => prev + fullText.charAt(p));
            p++;
          } else {
            clearInterval(typingTimerRef.current);
            setIsTypingAI(false);
          }
        }, 15); // typing speed
      } else {
        setIsTypingAI(false);
      }
    } catch (e) {
      console.error(e);
      setIsTypingAI(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setFormRating(newRating);
  };

  // ── Submit new review ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formRating) {
      setFormError('Please select a star rating before submitting.');
      return;
    }

    if (!isLoggedIn) {
      // Save draft and show login modal
      localStorage.setItem(`draftReview_${productId}`, JSON.stringify({ rating: formRating, comment: formComment }));
      setShowLoginModal(true);
      return;
    }

    const auth = getAuthHeaders();
    try {
      setSubmitting(true);
      const { data } = await axios.post('/api/reviews', { productId, rating: formRating, comment: formComment }, auth);
      if (data.success) {
        setFormSuccess('Your review was submitted successfully! 🎉');
        setFormRating(0);
        setFormComment('');
        setMyReview(data.data);
        setPage(1);
        fetchReviews();
        fetchDistribution(); // refresh bar counts after new review
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to submit review. Please try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit edit ──────────────────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editRating) { return; }
    const auth = getAuthHeaders();
    if (!auth) return;

    try {
      const { data } = await axios.put(`/api/reviews/${editReviewId}`, { rating: editRating, comment: editComment }, auth);
      if (data.success) {
        setEditReviewId(null);
        setMyReview(data.data);
        fetchReviews();
        fetchDistribution(); // refresh bar counts after edit
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating review');
    }
  };

  // ── Delete review ────────────────────────────────────────────────────────
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    const auth = getAuthHeaders();
    if (!auth) return;
    try {
      setDeletingId(reviewId);
      await axios.delete(`/api/reviews/${reviewId}`, auth);
      setMyReview(null);
      setPage(1);
      fetchReviews();
      fetchDistribution(); // refresh bar counts after delete
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting review');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Variables for Render ─────────────────────────────────────────────────
  // Use server-fetched distribution, not the current-page slice, so bars are always accurate.
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star, count: ratingsDistribution[star] || 0
  }));

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const contextualSuggestions = formRating > 0 ? getContextualSuggestions(formRating) : [];
  const currentSuggestion = contextualSuggestions.length > 0 
    ? contextualSuggestions[aiSuggestionRotation % contextualSuggestions.length] 
    : "";

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div id="product-reviews" className="mt-5 pt-2 position-relative">
      <style>{`
        #product-reviews .review-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          transition: box-shadow 0.2s ease;
        }
        #product-reviews .review-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        #product-reviews .review-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          background: #e2e8f0;
        }
        #product-reviews .review-form-box {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5ff 100%);
          border: 1px dashed #cbd5e1;
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        #product-reviews .ai-glow {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        #product-reviews .sort-btn {
          border: 1.5px solid #e2e8f0;
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        #product-reviews .sort-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
        #product-reviews .rating-summary-box {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
        }
        #product-reviews .review-textarea {
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          resize: none;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        #product-reviews .review-textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.12);
        }
        #product-reviews .submit-review-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          padding: 0.75rem 2rem;
          transition: all 0.25s;
        }
        #product-reviews .submit-review-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102,126,234,0.35);
          color: white;
        }
        #product-reviews .submit-review-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        #product-reviews .big-rating {
          font-size: 4rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }
        #product-reviews .section-heading {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        #product-reviews .section-heading::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40%;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
        }
        
        /* Modals and Overlays */
        .ai-soft-overlay {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid #8b5cf6;
          border-radius: 12px;
          padding: 12px 16px;
        }
        .ai-animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .ai-animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Section Heading ── */}
      <h2 className="section-heading">
        <i className="bi bi-chat-square-quote-fill me-2" style={{ color: '#667eea' }} />
        Ratings & Reviews
      </h2>

      {/* ── Rating Summary ─────────────────────────────────────────────────── */}
      <div className="rating-summary-box mb-4">
        <div className="row g-4 align-items-center">
          {/* Left: Big Number */}
          <div className="col-auto text-center px-4">
            <div className="big-rating">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
            {avgRating > 0 && <StarDisplay rating={avgRating} size="lg" />}
            <p className="text-muted small mt-2 mb-0">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>

          {/* Right: Distribution Bars */}
          <div className="col flex-grow-1">
            {distribution.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={totalReviews} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Login Modal ───────────────────────────────────────────────────── */}
      {showLoginModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ai-animate-fade-in" style={{ zIndex: 1050, background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-4 shadow p-4 ai-animate-slide-up" style={{ maxWidth: '400px', width: '90%' }}>
            <h5 className="fw-bold mb-3">
              <i className="bi bi-lock-fill me-2 text-primary" />
              Login Required
            </h5>
            <p className="text-muted mb-4">You need to sign in to submit your review. We've saved your draft, so you won't lose your progress!</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary rounded-pill" onClick={() => setShowLoginModal(false)}>Close</button>
              <button className="btn btn-primary rounded-pill" onClick={() => navigate('/account/signin')}>Sign In Now</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Write a Review OR Already Reviewed ───────────────────────────── */}
      {myReview && !editReviewId && isLoggedIn ? (
        /* User has reviewed — show their review with edit/delete options */
        <div className="review-form-box mb-4 ai-animate-slide-up">
          <div className="ai-glow" />
          <div className="d-flex justify-content-between align-items-start position-relative z-1">
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-patch-check-fill text-success me-2" />
              Your Review
            </h6>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary rounded-pill py-1 px-3"
                onClick={() => {
                  setEditReviewId(myReview._id);
                  setEditRating(myReview.rating);
                  setEditComment(myReview.comment);
                }}
              >
                 <i className="bi bi-pencil me-1" /> Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger rounded-pill py-1 px-3"
                onClick={() => handleDelete(myReview._id)}
                disabled={deletingId === myReview._id}
              >
                {deletingId === myReview._id
                  ? <span className="spinner-border spinner-border-sm" />
                  : <><i className="bi bi-trash me-1" />Delete</>}
              </button>
            </div>
          </div>
          <div className="position-relative z-1">
            <StarDisplay rating={myReview.rating} size="md" />
            {myReview.comment && <p className="mt-2 mb-0 text-secondary">{myReview.comment}</p>}
          </div>
        </div>
      ) : editReviewId ? (
        /* Edit form */
        <div className="review-form-box mb-4 ai-animate-slide-up">
          <h6 className="fw-bold text-dark mb-3">
            <i className="bi bi-pencil-square me-2" style={{ color: '#667eea' }} />
            Edit Your Review
          </h6>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-muted small">Your Rating *</label>
              <StarPicker value={editRating} onChange={setEditRating} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold text-muted small">Comment (optional)</label>
              <textarea
                className="form-control review-textarea"
                rows={3}
                value={editComment}
                onChange={e => setEditComment(e.target.value)}
                maxLength={1000}
                placeholder="Update your thoughts..."
              />
              <div className="text-end small text-muted mt-1">{editComment.length}/1000</div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="submit-review-btn" disabled={!editRating}>
                Save Changes
              </button>
              <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setEditReviewId(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* New review form (AI Enhanced) */
        <div className="review-form-box mb-4 ai-animate-slide-up">
          <div className="ai-glow" />
          <div className="position-relative z-1">
            <h6 className="fw-bold text-dark mb-1">
              <i className="bi bi-stars me-2" style={{ color: '#8b5cf6' }} />
              Write a Review
            </h6>
            <p className="text-muted small mb-3">Powered by AI to help you articulate your experience.</p>

            {formSuccess && (
              <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 py-2 px-3 mb-3">
                <i className="bi bi-check-circle-fill" /> {formSuccess}
              </div>
            )}
            {formError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 py-2 px-3 mb-3">
                <i className="bi bi-exclamation-circle-fill" /> {formError}
              </div>
            )}

            {formRating > 0 && formRating <= 3 && (
              <div className="ai-soft-overlay mb-3 d-flex flex-column gap-2 ai-animate-fade-in">
                <div className="d-flex align-items-center gap-2 text-dark fw-semibold" style={{ fontSize: '0.9rem' }}>
                  <span>🤖</span> 
                  <span>Our AI suggests improving your rating for better community recommendations.</span>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline-primary bg-white rounded-pill" onClick={() => handleRatingChange(4)}>
                    Adjust to 4 Stars ✨
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-primary bg-white rounded-pill" onClick={() => handleRatingChange(5)}>
                    Adjust to 5 Stars 🔥
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-muted small">Your Rating *</label>
                <StarPicker value={formRating} onChange={handleRatingChange} />
                <div className="d-flex align-items-center gap-2 mt-2">
                   <button 
                     type="button" 
                     className="btn btn-sm text-white rounded-pill px-3 shadow-sm"
                     style={{ background: 'linear-gradient(135deg, #8b5cf6, #c084fc)', border: 'none' }}
                     onClick={() => loadAITemplate(formRating)}
                     disabled={isTypingAI}
                   >
                     ✨ Generate AI Review
                   </button>
                   <span className="text-muted" style={{ fontSize: '0.8rem' }}>AI suggestions match your rating mood</span>
                </div>
              </div>
              
              <div className="mb-4 position-relative">
                <label className="form-label fw-semibold text-muted small d-flex justify-content-between align-items-end">
                  <span>Review Details (optional)</span>
                  {formRating > 0 && !isTypingAI && (
                     <span className="ai-animate-fade-in text-primary fst-italic" style={{ fontSize: '0.8rem' }}>
                       {currentSuggestion}
                     </span>
                  )}
                </label>
                
                <div className="position-relative">
                  <textarea
                    className="form-control review-textarea"
                    rows={4}
                    value={formComment}
                    onChange={e => setFormComment(e.target.value)}
                    maxLength={1000}
                    placeholder="Tell others what you think about this product..."
                  />
                  {isTypingAI && (
                    <div className="position-absolute bottom-0 start-0 m-2 px-2 py-1 bg-white border rounded shadow-sm d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', pointerEvents: 'none' }}>
                       <span className="spinner-grow spinner-grow-sm text-primary" style={{ animationDuration: '1s' }} />
                       ✨ AI is typing...
                    </div>
                  )}
                </div>
                <div className="text-end small text-muted mt-1">{formComment.length}/1000</div>
              </div>

              <button
                type="submit"
                className="submit-review-btn w-100 w-md-auto"
                disabled={submitting || !formRating || isTypingAI}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                  : <><i className="bi bi-send-fill me-2" />Submit Review</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Review List ───────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-5">
        <h6 className="fw-bold text-dark mb-0">{totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}</h6>
        {totalReviews > 1 && (
          <div className="d-flex gap-2 flex-wrap">
            {[
              { key: 'latest', label: 'Latest' },
              { key: 'highest', label: '★ Highest' },
              { key: 'lowest', label: '★ Lowest' }
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`sort-btn ${sortBy === key ? 'active' : ''}`}
                onClick={() => { setSortBy(key); setPage(1); }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#667eea' }} />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-5 rounded-4" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <i className="bi bi-chat-dots" style={{ fontSize: '3rem', color: '#94a3b8' }} />
          <h6 className="fw-bold text-dark mt-3">No reviews yet</h6>
          <p className="text-muted small">Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  {/* User Info */}
                  <div className="d-flex align-items-center gap-3">
                    {review.userId?.avatar ? (
                      <img src={review.userId.avatar} alt="" className="review-avatar" />
                    ) : (
                      <div className="review-avatar d-flex align-items-center justify-content-center"
                        style={{ background: '#e0e7ff' }}>
                        <i className="bi bi-person-fill" style={{ color: '#667eea' }} />
                      </div>
                    )}
                    <div>
                      <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                        {review.userId?.name || 'Anonymous'}
                      </div>
                      <StarDisplay rating={review.rating} size="sm" />
                    </div>
                  </div>
                  {/* Date + owner actions */}
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">{formatDate(review.createdAt)}</small>
                    {savedUser && review.userId?._id === savedUser.id && (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => {
                            setEditReviewId(review._id);
                            setEditRating(review.rating);
                            setEditComment(review.comment);
                            setMyReview(review);
                          }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill py-0 px-2"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleDelete(review._id)}
                          disabled={deletingId === review._id}
                        >
                          {deletingId === review._id
                            ? <span className="spinner-border spinner-border-sm" style={{ width: '0.6rem', height: '0.6rem' }} />
                            : <i className="bi bi-trash" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-3 mb-0 text-secondary" style={{ lineHeight: 1.7 }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-outline-secondary rounded-pill px-3"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <i className="bi bi-chevron-left" />
              </button>
              <span className="d-flex align-items-center px-3 fw-semibold text-muted">
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline-secondary rounded-pill px-3"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;
