import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StudyPencilCursor } from '../components/StudyPencilCursor';
import { useData } from '../context/DataContext';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { toasts, removeToast } = useData();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EF] text-[#887467] bg-paper-texture">
      <StudyPencilCursor />
      <Navbar />

      <div className="flex-1">
        <main key={location.pathname} className="editorial-page-enter">
          {children}
        </main>
      </div>

      <Footer />

      {/* Spacer for Phone Bottom Navigation Dock */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      {/* Global Toast Notification Layer */}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-5 left-4 right-4 sm:left-5 sm:right-auto z-50 flex flex-col gap-2.5 sm:max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="editorial-page-enter pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl bg-white border border-[#EDE0D5] shadow-[0_14px_34px_-10px_rgba(89,68,56,0.16)]"
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-[#594438] shrink-0 mt-0.5" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-[#D9A5A5] shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#594438] shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#594438]">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] text-[#887467] leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-[#887467] hover:text-[#594438] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
