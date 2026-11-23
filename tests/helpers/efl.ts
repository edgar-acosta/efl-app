import { expect, type Page } from '@playwright/test';

export interface EflConfig {
  baseURL: string;
  user: string;
  pass: string;
  client: string;
  role: string;
  testUser: string;
}

/**
 * Lee la configuración del entorno. EFL_BASE_URL no tiene valor por
 * defecto a propósito: el flujo solo corre en alcance de pruebas y
 * nunca debe apuntar a producción por accidente.
 */
export function loadConfig(): EflConfig {
  const baseURL = (process.env.EFL_BASE_URL ?? '').trim();
  const user = (process.env.EFL_USER ?? '').trim();
  const pass = (process.env.EFL_PASS ?? '').trim();
  if (!baseURL) {
    throw new Error(
      'Falta EFL_BASE_URL en .env: la URL base del entorno DEV. ' +
        'Copia .env.example como .env y completa los valores.',
    );
  }
  if (!user || !pass) {
    throw new Error(
      'Faltan EFL_USER o EFL_PASS en .env: la cuenta de pruebas del entorno DEV.',
    );
  }
  return {
    baseURL,
    user,
    pass,
    client: (process.env.EFL_CLIENT ?? 'TUTORIAL__PRUEBAS').trim(),
    role: (process.env.EFL_ROLE ?? 'OWNER').trim(),
    testUser: (process.env.EFL_TEST_USER ?? 'TUTORIAL__prueba hesa__pruebas').trim(),
  };
}

/** Rellena un campo buscando por etiqueta, placeholder o posición. */
async function fillField(
  page: Page,
  patterns: RegExp[],
  value: string,
  fieldName: string,
) {
  for (const pattern of patterns) {
    const byLabel = page.getByLabel(pattern, { exact: false });
    if ((await byLabel.count()) > 0) {
      await byLabel.first().fill(value);
      return;
    }
    const byPlaceholder = page.getByPlaceholder(pattern);
    if ((await byPlaceholder.count()) > 0) {
      await byPlaceholder.first().fill(value);
      return;
    }
  }
  throw new Error(`No se encontró el campo "${fieldName}" en la pantalla de login.`);
}

/**
 * Inicia sesión. Idempotente: si ya hay sesión activa (panel
 * principal visible sin pantalla de login), no vuelve a loguear.
 */
export async function login(page: Page, config: EflConfig) {
  await page.goto('/');
  const userField = page.getByLabel(/correo/i).or(page.getByPlaceholder(/correo/i));
  if ((await userField.count()) === 0) {
    // Sin pantalla de login: verificar que estamos dentro.
    await expect(
      page.getByText(/MONITOREO Y REACCIÓN/i),
    ).toBeVisible({ timeout: 10_000 });
    return;
  }

  await fillField(
    page,
    [/correo electrónico o usuario/i, /correo/i, /usuario/i],
    config.user,
    'usuario',
  );
  await fillField(page, [/contraseña/i], config.pass, 'contraseña');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // El panel principal es la señal de login correcto.
  await expect(page.getByText(/MONITOREO Y REACCIÓN/i)).toBeVisible({
    timeout: 15_000,
  });
}

/**
 * Abre el menú del usuario pulsando el elemento `motum-avatar` de la
 * pantalla home, justo después del login exitoso.
 */
export async function abrirMenuUsuario(page: Page, config: EflConfig) {
  const avatar = page.locator('motum-avatar').first();
  await avatar.waitFor({ state: 'visible', timeout: 10_000 });
  await avatar.click();

  // El menú desplegado muestra el correo de la cuenta.
  await expect(page.getByText(config.user, { exact: false }).first()).toBeVisible({
    timeout: 5_000,
  });
}

/**
 * Abre la sección "Viendo como". Si no está visible, pulsa el caret
 * pequeño (~14×14 px) a la derecha del nombre en el menú abierto.
 */
export async function abrirViendoComo(page: Page) {
  const viendoComo = page.getByText(/viendo como/i);
  if ((await viendoComo.count()) > 0 && (await viendoComo.first().isVisible())) {
    return;
  }
  // Caret: icono <i>/<svg> al borde derecho de la fila del nombre.
  const caret = page.locator('header i, header svg').last();
  await caret.click({ timeout: 5_000 });
  await expect(page.getByText(/viendo como/i)).toBeVisible({ timeout: 5_000 });
}

/**
 * Ejecuta "Ver como": cliente, rol y usuario, y confirma con Aceptar.
 * "Aceptar" solo se habilita con las tres selecciones hechas.
 */
export async function seleccionarVerComo(
  page: Page,
  config: EflConfig,
) {
  await page.getByRole('button', { name: /seleccionar/i }).first().click();
  await expect(page.getByText(/ver como/i)).toBeVisible({ timeout: 5_000 });

  await page.getByText(config.client, { exact: true }).click();
  await page.getByText(config.role, { exact: true }).click();
  await page.getByText(config.testUser, { exact: false }).click();

  const aceptar = page.getByRole('button', { name: /aceptar/i, exact: true });
  await expect(aceptar).toBeEnabled({ timeout: 5_000 });
  await aceptar.click();
}
