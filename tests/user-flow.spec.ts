import { test, expect } from "@playwright/test";
import { closeWelcomeModal, navigateToFirstSpace } from "./helpers/test-utils";

test("Flujo completo: Registro → Explorar → Unirse a Space → Crear Post", async ({
  page,
}) => {
  test.setTimeout(120000);

  const timestamp = Date.now();

  // 1️⃣ REGISTRO
  await page.goto("/register");

  await page.fill("#name", "Test");
  await page.fill("#lastName", "Usuario");
  await page.fill("#email", `test.${timestamp}@cpihub.test`);
  await page.fill("#password", "password123");

  await page.click('button[type="submit"]');
  await page.waitForURL(/.*explorar/, { timeout: 15000 });

  // 2️⃣ EXPLORAR
  await expect(page.locator('h2:has-text("Explorar")')).toBeVisible();

  await closeWelcomeModal(page);

  await page.waitForTimeout(2000);

  // 3️⃣ ENTRAR A UN SPACE
  await navigateToFirstSpace(page);

  // 4️⃣ UNIRSE AL SPACE
  await page.waitForTimeout(1500);

  const joinButton = page
    .locator('.join-space-btn, button:has-text("Unirse")')
    .first();
  if (await joinButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await joinButton.click();
    await page.waitForTimeout(1500);
  }

  // 5️⃣ CREAR POST
  const createPostBtn = page
    .locator('button.create-post-btn, button:has-text("Crear post")')
    .first();
  await expect(createPostBtn).toBeVisible({ timeout: 5000 });
  await createPostBtn.click();

  const modal = page.locator(".create-post-modal");
  await modal.waitFor({ state: "visible", timeout: 5000 });

  const titleInput = modal.locator('#post-title, input[name="title"]').first();
  const contentInput = modal
    .locator(
      'textarea.textarea-with-image, textarea[placeholder*="descripción" i]'
    )
    .first();

  await titleInput.fill(`Post de prueba ${timestamp}`);
  await contentInput.fill("Contenido del post de prueba");

  const submitBtn = modal
    .locator('button.btn-create:has-text("Crear Post"), button.btn-create')
    .first();
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  await submitBtn.click();

  const navigated = await page
    .waitForURL(/.*\/post\/\d+/, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  if (!navigated) {
    const successToast = await page
      .locator('.success-notification:has-text("Post creado correctamente")')
      .first()
      .waitFor({ state: "visible", timeout: 7000 })
      .then(() => true)
      .catch(() => false);
    if (!successToast) {
      await submitBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // Dar tiempo a que la página del post cargue por completo
  await page.waitForLoadState("domcontentloaded");
  await page
    .locator(".post-page")
    .first()
    .waitFor({ state: "visible", timeout: 3000 })
    .catch(() => {});

  await expect(page.locator(`text=Post de prueba ${timestamp}`)).toBeVisible({
    timeout: 3000,
  });

  console.log("✅ Test completado (flujo principal)");
});
