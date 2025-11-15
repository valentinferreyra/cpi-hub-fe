import { test, expect } from "@playwright/test";
import {
  closeWelcomeModal,
  navigateToFirstSpace,
  joinSpace,
  createPost,
  registerUser,
  generateTestUser,
  openPostByTitle,
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

  await test.step("Explorar y cerrar modal de bienvenida si aparece", async () => {
    await expect(
      page.getByRole("heading", { name: /Explorar/i })
    ).toBeVisible();
    await closeWelcomeModal(page);
  });

  await test.step("Entrar al primer Space disponible", async () => {
    await navigateToFirstSpace(page);
    await expect(page).toHaveURL(/\/space\//);
  });

  await test.step("Unirse al Space (si es necesario)", async () => {
    await joinSpace(page);
  });

  let navigatedToPost = false;
  await test.step("Crear un nuevo post", async () => {
    const res = await createPost(page, {
      title: postTitle,
      content: "Contenido del post de prueba",
    });
    navigatedToPost = res.navigated;
  });

  await test.step("Verificar post creado", async () => {
    if (!navigatedToPost) {
      await openPostByTitle(page, postTitle);
    }

    // Ahora deberíamos estar en la página del post
    await expect(page).toHaveURL(/\/post\//);
    await expect(
      page.locator("h1.post-title", { hasText: postTitle })
    ).toBeVisible({ timeout: 5000 });
  });
});
