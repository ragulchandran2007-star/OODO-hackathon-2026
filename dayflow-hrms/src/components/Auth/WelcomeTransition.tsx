import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { GlobalLiquidEther } from '../GlobalLiquidEther';

interface WelcomeTransitionProps {
  userName: string;
  onComplete: () => void;
}

export const WelcomeTransition: React.FC<WelcomeTransitionProps> = ({ userName, onComplete }) => {
  const [stage, setStage] = useState<'check' | 'greet' | 'exit'>('check');
  const firstName = userName.split(' ')[0];

  useEffect(() => {
    const t1 = setTimeout(() => setStage('greet'), 500);
    const t2 = setTimeout(() => setStage('exit'), 1500);
    const t3 = setTimeout(() => onComplete(), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-opacity duration-300 ${
        stage === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <GlobalLiquidEther />
      <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4 text-center px-6">
        <div
          className={`w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-500 ${
            stage === 'check' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <CheckCircle2 className="w-9 h-9 text-teal-300" strokeWidth={2} />
        </div>
        <div
          className={`transition-all duration-500 delay-100 ${
            stage === 'check' ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Signed in successfully</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-white/50 text-xs mt-2">Setting up your workspace...</p>
        </div>
      </div>
    </div>
  );
};







