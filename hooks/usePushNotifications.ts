import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import {
  registerPushToken,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  scheduleWelcomeNotification,
  scheduleRecurringReminder,
  cancelAllNotifications,
} from "../services/notifications";

export function usePushNotifications() {
  const { token, user } = useAuth();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Si no hay token no hacemos nada
    if (!token) return;

    // Guardamos el token para push
    registerPushToken(token);

    // Escuchar notificaciones cuando la app esta abierta
    notificationListener.current = addNotificationReceivedListener((notification) => {
      // Aca podriamos hacer algo con la notificacion
    });

    // Escuchar cuando tocan la notificacion
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      // Si viene un playlistId podriamos navegar ahi
      if (data?.playlistId) {
        // router.push(`/playlist-detail?id=${data.playlistId}`);
      }
    });

    // Limpiamos los listeners al salir
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [token]);

  // Mandar la bienvenida cuando se loguea
  useEffect(() => {
    if (token && user?.name) {
      // Esperamos un poquito para que cargue bien
      setTimeout(() => {
        if (user?.name) {
          scheduleWelcomeNotification(user.name);
        }
      }, 1000);
    }
  }, [token, user?.name]);

  // Chequear si la app se minimiza o se abre
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        // Si se minimiza, activamos el recordatorio
        await scheduleRecurringReminder();
      } else if (nextAppState === "active") {
        // Si vuelve, lo sacamos
        await cancelAllNotifications();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Aca podriamos borrar el token al salir
  useEffect(() => {
    if (!token) {
      // TODO: ver como borrar el token si no tenemos el viejo
    }
  }, [token]);
}
