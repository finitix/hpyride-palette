import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Check, X, Eye, User, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAdminApi } from "@/hooks/useAdminApi";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Verification {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  id_type: string;
  id_front_url: string;
  id_back_url: string;
  selfie_video_url: string;
  status: string;
  created_at: string;
  profile?: {
    email: string;
    phone: string;
  };
}

const AdminVerifyUsersPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { callAdminApi } = useAdminApi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate("/admin");
      return;
    }
    fetchVerifications();
  }, [admin, navigate, activeTab]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const data = await callAdminApi('get_verifications', { 
        status: activeTab === 'pending' ? 'pending' : null 
      });
      setVerifications(data || []);
    } catch (error: any) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to fetch verifications');
    }
    setLoading(false);
  };

  const handleApprove = async (verification: Verification) => {
    setProcessing(true);
    try {
      await callAdminApi('approve_verification', { 
        id: verification.id, 
        user_id: verification.user_id 
      });
      toast.success("User verified successfully");
      fetchVerifications();
      setSelectedVerification(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      await callAdminApi('reject_verification', { 
        id: selectedVerification.id,
        reason: rejectReason 
      });
      toast.success("Verification rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchVerifications();
      setSelectedVerification(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Verify Users</h1>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            All Users
          </button>
        </div>

        <main className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No verifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((v) => (
                <div key={v.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{v.full_name}</p>
                        <p className="text-sm text-muted-foreground">{v.profile?.email}</p>
                        <p className="text-xs text-muted-foreground">{v.profile?.phone}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      v.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                      v.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>DOB: {new Date(v.date_of_birth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>ID: {v.id_type.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedVerification(v)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    {v.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(v)}
                          disabled={processing}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm" 
                          onClick={() => { setSelectedVerification(v); setRejectDialogOpen(true); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedVerification && !rejectDialogOpen} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{selectedVerification.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{new Date(selectedVerification.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID Type</p>
                <p className="font-medium">{selectedVerification.id_type.toUpperCase()}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">ID Front</p>
                <img src={selectedVerification.id_front_url} alt="ID Front" className="w-full rounded-lg" />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">ID Back</p>
                <img src={selectedVerification.id_back_url} alt="ID Back" className="w-full rounded-lg" />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Selfie Video</p>
                <video src={selectedVerification.selfie_video_url} controls className="w-full rounded-lg" />
              </div>

              {selectedVerification.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { setRejectDialogOpen(true); }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedVerification)}
                    disabled={processing}
                  >
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejection. This will be shown to the user.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerifyUsersPage;