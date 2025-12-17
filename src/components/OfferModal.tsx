import React, { useState, useRef } from 'react';
import { Offer } from '../types';
import { X, Play, ExternalLink, AlertCircle } from 'lucide-react';

interface OfferModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (offerId: string) => Promise<void>;
}

const CustomVideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group" onClick={handlePlayPause}>
        <video ref={videoRef} src={src} className="w-full h-full object-contain" playsInline />
        {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
            </div>
        )}
    </div>
  );
};

const OfferModal: React.FC<OfferModalProps> = ({ offer, isOpen, onClose, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!offer) return null;

  const handleComplete = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!offer.link) { e.preventDefault(); return; }
    setIsSubmitting(true);
    onComplete(offer.id).finally(() => { setIsSubmitting(false); onClose(); });
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>

      <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none`}>
        <div 
          className={`
            w-full bg-white border border-gray-200 pointer-events-auto flex flex-col
            transform transition-transform duration-300 ease-out
            rounded-t-[2rem] max-h-[90%] 
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
            sm:rounded-3xl sm:max-w-md sm:max-h-[85vh] sm:m-4
            sm:${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95 opacity-0'}
            shadow-2xl
          `}
        >
          {/* Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden" onClick={onClose}>
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <button onClick={onClose} className="hidden sm:flex absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors">
             <X className="w-5 h-5" />
          </button>

          <div className="px-6 pb-4 pt-2 sm:pt-6 flex flex-col items-center border-b border-gray-100 flex-shrink-0">
              <img 
                  src={offer.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.title)}&background=random`} 
                  alt={offer.title} 
                  className="h-16 w-16 rounded-xl shadow-md mb-3 object-contain bg-gray-50 p-1 border border-gray-200"
              />
              <h3 className="text-lg font-bold text-gray-900 text-center">{offer.title}</h3>
              <p className="text-sm text-gray-500 mt-1 text-center line-clamp-2 max-w-[80%]">{offer.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Steps to Earn</h4>
                <div className="space-y-3">
                  {offer.steps && offer.steps.length > 0 ? (
                    offer.steps.map((step, index) => (
                      <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700 leading-snug font-medium">{step}</p>
                      </div>
                    ))
                  ) : <p className="text-sm text-gray-400 italic">No steps.</p>}
                </div>
              </div>

              {offer.terms && offer.terms.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Requirements
                  </h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {offer.terms.map((term, index) => (
                      <li key={index} className="text-xs text-orange-800/80">{term}</li>
                    ))}
                  </ul>
                </div>
              )}

              {offer.video_link && (
                <div>
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">Video Guide</h4>
                   <div className="relative w-full pb-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200">
                        <div className="absolute top-0 left-0 w-full h-full">
                           <CustomVideoPlayer src={offer.video_link} />
                        </div>
                   </div>
                </div>
              )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 pb-6 sm:pb-4 rounded-b-[2rem] sm:rounded-b-3xl">
              <a
                href={offer.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleComplete}
                className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all ${
                  isSubmitting || !offer.link
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? 'Verifying...' : <>Start Task <ExternalLink className="w-4 h-4" /></>}
              </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferModal;