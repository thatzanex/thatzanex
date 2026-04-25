import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  kanji?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, kanji }) => (
  <div className="mb-12 border-b border-neutral-800 pb-6 flex items-end justify-between relative overflow-hidden">
    <div className="relative z-10">
      <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.1em]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-neutral-400 mt-3 tracking-wide">{subtitle}</p>
      )}
    </div>
    {kanji && (
      <div className="absolute right-0 bottom-0 text-7xl md:text-9xl text-neutral-900/40 font-black select-none leading-none z-0 translate-y-4 md:translate-y-8">
        {kanji}
      </div>
    )}
  </div>
);

export default SectionHeader;
