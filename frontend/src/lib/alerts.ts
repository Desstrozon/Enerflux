// src/lib/alerts.ts
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Helpers de estilo (usa tus CSS variables)
const bg = "hsl(var(--card))";
const fg = "hsl(var(--foreground))";
const border = "hsl(var(--border))";

// Base modal
const modalBase = {
  background: bg,
  color: fg,
  buttonsStyling: false,
  showConfirmButton: true,
  confirmButtonText: "Aceptar",
  heightAuto: false,
  customClass: {
    container: "!z-[99999]",
    popup: "rounded-2xl border shadow-xl",
    title: "text-xl font-semibold",
    htmlContainer: "text-sm text-muted-foreground",
    confirmButton:
      "px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 ring-offset-2 ring-primary",
    cancelButton:
      "px-4 py-2 rounded-xl border border-[color:var(--border)] bg-transparent text-foreground hover:bg-foreground/5 ml-2",
  },
};

// Toast base
const toast = Swal.mixin({
  toast: true,
  position: "bottom",
  timer: 2200,
  timerProgressBar: true,
  showConfirmButton: false,
  background: bg,
  color: fg,
  customClass: {
    popup: "rounded-xl border shadow-lg",
    title: "text-sm",
  },
});

export const alertSuccess = (title: string, text?: string) =>
  Swal.fire({ ...modalBase, icon: "success", title, text });

export const alertError = (title: string, text?: string) =>
  Swal.fire({ ...modalBase, icon: "error", title, text });

export const alertInfo = (title: string, text?: string) =>
  Swal.fire({ ...modalBase, icon: "info", title, text });

export const alertConfirm = (title: string, text?: string) =>
  Swal.fire({
    ...modalBase,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
  });

export const toastSuccess = (title: string) =>
  toast.fire({ icon: "success", title });

export const toastError = (title: string) =>
  toast.fire({ icon: "error", title });

export const toastInfo = (title: string) =>
  toast.fire({ icon: "info", title });


/** Confirmación que devuelve true/false */
export async function confirm(
  title = "¿Seguro?",
  text = "Esta acción no se puede deshacer.",
  confirmText = "Sí"
): Promise<boolean> {
  const res = await Swal.fire({
    ...modalBase,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
  });
  return res.isConfirmed;
}