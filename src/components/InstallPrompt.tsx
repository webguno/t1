import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
  isIOS?: boolean;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss, isIOS = false }) => {
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleClick = () => {
    if (isIOS) {
        setShowIOSInstructions(!showIOSInstructions);
    } else {
        onInstall();
    }
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 animate-slide-in sm:left-auto sm:right-6 sm:w-96">
      {/* iOS Instructions Balloon */}
      {showIOSInstructions && (
          <div className="absolute bottom-full left-0 right-0 mb-4 bg-white text-gray-900 p-4 rounded-xl shadow-xl border border-gray-200 animate-fade-up">
              <div className="text-sm">
                  <p className="font-bold mb-2">Install for iOS:</p>
                  <ol className="list-decimal pl-4 space-y-2 text-xs text-gray-600">
                      <li className="flex items-center gap-1 flex-wrap">
                          Tap the <span className="font-bold text-gray-900 inline-flex items-center gap-1"><Share className="w-3 h-3" /> Share</span> icon below.
                      </li>
                      <li className="flex items-center gap-1 flex-wrap">
                          Scroll down and select <span className="font-bold text-gray-900 inline-flex items-center gap-1"><PlusSquare className="w-3 h-3" /> Add to Home Screen</span>.
                      </li>
                  </ol>
              </div>
              <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 rotate-45"></div>
          </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl text-gray-900 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-gray-200 ring-1 ring-gray-200">
        <div className="flex items-center gap-3.5">
           {/* App Icon Container */}
           <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Download className="h-5 w-5 text-white" />
           </div>
           <div>
               <h3 className="font-bold text-sm leading-tight text-gray-900">Install App</h3>
               <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Get the best experience</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={onDismiss}
                className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            >
                <X className="h-4 w-4" />
            </button>
            <button 
                onClick={handleClick}
                className="bg-gray-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-gray-200 hover:bg-black active:scale-95 transition-all whitespace-nowrap"
            >
                {isIOS ? 'How to?' : 'Download'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;