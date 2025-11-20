import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import * as Notifications from "expo-notifications";
import {
  registerPushToken,
  unregisterPushToken,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from "../services/notifications";

export function usePushNotifications() {
  const { token } = useAuth();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Solo registrar si hay token de autenticación
    if (!token) return;

    // Registrar token de push
    registerPushToken(token);

    // Listener para notificaciones recibidas
    notificationListener.current = addNotificationReceivedListener((notification) => {
      // Aquí puedes manejar las notificaciones recibidas mientras la app está abierta
    });

    // Listener para cuando el usuario toca una notificación
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      // Aquí puedes navegar a una pantalla específica según la notificación
      const data = response.notification.request.content.data;
      
      // Ejemplo: si la notificación tiene un playlistId, navegar a esa playlist
      if (data?.playlistId) {
        // router.push(`/playlist-detail?id=${data.playlistId}`);
      }
    });

    // Cleanup al desmontar o cambiar token
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [token]);

  // Desregistrar token al cerrar sesión
  useEffect(() => {
    if (!token) {
      // El usuario cerró sesión, intentar desregistrar el token
      // Necesitaríamos guardar el último token usado para esto
    }
  }, [token]);
}
