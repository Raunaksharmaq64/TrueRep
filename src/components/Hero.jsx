import React from 'react';
import { Dumbbell, TrendingUp, Users, Instagram, Youtube, Play } from 'lucide-react';
import athleteImg from '../assets/athlete.jpg';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between overflow-hidden pb-0 pt-2">
      {/* LEFT COLUMN: Main Brand Message */}
      <div className="w-full lg:w-1/3 z-20 flex flex-col justify-center items-start text-left py-6 lg:py-4">
        {/* Top Tagline */}
        <div className="text-slate-300 text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase leading-relaxed mb-4">
          <p>CONSISTENCY TODAY</p>
          <p>A STRONGER YOU TOMORROW</p>
        </div>

        {/* Main Headline Upright Slim */}
        <h1 className="font-hero-slant text-7xl sm:text-8xl lg:text-9xl tracking-wider leading-[0.9] select-none my-2 font-medium">
          <span className="block text-white">
            TRUE
          </span>
          <span className="block text-[#007DFF]">
            REP
          </span>
        </h1>

        {/* Secondary Subtitle */}
        <div className="text-white text-base sm:text-lg font-medium tracking-widest leading-snug mt-6 mb-4 uppercase">
          <p>MORE THAN A WORKOUT.</p>
          <p>A BETTER YOU.</p>
        </div>


        {/* Cyan Horizontal Accent Bar */}
        <div className="w-20 h-[3.5px] bg-cyan-400 rounded-full my-4" />

        {/* Core Values Tagline */}
        <div className="text-slate-300 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase my-3">
          TRAIN <span className="mx-1 text-slate-500">|</span> TRACK <span className="mx-1 text-slate-500">|</span> COMPETE <span className="mx-1 text-slate-500">|</span> CONQUER
        </div>

        {/* Social Icons Row */}
        <div className="flex items-center gap-5 mt-6">
          <a 
            href="#instagram" 
            aria-label="Instagram"
            className="text-slate-300 hover:text-cyan-400 transition-all duration-200 hover:scale-110"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a 
            href="#youtube" 
            aria-label="YouTube"
            className="text-slate-300 hover:text-cyan-400 transition-all duration-200 hover:scale-110"
          >
            <Youtube className="w-5 h-5" />
          </a>
          <a 
            href="#twitter" 
            aria-label="X Twitter"
            className="text-slate-300 hover:text-cyan-400 transition-all duration-200 hover:scale-110"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* CENTER COLUMN: Athlete Image (No Glow, Anchored Top & Bottom, Larger Size) */}
      <div className="w-full lg:w-1/3 z-10 flex items-end justify-center relative self-end h-full min-h-[500px] lg:min-h-[calc(100vh-90px)] my-0">
        <img
          src={athleteImg}
          alt="TrueRep Athlete Lifting Barbell"
          className="w-auto h-[82vh] sm:h-[88vh] lg:h-[94vh] max-w-none object-contain object-bottom select-none pointer-events-none"
        />
      </div>

      {/* RIGHT COLUMN: Feature Highlights & Discipline Callout */}
      <div className="w-full lg:w-1/3 z-20 flex flex-col justify-between items-start lg:items-end text-left lg:text-left pl-0 lg:pl-10 space-y-12 py-4">
        {/* Features Stack */}
        <div className="flex flex-col space-y-8 w-full max-w-sm">
          {/* Feature 1: TRACK */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-cyan-950/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all duration-300 flex-shrink-0">
              <Dumbbell className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-wider text-base uppercase">TRACK</h3>
              <p className="text-slate-400 text-xs sm:text-sm tracking-wide font-normal">
                Ai tracks your workout sessions
              </p>
            </div>
          </div>

          {/* Feature 2: IMPROVE */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-cyan-950/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all duration-300 flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-wider text-base uppercase">IMPROVE</h3>
              <p className="text-slate-400 text-xs sm:text-sm tracking-wide font-normal">
                Get personalized plans and insights
              </p>
            </div>
          </div>

          {/* Feature 3: BELONG */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-full border border-cyan-500/60 bg-cyan-950/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all duration-300 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-wider text-base uppercase">BELONG</h3>
              <p className="text-slate-400 text-xs sm:text-sm tracking-wide font-normal">
                Join a community that keeps you going
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Right Callout: DISCIPLINE IN YOUR POCKET */}
        <div className="pt-6 border-t border-slate-800/40 w-full max-w-sm flex items-center justify-between">
          <div>
            <div className="text-white font-bold tracking-[0.18em] text-sm uppercase">
              DISCIPLINE
            </div>
            <div className="text-white font-bold tracking-[0.18em] text-sm uppercase">
              IN YOUR POCKET
            </div>
            {/* Cyan Underline under IN YOUR POCKET */}
            <div className="w-24 h-[2px] bg-cyan-400 mt-1" />
          </div>

          {/* Play Button Icon */}
          <button 
            aria-label="Play video"
            className="w-12 h-12 rounded-full border border-white/80 flex items-center justify-center text-white hover:border-cyan-400 hover:text-cyan-400 hover:scale-110 active:scale-95 transition-all duration-300 group ml-4"
          >
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
