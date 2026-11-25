import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type FeedbackTone = 'success' | 'error' | 'info';

export interface FeedbackMessage {
  id: number;
  message: string;
  tone: FeedbackTone;
}

const TONE_STYLES: Record<FeedbackTone, { icon: typeof Info; iconClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-[#4ADE80]' },
  error: { icon: AlertCircle, iconClass: 'text-[#F87171]' },
  info: { icon: Info, iconClass: 'text-[#93C5FD]' },
};

interface ToastProps {
  feedback: FeedbackMessage | null;
  onDismiss: () => void;
}

/** Notificação flutuante, anunciada para leitores de tela via aria-live. */
export function Toast({ feedback, onDismiss }: ToastProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6"
    >
      {feedback && (
        <div
          key={feedback.id}
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          className="toast-enter pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-[#141413] py-3 pr-2 pl-4 text-sm text-white shadow-lg ring-1 ring-white/10"
        >
          {(() => {
            const { icon: Icon, iconClass } = TONE_STYLES[feedback.tone];
            return <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} aria-hidden="true" />;
          })()}
          <span className="min-w-0 flex-1">{feedback.message}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Fechar notificação"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
