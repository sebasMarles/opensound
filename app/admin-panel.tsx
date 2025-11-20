"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { useAdminUsers } from "../hooks/useAdminUsers"
import { useAdminStats } from "../hooks/useAdminStats"
import { useAdminActions } from "../hooks/useAdminActions"
import { AuthAlert } from "../components/AuthAlert"
import type { AdminUser } from "../services/admin"

export default function AdminPanel() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [search, setSearch] = useState("")
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" as "user" | "admin" })

  const { users, loading: loadingUsers, error: usersError, reload: reloadUsers, filterUsers } = useAdminUsers(token)
  const { stats, loading: loadingStats } = useAdminStats(token)
  const {
    loading: actionLoading,
    error: actionError,
    updateUser: handleUpdate,
    deleteUser: handleDelete,
    clearError,
  } = useAdminActions(token, () => {
    reloadUsers()
    setEditingUser(null)
    setAlert({ type: "success", message: "Operación completada exitosamente" })
  })

  const handleSearchChange = (text: string) => {
    setSearch(text)
    filterUsers(text)
  }

  const openEditModal = (userToEdit: AdminUser) => {
    setEditingUser(userToEdit)
    setEditForm({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
    })
  }

  const confirmUpdate = async () => {
    if (!editingUser) return
    const success = await handleUpdate(editingUser.id, editForm)
    if (success) {
      setAlert({ type: "success", message: "Usuario actualizado correctamente" })
    }
  }

  const confirmDelete = (userId: string, userName: string) => {
    if (userId === user?.id) {
      setAlert({ type: "error", message: "No puedes eliminarte a ti mismo" })
      return
    }

    Alert.alert("Confirmar eliminación", `¿Estás seguro de que deseas eliminar a ${userName}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const success = await handleDelete(userId)
          if (success) {
            setAlert({ type: "success", message: "Usuario eliminado correctamente" })
          }
        },
      },
    ])
  }

  if (user?.role !== "admin") {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-black px-6">
        <Ionicons name="lock-closed" size={64} color="#888" />
        <Text className="text-white text-xl mt-4 text-center">No tienes permisos para acceder a esta sección</Text>
        <TouchableOpacity className="mt-6 bg-purple-600 px-6 py-3 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const loading = loadingUsers || loadingStats

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Panel de Administración</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text className="text-gray-400 mb-4">Gestiona los usuarios de la aplicación</Text>

        {stats && (
          <View className="flex-row justify-between mb-4">
            <View className="bg-neutral-900 rounded-lg p-4 flex-1 mr-2">
              <Text className="text-gray-400 text-sm">Total Usuarios</Text>
              <Text className="text-white text-2xl font-bold">{stats.totalUsers}</Text>
            </View>
            <View className="bg-neutral-900 rounded-lg p-4 flex-1 ml-2">
              <Text className="text-gray-400 text-sm">Administradores</Text>
              <Text className="text-purple-500 text-2xl font-bold">{stats.totalAdmins}</Text>
            </View>
          </View>
        )}

        {(alert || actionError || usersError) && (
          <View className="mb-4">
            <AuthAlert
              type={alert?.type || "error"}
              message={alert?.message || actionError || usersError || ""}
              onDismiss={() => {
                setAlert(null)
                clearError()
              }}
            />
          </View>
        )}

        <View className="flex-row items-center bg-neutral-900 rounded-lg px-4 py-2 mb-4">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Buscar por nombre o email..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={handleSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("")
                filterUsers("")
              }}
            >
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#D400FF" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="bg-neutral-900 rounded-lg p-4 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">{item.name}</Text>
                  <Text className="text-gray-400">{item.email}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.role === "admin" ? "bg-purple-600" : "bg-gray-600"}`}>
                  <Text className="text-white text-xs font-bold">{item.role === "admin" ? "ADMIN" : "USER"}</Text>
                </View>
              </View>

              <Text className="text-gray-500 text-xs mb-3">
                Registrado: {new Date(item.createdAt).toLocaleDateString()}
              </Text>

              <View className="flex-row justify-end">
                <TouchableOpacity
                  className="bg-blue-600 px-4 py-2 rounded-lg mr-2 flex-row items-center"
                  onPress={() => openEditModal(item)}
                  disabled={actionLoading}
                >
                  <Ionicons name="pencil" size={16} color="white" />
                  <Text className="text-white ml-2 font-bold">Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
                  onPress={() => confirmDelete(item.id, item.name)}
                  disabled={item.id === user?.id || actionLoading}
                >
                  <Ionicons name="trash" size={16} color="white" />
                  <Text className="text-white ml-2 font-bold">Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-8">
              <Ionicons name="people-outline" size={64} color="#888" />
              <Text className="text-gray-400 mt-4">No se encontraron usuarios</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!editingUser} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-neutral-900 rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-white text-2xl font-bold mb-4">Editar Usuario</Text>

            <Text className="text-gray-400 mb-2">Nombre</Text>
            <TextInput
              className="bg-black text-white px-4 py-3 rounded-lg mb-4"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              placeholder="Nombre del usuario"
              placeholderTextColor="#888"
            />

            <Text className="text-gray-400 mb-2">Email</Text>
            <TextInput
              className="bg-black text-white px-4 py-3 rounded-lg mb-4"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text className="text-gray-400 mb-2">Rol</Text>
            <View className="flex-row mb-6">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg mr-2 ${editForm.role === "user" ? "bg-purple-600" : "bg-black"}`}
                onPress={() => setEditForm({ ...editForm, role: "user" })}
              >
                <Text className="text-white text-center font-bold">Usuario</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ml-2 ${editForm.role === "admin" ? "bg-purple-600" : "bg-black"}`}
                onPress={() => setEditForm({ ...editForm, role: "admin" })}
              >
                <Text className="text-white text-center font-bold">Admin</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-600 py-3 rounded-lg mr-2"
                onPress={() => setEditingUser(null)}
                disabled={actionLoading}
              >
                <Text className="text-white text-center font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-purple-600 py-3 rounded-lg ml-2"
                onPress={confirmUpdate}
                disabled={actionLoading}
              >
                <Text className="text-white text-center font-bold">{actionLoading ? "Guardando..." : "Guardar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
