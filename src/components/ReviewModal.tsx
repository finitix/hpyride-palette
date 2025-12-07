import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  rideId: string;
  driverId: string;
  userId: string;
}

const ReviewModal = ({ isOpen, onClose, bookingId, rideId, driverId, userId }: ReviewModalProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        ride_id: rideId,
        driver_id: driverId,
        reviewer_id: userId,
        rating,
        comment: comment.trim() || null
      });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback"
      });
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Rate Your Ride</h2>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-center text-muted-foreground mb-4">
          Your ride is complete! How was your experience?
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-6 min-h-[100px]"
        />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Skip
          </Button>
          <Button 
            variant="hero" 
            className="flex-1" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
