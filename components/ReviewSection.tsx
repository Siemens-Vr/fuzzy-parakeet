// components/ReviewSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string | null;
  content: string | null;
  helpful: number;
  verified: boolean;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface ReviewSectionProps {
  appSlug: string;
  initialStats?: ReviewStats;
}

const StarIcon = ({ filled = false, onClick, interactive = false }: { filled?: boolean; onClick?: () => void; interactive?: boolean }) => (
  <svg 
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`} 
    fill={filled ? 'currentColor' : 'none'} 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    onClick={onClick}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const StarRating = ({ rating, interactive = false, onRatingChange }: { rating: number; interactive?: boolean; onRatingChange?: (rating: number) => void }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
        >
          <StarIcon 
            filled={star <= (hoverRating || rating)} 
            interactive={interactive}
          />
        </div>
      ))}
    </div>
  );
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function ReviewSection({ appSlug, initialStats }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>(initialStats || {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Check authentication and existing review
  useEffect(() => {
    checkUserReviewStatus();
  }, [appSlug]);

  // Fetch reviews
  useEffect(() => {
    fetchReviews(1, true);
  }, [appSlug, sortBy]);

  const checkUserReviewStatus = async () => {
    try {
      const response = await fetch('/api/user/reviews/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appSlug })
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setHasPurchased(data.hasPurchased);
        if (data.hasReviewed && data.review) {
          setUserReview(data.review);
          setFormData({
            rating: data.review.rating,
            title: data.review.title || '',
            content: data.review.content || ''
          });
        }
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const fetchReviews = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/public/apps/${appSlug}/reviews?page=${pageNum}&limit=10&sortBy=${sortBy}`
      );

      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setReviews(data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
        }
        setStats(data.stats);
        setHasMore(data.pagination.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const method = userReview ? 'PUT' : 'POST';
      const response = await fetch('/api/user/reviews', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          appSlug,
          rating: formData.rating,
          title: formData.title || null,
          content: formData.content || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserReview(data.review);
        setShowReviewForm(false);
        setIsEditing(false);
        // Refresh reviews
        fetchReviews(1, true);
        checkUserReviewStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      const response = await fetch(`/api/user/reviews?appSlug=${appSlug}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setUserReview(null);
        setFormData({ rating: 0, title: '', content: '' });
        fetchReviews(1, true);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/user/reviews/${reviewId}/helpful`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Update the review in the list
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 }
            : review
        ));
      }
    } catch (error) {
      console.error('Error marking as helpful:', error);
    }
  };

  const totalReviews = stats.totalReviews;

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <div className="flex justify-center my-2">
              <StarRating rating={stats.averageRating} />
            </div>
            <div className="text-gray-400 text-sm">{totalReviews.toLocaleString()} reviews</div>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1 space-y-2 w-full">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = stats.distribution[stars] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-3">{stars}</span>
                  <StarIcon filled />
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-yellow-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-10">{percentage.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isAuthenticated ? (
          userReview ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-400">You've reviewed this app</span>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowReviewForm(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Edit Review
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
            >
              Write a Review
            </button>
          )
        ) : (
          <div className="text-gray-400">
            <a href={`/auth/user/login?redirect=/apps/${appSlug}`} className="text-purple-400 hover:underline">
              Sign in
            </a> to write a review
          </div>
        )}

        {/* Sort Options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {!hasPurchased && (
              <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-400 text-sm">
                ⚠️ You haven't purchased this app. Your review won't be marked as verified.
              </div>
            )}

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Rating *</label>
              <div className="flex items-center gap-2">
                <StarRating 
                  rating={formData.rating} 
                  interactive 
                  onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                />
                <span className="text-gray-400 text-sm ml-2">
                  {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Title (optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                maxLength={100}
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Review (optional)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tell others about your experience with this app..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none min-h-[120px] resize-y"
                maxLength={2000}
              />
              <div className="text-right text-gray-500 text-xs mt-1">
                {formData.content.length}/2000
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setIsEditing(false);
                  setError('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || formData.rating === 0}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  isEditing ? 'Update Review' : 'Submit Review'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
            <p className="text-gray-400">Be the first to review this app!</p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{review.userName}</span>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-gray-400 text-sm">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-medium text-white mb-2">{review.title}</h4>
                )}
                {review.content && (
                  <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">{review.content}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <button 
                    onClick={() => isAuthenticated && handleMarkHelpful(review.id)}
                    className={`text-gray-400 hover:text-white flex items-center gap-1 transition-colors ${!isAuthenticated ? 'cursor-default' : ''}`}
                    disabled={!isAuthenticated}
                  >
                    <span>👍</span>
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => fetchReviews(page + 1)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Reviews'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}