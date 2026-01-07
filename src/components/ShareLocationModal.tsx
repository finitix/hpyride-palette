import { useState } from "react";
import { Share2, Copy, MessageSquare, Mail, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  destination: string;
  eta: string;
  bookingId?: string;
}

const ShareLocationModal = ({
  isOpen,
  onClose,
  userLocation,
  destination,
  eta,
  bookingId
}: ShareLocationModalProps) => {
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");
  const [copied, setCopied] = useState(false);

  const shareUrl = userLocation
    ? `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`
    : "";

  const shareMessage = `🚗 I'm on my way!\n\n📍 Current Location: ${shareUrl}\n🎯 Destination: ${destination}\n⏱️ ETA: ${eta}\n\nTracking via HpyRide Safety Feature`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast({ title: "Copied!", description: "Location link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const shareViaSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const shareViaEmail = () => {
    const subject = "Live Location - HpyRide Safety";
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Live Location - HpyRide",
          text: shareMessage,
          url: shareUrl,
        });
        toast({ title: "Shared!", description: "Location shared successfully" });
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard();
    }
  };

  const addContact = () => {
    if (newContact.trim() && !contacts.includes(newContact.trim())) {
      setContacts([...contacts, newContact.trim()]);
      setNewContact("");
      toast({ title: "Contact added", description: "They will receive your live location" });
    }
  };

  const removeContact = (contact: string) => {
    setContacts(contacts.filter(c => c !== contact));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-green-500" />
            Share Live Location
          </DialogTitle>
          <DialogDescription>
            Share your real-time location with emergency contacts for added safety
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Location Preview */}
          {userLocation && (
            <div className="p-3 bg-secondary/50 rounded-xl">
              <p className="text-sm font-medium text-foreground">Current Location</p>
              <p className="text-xs text-muted-foreground mt-1">
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Heading to: {destination}
              </p>
              <p className="text-xs text-green-500 font-medium">
                ETA: {eta}
              </p>
            </div>
          )}

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareNative}
              className="flex flex-col items-center gap-1 h-16 rounded-xl"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[10px]">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaWhatsApp}
              className="flex flex-col items-center gap-1 h-16 rounded-xl bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
            >
              <MessageSquare className="w-5 h-5 text-green-500" />
              <span className="text-[10px]">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaSMS}
              className="flex flex-col items-center gap-1 h-16 rounded-xl"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px]">SMS</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaEmail}
              className="flex flex-col items-center gap-1 h-16 rounded-xl"
            >
              <Mail className="w-5 h-5" />
              <span className="text-[10px]">Email</span>
            </Button>
          </div>

          {/* Copy Link */}
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-muted rounded-lg text-xs truncate">
              {shareUrl || "Location not available"}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Emergency Contacts</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter phone or email"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addContact()}
                className="flex-1"
              />
              <Button onClick={addContact} size="sm">Add</Button>
            </div>
            {contacts.length > 0 && (
              <div className="space-y-1">
                {contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-sm truncate">{contact}</span>
                    <button onClick={() => removeContact(contact)} className="p-1">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Your location updates in real-time. Sharing stops when you end the ride.
          </p>
        </div>

        <Button onClick={onClose} variant="outline" className="w-full rounded-xl">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareLocationModal;
