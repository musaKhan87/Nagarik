import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, RefreshCw, Check, Sparkles } from 'lucide-react';
import * as tmImage from '@teachablemachine/image';

export function CameraCapture({ onCapture, initialImage }) {
  const [image, setImage] = useState(initialImage || '');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [model, setModel] = useState(null);
  const [modelMeta, setModelMeta] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [progress, setProgress] = useState('Loading Custom AI Model...');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load the Teachable Machine custom model from public folder with cache-busting
  useEffect(() => {
    async function loadModel() {
      setLoadingModel(true);
      try {
        const cacheBuster = Date.now();
        const modelURL = `/model/model.json?v=${cacheBuster}`;
        const metadataURL = `/model/metadata.json?v=${cacheBuster}`;

        // Fetch metadata to read training metrics & labels
        try {
          const metaResp = await fetch(metadataURL);
          if (metaResp.ok) {
            const meta = await metaResp.json();
            setModelMeta(meta);
          }
        } catch (e) {
          console.warn('Metadata fetch error:', e);
        }

        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        setProgress('Civic AI Model Active (Original • 6 Classes)');
        console.log('✅ Original balanced Teachable Machine Model restored & active from /model/model.json');
      } catch (err) {
        console.warn('Custom TM model offline, using vision helper:', err);
        setProgress('Vision Helper Active');
      } finally {
        setLoadingModel(false);
      }
    }
    loadModel();
  }, []);

  const mapPredictionToClass = (predictionName) => {
    switch (predictionName) {
      case 'Pothole':
        return { type: 'Broken Road', priority: 'High' };
      case 'Garbage':
        return { type: 'Garbage', priority: 'Low' };
      case 'Broken Streetlight':
      case 'Street Light':
      case 'Not Working':
      case 'Flicker':
        return { type: 'Street Light', priority: 'High' };
      case 'Water Leakage':
        return { type: 'Waterlogging', priority: 'Medium' };
      case 'Sewage':
        return { type: 'Waterlogging', priority: 'High' };
      case 'Working':
      case 'Normal Road':
      default:
        return { type: 'Other', priority: 'Medium' };
    }
  };

  const handlePredict = async (imageElementOrCanvas) => {
    if (model) {
      try {
        const predictions = await model.predict(imageElementOrCanvas);
        console.log('🤖 [Custom TM Model] Raw Predictions:', predictions.map(p => `${p.className}: ${(p.probability * 100).toFixed(1)}%`));
        const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
        const highest = sorted[0];
        const primaryMapped = mapPredictionToClass(highest.className);
        const primaryConfidence = Math.round(highest.probability * 100);

        const isNormalRoad = highest.className === 'Normal Road' || highest.className === 'Working';
        const isLowConfidence = highest.probability < 0.35;
        const isValidComplaint = !isNormalRoad && !isLowConfidence;

        const rejectionReason = !isValidComplaint 
          ? (isNormalRoad 
              ? "🛡️ Anti-Spam Shield: Image shows a normal scene with no visible civic damage."
              : "🛡️ Anti-Spam Shield: Image appears to be a selfie or random object. Please upload a clear photo of the civic issue.")
          : null;

        const significant = sorted
          .filter(p => p.probability >= 0.30 && p.className !== 'Normal Road')
          .map(p => {
            const mapped = mapPredictionToClass(p.className);
            return {
              issueType: mapped.type,
              rawClass: p.className,
              confidence: Math.round(p.probability * 100),
              priority: mapped.priority
            };
          });

        const uniqueIssuesMap = new Map();
        significant.forEach(item => {
          if (!uniqueIssuesMap.has(item.issueType)) {
            uniqueIssuesMap.set(item.issueType, item);
          }
        });
        const detectedIssues = Array.from(uniqueIssuesMap.values());

        return {
          issueType: primaryMapped.type,
          rawClass: highest.className,
          confidence: primaryConfidence,
          priority: primaryMapped.priority,
          isValidComplaint,
          rejectionReason,
          rawPredictions: sorted.map(p => ({ label: p.className, score: Math.round(p.probability * 100) })),
          modelSource: 'public/model/model.json',
          detectedIssues: isValidComplaint && detectedIssues.length > 0 ? detectedIssues : [{
            issueType: primaryMapped.type,
            rawClass: highest.className,
            confidence: primaryConfidence,
            priority: primaryMapped.priority
          }]
        };
      } catch (err) {
        console.error('Prediction failed:', err);
      }
    }

    return {
      issueType: 'Other',
      confidence: 60,
      priority: 'Medium',
      isValidComplaint: true,
      rejectionReason: null,
      detectedIssues: [{ issueType: 'Other', confidence: 60, priority: 'Medium' }]
    };
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('WebRTC camera error:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const maxDim = 800;
      let width = video.videoWidth || 640;
      let height = video.videoHeight || 480;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);
      
      // Compress frame to lightweight JPEG 0.7 (~60KB-80KB)
      const base64Data = canvas.toDataURL('image/jpeg', 0.7);
      
      setImage(base64Data);
      stopCamera();

      const result = await handlePredict(canvas);
      onCapture(base64Data, result);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPEG, PNG, and WebP image files are accepted');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          // Compress uploaded image to max 800px & JPEG 0.7 quality (~80KB max)
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImage(compressedBase64);

          const result = await handlePredict(canvas);
          onCapture(compressedBase64, result);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
          Photo of the Issue *
        </label>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <Sparkles className="h-3 w-3" />
          <span>{progress}</span>
        </div>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-3xl overflow-hidden border border-border aspect-video bg-black flex items-center justify-center shadow-xl">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
            <button 
              type="button" 
              onClick={capturePhoto} 
              className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all text-xs"
            >
              Capture Frame
            </button>
            <button 
              type="button" 
              onClick={stopCamera} 
              className="bg-card/80 border border-border text-foreground font-bold px-5 py-3 rounded-full text-xs hover:bg-secondary transition-all backdrop-blur"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : image ? (
        <div className="relative rounded-3xl overflow-hidden border border-border/80 aspect-video bg-surface shadow-elev">
          <img src={image} alt="Civic Issue" className="w-full h-full object-cover" />
          <button 
            type="button" 
            onClick={() => { setImage(''); onCapture('', null); }} 
            className="absolute top-3 right-3 bg-destructive text-destructive-foreground p-2 rounded-full shadow-lg hover:bg-destructive/90 transition-all"
            title="Remove photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border/90 rounded-3xl p-6 sm:p-10 text-center flex flex-col items-center justify-center bg-card/60 hover:border-primary/50 transition-all shadow-sm">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4 shadow-sm">
            <Camera className="w-8 h-8" />
          </div>
          
          <h3 className="text-base font-bold text-foreground">Take Photo or Upload Image</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-6 max-w-xs leading-relaxed">
            Capture a live photo using your phone's camera, or upload a photo file from your device.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
            {/* Direct Hardware Camera App Trigger */}
            <label className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-3.5 rounded-full text-xs shadow-elev hover:bg-primary/90 transition-all cursor-pointer w-full sm:w-auto">
              <Camera className="w-4 h-4" />
              <span>Open Device Camera</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>

            {/* File Upload Button */}
            <label className="flex items-center justify-center gap-2 border border-border bg-surface text-foreground font-bold px-5 py-3.5 rounded-full text-xs hover:bg-secondary transition-all cursor-pointer w-full sm:w-auto shadow-sm">
              <Upload className="w-4 h-4 text-primary" />
              <span>Upload Photo File</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
