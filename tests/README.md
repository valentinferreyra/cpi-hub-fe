# Tests E2E con Playwright

Este directorio contiene los tests End-to-End (E2E) para CPIHub usando Playwright.

## 📋 Contenido

- **`user-flow.spec.ts`** - Test completo del flujo de usuario con comentarios detallados
- **`user-flow-simple.spec.ts`** - Versión simplificada usando helpers
- **`helpers/test-utils.ts`** - Funciones de utilidad reutilizables
- **`example.spec.ts`** - Test de ejemplo de Playwright (puedes eliminarlo)

## 🚀 Cómo ejecutar los tests

### Requisitos previos

1. Asegúrate de tener el backend corriendo
2. La aplicación frontend debería estar lista para servirse

### Comandos básicos

```bash
# Ejecutar todos los tests (en modo headless)
npm run test

# Ejecutar tests en modo UI (con interfaz visual)
npx playwright test --ui

# Ejecutar un test específico
npx playwright test user-flow.spec.ts

# Ejecutar tests en modo headed (ver el navegador)
npx playwright test --headed

# Ejecutar tests en un navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Ejecutar tests en modo debug
npx playwright test --debug
```

### Ver resultados

```bash
# Abrir el reporte HTML después de ejecutar los tests
npx playwright show-report
```

## 🎯 Test: Flujo completo de usuario

El test principal simula el siguiente flujo:

1. **Registro** - Crea un nuevo usuario
2. **Explorar** - Visualiza la página de explorar
3. **Entrar a Space** - Navega a un space existente
4. **Unirse** - Se une al space seleccionado
5. **Crear Post** - Crea un nuevo post en el space

### Características

- ✅ Genera datos únicos para cada ejecución (evita conflictos)
- 📸 Captura screenshots en cada paso
- 📝 Logs detallados en consola
- ⏱️ Timeouts configurados apropiadamente
- 🎬 Graba video en caso de fallo

## 📸 Screenshots

Los screenshots se guardan automáticamente en:
- `test-results/` - Screenshots durante la ejecución
- `playwright-report/` - Reporte HTML con evidencias

## 🔍 Modo UI (Recomendado para desarrollo)

El **modo UI** es perfecto para ver qué está pasando:

```bash
npx playwright test --ui
```

Características del modo UI:
- 👀 Ve el navegador en acción
- ⏸️ Pausa y avanza paso a paso
- 🔍 Inspecciona el DOM en cada paso
- 📊 Ve los locators que está usando
- 🐛 Facilita el debugging

## 🎥 Ver los tests en acción

Para ver los tests ejecutándose en tiempo real:

```bash
# Modo headed (ver navegador)
npx playwright test --headed

# Modo headed + slow motion (más lento para ver mejor)
npx playwright test --headed --slow-mo=1000
```

## 🐛 Debugging

Si un test falla, tienes varias opciones:

### 1. Modo debug
```bash
npx playwright test --debug
```

### 2. Ver el trace
```bash
# Los traces se generan automáticamente en el primer reintento
npx playwright show-trace trace.zip
```

### 3. Screenshots
Revisa las capturas en `test-results/` para ver dónde falló

### 4. Video
Los videos se graban automáticamente cuando hay fallos

## 📝 Escribir nuevos tests

### Ejemplo básico

```typescript
import { test, expect } from '@playwright/test';

test('mi nuevo test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('CPIHub');
});
```

### Usando helpers

```typescript
import { test } from '@playwright/test';
import { registerUser, generateTestUser } from './helpers/test-utils';

test('test con helpers', async ({ page }) => {
  const user = generateTestUser();
  await registerUser(page, user);
  // ... resto del test
});
```

## 🔧 Configuración

La configuración de Playwright está en `playwright.config.ts`:

- **baseURL**: `http://localhost:3000`
- **Navegadores**: Chromium, Firefox, WebKit
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Traces**: En el primer reintento

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

## 💡 Tips

1. **Usa el inspector de Playwright** para generar locators:
   ```bash
   npx playwright codegen http://localhost:3000
   ```

2. **Los tests deberían ser independientes** - Cada test debe poder ejecutarse solo

3. **Usa data-testid cuando sea necesario** - Para elementos difíciles de seleccionar

4. **No uses timeouts fijos** - Usa waitFor en su lugar cuando sea posible

5. **Organiza por funcionalidad** - Agrupa tests relacionados con `test.describe()`

## 🎬 Próximos pasos

Ideas para expandir la suite de tests:

- ✅ Test de login
- ✅ Test de crear space
- ✅ Test de comentarios en posts
- ✅ Test de reacciones (likes/dislikes)
- ✅ Test de búsqueda
- ✅ Test de perfil de usuario
- ✅ Test de edición de post
- ✅ Test de responsive design
- ✅ Test de manejo de errores
