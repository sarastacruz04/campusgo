# CampusGo

**Conectando estudiantes, compartiendo trayectos.** By Sara y Samuel.

CampusGo es una app móvil de carpooling para estudiantes de la Universidad de La Sabana. Conecta conductores y pasajeros para compartir trayectos hacia y desde el campus en una red cerrada (solo correo @unisabana.edu.co) y sin comisiones: el valor por cupo es una referencia y el pago ocurre fuera de la app.

Proyecto del curso Desarrollo de Aplicaciones Móviles (profesor Santiago Rivadereina), por Sara Santacruz Corredor y Samuel Borda Munevar.

> Este README es inicial (Etapa 0). Se completa en la Etapa 9 con capturas, variables de entorno, migraciones, arquitectura y resumen de accesibilidad.

## Requisitos

- Node.js 22.13 o superior (en la línea 22) o 24.3 o superior.
- Expo Go para SDK 58 en un teléfono Android. Si Google Play todavía ofrece una versión anterior, instálalo desde https://expo.dev/go o deja que Expo CLI lo instale (tecla `a` con el teléfono conectado por USB o con un emulador).
- Cuenta de Supabase (plan gratuito) con un proyecto creado.

## Preparar Supabase (una sola vez por proyecto)

1. En el SQL Editor del proyecto, ejecuta en orden los archivos de `supabase/migrations` (de `0001` a `0009`, uno por uno) y luego `supabase/seed.sql` (sectores). Para comprobar la seguridad, `supabase/tests/rls.sql` debe terminar con "RESULTADO RLS: 92 de 92 correctas".
2. Authentication > Email Templates > "Confirm signup": el cuerpo debe incluir `{{ .Token }}`, porque la app verifica el correo con el código de 6 dígitos.
3. Project Settings > API: copia la **Project URL** y la **anon public key** (o publishable key). Nunca uses la `service_role` key en la app.

## Instalar y correr

```sh
git clone https://github.com/sarastacruz04/campusgo.git
cd campusgo
npm install
cp .env.example .env   # pega la URL y la anon key del paso 3 de arriba
npx expo start
```

En `.env` van `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`. El archivo está ignorado por Git.

Escanea el código QR con Expo Go (el teléfono y el computador deben estar en la misma red; si no, usa `npx expo start --tunnel`).

Para comprobar el proyecto: `npm run typecheck`, `npm run lint` y `npm test`.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo de Expo. |
| `npm run android` | Inicia y abre la app en un Android conectado o en el emulador. |
| `npm run typecheck` | Revisa los tipos con TypeScript estricto. |
| `npm run lint` | ESLint con reglas de Expo, Prettier y accesibilidad. |
| `npm run format` | Formatea el código con Prettier. |
| `npm test` | Pruebas con jest-expo y Testing Library. |
| `npm run a11y:contrast` | Verifica que todos los pares de color cumplan WCAG AA en los temas claro, oscuro y alto contraste. |

## Documentación

La especificación está en docs/spec. Decisiones en docs/DECISIONES.md, guía del código en docs/GUIA_DEL_CODIGO.md y guía de defensa en docs/GUIA_DEFENSA.md.
