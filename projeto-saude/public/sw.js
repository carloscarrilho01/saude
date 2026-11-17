// Service Worker — Orvalho (PWA)
// v1: habilita instalação na tela inicial, exibe notificações de lembrete e
// trata o clique. Push com app fechado (VAPID) entra na fase do backend.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// A página manda {type:"LEMBRETE"} para o SW exibir a notificação.
self.addEventListener("message", (event) => {
  const dados = event.data || {};
  if (dados.type === "LEMBRETE") {
    self.registration.showNotification("Hora de se hidratar", {
      body: dados.body || "Que tal beber um pouco de água agora?",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: "lembrete-agua", // dedup: substitui a notificação anterior
      renotify: true,
      data: { url: "/agua" },
    });
  }
});

// Futuro: push real do servidor (requer VAPID).
self.addEventListener("push", (event) => {
  let payload = { body: "Que tal beber um pouco de água agora?" };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    /* payload padrão */
  }
  event.waitUntil(
    self.registration.showNotification("Hora de se hidratar", {
      body: payload.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: "lembrete-agua",
      renotify: true,
      data: { url: "/agua" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/agua";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientes) => {
      for (const c of clientes) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
