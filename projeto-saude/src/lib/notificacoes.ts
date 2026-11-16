"use client";

// Ponte com as APIs do navegador (Service Worker + Notification).
// Mantida separada da lógica pura (lembretes.ts) e do storage.

export function suportaNotificacoes(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function estadoPermissao(): NotificationPermission | "indisponivel" {
  if (!suportaNotificacoes()) return "indisponivel";
  return Notification.permission;
}

export async function pedirPermissao(): Promise<NotificationPermission | "indisponivel"> {
  if (!suportaNotificacoes()) return "indisponivel";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

let registroPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!suportaNotificacoes()) return Promise.resolve(null);
  if (!registroPromise) {
    registroPromise = navigator.serviceWorker
      .register("/sw.js")
      .catch(() => null);
  }
  return registroPromise;
}

/** Exibe um lembrete via Service Worker (fallback: Notification direta). */
export async function mostrarLembrete(body?: string): Promise<boolean> {
  if (!suportaNotificacoes() || Notification.permission !== "granted") return false;
  const texto = body || "Que tal beber um pouco de água agora?";
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("Hora de se hidratar! 💧", {
      body: texto,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: "lembrete-agua",
      data: { url: "/agua" },
    });
    return true;
  } catch {
    try {
      new Notification("Hora de se hidratar! 💧", { body: texto, icon: "/icon.svg" });
      return true;
    } catch {
      return false;
    }
  }
}
