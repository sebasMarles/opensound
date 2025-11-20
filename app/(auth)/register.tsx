"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "../../store/authStore"
import type { RegisterCredentials } from "../../types/auth"
import {
  getEmailRules,
  getPasswordRules,
  getNameRules,
  getConfirmPasswordRules,
  sanitizeInput,
} from "../../utils/validation"
import { AuthAlert } from "../../components/AuthAlert"
import { checkEmailExists } from "../../services/auth"

export default function RegisterScreen() {
  const router = useRouter()
  const { register, isLoading, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit = async (data: RegisterCredentials) => {
    clearError()
    setAlert(null)

    try {
      setCheckingEmail(true)
      const emailExists = await checkEmailExists(data.email)
      setCheckingEmail(false)

      if (emailExists) {
        setAlert({
          type: "error",
          message: "Este correo ya tiene una cuenta en OpenSound. Por favor, inicia sesión.",
        })
        return
      }

      const sanitizedData = {
        ...data,
        name: sanitizeInput(data.name),
        email: sanitizeInput(data.email),
      }

      await register(sanitizedData)

      setAlert({
        type: "success",
        message: "¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.",
      })

      // Esperar 2 segundos para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        router.replace("/(auth)/login")
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la cuenta"
      setAlert({ type: "error", message })
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Crear Cuenta</Text>
          </View>

          <View className="items-center mb-8">
            <Image source={require("../../assets/logo.png")} className="w-16 h-16 mb-3" resizeMode="contain" />
            <Text className="text-white text-2xl font-bold mb-2">Únete a OpenSound</Text>
            <Text className="text-gray-400 text-sm text-center">Descubre música increíble de artistas emergentes</Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text className="text-white text-sm font-medium mb-2">Nombre completo</Text>
              <Controller
                control={control}
                name="name"
                rules={getNameRules()}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="Tu nombre completo"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={50}
                    accessibilityLabel="Campo de nombre completo"
                    accessibilityHint="Ingresa tu nombre completo"
                  />
                )}
              />
              {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>}
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Email</Text>
              <Controller
                control={control}
                name="email"
                rules={getEmailRules()}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="tu@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    maxLength={100}
                    accessibilityLabel="Campo de correo electrónico"
                    accessibilityHint="Ingresa tu correo electrónico"
                  />
                )}
              />
              {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>}
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Contraseña</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  rules={getPasswordRules()}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-neutral-900 text-white px-4 py-3 pr-12 rounded-lg border border-neutral-700 focus:border-purple-600"
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      autoCorrect={false}
                      maxLength={128}
                      accessibilityLabel="Campo de contraseña"
                      accessibilityHint="Ingresa una contraseña segura"
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>}
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Confirmar contraseña</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={getConfirmPasswordRules(password)}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-neutral-900 text-white px-4 py-3 pr-12 rounded-lg border border-neutral-700 focus:border-purple-600"
                      placeholder="Confirma tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      autoCorrect={false}
                      maxLength={128}
                      accessibilityLabel="Campo de confirmación de contraseña"
                      accessibilityHint="Confirma tu contraseña"
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {alert && (
              <View className="mt-2">
                <AuthAlert type={alert.type} message={alert.message} />
              </View>
            )}

            <TouchableOpacity
              className={`bg-purple-600 py-4 rounded-lg mt-6 flex-row items-center justify-center ${isLoading || checkingEmail ? "opacity-50" : ""}`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading || checkingEmail}
            >
              {(isLoading || checkingEmail) && (
                <ActivityIndicator style={{ marginRight: 8 }} size="small" color="#fff" />
              )}
              <Text className="text-white text-center text-lg font-semibold">
                {checkingEmail ? "Verificando..." : isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-400 text-xs text-center mt-4">
              Al registrarte, aceptas nuestros <Text className="text-purple-400">Términos de Servicio</Text> y{" "}
              <Text className="text-purple-400">Política de Privacidad</Text>
            </Text>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-400">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-purple-400 font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
