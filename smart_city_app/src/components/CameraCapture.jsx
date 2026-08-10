import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, RefreshCw } from 'lucide-react';
import * as tmImage from '@teachablemachine/image';

export function CameraCapture({ onCapture, initialImage }) {
  const [image, setImage] = useState(initialImage || '');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [model, setModel] = useState(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [progress, setProgress] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load the Teachable Machine custom model from public folder
  useEffect(() => {
    async function loadModel() {
      setLoadingModel(true);
      setProgress('Loading AI custom model...');
      try {
        const modelURL = '/model/model.json';
        const metadataURL = '/model/metadata.json';
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        setProgress('AI model loaded successfully');
      } catch (err) {
        console.error('Failed to load TM model:', err);
        setProgress('Failed to load custom model. Falling back to local helper.');
      } finally {
        setLoadingModel(false);
      }
    }
    loadModel();
  }, []);

  // Map custom model labels to database classes & default priority values
  const mapPredictionToClass = (predictionName) => {
    // Labels in metadata: "Pothole", "Garbage", "Water Leakage", "Broken Streetlight", "Sewage", "Normal Road"
    switch (predictionName) {
      case 'Pothole':
        return { type: 'Broken Road', priority: 'High' };
      case 'Garbage':
        return { type: 'Garbage', priority: 'Low' };
      case 'Broken Streetlight':
        return { type: 'Street Light', priority: 'Low' };
      case 'Water Leakage':
        return { type: 'Waterlogging', priority: 'Medium' };
      case 'Sewage':
        return { type: 'Waterlogging', priority: 'High' };
      case 'Normal Road':
      default:
        return { type: 'Other', priority: 'Medium' };
    }
  };

  const handlePredict = async (imageElementOrCanvas) => {
    if (model) {
      try {
        const predictions = await model.predict(imageElementOrCanvas);
        
        // Sort predictions descending by probability
        const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
        
        // Find highest probability prediction
        const highest = sorted[0];
        const primaryMapped = mapPredictionToClass(highest.className);
        const primaryConfidence = Math.round(highest.probability * 100);

        // Anti-Spam / Fake Image Validation Rule:
        // Rejects Normal Road, selfies, or images where no civic class reaches 35% confidence
        const isNormalRoad = highest.className === 'Normal Road';
        const isLowConfidence = highest.probability < 0.35;
        const isValidComplaint = !isNormalRoad && !isLowConfidence;

        const rejectionReason = !isValidComplaint 
          ? (isNormalRoad 
              ? "🛡️ Anti-Spam Shield: Image shows a normal scene with no visible civic damage."
              : "🛡️ Anti-Spam Shield: Image appears to be a selfie or random object. Please upload a clear photo of the civic issue.")
          : null;

        // Find all significant issue predictions (confidence >= 30% and not Normal Road)
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

        // Remove duplicate issue types (keep highest confidence for each issueType)
        const uniqueIssuesMap = new Map();
        significant.forEach(item => {
          if (!uniqueIssuesMap.has(item.issueType)) {
            uniqueIssuesMap.set(item.issueType, item);
          }
        });
        const detectedIssues = Array.from(uniqueIssuesMap.values());

        return {
          issueType: primaryMapped.type,
          confidence: primaryConfidence,
          priority: primaryMapped.priority,
          isValidComplaint,
          rejectionReason,
          detectedIssues: isValidComplaint && detectedIssues.length > 0 ? detectedIssues : [{
            issueType: primaryMapped.type,
            confidence: primaryConfidence,
            priority: primaryMapped.priority
          }]
        };
      } catch (err) {
        console.error('Prediction failed:', err);
      }
    }
    // Fallback if model not loaded
    return {
      issueType: 'Other',
      confidence: 50,
      priority: 'Medium',
      isValidComplaint: true,
      rejectionReason: null,
      detectedIssues: [{ issueType: 'Other', confidence: 50, priority: 'Medium' }]
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
      console.error('Camera access denied:', err);
      alert('Could not access camera. Please upload an image file instead.');
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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg');
      
      setImage(base64Data);
      stopCamera();

      // Classify the captured frame using custom model
      const result = await handlePredict(canvas);
      onCapture(base64Data, result);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPEG, PNG, and WebP files are accepted');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        
        // Create an image element to predict on
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          const result = await handlePredict(img);
          onCapture(reader.result, result);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-text-secondary uppercase">Photo of the Issue *</label>
        <span className="text-[10px] font-mono text-text-secondary">{progress}</span>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button 
              type="button" 
              onClick={capturePhoto} 
              className="bg-primary text-bg font-bold px-6 py-2.5 rounded shadow-lg hover:bg-primary-hover transition-colors text-sm"
            >
              Capture Frame
            </button>
            <button 
              type="button" 
              onClick={stopCamera} 
              className="bg-white/10 border border-white/10 text-white font-semibold px-4 py-2.5 rounded text-sm hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : image ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-bg-input">
          <img src={image} alt="Civic Issue" className="w-full h-full object-cover" />
          <button 
            type="button" 
            onClick={() => { setImage(''); onCapture('', null); }} 
            className="absolute top-2 right-2 bg-danger text-white p-1.5 rounded hover:bg-danger-hover transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-bg-input hover:border-primary/50 transition-colors">
          <Camera className="w-10 h-10 text-text-secondary mb-4" />
          <p className="text-sm text-text-primary mb-4">Take a live photo or upload an image file</p>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={startCamera} 
              className="bg-primary text-bg font-semibold px-4 py-2 rounded text-xs hover:bg-primary-hover transition-colors"
            >
              Open Device Camera
            </button>
            <label className="bg-white/5 border border-white/10 text-white font-semibold px-4 py-2 rounded text-xs hover:bg-white/10 transition-colors cursor-pointer">
              Upload File
              <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
            </label>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
