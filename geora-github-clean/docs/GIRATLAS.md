# Giratlas · entrega inicial

## Experiencia

- Cuatro modos sobre un globo esférico azul y verde: arrastre con ajuste al
  marcador más cercano, flechas y teclado. Render WebGL con alternativa visual.
- Identidad de explorador con una G tipográfica sin deformar. SVG e iconos PWA.
- Paleta Océano y aventura. Inicio, pasaporte, perfil y resultados expresivos;
  atlas y preguntas sobre fondos planos.
- Señales distintas para seleccionar, acertar y fallar. Corazones, etapas,
  progreso y resultados animados. Movimiento reducido y sonido opcional.
- Sellos vinculados a retos completados, habilidades y actividad reales.

## Compatibilidad

Se mantienen reglas, contenido, `geora.progress.v1` y `geora_progress` para no
perder guardados existentes. La sincronización Supabase sigue siendo opcional
y explícita; requiere la configuración propia del proyecto.

Las banderas y las siluetas se generan desde los datos locales mediante
`scripts/prepare-assets.mjs`, ejecutado antes de dev, test y build. No es necesario
consultar una API de geografía ni incorporar claves de mapas.

## Verificación

- 19 pruebas individuales: contenido (3), juego (10), selector (3), copias (3).
- TypeScript sin errores y compilación Vinext de producción completada.
- Pendiente revisión visual e interacción en navegador: la herramienta de
  navegador requerida para la vista previa de Sites no está disponible en este
  entorno. No se afirma que se hayan probado visualmente móvil, WebGL o mapas.

La validación de copias rechaza estados incoherentes (vidas, tareas duplicadas,
colas vacías, habilidades desconocidas) antes de que alcancen la interfaz.
