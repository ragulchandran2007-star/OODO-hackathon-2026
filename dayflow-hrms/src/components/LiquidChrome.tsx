import React from 'react';

export const LiquidChrome: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`liquid-backdrop ${className}`} aria-hidden="true" />;
};

export default LiquidChrome;







