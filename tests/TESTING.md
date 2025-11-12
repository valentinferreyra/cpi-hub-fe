# 🎯 Guía Rápida de Tests E2E

## 🚀 Inicio Rápido

### 1. Ejecutar el test principal (modo UI - RECOMENDADO)

```bash
npm run test:ui
```

**Esto abrirá una interfaz visual donde podrás:**
- ✅ Ver el navegador en acción
- ✅ Pausar en cualquier momento
- ✅ Ver cada paso del test
- ✅ Inspeccionar el DOM
- ✅ Ver screenshots automáticos

### 2. Ejecutar en modo headed (ver navegador)

```bash
npm run test:headed
```

Verás el navegador abrirse y ejecutar el test automáticamente.

### 3. Ejecutar en modo headless (sin ver navegador)

```bash
npm test
```

Ideal para CI/CD o cuando solo quieres resultados rápidos.

## 📁 Archivos de Tests

| Archivo | Descripción |
|---------|-------------|
| `user-flow.spec.ts` | ⭐ **Test principal completo** - Flujo completo con comentarios detallados |
| `user-flow-simple.spec.ts` | Test simplificado usando helpers |
| `features.spec.ts` | Tests de features específicas (login, responsividad, etc.) |
| `helpers/test-utils.ts` | Utilidades reutilizables |

## 🎬 El Test Principal hace esto:

1. **Registro** → Crea un usuario nuevo con email único
2. **Explorar** → Verifica que carga la página de explorar
3. **Entrar a Space** → Hace clic en el primer space disponible
4. **Unirse** → Se une al space
5. **Crear Post** → Crea un nuevo post con título y contenido

## 📸 Screenshots

Durante el test se toman screenshots en cada paso:
- `01-registro-formulario`
- `02-explorar`
- `03-antes-entrar-space`
- `04-vista-space`
- `05-despues-unirse`
- `06-formulario-post`
- `07-post-creado`

Ubicación: `test-results/`

## 🐛 Si algo falla

### Ver el reporte HTML
```bash
npm run test:report
```

### Ejecutar en modo debug
```bash
npm run test:debug
```

### Ver screenshots
Revisa la carpeta `test-results/` para ver capturas de pantalla.

## 💡 Comandos Útiles

```bash
# Ejecutar solo UN test específico
npx playwright test user-flow.spec.ts

# Ejecutar en modo slow motion (ver mejor qué pasa)
npx playwright test --headed --slow-mo=1000

# Generar código de test automáticamente
npx playwright codegen http://localhost:5173

# Ver qué tests hay disponibles
npx playwright test --list
```

## ⚙️ Antes de ejecutar

**IMPORTANTE:** Los tests necesitan que el servidor esté corriendo. Sigue estos pasos:

### Paso 1: Iniciar el servidor frontend
```bash
npm run dev
```

Deja esta terminal abierta. Deberías ver algo como:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Paso 2: Abrir una NUEVA terminal

### Paso 3: Ejecutar los tests
```bash
npm run test:ui
```

**Resumen:**
1. ✅ Terminal 1: `npm run dev` (dejar corriendo)
2. ✅ Terminal 2: `npm run test:ui`
3. ✅ El backend debe estar corriendo también

## 🎓 Aprende más

Lee el archivo `tests/README.md` para información completa sobre:
- Cómo escribir nuevos tests
- Best practices
- Debugging avanzado
- Configuración
