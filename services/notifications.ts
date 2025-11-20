import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { getConfig } from "../hooks/useConfig";

const config = getConfig();

// Configurar comportamiento de notificaciones
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

/**
 * Registra el token de notificación push en el backend
 */
export async function registerPushToken(authToken: string): Promise<boolean> {
  try {
    // Verificar que sea dispositivo físico
    if (!Device.isDevice) {
      return false;
    }

    // Solicitar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    // Obtener token de Expo
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    const pushToken = tokenData.data;

    // Obtener información del dispositivo
    const deviceInfo: PushTokenData = {
      token: pushToken,
      platform: Platform.OS as "ios" | "android" | "web",
      deviceName: Device.deviceName || undefined,
      osVersion: Device.osVersion || undefined,
    };

    // Registrar en el backend
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

/**
 * Desregistra el token de notificación del backend
 */
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

/**
 * Listener para notificaciones recibidas
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Listener para cuando el usuario toca una notificación
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
