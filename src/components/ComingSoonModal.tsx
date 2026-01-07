import { Clock, Bell, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

const ComingSoonModal = ({ isOpen, onClose, serviceName }: ComingSoonModalProps) => {
  const handleNotifyMe = () => {
    toast({
      title: "🔔 You're on the list!",
      description: `We'll notify you when ${serviceName} launches.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl border-none">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
            <Clock className="w-10 h-10 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Coming Soon
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-lg font-semibold text-primary">{serviceName}</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground">
            We're working hard to bring you an amazing {serviceName.toLowerCase()} experience. 
            Be the first to know when we launch!
          </p>

          <div className="bg-secondary/50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Get Notified</p>
                <p className="text-xs text-muted-foreground">
                  We'll send you a notification the moment this feature goes live.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleNotifyMe}
            className="w-full h-12 rounded-2xl font-bold"
            variant="hero"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me When Ready
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Thank you for your patience! 🙏
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
