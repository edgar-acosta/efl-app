# Flujo inicial de pruebas — app EFL (DEV)

Primera versión ejecutable del flujo inicial de pruebas automatizadas
asignado en la weekly Producto-QA: **login, selección de cliente,
usuario y rol**, en el entorno DEV, con Playwright.

Cubre solo este flujo inicial, no una suite completa. Corre solo en
alcance de pruebas, sin tocar datos ni sistemas de producción.

## Qué cubre

1. Abrir la app en DEV y verificar la pantalla de login.
2. Iniciar sesión con la cuenta de pruebas.
3. Abrir el menú del usuario desde el avatar.
4. Abrir «Viendo como» y pulsar «Seleccionar».
5. Seleccionar cliente, rol y usuario, y confirmar con «Aceptar».
6. Verificar la píldora «Ver como: …» y el encabezado del cliente.

Cada paso queda registrado en el reporte con su propio nombre, y el
flujo guarda capturas de `login` y `ver-como` en `test-results/`.

## Requisitos

- Node.js 20 o superior.
- Un archivo `.env` con los valores del entorno DEV (copia
  `.env.example` como `.env` y complétalo). El `.env` nunca se sube
  al repo. `EFL_BASE_URL` no tiene valor por defecto a propósito:
  el flujo jamás debe apuntar a producción por accidente.
- Los datos de «Ver como» por defecto son los del cliente tutorial
  verificados en el POC; ajústalos a los datos de DEV en el `.env`.

## Cómo correrlo

```bash
npm install
npm run test:flujo
npm run report        # abre el reporte HTML en el navegador
npm run check-report  # veredicto en una línea desde el reporte JSON
```

## Ejecución programada

El archivo `.github/workflows/flujo-inicial.yml` corre el flujo de
lunes a viernes a las 08:00 CST (horario propuesto, por confirmar) y
guarda el reporte como artefacto 30 días. Necesita estos secrets en
el repositorio: `EFL_BASE_URL`, `EFL_USER`, `EFL_PASS`,
`EFL_CLIENT`, `EFL_ROLE`, `EFL_TEST_USER`.

## Reportes

- `playwright-report/index.html`: reporte legible con cada paso.
- `playwright-report/results.json`: reporte en JSON para la
  validación periódica. Un reporte vacío o sin generar no cuenta
  como éxito (`npm run check-report` lo detecta).

## Qué falta para ampliarlo

- URL real del entorno DEV y datos de prueba de DEV (hoy el flujo
  trae valores del cliente tutorial como punto de partida).
- Confirmar la hora de la ejecución programada entre semana.
- Validar el elemento `motum-avatar` en DEV: el flujo abre el menú
  del usuario pulsando ese elemento justo después del login. Si
  cambia el encabezado, ese es el primer punto a ajustar.
