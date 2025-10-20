import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Switch, View } from "react-native";
import Button from "@/ui/atoms/Button";
import Text from "@/ui/atoms/Text";
import { Input } from "@/ui/atoms/Input";
import type { Playlist, PlaylistPayload } from "../types";

type Props = {
  initialPlaylist?: Playlist | null;
  onSubmit: (values: PlaylistPayload) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
};

const DEFAULT_VALUES: PlaylistPayload = {
  name: "",
  description: "",
  isPublic: true,
};

// Formulario reutilizable para crear y editar playlists.
export function PlaylistForm({
  initialPlaylist,
  onSubmit,
  submitLabel = "Guardar playlist",
  onCancel,
  loading = false,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PlaylistPayload>({
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  // Cuando cambia la playlist seleccionada sincronizamos los valores del formulario.
  useEffect(() => {
    if (initialPlaylist) {
      reset({
        name: initialPlaylist.name,
        description: initialPlaylist.description,
        isPublic: initialPlaylist.isPublic,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [initialPlaylist, reset]);

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      isPublic: values.isPublic,
    });
  });

  return (
    <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
      <Text variant="subtitle" className="mb-4">
        {initialPlaylist ? "Editar playlist" : "Crear nueva playlist"}
      </Text>

      <View className="mb-4">
        <Text className="text-sm text-gray-300 mb-2">Nombre</Text>
        <Controller
          control={control}
          name="name"
          rules={{
            required: "El nombre es obligatorio",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
            maxLength: { value: 40, message: "Máximo 40 caracteres" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej. Playlist de entrenamiento"
              hasError={Boolean(errors.name)}
              autoCapitalize="sentences"
              autoCorrect
            />
          )}
        />
        {errors.name && (
          <Text variant="caption" className="text-red-400 mt-1">
            {errors.name.message}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-300 mb-2">Descripción</Text>
        <Controller
          control={control}
          name="description"
          rules={{
            maxLength: { value: 140, message: "Máximo 140 caracteres" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Cuenta de qué trata esta playlist"
              hasError={Boolean(errors.description)}
              multiline
              numberOfLines={3}
              className="h-24"
              style={{ textAlignVertical: "top" }}
            />
          )}
        />
        {errors.description && (
          <Text variant="caption" className="text-red-400 mt-1">
            {errors.description.message}
          </Text>
        )}
      </View>

      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-sm text-gray-300">Playlist pública</Text>
          <Text variant="caption">Permite que otros usuarios la descubran</Text>
        </View>
        <Controller
          control={control}
          name="isPublic"
          render={({ field: { value, onChange } }) => (
            <Switch value={value} onValueChange={onChange} trackColor={{ true: "#A855F7" }} />
          )}
        />
      </View>

      <View className="flex-row justify-end space-x-3">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onCancel}
            accessibilityLabel="Cancelar edición de playlist"
          >
            Cancelar
          </Button>
        )}
        <Button
          onPress={submitHandler}
          loading={loading}
          disabled={!isDirty && !initialPlaylist}
          accessibilityLabel={submitLabel}
        >
          {submitLabel}
        </Button>
      </View>
    </View>
  );
}
