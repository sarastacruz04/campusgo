# Guía de defensa — CampusGo

Se actualiza al cerrar cada etapa. Objetivo: que Sara y Samuel puedan ubicar cualquier archivo, explicarlo línea por línea y hacer ajustes en vivo (sección 12 de la especificación).

## 1. Mapa de archivos

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| package.json | Dependencias (versiones del SDK 58) y scripts: `start`, `android`, `typecheck`, `lint`, `format`, `test`, `test:watch` y `a11y:contrast`. El bloque `jest` configura el preset jest-expo; `overrides` permite usar el plugin de accesibilidad con ESLint 9. | Sara (E0) |
| app.json | Configuración de Expo: nombre, ícono, splash, esquema `campusgo`, `userInterfaceStyle: automatic` (para el tema oscuro), rutas tipadas y React Compiler desactivado. | Sara (E0) |
| tsconfig.json | TypeScript estricto (`strict: true`), alias `@/*` a la raíz y tipos de Jest. | Sara (E0) |
| eslint.config.js | ESLint "flat": reglas de Expo + Prettier + `eslint-plugin-react-native-a11y` (conjunto `all`) y `no-console`. | Sara (E0) |
| .prettierrc / .prettierignore | Formato del código (comillas simples, 100 columnas). | Sara (E0) |
| .gitignore / .env.example | Qué no se sube a Git (.env, llaves, keystores, carpetas nativas) y la plantilla de variables sin valores. | Sara (E0) |
| app/_layout.tsx | Layout raíz de Expo Router (un Stack sin encabezado). En E4 tendrá el guardia de sesión. | Sara (E0) |
| app/index.tsx | Pantalla provisional que comprueba que la app abre. En E1/E4 será la bienvenida. | Sara (E0) |
| \_\_tests\_\_/smoke.test.tsx | Prueba de humo con Testing Library. | Sara (E0) |
| components/, features/, services/, store/, db/, hooks/, theme/, lib/, types/, scripts/, supabase/ | Estructura de la sección 4 (vacías con `.gitkeep` hasta su etapa). | Sara (E0) |
| docs/ | Especificación, decisiones, matriz, contratos, pruebas, auditoría y esta guía. | Ambos |

## 2. Flujo de datos

Se documenta paso a paso en la Etapa 3: pantalla → `dispatch(thunk)` → servicio → Supabase → reducer → selector → pantalla.

## 3. Preguntas probables (se acumulan por etapa hasta llegar a 40)

### Arquitectura de React Native y Expo Router

1. **¿Cómo arranca la app?** `package.json` tiene `"main": "expo-router/entry"`. Ese punto de entrada registra la app y Expo Router lee la carpeta `app/`: cada archivo es una ruta. `app/_layout.tsx` envuelve todas las rutas y `app/index.tsx` es la ruta `/`.
2. **¿Por qué no hay carpeta src?** La especificación pide la estructura en la raíz. La plantilla del SDK 58 trae `src/app`; la movimos a `app/` y el alias `@/*` apunta a la raíz (docs/DECISIONES.md, D-02).
3. **¿Por qué Expo Go y no un development build?** Es un requisito del curso: todo debe correr en Expo Go, sin módulos nativos propios. Por eso cada librería se verifica en la documentación del SDK 58 antes de instalarla y se instala con `npx expo install`, que elige la versión compatible.
4. **¿Qué hace `npx expo-doctor`?** Revisa la configuración del proyecto y que las versiones de las dependencias coincidan con el SDK. En E0 pasó 20 de 20 comprobaciones.

### Calidad y herramientas

5. **¿Qué garantiza `strict: true`?** Activa las comprobaciones estrictas de TypeScript (por ejemplo `strictNullChecks` y `noImplicitAny`): no se puede usar un valor que puede ser `null` sin comprobarlo, ni dejar parámetros sin tipo.
6. **¿Para qué sirve eslint-plugin-react-native-a11y?** Revisa en el código props de accesibilidad inválidas (un `accessibilityRole` que no existe, estados mal escritos, touchables anidados). Detecta errores antes de llegar al teléfono. Apagamos solo `has-accessibility-hint` porque obligaría a poner pistas redundantes, en contra de S-02 (D-08).
7. **¿Por qué desactivaron React Compiler?** Porque la especificación pide memoización explícita (React.memo, useCallback, selectores memoizados) que debemos poder explicar y medir; el compilador la haría de forma implícita (D-05).
8. **¿Qué hace jest-expo?** Es el preset de Jest para Expo: simula los módulos nativos y transforma el código de React Native para que las pruebas corran en Node. Testing Library renderiza componentes y los busca como lo haría un usuario (por rol y por texto).

## 4. Ejercicios de ajuste en vivo

Se agregan desde la Etapa 1 (meta: 10).

## 5. Mis archivos y los del otro

| Persona | Mis archivos | Archivos del otro que debo dominar |
| --- | --- | --- |
| Sara | Configuración del proyecto (E0) | Se completa desde E2 |
| Samuel | Se completa desde E2 | Configuración del proyecto (E0): package.json, tsconfig.json, eslint.config.js, app.json |
