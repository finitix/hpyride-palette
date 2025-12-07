import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera, Check, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const VerificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    idType: "",
  });
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfieVideo, setSelfieVideo] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingVerification, setExistingVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingVerification();
  }, [user]);

  const checkExistingVerification = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setExistingVerification(data);
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'front') setIdFront(file);
      else setIdBack(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Camera access denied");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const startRecording = async () => {
    if (!videoRef.current?.srcObject) return;
    
    setIsRecording(true);
    setRecordingTime(0);
    setBlinkDetected(false);
    
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setSelfieVideo(blob);
      stopCamera();
    };
    
    mediaRecorder.start();
    
    // Simulate face and blink detection (in production, use TensorFlow.js or similar)
    setTimeout(() => setFaceDetected(true), 1000);
    
    const interval = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 5) {
          clearInterval(interval);
          mediaRecorder.stop();
          setIsRecording(false);
          return prev;
        }
        // Simulate blink detection at 3 seconds
        if (prev === 2) setBlinkDetected(true);
        return prev + 1;
      });
    }, 1000);
  };

  const uploadFile = async (file: File | Blob, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('user-verifications')
      .upload(path, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('user-verifications')
      .getPublicUrl(path);
    
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !formData.fullName || !formData.dateOfBirth || !formData.idType || !idFront || !idBack || !selfieVideo) {
      toast.error("Please fill all fields and upload all documents");
      return;
    }

    setSubmitting(true);
    try {
      const timestamp = Date.now();
      const frontUrl = await uploadFile(idFront, `${user.id}/id_front_${timestamp}.${idFront.name.split('.').pop()}`);
      const backUrl = await uploadFile(idBack, `${user.id}/id_back_${timestamp}.${idBack.name.split('.').pop()}`);
      const videoUrl = await uploadFile(selfieVideo, `${user.id}/selfie_video_${timestamp}.webm`);

      if (!frontUrl || !backUrl || !videoUrl) {
        throw new Error("Failed to upload files");
      }

      if (existingVerification) {
        const { error } = await supabase
          .from('user_verifications')
          .update({
            full_name: formData.fullName,
            date_of_birth: formData.dateOfBirth,
            id_type: formData.idType,
            id_front_url: frontUrl,
            id_back_url: backUrl,
            selfie_video_url: videoUrl,
            status: 'pending',
            rejection_reason: null,
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_verifications')
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            date_of_birth: formData.dateOfBirth,
            id_type: formData.idType,
            id_front_url: frontUrl,
            id_back_url: backUrl,
            selfie_video_url: videoUrl,
          });

        if (error) throw error;
      }

      toast.success("Verification submitted successfully!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (existingVerification?.status === 'verified') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Verification</h1>
        </header>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">You're Verified!</h2>
          <p className="text-muted-foreground">Your account has been verified successfully.</p>
        </div>
      </div>
    );
  }

  if (existingVerification?.status === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Verification</h1>
        </header>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Verification Pending</h2>
          <p className="text-muted-foreground">Your verification is under review. We'll notify you once it's approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Verify Your Identity</h1>
      </header>

      {existingVerification?.status === 'rejected' && (
        <div className="mx-4 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Verification Rejected</p>
              <p className="text-sm text-muted-foreground mt-1">{existingVerification.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Personal Details</h3>
          
          <div className="space-y-2">
            <Label>Full Name (as per ID)</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>ID Type</Label>
            <Select value={formData.idType} onValueChange={(v) => setFormData({ ...formData, idType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhar">Aadhar Card</SelectItem>
                <SelectItem value="voter">Voter ID</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ID Documents */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Upload ID Documents</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Front Side</Label>
              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  idFront ? 'border-green-500 bg-green-500/10' : 'border-border hover:border-foreground'
                }`}>
                  {idFront ? (
                    <div className="flex flex-col items-center">
                      <Check className="w-6 h-6 text-green-500 mb-1" />
                      <span className="text-xs truncate max-w-full">{idFront.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Upload Front</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} />
              </label>
            </div>

            <div className="space-y-2">
              <Label>Back Side</Label>
              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  idBack ? 'border-green-500 bg-green-500/10' : 'border-border hover:border-foreground'
                }`}>
                  {idBack ? (
                    <div className="flex flex-col items-center">
                      <Check className="w-6 h-6 text-green-500 mb-1" />
                      <span className="text-xs truncate max-w-full">{idBack.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Upload Back</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} />
              </label>
            </div>
          </div>
        </div>

        {/* Selfie Video */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Selfie Video Verification</h3>
          <p className="text-sm text-muted-foreground">Record a 5-second video. Blink your eyes when prompted to verify you're a real person.</p>

          {!showCamera && !selfieVideo && (
            <Button onClick={startCamera} className="w-full" variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          )}

          {showCamera && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full rounded-xl bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Face circle overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-48 h-64 border-4 rounded-full transition-colors ${
                  faceDetected ? 'border-green-500' : 'border-white/50'
                }`} />
              </div>

              {/* Recording status */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm">{recordingTime}s / 5s</span>
                </div>
              )}

              {/* Instructions */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                {!isRecording ? (
                  <Button onClick={startRecording} disabled={!faceDetected}>
                    Start Recording
                  </Button>
                ) : (
                  <div className="bg-black/50 px-4 py-2 rounded-lg inline-block">
                    <p className="text-white text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {blinkDetected ? "Blink detected! ✓" : "Please blink your eyes"}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          {selfieVideo && (
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-500" />
                <span className="font-medium">Video recorded successfully</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelfieVideo(null); startCamera(); }}>
                Re-record
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || !formData.fullName || !formData.dateOfBirth || !formData.idType || !idFront || !idBack || !selfieVideo}
          className="w-full"
        >
          {submitting ? "Submitting..." : existingVerification ? "Resubmit Verification" : "Submit for Verification"}
        </Button>
      </div>
    </div>
  );
};

export default VerificationPage;