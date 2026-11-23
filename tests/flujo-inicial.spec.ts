import { expect, test } from '@playwright/test';
import {
  abrirMenuUsuario,
  abrirViendoComo,
  loadConfig,
  login,
  seleccionarVerComo,
} from './helpers/efl';

/**
 * Flujo inicial asignado en la weekly Producto-QA (9 nov 2026):
 * login, selección de cliente, usuario y rol, en el entorno DEV.
 * Cubre solo este flujo inicial, no una suite completa.
 */
test('flujo inicial: login, cliente, usuario y rol en DEV', async ({ page }) => {
  const config = loadConfig();

  await test.step('Abrir la app (entorno DEV)', async () => {
    await page.goto('/');
    await expect(page).toHaveURL(new RegExp('login|#/login|panel|home', 'i'), {
      timeout: 10_000,
    });
  });

  await test.step('Iniciar sesión', async () => {
    await login(page, config);
    await page.screenshot({ path: 'test-results/login.png' });
  });

  await test.step('Abrir el menú de usuario (avatar)', async () => {
    await abrirMenuUsuario(page, config);
  });

  await test.step('Abrir "Viendo como" y pulsar "Seleccionar"', async () => {
    await abrirViendoComo(page);
  });

  await test.step('Seleccionar cliente, rol y usuario', async () => {
    await seleccionarVerComo(page, config);
  });

  await test.step('Verificar la vista como cliente', async () => {
    // La píldora "Ver como: ..." confirma la vista aplicada.
    await expect(page.getByText(/ver como:/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(config.client, { exact: false }).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/ver-como.png' });
  });
});
