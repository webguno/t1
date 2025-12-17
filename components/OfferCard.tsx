import React from 'react';
import { Offer } from '../types';
import { ChevronRight, Zap } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
  onClick: (offer: Offer) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onClick }) => {
  return (
    <div 
      onClick={() => onClick(offer)}
      className="group bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex items-start gap-4"
    >
      {/* Small Icon */}
      <div className="flex-shrink-0 relative">
        <img 
          src={offer.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.title)}&background=random`} 
          alt={offer.title} 
          loading="lazy"
          decoding="async"
          className="w-14 h-14 rounded-lg object-contain bg-gray-50 p-1 border border-gray-100"
        />
        {/* Play indicator dot if video */}
        {offer.video_link && (
             <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1 border-2 border-white shadow-sm">
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
             </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
        <div>
            <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1 pr-2">
                    {offer.title}
                </h3>
            </div>
            
            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                {offer.description}
            </p>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
            Free
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Zap className="w-3 h-3" /> Quick
          </span>
        </div>
      </div>

      <div className="self-center text-gray-300 group-hover:text-indigo-500 transition-colors">
         <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
};

export default OfferCard;