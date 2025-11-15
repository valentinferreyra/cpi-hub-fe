import { test, expect } from "@playwright/test";
import {
  closeWelcomeModal,
  navigateToFirstSpace,
  joinSpace,
  createPost,
  registerUser,
  generateTestUser,
} from "./helpers/test-utils";

test("Flujo completo: Registro → Explorar → Unirse a Space → Crear Post", async ({
  page,
}) => {
  test.setTimeout(90_000);

  const user = generateTestUser();
  const postTitle = `Post de prueba ${Date.now()}`;

  await test.step("Registro de usuario", async () => {
    await registerUser(page, user);
    await expect(page).toHaveURL(/.*explorar/);
  });

  await test.step("Explorar y cerrar modal de bienvenida", async () => {
    await expect(
      page.getByRole("heading", { name: /Explorar/i })
    ).toBeVisible();
    await closeWelcomeModal(page);
  });

  await test.step("Navegar al primer Space disponible", async () => {
    await navigateToFirstSpace(page);
    await expect(page).toHaveURL(/\/space\//);
  });

  await test.step("Unirse al Space", async () => {
    await joinSpace(page);
  });

  await test.step("Crear un nuevo post", async () => {
    await createPost(page, {
      title: postTitle,
      content: "Contenido del post de prueba",
    });
  });

  await test.step("Verificar post creado", async () => {
    // Verificar que estamos en la página del post
    await expect(page).toHaveURL(/\/post\//);
    await expect(
      page.locator("h1.post-title", { hasText: postTitle })
    ).toBeVisible({ timeout: 5000 });
  });
});
