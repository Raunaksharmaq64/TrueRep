import React from 'react';
import samuraiPfp from '../../assets/samurai_pfp.png';
import roninBanner from '../../assets/ronin_banner.jpg';

export function SphericalAvatar({ 
  avatarUrl, 
  bannerUrl, 
  pfpTransform, 
  className = "w-8 h-8",
  borderClassName = "border-2 border-yellow-500",
  alt = "Athlete PFP" 
}) {
  const pfpScale = pfpTransform?.pfpScale ?? 100;
  const pfpRotate = pfpTransform?.pfpRotate ?? 0;
  const pfpX = pfpTransform?.pfpX ?? 0;
  const pfpY = pfpTransform?.pfpY ?? 0;
  const pfpFit = pfpTransform?.pfpFit ?? 'cover';

  const finalAvatar = avatarUrl || samuraiPfp;
  const finalBanner = bannerUrl || roninBanner;

  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-transparent ${borderClassName} ${className}`}>
      {/* Banner Backdrop filling any remaining area of the circle */}
      <img 
        src={finalBanner} 
        alt="Banner Backdrop" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 opacity-80"
      />
      <div className="absolute inset-0 bg-neutral-950/20 backdrop-blur-[1px] pointer-events-none z-0" />

      {/* PFP Avatar Layer with exact scale/rotate/shift */}
      <img 
        src={finalAvatar} 
        alt={alt} 
        style={{
          transform: `scale(${pfpScale / 100}) translate(${pfpX}px, ${pfpY}px) rotate(${pfpRotate}deg)`
        }}
        className={`w-full h-full ${pfpFit === 'contain' ? 'object-contain' : 'object-cover'} pointer-events-none select-none relative z-10`}
      />
    </div>
  );
}

export default SphericalAvatar;
