import { useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

const EXAM_STARTED_KEY = "exam_started";

export function ExamProvider({ children }: { children: ComponentChildren }) {
  const [started, setStarted] = useState(
    () => localStorage.getItem(EXAM_STARTED_KEY) === "true",
  );

  const startExam = () => {
    localStorage.setItem(EXAM_STARTED_KEY, "true");
    setStarted(true);
  };

  if (!started) {
    return (
      <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center p-8">
        <h1 class="text-4xl font-black uppercase tracking-tight mb-2">
          Examen Parcial
        </h1>
        <p class="text-gray-400 mb-10 text-lg">
          Lee las instrucciones antes de comenzar.
        </p>
        <div class="bg-gray-800 rounded-2xl p-6 max-w-md text-left text-sm text-gray-300 mb-10 space-y-2">
          <p>
            ⚠️ <strong class="text-white">No cambies de pestaña</strong> ni
            minimices la ventana durante el examen.
          </p>
          <p>
            ⚠️ <strong class="text-white">No hagas click fuera</strong> de esta
            ventana.
          </p>
          <p>
            ⚠️ Cualquier salida de la página{" "}
            <strong class="text-white">anulará tu examen</strong>{" "}
            automáticamente.
          </p>
          <p>
            ⚠️ Cualquier salida de la página{" "}
            <strong class="text-white">anulará tu examen</strong>{" "}
            automáticamente.
          </p>

          <p>
            ✅ Una vez iniciado,{" "}
            <strong class="text-white">permanece en esta página</strong> hasta
            terminar.
          </p>
        </div>
        <button
          onClick={startExam}
          class="bg-green-500 hover:bg-green-400 text-white font-bold text-xl px-12 py-4 rounded-2xl transition-colors uppercase tracking-wide"
        >
          Iniciar Examen
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
