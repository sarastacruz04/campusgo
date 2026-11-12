# Auditoría del repositorio — CampusGo (Etapa 8)

Ejecutada el 2026-11-11 por Sara Santacruz con Claude Code, en WSL (Ubuntu) con Node 22.20.0 y npm. Base: `master` en el commit `149bead` (merge del PR #10), 99 commits en todas las ramas (`git rev-list --all`) y 11 ramas remotas. Todo lo de abajo es la salida real de los comandos; ningún valor de clave se imprimió en pantalla ni se escribió en un archivo.

## 1. Secretos en todo el historial

### 1.1 Herramienta

`gitleaks` no está instalado en el equipo (`command -v gitleaks` no devuelve nada). La búsqueda se hizo con `git log --all -p` y expresiones regulares. Esto cubre todas las ramas y todos los commits, pero no reemplaza las cientos de reglas de gitleaks; queda como limitación.

### 1.2 Patrones buscados

Para cada patrón: `git log --all -p -G"<patrón>"` y conteo de las líneas **añadidas** que coinciden. La salida se enmascaró antes de mostrarse (cualquier `eyJ…`, `sb_…` o subdominio de supabase.co se recortaba).

| Patrón | Qué detectaría | Líneas añadidas que coinciden | Qué son |
| --- | --- | --- | --- |
| `eyJ[A-Za-z0-9_-]{10,}` | Un JWT (anon key o service_role key con el formato anterior) | 0 | — |
| `service_role` | Mención o valor de la service_role key | 5 | Solo texto de advertencia: docs/GUIA_DEL_CODIGO.md, el comentario de services/supabase.ts, el comentario de .env.example y la especificación. Ningún valor |
| `[a-z0-9]{20}\.supabase\.co` | La URL de un proyecto de Supabase | 0 | — |
| `sb_secret_` | Clave secreta con el formato nuevo de Supabase | 0 | — |
| `sb_publishable_` | Clave pública con el formato nuevo | 0 | — |
| `SUPABASE_ANON_KEY=.+` y `SUPABASE_URL=.+` | Una variable de entorno con valor | 0 | — |
| `password\s*[:=]\s*["'][^"']{3,}` | Contraseñas escritas en el código | 4 | Contraseñas de mentira dentro de `__tests__/features/auth.test.ts` (`'123456'`, `'malo00'`) contra un servicio simulado, y el texto de error `weak_password` de services/errors.ts. Ninguna es una credencial real |
| `BEGIN (RSA \|EC )?PRIVATE KEY` | Llaves privadas | 0 | — |
| `AKIA[0-9A-Z]{16}` | Llaves de AWS | 0 | — |
| `ghp_[A-Za-z0-9]{20,}` | Tokens de GitHub | 0 | — |

### 1.3 Búsqueda de los valores reales

Además de los patrones, se leyeron la URL y la anon key del `.env` local (sin imprimirlas, solo su longitud) y se buscaron en todo el historial con `git log --all -F -S"<valor>"`:

| Qué se buscó | Commits que lo contienen |
| --- | --- |
| Identificador del proyecto (subdominio de la URL) | 0 |
| Primeros 40 caracteres de la anon key | 0 |
| Últimos 30 caracteres de la anon key | 0 |
| El identificador en algún archivo de cualquier commit (`git grep -F` sobre `git rev-list --all`) | 0 archivos |

### 1.4 Archivos de entorno

- Archivos `.env*` que alguna vez se agregaron al historial (`git log --all --name-only --diff-filter=A`): solo `.env.example`.
- `.gitignore` ignora `.env` (línea 28) y `.env.*` (línea 29), con la excepción `!.env.example` (línea 30); también `*.jks`, `*.keystore`, `*.p8`, `*.p12` y `*.key` (líneas 18 a 22). `git check-ignore -v .env .env.local` confirma las reglas de las líneas 28 y 29.
- `.env` existe en el equipo y **no** está rastreado (`git ls-files .env` no devuelve nada).
- `.env.example` solo tiene comentarios y las dos variables vacías: `EXPO_PUBLIC_SUPABASE_URL=` y `EXPO_PUBLIC_SUPABASE_ANON_KEY=`.
- Archivos rastreados con nombres sospechosos (`.env`, `secret`, `credential`, `.pem`, `.key`, `supabase/.temp`, `config.toml`): solo `.env.example`.

### 1.5 Conclusión

No se encontró ninguna clave, contraseña real ni URL del proyecto en el historial. No hay nada que rotar. La anon key es pública por diseño (la protege RLS), y aun así no está en el repositorio.

## 2. README desde un clon limpio

Se clonó el repositorio en una carpeta temporal fuera del proyecto (`~/clon-limpio-campusgo`) y se siguió el README tal como estaba en `149bead`. Las claves reales se copiaron del `.env` local con `cp`, sin mostrarlas. Al terminar se borró la carpeta del clon, que tenía esa copia del `.env`.

| Paso del README | Comando | Resultado real |
| --- | --- | --- |
| Clonar | `git clone https://github.com/sarastacruz04/campusgo.git` | Correcto, commit `149bead` |
| Requisitos | `node -v` | v22.20.0 (cumple "22.13 o superior") |
| Instalar | `npm install` | Correcto en 27 s. npm muestra avisos de `npm audit` de dependencias; no impiden instalar |
| Variables | `cp .env.example .env` y llenar los valores | Correcto. `.env` no aparece en `git status` (0 cambios) |
| Tipos | `npm run typecheck` | Sin errores (código de salida 0) |
| Lint | `npm run lint` | Sin errores (código de salida 0) |
| Pruebas | `npm test` | 34 archivos, 241 de 241 pruebas aprobadas en 33 s |
| Contraste | `npm run a11y:contrast` | Los 66 pares cumplen WCAG AA |
| Doctor | `npx expo-doctor` | La primera corrida en el clon dijo "1 check failed". Solo se guardaron las dos últimas líneas de esa salida, así que no se sabe cuál chequeo falló. Al repetirlo en el mismo clon, sin cambiar nada: 20 de 20. En el repositorio también: 20 de 20. Pasó otra vez en la rama e8-auditoria: "2 checks failed" justo después de seis corridas seguidas de jest, y luego 20 de 20 en cuatro corridas seguidas, guardando la salida completa. La falla no se pudo reproducir y no se sabe qué chequeo fue; algunos chequeos de expo-doctor consultan servicios de Expo por red |
| Correr | `npx expo start` (sin interacción, puerto 8099) | El servidor respondió `packager-status:running` y el bundle de Android se generó: HTTP 200, 9.620.704 bytes. No se abrió en un teléfono desde el clon |

### 2.1 Qué faltaba en el README y se corrigió

Con el README de `149bead`, alguien con un proyecto nuevo de Supabase instala y abre la app, pero no puede usarla:

1. No decía que hay que aplicar las migraciones `0001` a `0008` y `seed.sql`. Sin ellas no hay tablas, y sin la semilla no hay sectores.
2. No decía de dónde salen los dos valores del `.env` (Project URL y anon key) ni repetía que la `service_role` key no va.
3. No decía que la plantilla "Confirm signup" debe incluir `{{ .Token }}`. Sin eso no llega el código de 6 dígitos y el registro no se puede terminar.
4. Requisitos: decía "Cuenta de Supabase (desde la Etapa 2)", que ya no aplica.

Se agregó la sección "Preparar Supabase" con esos tres pasos, una línea con los nombres de las variables y los comandos de comprobación (`typecheck`, `lint`, `test`). El README completo (tabla de variables, arquitectura, capturas y resumen de accesibilidad) es de la Etapa 9.

### 2.2 Segunda prueba con el README final (Etapa 9)

El 2026-11-12, después de unir los PR #13 y #14, se volvió a clonar el repositorio (master en `cfa5f6c`) y se siguió el README completo: `npm install` correcto, `.env` no rastreado, `typecheck` y `lint` sin errores, 259 de 259 pruebas, los 66 pares de contraste cumplen, `npx expo-doctor` 20 de 20 y el bundle de Android se compiló (HTTP 200). Abrir la app en Expo Go desde ese clon no se probó; la app sí se usó en Expo Go durante todas las pruebas de la Etapa 8.

## 3. Limitaciones de esta auditoría

- Sin gitleaks: la búsqueda cubre los patrones de la tabla 1.2 y los valores reales del `.env`, no todas las reglas de gitleaks.
- La app no se abrió en un teléfono desde el clon limpio: se comprobó que Metro genera el bundle de Android. La apertura en Expo Go se verifica en TC-03 y TC-22.
- La configuración manual de Auth (plantilla del código, SMTP propio, contraseña mínima de 6) no se puede comprobar desde el repositorio: la hace quien administra el proyecto de Supabase en el panel.
