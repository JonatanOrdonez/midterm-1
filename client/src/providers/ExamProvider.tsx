import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

const EXAM_VOIDED_KEY = 'exam_voided';

export function ExamProvider({ children }: { children: ComponentChildren }) {
  const [voided, setVoided] = useState(
    () => localStorage.getItem(EXAM_VOIDED_KEY) === 'true'
  );

  const voidExam = () => {
    localStorage.setItem(EXAM_VOIDED_KEY, 'true');
    setVoided(true);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        voidExam();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (voided) {
    return (
      <div class="fixed inset-0 bg-red-600 z-[9999] flex flex-col items-center justify-center text-white text-center p-8">
        <div class="text-8xl mb-6">🚫</div>
        <h1 class="text-5xl font-black uppercase tracking-tight mb-4">
          Examen Anulado
        </h1>
        <div class="w-24 h-1 bg-white opacity-50 mb-6" />
        <p class="text-2xl font-semibold mb-3">
          Se ha detectado que abandonaste esta página.
        </p>
        <p class="text-lg opacity-80 max-w-lg">
          Esta acción queda registrada. Tu examen ha sido marcado como anulado.
          Comunícate con tu docente para más información.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
