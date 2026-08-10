import React, { useState, useEffect } from 'react';
import { 
  Camera, Upload, AlertTriangle, MapPin, Trash2, ThumbsUp, Star, CheckCircle, 
  Clock, Shield, User, Settings, Layers, Navigation, LogIn, LogOut, CheckSquare, 
  Map, BarChart2, PlusCircle, Bell, RefreshCw
} from 'lucide-react';

export function StarRating({ rating, onChange, readOnly = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          className={`focus:outline-none transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star 
            className={`w-6 h-6 ${
              star <= (hoverRating || rating) 
                ? 'fill-primary text-primary' 
                : 'text-text-secondary hover:text-primary'
            }`} 
          />
        </button>
      ))}
    </div>
  );
}
