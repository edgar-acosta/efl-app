import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Las variables viven en .env (nunca se sube al repo) o en los
// secrets del repositorio para la ejecución programada.
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: process.env.EFL_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Sin permisos concedidos: el navegador no muestra el aviso de
    // ubicación ni de notificaciones durante el flujo.
    // Opcional: reutilizar un Chromium ya instalado (p. ej. el del
    // POC) con PLAYWRIGHT_CHROMIUM_PATH=/ruta/a/chrome.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
