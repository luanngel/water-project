import { useMemo, useState } from "react";
import { Lock, User, Eye, EyeOff, Loader2, Check } from "lucide-react";
import grhWatermark from "../assets/images/grhWatermark.png";

type Form = { usuario: string; contrasena: string };

type LoginPageProps = {
  onSuccess: (payload?: { token?: string }) => void;
};

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [form, setForm] = useState<Form>({ usuario: "", contrasena: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [notRobot, setNotRobot] = useState(false);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Form | "robot", string>> = {};
    if (!form.usuario.trim()) e.usuario = "El usuario es obligatorio.";
    if (!form.contrasena) e.contrasena = "La contraseña es obligatoria.";
    if (!notRobot) e.robot = "Confirma que no eres un robot.";
    return e;
  }, [form.usuario, form.contrasena, notRobot]);

  const canSubmit = Object.keys(errors).length === 0 && !loading;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    if (!canSubmit) return;

    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 700));
      onSuccess({ token: "demo" });
    } catch {
      setServerError("No se pudo iniciar sesión. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen font-sans bg-slate-50">
      <div className="relative h-full w-full overflow-hidden bg-white">
        <div
          className="absolute left-0 top-0 h-[3px] w-full opacity-90"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(86,107,184,0.9), rgba(76,95,158,0.9), transparent)",
          }}
        />

        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* IZQUIERDA */}
          <section className="relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #2a355d 10%, #4c5f9e 55%, #566bb8 100%)",
              }}
            />

            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0, 80% 0, 55% 100%, 0 100%)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
              }}
            />

            <div className="relative h-full flex items-center px-10 md:px-12">
              <div className="max-w-sm text-white">
                <h2 className="text-4xl font-semibold tracking-tight">
                  ¡Bienvenido!
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/90">
                  Ingresa con tus credenciales para acceder al panel GRH.
                </p>
              </div>
            </div>
          </section>

          {/* DERECHA */}
          <section className="bg-white flex items-center justify-center">
            <div className="w-full max-w-lg px-6">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 md:p-12 shadow-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={grhWatermark}
                    alt="GRH"
                    className="h-20 w-20 object-contain rounded-lg"
                  />
                  <div className="leading-tight">
                    <h1 className="text-2xl font-semibold text-slate-900">
                      Iniciar sesión
                    </h1>
                    <p className="text-xs text-slate-500">
                      Gestión de Recursos Hídricos
                    </p>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="mt-8 space-y-6">
                  {serverError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {serverError}
                    </div>
                  )}

                  {/* Usuario */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Usuario
                    </label>
                    <div className="relative mt-2">
                      <input
                        value={form.usuario}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, usuario: e.target.value }))
                        }
                        className="w-full border-b border-slate-300 py-2 pr-10 outline-none focus:border-slate-600"
                      />
                      <User
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500"
                        size={18}
                      />
                    </div>
                    {errors.usuario && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.usuario}
                      </p>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Contraseña
                    </label>
                    <div className="relative mt-2">
                      <input
                        value={form.contrasena}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, contrasena: e.target.value }))
                        }
                        type={showPass ? "text" : "password"}
                        className="w-full border-b border-slate-300 py-2 pr-16 outline-none focus:border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <Lock
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500"
                        size={18}
                      />
                    </div>
                    {errors.contrasena && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.contrasena}
                      </p>
                    )}
                  </div>

                  {/* NO SOY UN ROBOT */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setNotRobot((v) => !v)}
                      className={`h-5 w-5 rounded border flex items-center justify-center ${
                        notRobot
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {notRobot && <Check size={14} />}
                    </button>
                    <span className="text-sm text-slate-700">No soy un robot</span>
                    <span className="ml-auto text-xs text-slate-400">
                      reCAPTCHA
                    </span>
                  </div>

                  {errors.robot && (
                    <p className="text-xs text-red-600">{errors.robot}</p>
                  )}

                  {/* Botón */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-2 w-full rounded-full bg-gradient-to-r from-[#4c5f9e] to-[#566bb8] py-2.5 text-white shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Entrando...
                      </>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
