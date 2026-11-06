# CampusGo

**Conectando estudiantes, compartiendo trayectos.** By Sara y Samuel.

CampusGo es una app móvil de carpooling para estudiantes de la Universidad de La Sabana. Conecta conductores y pasajeros para compartir trayectos hacia y desde el campus en una red cerrada (solo correo @unisabana.edu.co) y sin comisiones: el valor por cupo es una referencia y el pago ocurre fuera de la app.

Proyecto del curso Desarrollo de Aplicaciones Móviles (profesor Santiago Rivadereina), por Sara Santacruz Corredor y Samuel Borda Munevar.

> Este README es inicial (Etapa 0). Se completa en la Etapa 9 con capturas, variables de entorno, migraciones, arquitectura y resumen de accesibilidad.

## Requisitos

- Node.js 22.13 o superior (en la línea 22) o 24.3 o superior.
- Expo Go para SDK 58 en un teléfono Android. Si Google Play todavía ofrece una versión anterior, instálalo desde https://expo.dev/go o deja que Expo CLI lo instale (tecla `a` con el teléfono conectado por USB o con un emulador).
- Cuenta de Supabase (desde la Etapa 2).

## Instalar y correr

```sh
git clone https://github.com/sarastacruz04/campusgo.git
cd campusgo
npm install
cp .env.example .env   # luego llena los valores (Etapa 2)
npx expo start
```

Escanea el código QR con Expo Go (el teléfono y el computador deben estar en la misma red; si no, usa `npx expo start --tunnel`).

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
