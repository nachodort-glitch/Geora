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

## Corrección de configuración móvil y respuestas

- Los diálogos se centran con una cuadrícula fija al área visible, respetan los
  márgenes seguros y desplazan su contenido. Se elimina la combinación de
  `translate` de Tailwind y `transform` de CSS que desplazaba dos veces la ventana.
- Las opciones usan Fisher–Yates con una semilla estable por partida, pregunta y
  país; conservan el orden al mostrar la solución y al recuperar una partida.
- Cuatro pruebas adicionales verifican unicidad, distribución de posiciones,
  estabilidad y distractores del mismo continente. Total: 23 pruebas.
- En 7.800 preguntas de banderas, las posiciones A–D obtuvieron 23,5 %, 25,7 %,
  25,7 % y 25,1 %, frente a 42 respuestas en D de 45 países europeos en la mezcla
  anterior para la muestra reproducida.

## Diseño Arcade Adventure

Se aplica la dirección visual de los bocetos aprobados de escritorio y móvil:

- Tipografía de títulos Nunito Sans en peso 900 e inclinada, alojada localmente.
- Botones naranjas con borde azul oscuro y relieve corto; estados seleccionados
  azules, aciertos verdes y errores coral. Se conserva movimiento reducido.
- Escenario azul para el globo giratorio, controles de modo y acción principal.
  En móvil solo se muestra una navegación inferior, sin duplicar el menú arriba.
- Configuración en el contenedor móvil ya corregido, con regiones en tres
  columnas, etapas numeradas y resumen de vidas y países.
- Atlas plano de tarjetas horizontales con bandera, país y capital.
- Carnet de explorador, colección de cinco sellos con uno protagonista y medalla
  SVG del continente al completar un reto. Todo utiliza progreso real.

La apariencia se separa en `app/arcade.css`. Las reglas, guardados y la mezcla de
opciones no cambian. Verificados TypeScript, las 23 pruebas y la compilación.
La herramienta de vista previa en navegador sigue sin estar disponible en este
entorno; queda pendiente la comparación visual final en dispositivos reales.
