# Sistema de Validación de OpenSound

Este documento describe el sistema de validación implementado en la aplicación OpenSound.

## Estructura

El sistema de validación está centralizado en `utils/validation.ts` y proporciona:

### 1. Patrones de Validación (ValidationPatterns)

- **email**: Validación RFC 5322 simplificada para correos electrónicos
- **passwordStrong**: Contraseña fuerte (8+ caracteres, mayúscula, minúscula, número)
- **passwordBasic**: Contraseña básica (6+ caracteres)
- **name**: Nombres con letras, espacios, guiones y apóstrofes (incluyendo caracteres en español)
- **username**: Alfanumérico con guiones bajos y puntos
- **search**: Búsquedas con caracteres alfanuméricos y espacios

### 2. Límites de Longitud (ValidationLimits)

Todos los campos tienen límites mínimos y máximos definidos:

\`\`\`typescript
name: { min: 2, max: 50 }
email: { min: 5, max: 100 }
password: { min: 6, max: 128 }
username: { min: 3, max: 20 }
search: { min: 1, max: 100 }
bio: { min: 0, max: 500 }
comment: { min: 1, max: 1000 }
\`\`\`

### 3. Mensajes de Error (ValidationMessages)

Todos los mensajes están en español y son consistentes en toda la aplicación.

### 4. Funciones de Validación

- `validateEmail(email: string): boolean`
- `validatePassword(password: string, strong?: boolean): boolean`
- `validateName(name: string): boolean`
- `validateUsername(username: string): boolean`
- `sanitizeInput(input: string): string` - Elimina espacios extras

### 5. Reglas para React Hook Form

Funciones que retornan objetos de reglas listos para usar con `react-hook-form`:

- `getEmailRules()`
- `getPasswordRules(strong?: boolean)`
- `getNameRules()`
- `getConfirmPasswordRules(password: string)`

## Uso en Formularios

### Ejemplo con Login

\`\`\`typescript
import { getEmailRules, getPasswordRules, sanitizeInput } from "../../utils/validation";

const { control, handleSubmit } = useForm<FormData>();

<Controller
  control={control}
  name="email"
  rules={getEmailRules()}
  render={({ field: { onChange, value } }) => (
    <TextInput
      value={value}
      onChangeText={onChange}
      maxLength={100}
      autoCapitalize="none"
      autoComplete="email"
    />
  )}
/>
\`\`\`

### Ejemplo con Registro

\`\`\`typescript
const password = watch('password');

<Controller
  control={control}
  name="confirmPassword"
  rules={getConfirmPasswordRules(password)}
  render={({ field }) => <TextInput {...field} />}
/>
\`\`\`

## Características de Seguridad

1. **Sanitización**: Todos los inputs se sanitizan antes de enviar al backend
2. **Límites estrictos**: maxLength en todos los TextInput
3. **Validación en tiempo real**: Errores mostrados inmediatamente
4. **Accesibilidad**: Labels y hints para lectores de pantalla
5. **Autocompletado**: Atributos autoComplete para mejor UX

## Validaciones Implementadas

### Formulario de Login
- ✅ Email: formato válido, longitud 5-100 caracteres
- ✅ Contraseña: mínimo 6 caracteres, máximo 128

### Formulario de Registro
- ✅ Nombre: 2-50 caracteres, solo letras y espacios
- ✅ Email: formato válido, longitud 5-100 caracteres
- ✅ Contraseña: mínimo 6 caracteres, máximo 128
- ✅ Confirmar contraseña: debe coincidir con la contraseña

### Búsqueda
- ✅ Búsqueda: 1-100 caracteres
- ✅ Sanitización de entrada
- ✅ Validación en tiempo real

## Próximas Mejoras

Para futuras implementaciones, considera agregar:

1. Validación de campos de perfil (bio, username)
2. Validación de comentarios
3. Validación de formularios de contacto
4. Rate limiting en búsquedas
5. Validación de archivos subidos (imágenes de perfil)
