# AGENTS.md — CampusGo (Entrega Final, Fase 3)

Punto de entrada para cualquier agente de IA (Claude Code, Antigravity u otro). Es corto a propósito. El contexto completo está en tres archivos que debes leer COMPLETOS, con tu herramienta de lectura de archivos, antes de hacer cualquier cosa y en este orden:

1. docs/spec/01-contexto-y-arquitectura.md: modo de trabajo, producto, rúbrica, stack y arquitectura (secciones 0 a 4).
2. docs/spec/02-datos-diseno-accesibilidad.md: modelo de datos, reglas de negocio, diseño del Figma y accesibilidad (secciones 5 a 7).
3. docs/spec/03-etapas-git-pruebas-cierre.md: etapas E0 a E9, Git, pruebas, documento final, defensa, definición de terminado y prohibiciones (secciones 8 a 14).

También: docs/CHECKLIST.md (cobertura de la Fase 3), design/Work.png (diseño de las pantallas) y docs/PROPUESTA_ACCESIBILIDAD_CORTE2.md (propuesta de accesibilidad aprobada). Los números de sección (§0 a §14) son globales entre los tres archivos.

## Reglas que nunca se rompen

- Responde en español. El texto visible de la app va en español de Colombia.
- Haz solo la etapa que pida el usuario ("Ejecuta la Etapa N"). Al terminar, resume en máximo 15 líneas y espera su confirmación. Si trabajas en modo de planificación, el plan cubre solo esa etapa.
- El usuario dirá "Soy Sara" o "Soy Samuel". No cambies la identidad de Git, no uses --author para atribuir commits a otra persona y no reescribas historial.
- Nunca inventes resultados de pruebas, mediciones, capturas, citas ni referencias. Lo que se ejecuta en un teléfono lo ejecutan ellos: tú dejas el protocolo y el estado "Pendiente".
- Cero secretos en el código o en Git (.env va ignorado) y cero datos simulados en la app.
- Antes de usar una API de Expo SDK 58 o de una librería, verifícala en https://docs.expo.dev/versions/v58.0.0. Si no funciona en Expo Go, no la uses.
- Antes de cada commit pasan typecheck, lint y tests. Commits pequeños en Conventional Commits en español.
- Cada componente nace accesible (sección 7).
