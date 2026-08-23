import React, { useEffect, useState } from 'react';
import LiquidEther from './LiquidEther/LiquidEther.jsx';

export const GlobalLiquidEther: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div className="liquid-ether-backdrop" aria-hidden="true">
      {reducedMotion ? (
        <div className="liquid-ether-static" />
      ) : (
        <LiquidEther
          colors={['#2563eb', '#6d5dfc', '#14d7b8']}
          mouseForce={4}
          cursorSize={58}
          isViscous={false}
          iterationsPoisson={3}
          iterationsViscous={2}
          resolution={0.14}
          dt={0.004}
          BFECC={false}
          autoDemo
          autoSpeed={0.045}
          autoIntensity={0.28}
          takeoverDuration={0.45}
          autoResumeDelay={9000}
          autoRampDuration={2.4}
          frameInterval={100}
          className="h-full w-full"
        />
      )}
    </div>
  );
};

export default GlobalLiquidEther;
