import { useState } from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useProductReviews, useCreateReview, useUpdateReview, useDeleteReview, DbReview } from '@/hooks/useReviews';

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          <Star
            className={`w-5 h-5 ${
              (hovered || rating) >= star
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [editingReview, setEditingReview] = useState<DbReview | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const userReview = reviews.find((r) => r.user_id === user?.id);
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmitReview = () => {
    if (!user || newRating === 0) return;

    createReview.mutate({
      product_id: productId,
      user_id: user.id,
      rating: newRating,
      comment: newComment.trim() || undefined,
    }, {
      onSuccess: () => {
        setNewRating(0);
        setNewComment('');
      }
    });
  };

  const handleUpdateReview = () => {
    if (!editingReview || editRating === 0) return;

    updateReview.mutate({
      id: editingReview.id,
      product_id: productId,
      rating: editRating,
      comment: editComment.trim() || undefined,
    }, {
      onSuccess: () => {
        setEditingReview(null);
        setEditRating(0);
        setEditComment('');
      }
    });
  };

  const handleDeleteReview = (review: DbReview) => {
    deleteReview.mutate({ id: review.id, product_id: productId });
  };

  const startEditing = (review: DbReview) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Reviews</h3>
        {averageRating && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-medium">{averageRating}</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {/* Add Review Form - Only for logged-in users who haven't reviewed */}
      {user && !userReview && (
        <div className="p-4 bg-secondary rounded-lg space-y-3">
          <p className="text-sm font-medium">Write a Review</p>
          <StarRating rating={newRating} onRate={setNewRating} interactive />
          <Textarea
            placeholder="Share your thoughts about this product..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
          <Button
            size="sm"
            onClick={handleSubmitReview}
            disabled={newRating === 0 || createReview.isPending}
          >
            {createReview.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <p className="text-sm text-muted-foreground p-4 bg-secondary rounded-lg">
          Please sign in to leave a review.
        </p>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading reviews...</p>}

      {/* Reviews List */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {reviews.map((review) => (
          <div key={review.id} className="p-3 bg-muted rounded-lg space-y-2">
            {editingReview?.id === review.id ? (
              <div className="space-y-3">
                <StarRating rating={editRating} onRate={setEditRating} interactive />
                <Textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdateReview} disabled={updateReview.isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingReview(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  {user?.id === review.user_id && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditing(review)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteReview(review)}
                        disabled={deleteReview.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        ))}

        {!isLoading && reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
