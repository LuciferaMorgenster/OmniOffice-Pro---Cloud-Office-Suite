import React from 'react';
import { DeviceMode } from '../types/office';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface DeviceFrameWrapperProps {
  deviceMode: DeviceMode;
  children: React.ReactNode;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({ deviceMode, children }) => {
  if (deviceMode === 'desktop') {
    return <div className="w-full h-full min-h-screen">{children}</div>;
  }

  if (deviceMode === 'tablet') {
    return (
      <div className="min-h-screen bg-slate-900/90 py-8 px-4 flex items-center justify-center overflow-auto">
        <div className="w-[880px] max-w-full bg-slate-900 rounded-[36px] p-4 shadow-2xl border-4 border-slate-700/60 ring-1 ring-white/10 flex flex-col transition-all">
          {/* Tablet Bezel & Camera */}
          <div className="w-full flex items-center justify-between px-6 py-2 text-slate-400 text-xs">
            <span className="font-semibold text-slate-300">09:41</span>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600/80"></div>
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
          {/* Tablet Screen */}
          <div className="w-full h-[720px] bg-white dark:bg-slate-950 rounded-[24px] overflow-hidden flex flex-col shadow-inner">
            {children}
          </div>
          {/* Home indicator */}
          <div className="w-32 h-1 bg-slate-600/80 rounded-full mx-auto mt-3"></div>
        </div>
      </div>
    );
  }

  // iOS Smartphone Frame
  if (deviceMode === 'mobile-ios') {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4 flex items-center justify-center overflow-auto">
        <div className="w-[390px] max-w-full bg-slate-900 rounded-[50px] p-3 shadow-2xl border-[6px] border-slate-800 ring-1 ring-white/10 flex flex-col transition-all">
          {/* iOS Dynamic Island & Status Bar */}
          <div className="w-full relative px-6 pt-2 pb-1 flex items-center justify-between text-slate-400 text-xs select-none">
            <span className="font-semibold text-white tracking-tight">09:41</span>
            {/* Dynamic Island */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-6 bg-black rounded-full flex items-center justify-end px-2 border border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
          {/* iOS Screen */}
          <div className="w-full h-[740px] bg-white dark:bg-slate-950 rounded-[38px] overflow-hidden flex flex-col shadow-inner">
            {children}
          </div>
          {/* iOS Home Bar */}
          <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-3"></div>
        </div>
      </div>
    );
  }

  // Android Smartphone Frame
  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 flex items-center justify-center overflow-auto">
      <div className="w-[392px] max-w-full bg-zinc-900 rounded-[44px] p-3 shadow-2xl border-4 border-zinc-700 ring-1 ring-white/10 flex flex-col transition-all">
        {/* Android Punch Hole & Status Bar */}
        <div className="w-full relative px-6 py-1.5 flex items-center justify-between text-zinc-400 text-xs select-none">
          <span className="font-medium text-zinc-200">9:41</span>
          {/* Punch Hole Camera */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-3.5 h-3.5 rounded-full bg-black border border-zinc-700"></div>
          <div className="flex items-center gap-2 text-zinc-200">
            <Wifi className="w-3.5 h-3.5" />
            <Signal className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>
        {/* Android Screen */}
        <div className="w-full h-[740px] bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden flex flex-col shadow-inner">
          {children}
        </div>
        {/* Android Nav Pill */}
        <div className="w-24 h-1 bg-zinc-500 rounded-full mx-auto mt-3"></div>
      </div>
    </div>
  );
};
