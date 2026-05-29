import React, { useState, useEffect } from 'react';
import { Fingerprint, ScanFace, LogIn } from 'lucide-react';
import { Button } from './ui/Button';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { useStore } from '../store/useStore';

export function AuthLock({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        useStore.getState().setGoogleToken(credential.accessToken);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 flex bg-opacity-90 flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center text-white p-6">
      <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-8 relative">
         <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
         <ScanFace className="w-10 h-10 text-blue-500" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">TradeCalc Pro</h2>
      <p className="text-slate-400 text-center mb-10 max-w-sm">Authenticate to access your private trading and dropshipping calculations safely.</p>
      
      {error && <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}

      <Button 
        onClick={handleLogin} 
        className="w-full max-w-xs h-14 text-lg rounded-xl flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700"
      >
         <LogIn className="w-6 h-6" />
         Sign in with Google
      </Button>
    </div>
  );
}
