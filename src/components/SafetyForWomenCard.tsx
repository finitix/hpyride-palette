import { useState } from "react";
import { Shield, UserCheck, Share2, Phone, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface SafetyForWomenCardProps {
  onPreferenceChange?: (femaleOnly: boolean) => void;
  showCard?: boolean;
}

const SafetyForWomenCard = ({ onPreferenceChange, showCard = true }: SafetyForWomenCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");
  const [shareRideStatus, setShareRideStatus] = useState(true);

  const handleFemaleOnlyChange = (checked: boolean) => {
    setFemaleOnly(checked);
    onPreferenceChange?.(checked);
  };

  const addTrustedContact = () => {
    if (newContact && newContact.length === 10) {
      setTrustedContacts([...trustedContacts, newContact]);
      setNewContact("");
      toast({
        title: "Contact added",
        description: "Trusted contact saved successfully.",
      });
    } else {
      toast({
        title: "Invalid number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
    }
  };

  const removeContact = (index: number) => {
    setTrustedContacts(trustedContacts.filter((_, i) => i !== index));
  };

  const shareRideNow = () => {
    if (trustedContacts.length === 0) {
      toast({
        title: "No contacts",
        description: "Please add trusted contacts first.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Ride shared!",
      description: `Live location shared with ${trustedContacts.length} contact(s).`,
    });
  };

  if (!showCard) return null;

  return (
    <>
      {/* Safety Card */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border border-pink-500/30 rounded-2xl flex items-center gap-4 hover:border-pink-500/50 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-bold text-foreground flex items-center gap-2">
            Safety for Women
            <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] rounded-full">NEW</span>
          </h4>
          <p className="text-xs text-muted-foreground">Female-only rides & trusted contact sharing</p>
        </div>
        <UserCheck className="w-5 h-5 text-pink-500" />
      </button>

      {/* Safety Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">Safety for Women</DialogTitle>
            <p className="text-sm text-muted-foreground">Your safety is our priority</p>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Female Only Preference */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-pink-500" />
                <div>
                  <p className="font-medium text-sm">Female co-passengers only</p>
                  <p className="text-xs text-muted-foreground">Prefer rides with women</p>
                </div>
              </div>
              <Switch checked={femaleOnly} onCheckedChange={handleFemaleOnlyChange} />
            </div>

            {/* Share Ride Status */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Auto-share ride status</p>
                  <p className="text-xs text-muted-foreground">Share with trusted contacts</p>
                </div>
              </div>
              <Switch checked={shareRideStatus} onCheckedChange={setShareRideStatus} />
            </div>

            {/* Trusted Contacts */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Trusted Contacts
              </h4>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter phone number"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="flex-1"
                />
                <Button onClick={addTrustedContact} size="sm" className="rounded-xl">
                  Add
                </Button>
              </div>

              {trustedContacts.length > 0 ? (
                <div className="space-y-2">
                  {trustedContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">+91 {contact}</span>
                      </div>
                      <button onClick={() => removeContact(index)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No trusted contacts added yet
                </p>
              )}
            </div>

            {/* Share Now Button */}
            <Button
              onClick={shareRideNow}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share My Ride Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SafetyForWomenCard;
