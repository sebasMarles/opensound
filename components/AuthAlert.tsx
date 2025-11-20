import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type AuthAlertProps = {
  type: "error" | "success" | "warning"
  message: string
  onDismiss?: () => void
}

export function AuthAlert({ type, message, onDismiss }: AuthAlertProps) {
  const config = {
    error: {
      icon: "alert-circle" as const,
      bgColor: "bg-red-900/20",
      borderColor: "border-red-500",
      textColor: "text-red-400",
      iconColor: "#ef4444",
    },
    success: {
      icon: "checkmark-circle" as const,
      bgColor: "bg-green-900/20",
      borderColor: "border-green-500",
      textColor: "text-green-400",
      iconColor: "#22c55e",
    },
    warning: {
      icon: "warning" as const,
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-400",
      iconColor: "#eab308",
    },
  }

  const style = config[type]

  return (
    <View className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4 flex-row items-start gap-3`}>
      <Ionicons name={style.icon} size={20} color={style.iconColor} />
      <Text className={`${style.textColor} flex-1 text-sm leading-relaxed`}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={20} color={style.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  )
}
