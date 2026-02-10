import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Camera, MapPin, Upload, X, Loader2, CheckCircle2, 
  AlertCircle, ChevronDown, ArrowLeft, Sparkles, 
  Settings2, Lightbulb, Trash2, Droplets, Zap, ShieldAlert,
  Navigation, Maximize2, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';
import { issueService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import { DEPARTMENTS } from '../../constants';
import LocationMap from '../../components/LocationMap';

const DEPARTMENT_ICONS = {
  'Road Maintenance': <Trash2 className="h-5 w-5" />,
  'Drainage': <Droplets className="h-5 w-5" />,
  'Streetlight Department': <Zap className="h-5 w-5" />,
  'Head Authority': <ShieldAlert className="h-5 w-5" />,
};

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [aiFailed, setAiFailed] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [locationStatus, setLocationStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [error, setError] = useState('');

  const [manualIssueType, setManualIssueType] = useState('');
  const [isMapFull, setIsMapFull] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const requestLocation = () => {
    setLocationStatus('loading');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('success');
        },
        (err) => {
          console.error("Location error:", err);
          setLocationStatus('error');
          setError('Location access is required to report an issue accurately.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus('error');
      setError('Browser does not support geolocation.');
    }
  };

  // Get location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-black">Initializing report environment...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('--- SUBMISSION START ---');
    console.log('isManualSelection:', isManualSelection);
    console.log('selectedDepartment:', selectedDepartment);
    
    if (!image) {
      setError('Please capture or upload an image');
      return;
    }

    if (locationStatus !== 'success') {
      setError('Location access is required to report an issue accurately.');
      return;
    }

    if (isManualSelection && !selectedDepartment) {
      setError('Please select a department');
      return;
    }

    setIsSubmitting(true);
    setAiFailed(false);
    setError('');

    try {
      // 1. Upload Image to Supabase Storage
      const fileExt = image.split(';')[0].split('/')[1];
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const base64Data = image.split(',')[1];
      const blob = await fetch(image).then(res => res.blob());

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('issue-images')
        .getPublicUrl(fileName);

      // 2. Submit to Backend API
      const payload = {
        image_url: publicUrl,
        description,
        location_lat: location.lat,
        location_lng: location.lng,
        manual_department: isManualSelection ? selectedDepartment : null,
        manual_issue_type: isManualSelection ? manualIssueType : null,
        is_manual_submission: isManualSelection // Explicit flag
      };
      
      console.log('Sending Payload to Backend:', JSON.stringify(payload, null, 2));

      const result = await issueService.createIssue(payload);
      
      console.log('Backend Response Full:', result);

      setAiResult({
        issueType: result.issue_type,
        assignedDepartment: result.department || result.assigned_authority,
        status: result.status,
        isManual: result.ai_analysis?.is_manual || isManualSelection, // Fallback to local state if server is ambiguous
        confidence: result.ai_analysis?.confidence
      });
      setShowResult(true);
    } catch (err) {
      console.error('Submission error full object:', err);
      
      let errorMessage = 'Failed to submit issue. Please try again.';
      let errorDetails = '';

      if (err.response?.data) {
        errorMessage = err.response.data.error || errorMessage;
        errorDetails = err.response.data.details || err.response.data.message || '';
        
        // If there's a hint or code (from Supabase), include them
        if (err.response.data.hint) errorDetails += ` (Hint: ${err.response.data.hint})`;
        if (err.response.data.code) errorDetails += ` [Code: ${err.response.data.code}]`;
      } else {
        errorMessage = err.message;
      }

      setError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
      
      // Fallback to manual if AI fails or other error occurs
      setAiFailed(true);
      setIsManualSelection(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResult) {
    return (
      <DashboardLayout>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-10 text-center text-white relative">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-black mb-2">Report Submitted!</h1>
              <p className="opacity-90 font-medium">Your contribution makes our city better.</p>
            </div>
            
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Status & Classification</h2>
                <Badge variant="success" className="px-4 py-1.5 rounded-full font-bold">LIVE</Badge>
              </div>
              
              <div className="space-y-4">
                <div className="group flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 transition-all">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {aiResult?.isManual ? "Reported Issue" : "Detected Issue"}
                    </p>
                    <p className="text-xl font-black text-slate-900">{aiResult?.issueType}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider border shadow-sm transition-all",
                      aiResult?.isManual 
                        ? "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50" 
                        : "bg-primary-50 text-primary-600 border-primary-100 shadow-primary-100/50"
                    )}>
                      {aiResult?.isManual ? (
                        <><User className="h-3.5 w-3.5" /> Manual Report</>
                      ) : (
                        <><Zap className="h-3.5 w-3.5" /> AI Detected</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="group flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                      {DEPARTMENT_ICONS[aiResult?.assignedDepartment] || <Settings2 className="h-5 w-5 text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {aiResult?.isManual ? "Selected Department" : "Assigned Department"}
                      </p>
                      <p className="text-xl font-black text-slate-900">{aiResult?.assignedDepartment}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                      aiResult?.isManual ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {aiResult?.isManual ? "USER ASSIGNED" : "SYSTEM VERIFIED"}
                    </div>
                    {!aiResult?.isManual && (
                      <button 
                        onClick={() => {
                          setShowResult(false);
                          setIsManualSelection(true);
                          setSelectedDepartment(aiResult?.assignedDepartment);
                        }}
                        className="text-[10px] font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2"
                      >
                        Wrong Category?
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    onClick={() => navigate('/citizen/my-issues')}
                    className="flex-[2] bg-slate-900 text-white py-5 rounded-[1.25rem] font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Track My Report
                  </button>
                  <button 
                    onClick={() => {
                      setShowResult(false);
                      setImage(null);
                      setDescription('');
                      setIsManualSelection(false);
                    }}
                    className="flex-1 bg-white text-slate-700 border-2 border-slate-100 py-5 rounded-[1.25rem] font-black hover:bg-slate-50 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 md:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Report Issue</h1>
              <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Smart civic reporting for a better city.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isManualSelection && (
              <div className="hidden md:flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-2xl border border-primary-100">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-xs font-black text-primary-700 uppercase tracking-wider">Smart Analysis Active</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsManualSelection(!isManualSelection)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 md:py-2 rounded-2xl border-2 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest ${
                isManualSelection 
                  ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-lg shadow-amber-100' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              <Settings2 className="h-4 w-4" />
              {isManualSelection ? 'Manual Mode' : 'Switch to Manual'}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {aiFailed && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-10 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-[2rem] p-8 shadow-xl shadow-amber-100/20"
            >
              <div className="flex items-start gap-5">
                <div className="bg-white p-4 rounded-[1.25rem] shadow-sm">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-900">System Needs Help!</h3>
                  <p className="text-amber-700 font-medium mt-1 leading-relaxed">
                    Our system couldn't quite figure this one out. No worries—you can manually select the department below to ensure it reaches the right team.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
          {/* Mode Selector */}
          <div className="bg-slate-100/50 p-1.5 md:p-2 rounded-[1.25rem] md:rounded-[1.5rem] flex gap-2">
            <button
              type="button"
              onClick={() => setIsManualSelection(false)}
              className={`flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 rounded-xl md:rounded-[1.25rem] font-black text-[10px] md:text-xs tracking-widest transition-all ${!isManualSelection ? 'bg-white shadow-lg shadow-slate-200 text-primary-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Sparkles className={`h-4 w-4 md:h-5 md:w-5 ${!isManualSelection ? 'fill-primary-600' : ''}`} />
              SMART DETECTION
            </button>
            <button
              type="button"
              onClick={() => setIsManualSelection(true)}
              className={`flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 rounded-xl md:rounded-[1.25rem] font-black text-[10px] md:text-xs tracking-widest transition-all ${isManualSelection ? 'bg-white shadow-lg shadow-slate-200 text-amber-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Settings2 className="h-4 w-4 md:h-5 md:w-5" />
              MANUAL SELECT
            </button>
          </div>

          <AnimatePresence>
            {isManualSelection && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-100 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900">Select Department</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDepartment(dept)}
                        className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all text-left ${selectedDepartment === dept ? 'border-primary-500 bg-primary-50/50 ring-4 ring-primary-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className={`p-2 md:p-3 rounded-xl ${selectedDepartment === dept ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-400'}`}>
                          {DEPARTMENT_ICONS[dept] || <Settings2 className="h-4 w-4 md:h-5 md:w-5" />}
                        </div>
                        <span className={`font-bold text-sm md:text-base ${selectedDepartment === dept ? 'text-primary-900' : 'text-slate-600'}`}>{dept}</span>
                      </button>
                    ))}
                  </div>



                  {/* Manual Issue Type Dropdown */}
                  <div className="space-y-4">
                    <label htmlFor="manualIssueType" className="text-lg md:text-xl font-black text-slate-900 ml-2">Issue Type</label>
                    <div className="relative">
                      <select
                        id="manualIssueType"
                        value={manualIssueType}
                        onChange={(e) => setManualIssueType(e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-base md:text-lg font-medium text-slate-900 focus:ring-4 focus:ring-primary-50 outline-none shadow-sm appearance-none pr-12"
                        required={isManualSelection}
                      >
                        <option value="" disabled>Select an issue type</option>
                        <option value="Pothole">Pothole</option>
                        <option value="Garbage">Garbage</option>
                        <option value="Damage Streetlight">Damage Streetlight</option>
                        <option value="Water Log">Water Log</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Image Upload Area */}
            <div className="space-y-4">
              <label className="text-lg md:text-xl font-black text-slate-900 ml-2">Photo Proof</label>
              <div className={`relative group aspect-[4/3] md:aspect-square rounded-[2rem] md:rounded-[2.5rem] border-4 border-dashed transition-all overflow-hidden ${image ? 'border-primary-500' : 'border-slate-200 hover:border-primary-400 bg-slate-50/50'}`}>
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setImage(null)}
                        className="bg-white/20 backdrop-blur-md text-white p-3 md:p-4 rounded-full hover:bg-white/30 transition-colors border border-white/30"
                      >
                        <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6 md:p-10 text-center">
                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 mb-4 md:mb-6 group-hover:scale-110 transition-transform border border-slate-50">
                      <Camera className="h-8 w-8 md:h-12 md:w-12 text-primary-600" />
                    </div>
                    <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Snap or Upload</p>
                    <p className="text-xs md:text-sm text-slate-400 font-medium mt-1 md:mt-2">Clear photos help AI process faster</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                  </label>
                )}
              </div>
            </div>

            {/* Details Area */}
            <div className="space-y-8 md:space-y-10">
              <div className="space-y-4">
                <label className="text-lg md:text-xl font-black text-slate-900 ml-2">Description</label>
                <div className="relative">
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us what's happening..."
                    className="w-full h-48 md:h-56 bg-white border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-base md:text-lg font-medium text-slate-900 focus:ring-4 focus:ring-primary-50 placeholder:text-slate-300 outline-none resize-none shadow-sm"
                  />
                  <div className="absolute bottom-4 right-6 md:bottom-6 md:right-8 text-slate-300 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                    {description.length} chars
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <label className="text-lg md:text-xl font-black text-slate-900">Location Detection</label>
                  <button 
                    type="button"
                    onClick={requestLocation}
                    className="flex items-center gap-2 text-[10px] md:text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                  >
                    <Navigation className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
                
                <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 relative overflow-hidden h-64 md:h-72 shadow-2xl shadow-slate-300">
                  {locationStatus === 'loading' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                      <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary-500 animate-spin mb-4" />
                      <p className="text-primary-400 font-black uppercase tracking-widest text-[10px] md:text-xs">Fetching location...</p>
                    </div>
                  ) : locationStatus === 'error' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20 p-6 md:p-10 text-center">
                      <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-red-500 mb-4" />
                      <p className="text-white font-black text-xs md:text-sm uppercase tracking-wider mb-2">Location Denied</p>
                      <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed">Please enable location access in your browser to report an issue.</p>
                      <button 
                        type="button"
                        onClick={requestLocation}
                        className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] md:text-xs font-black transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 z-0">
                        <LocationMap lat={location.lat} lng={location.lng} />
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => setIsMapFull(true)}
                        className="absolute top-3 right-3 md:top-4 md:right-4 z-30 bg-white/90 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl shadow-xl border border-white/20 hover:bg-white transition-all group"
                        title="View Full Map"
                      >
                        <Maximize2 className="h-4 w-4 md:h-5 md:w-5 text-slate-700 group-hover:scale-110 transition-transform" />
                      </button>
                      
                      {/* Overlay Info */}
                      <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-10">
                        <div className="bg-slate-900/80 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 flex items-center gap-4 md:gap-5">
                          <div className="bg-primary-500 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-primary-500/20 shrink-0">
                            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] md:text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-0.5 md:mb-1">Detected Coordinates</p>
                            <p className="text-white font-black text-sm md:text-lg truncate">
                              {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                            </p>
                            <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5 md:mt-1">
                              <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                              Live Location Active
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || !image || (isManualSelection && !selectedDepartment)}
            className={`w-full py-5 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl transition-all shadow-2xl flex items-center justify-center gap-3 md:gap-4 ${isSubmitting ? 'bg-slate-100 text-slate-400' : isManualSelection ? 'bg-amber-600 text-white shadow-amber-200' : 'bg-primary-600 text-white shadow-primary-200'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
                {isManualSelection ? 'Finalizing...' : 'AI Processing...'}
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 md:h-7 md:w-7" />
                {isManualSelection ? 'Confirm & Submit' : 'Submit for AI Scan'}
              </>
            )}
          </motion.button>
        </form>

        {/* Full Map Modal */}
        <AnimatePresence>
          {isMapFull && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl p-2 md:p-10 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-6xl h-[90vh] md:h-[80vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                  <div className="min-w-0">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3">
                      <div className="bg-primary-100 p-1.5 md:p-2 rounded-xl shrink-0">
                        <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                      </div>
                      <span className="truncate">Full Location View</span>
                    </h2>
                    <p className="text-slate-500 text-xs md:text-sm font-medium ml-10 md:ml-12 truncate">
                      {location.lat.toFixed(6)}°, {location.lng.toFixed(6)}°
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsMapFull(false)}
                    className="p-3 md:p-4 bg-slate-100 rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all group shrink-0"
                  >
                    <X className="h-5 w-5 md:h-6 md:w-6 text-slate-600 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                {/* Modal Map */}
                <div className="flex-1 relative">
                  <LocationMap 
                    lat={location.lat} 
                    lng={location.lng} 
                    interactive={true} 
                    className="h-full w-full"
                  />
                  
                  {/* Floating Location Tag */}
                  <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 z-20">
                    <div className="bg-slate-900/90 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                        <div>
                          <p className="text-[8px] md:text-[10px] font-black text-primary-400 uppercase tracking-widest">System Status</p>
                          <p className="text-white text-xs md:text-base font-black">Live Tracking Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setIsMapFull(false)}
                    className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ReportIssue;
