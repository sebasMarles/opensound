import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { getConfig } from "../hooks/useConfig";

const config = getConfig();

// Configuramos como se ven las notificaciones cuando la app esta abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushTokenData {
  token: string;
  platform: "ios" | "android" | "web";
  deviceName?: string;
  osVersion?: string;
}

// Guardar el token en el backend
export async function registerPushToken(authToken: string): Promise<boolean> {
  try {
    // Solo funciona en celular fisico
    if (!Device.isDevice) {
      return false;
    }

    // Pedir permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    // Sacar el token de Expo
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    const pushToken = tokenData.data;

    // Info del celular
    const deviceInfo: PushTokenData = {
      token: pushToken,
      platform: Platform.OS as "ios" | "android" | "web",
      deviceName: Device.deviceName || undefined,
      osVersion: Device.osVersion || undefined,
    };

    // Mandar al backend
    const response = await fetch(`${config.apiUrl}/push-tokens/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(deviceInfo),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Borrar token del backend
export async function unregisterPushToken(authToken: string): Promise<boolean> {
  try {
    if (!Device.isDevice) {
      return false;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    const response = await fetch(`${config.apiUrl}/push-tokens/unregister`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: tokenData.data }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Escuchar cuando llega una notificacion
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Escuchar cuando tocan la notificacion
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Programar mensaje de bienvenida
export async function scheduleWelcomeNotification(username: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Bienvenido a OpenSound, ${username}!`,
      body: "Nos alegra tenerte aquí. ¡Disfruta de la música!",
      sound: true,
    },
    trigger: null, // Mostrar de una
  });
}

// Programar recordatorio cada 3 dias
export async function scheduleRecurringReminder() {
  // Borramos las anteriores para no duplicar
  await cancelAllNotifications();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Recuerda escuchar música en OpenSound!",
      body: "Tu dosis diaria de música te espera.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 259200, // 3 dias
      repeats: true,
    },
  });
}

// Cancelar todo
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
