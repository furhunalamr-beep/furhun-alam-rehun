import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save, Navigation, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { useStore } from '../../store/useStore';

export function MileageCalc() {
  const [miles, setMiles] = useState<number | ''>(150);
  const [rate, setRate] = useState<number | ''>(0.67); // IRS Standard Rate 2024
  
  // GPS Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [trackedDistance, setTrackedDistance] = useState(0);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastPos, setLastPos] = useState<GeolocationPosition | null>(null);

  const { addToHistory } = useStore();

  const m = Number(miles) || 0;
  const r = Number(rate) || 0;
  const deduction = m * r;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'mileage',
      title: 'Mileage Deduction',
      inputs: { 'Miles': m, 'Rate': r },
      results: { 'Deduction Value': deduction }
    });
  };

  // Helper to calculate distance between two coordinates in miles
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
  };

  const toggleTracking = () => {
    if (!('geolocation' in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    if (isTracking) {
      // Stop tracking
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
      setLastPos(null);
      setMiles(prev => Number(prev || 0) + trackedDistance);
      setTrackedDistance(0);
    } else {
      // Start tracking
      setTrackedDistance(0);
      setIsTracking(true);
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setLastPos(prev => {
            if (prev) {
              const dist = calculateDistance(
                prev.coords.latitude, prev.coords.longitude,
                position.coords.latitude, position.coords.longitude
              );
              // Only add if movement is somewhat reasonable to reduce GPS jitter (e.g., > 0.01 miles)
              if (dist > 0.01) {
                setTrackedDistance(current => current + dist);
              }
            }
            return position;
          });
        },
        (error) => {
          console.error("Error watching position:", error);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             GPS & Manual Mileage Tracker
             {isTracking && <span className="flex h-3 w-3 relative ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
           </h2>
          <p className="text-sm text-slate-500">Calculate business deductions using the standard milage rate.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveToTape}>
            <Save className="w-4 h-4 mr-2" /> Tape
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Miles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Standard Rate (per mile)"
              type="number"
              prefix="$"
              value={rate}
              step="0.01"
              onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
            />
            
            <div className="pt-2">
               <Input
                 label="Total Business Miles"
                 type="number"
                 value={miles}
                 onChange={(e) => setMiles(e.target.value === '' ? '' : Number(e.target.value))}
               />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
               <div className="text-sm text-slate-500 mb-3">Or Track Live with GPS</div>
               <Button 
                 variant={isTracking ? "outline" : "primary"}
                 onClick={toggleTracking}
                 className={`w-full ${isTracking ? 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}
               >
                 {isTracking ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Stop Tracking</span> : <span className="flex items-center gap-2"><Navigation className="w-4 h-4" /> Start GPS Tracking</span>}
               </Button>
               {isTracking && (
                 <div className="mt-3 text-sm font-medium animate-pulse text-slate-600 dark:text-slate-300">
                    Distance Tracked: {trackedDistance.toFixed(2)} miles
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white flex flex-col justify-center">
          <CardContent className="space-y-6 flex flex-col items-center justify-center py-10">
             <div className="text-slate-400 text-sm font-medium mb-1 text-center">
                Total Tax Deduction Value
             </div>
             <div className="text-5xl font-bold text-center text-green-400">
               {formatCurrency(deduction)}
             </div>
             <div className="text-slate-500 text-sm mt-4 text-center max-w-xs">
               Based on {(m + (isTracking ? trackedDistance : 0)).toFixed(1)} total miles logged at {formatCurrency(r)} per mile.
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
