import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase"; // Asegúrate de configurar Firebase correctamente
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(
        "Correo de recuperación enviado. Revisa tu bandeja de entrada."
      );
      setEmail("");
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);
      toast.error(
        "No se pudo enviar el correo de recuperación. Verifica el correo ingresado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Recuperar Contraseña
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Ingresa tu correo para restablecer tu contraseña.
        </p>
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ingresa tu correo"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-semibold text-white rounded-lg shadow-md focus:outline-none ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default ResetPassword;
