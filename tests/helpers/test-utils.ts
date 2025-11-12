import { Page, expect } from "@playwright/test";

/**
 * Utilidades para tests E2E de CPIHub
 */

/**
 * Genera un usuario de prueba único
 */
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    name: "Test",
    lastName: "Usuario",
    email: `test.usuario.${timestamp}@cpihub.test`,
    password: "test123456",
  };
}

/**
 * Registra un nuevo usuario en la aplicación
 */
export async function registerUser(
  page: Page,
  userData: {
    name: string;
    lastName: string;
    email: string;
    password: string;
  }
) {
  await page.goto("/register");

  await page.fill("#name", userData.name);
  await page.fill("#lastName", userData.lastName);
  await page.fill("#email", userData.email);
  await page.fill("#password", userData.password);

  await page.click('button[type="submit"]');

  // Esperar a que se complete el registro
  await page.waitForURL(/.*explorar/, { timeout: 15000 });
}

/**
 * Cierra el modal de bienvenida si está visible
 */
export async function closeWelcomeModal(page: Page): Promise<boolean> {
  await page.waitForTimeout(500);

  const modalLocator = page.locator(
    '.welcome-modal, [data-testid="welcome-modal"], .modal:has(.welcome-btn-primary), [role="dialog"]'
  );

  const isModalVisible = async () => {
    const modal = modalLocator.first();
    try {
      await modal.waitFor({ state: "visible", timeout: 200 });
      return true;
    } catch {
      return await modal.isVisible().catch(() => false);
    }
  };

  if (!(await isModalVisible())) {
    return false;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const primaryBtn = page.locator(".welcome-btn-primary").first();
    if (
      await primaryBtn
        .waitFor({ state: "visible", timeout: 300 })
        .then(() => true)
        .catch(() => false)
    ) {
      await primaryBtn.click().catch(() => {});
    } else {
      const textBtn = page
        .locator(
          'button:has-text("Cerrar"), button:has-text("Entendido"), button:has-text("Comenzar"), button:has-text("Continuar")'
        )
        .first();
      if (
        await textBtn
          .waitFor({ state: "visible", timeout: 300 })
          .then(() => true)
          .catch(() => false)
      ) {
        await textBtn.click().catch(() => {});
      } else {
        // 3) Cualquier botón dentro del modal
        const anyBtn = modalLocator.locator("button").first();
        if (
          await anyBtn
            .waitFor({ state: "visible", timeout: 300 })
            .then(() => true)
            .catch(() => false)
        ) {
          await anyBtn.click().catch(() => {});
        } else {
          // 4) Último recurso: Escape
          await page.keyboard.press("Escape").catch(() => {});
        }
      }
    }

    // Esperar desprendimiento / invisibilidad
    const detached = await modalLocator
      .first()
      .waitFor({ state: "detached", timeout: 1000 })
      .then(() => true)
      .catch(() => false);
    if (detached || !(await isModalVisible())) {
      return true;
    }

    // Pequeño delay antes del próximo intento
    await page.waitForTimeout(250);
  }

  if (await isModalVisible()) {
    await page
      .evaluate(() => {
        const el = document.querySelector(
          '.welcome-modal, [data-testid="welcome-modal"], .modal, [role="dialog"]'
        );
        if (el) el.remove();
      })
      .catch(() => {});
    await page.waitForTimeout(200);
    return true;
  }

  return true;
}

/**
 * Navega al primer space disponible
 */
export async function navigateToFirstSpace(page: Page): Promise<string> {
  const spaceCard = page.locator('.space-card, [class*="space"]').first();
  await expect(spaceCard).toBeVisible({ timeout: 10000 });

  const spaceName =
    (await spaceCard
      .locator('h3, .space-name, [class*="space-title"]')
      .first()
      .textContent()) || "Unknown Space";

  await spaceCard.click();
  await page.waitForURL(/.*\/space\/\d+/, { timeout: 10000 });

  return spaceName;
}

/**
 * Se une a un space si no está unido
 */
export async function joinSpace(page: Page) {
  await page.waitForTimeout(1500);

  const joinButton = page
    .locator('button:has-text("Unirse"), button:has-text("Join")')
    .first();

  if (
    await joinButton
      .waitFor({ state: "visible", timeout: 3000 })
      .then(() => true)
      .catch(() => false)
  ) {
    await joinButton.click();
    await page.waitForTimeout(1500);
  }
}

/**
 * Crea un post en el space actual
 */
export async function createPost(
  page: Page,
  postData: {
    title: string;
    content: string;
  }
) {
  // Hacer clic en crear post
  const createPostButton = page
    .locator('button:has-text("Crear post"), button:has-text("+ Crear post")')
    .first();
  await expect(createPostButton).toBeVisible({ timeout: 5000 });
  await createPostButton.click();

  // Esperar modal
  await page.waitForTimeout(1000);

  // Completar formulario
  const titleInput = page
    .locator(
      'input[placeholder*="título"], input[placeholder*="Título"], input[name="title"], #title'
    )
    .first();
  const contentInput = page
    .locator(
      'textarea[placeholder*="contenido"], textarea[placeholder*="Escribe"], textarea[name="content"], #content'
    )
    .first();

  await titleInput.fill(postData.title);
  await contentInput.fill(postData.content);

  // Enviar
  const submitPostButton = page
    .locator(
      'button:has-text("Crear"), button:has-text("Publicar"), button[type="submit"]'
    )
    .last();
  await submitPostButton.click();

  // Esperar confirmación
  await page.waitForTimeout(2000);
}

/**
 * Toma un screenshot con un nombre descriptivo
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = Date.now();
  await page.screenshot({
    path: `test-results/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Espera a que desaparezca el indicador de carga
 */
export async function waitForLoadingToFinish(page: Page) {
  // Esperar a que desaparezcan los spinners de carga
  const loadingSpinner = page
    .locator('.loading-spinner, .spinner, [class*="loading"]')
    .first();

  try {
    await loadingSpinner.waitFor({ state: "visible", timeout: 2000 });
    await loadingSpinner.waitFor({ state: "hidden", timeout: 10000 });
  } catch {
    // si no aparece visible, continuamos
  }

  // Esperar un poco más para asegurar que todo terminó de cargar
  await page.waitForTimeout(500);
}
