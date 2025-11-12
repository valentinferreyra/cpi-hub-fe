import { test, expect } from "@playwright/test";
import { closeWelcomeModal } from "./helpers/test-utils";

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

  // Cerrar modal de bienvenida usando helper robusto
  await closeWelcomeModal(page);

  await page.waitForTimeout(2000);

  // 3️⃣ ENTRAR A UN SPACE
  const spaceCard = page.locator('.space-card, [class*="space"]').first();
  await expect(spaceCard).toBeVisible({ timeout: 10000 });

  await spaceCard.click();
  await page.waitForURL(/.*\/space\/\d+/, { timeout: 10000 });

  // 4️⃣ UNIRSE AL SPACE
  await page.waitForTimeout(1500);

  const joinButton = page.locator('button:has-text("Unirse")').first();
  if (await joinButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await joinButton.click();
    await page.waitForTimeout(1500);
  }

  // 5️⃣ CREAR POST
  const createPostBtn = page.locator('button:has-text("Crear post")').first();
  await expect(createPostBtn).toBeVisible({ timeout: 5000 });
  await createPostBtn.click();

  await page.waitForTimeout(1000);

  const titleInput = page
    .locator('input[placeholder*="título"], input[name="title"]')
    .first();
  const contentInput = page
    .locator('textarea[placeholder*="contenido"], textarea[name="content"]')
    .first();

  await titleInput.fill(`Post de prueba ${timestamp}`);
  await contentInput.fill("Contenido del post de prueba");

  const submitBtn = page
    .locator('button:has-text("Crear"), button:has-text("Publicar")')
    .last();
  await submitBtn.click();

  await page.waitForTimeout(2000);

  // Validar que el post (por título) aparece en la página (optimista, puede adaptarse según UI real)
  await expect(page.locator(`text=Post de prueba ${timestamp}`)).toBeVisible({
    timeout: 5000,
  });

  console.log("✅ Test completado (flujo principal)");
});
