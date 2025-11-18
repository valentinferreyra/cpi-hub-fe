import { Page } from "@playwright/test";

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
 * Cierra el modal de bienvenida si aparece
 */
export async function closeWelcomeModal(page: Page): Promise<void> {
  const modalLocator = page.locator(".welcome-overlay");

  const isVisible = await modalLocator
    .waitFor({ state: "visible", timeout: 2000 })
    .then(() => true)
    .catch(() => false);

  if (!isVisible) {
    return;
  }

  const startButton = page
    .locator('button:has-text("Empezar a explorar")')
    .first();

  await startButton.click({ timeout: 3000 });

  // Esperar a que el modal se cierre
  await modalLocator.waitFor({ state: "detached", timeout: 3000 });
}

/**
 * Navega al primer space disponible en la página de exploración
 */
export async function navigateToFirstSpace(page: Page): Promise<void> {
  const cards = page.locator(".explore-grid .space-card");
  await cards.first().waitFor({ state: "visible", timeout: 10000 });

  const firstCard = cards.first();
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.click();

  await page.waitForURL(/.*\/space\/\d+/, { timeout: 10000 });
}

/**
 * Une al usuario al space si el botón de unirse está disponible
 */
export async function joinSpace(page: Page): Promise<void> {
  const joinButton = page.locator('button:has-text("Unirse")').first();

  // Verificar si el botón de unirse está visible
  const isVisible = await joinButton
    .waitFor({ state: "visible", timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (isVisible) {
    await joinButton.click();
    // Esperar a que el botón desaparezca o la página cargue
    await Promise.race([
      joinButton.waitFor({ state: "detached", timeout: 5000 }),
      page.waitForLoadState("networkidle"),
    ]).catch(() => {});
  }
}

/**
 * Crea un nuevo post en el space actual
 */
export async function createPost(
  page: Page,
  postData: {
    title: string;
    content: string;
  }
): Promise<void> {
  // Hacer clic en el botón de crear post
  const createPostButton = page
    .locator('button:has-text("Crear post")')
    .first();
  await createPostButton.waitFor({ state: "visible", timeout: 5000 });
  await createPostButton.click();

  // Esperar a que aparezca el modal
  const modal = page.locator(".create-post-modal");
  await modal.waitFor({ state: "visible", timeout: 5000 });

  // Completar el formulario
  const titleInput = modal.locator('#post-title, input[name="title"]').first();
  const contentInput = modal
    .locator(
      'textarea.textarea-with-image, textarea[placeholder*="descripción" i]'
    )
    .first();

  await titleInput.fill(postData.title);
  await contentInput.fill(postData.content);

  // Enviar el formulario
  const submitPostButton = modal
    .locator('button.btn-create:has-text("Crear Post"), button.btn-create')
    .first();
  await submitPostButton.waitFor({ state: "visible", timeout: 5000 });
  await submitPostButton.click();
}
