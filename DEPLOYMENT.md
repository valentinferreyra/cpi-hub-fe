# Guía de Deployment - CPI Hub Frontend

## 📋 Análisis y Consideraciones Previas

### ⚠️ Puntos Críticos Identificados

1. **URLs Hardcodeadas**
   - El archivo `src/api/websocket.ts` tiene URLs hardcodeadas a `localhost:8080`
   - El archivo `src/api/client.ts` usa `/v1` como baseURL relativo (funciona en desarrollo con proxy, pero necesita configuración en producción)

2. **Variables de Entorno**
   - No existe configuración de variables de entorno actualmente
   - Necesitamos crear variables para:
     - URL del backend API (REST)
     - URL del backend WebSocket

3. **Configuración de Vite**
   - El proxy configurado en `vite.config.ts` solo funciona en desarrollo
   - En producción, las peticiones deben ir directamente al backend

4. **CORS**
   - Verificar que el backend en `https://cpi-hub-api.onrender.com` tenga configurado CORS para aceptar peticiones desde el dominio de Vercel

5. **WebSockets**
   - Render.com puede tener restricciones con WebSockets
   - Verificar que el backend soporte conexiones WebSocket (wss://) desde el frontend

---

## 🚀 Pasos para Deployar en Vercel

### Paso 1: Preparar el Código para Producción

#### 1.1. Archivo de configuración de variables de entorno

Ya se ha creado un archivo `.env.example` en la raíz del proyecto con las variables necesarias. Este archivo documenta las variables pero no se commitea (está en .gitignore).

**Nota**: Para desarrollo local, puedes crear un archivo `.env.local` (tampoco se commitea) con:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080
```

#### 1.2. Modificar `src/api/client.ts`

Cambiar la baseURL para usar variables de entorno:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

#### 1.3. Modificar `src/api/websocket.ts`

Cambiar las URLs hardcodeadas para usar variables de entorno:

```typescript
const WEBSOCKET_BASE_URL = import.meta.env.VITE_WS_BASE_URL + '/v1/ws';
```

#### 1.4. Verificar que Vite esté configurado correctamente

El archivo `vite.config.ts` ya está bien configurado. El proxy solo se usa en desarrollo, así que no afecta la producción.

---

### Paso 2: Configurar el Repositorio en GitHub

1. **Asegurarse de que el código esté en GitHub**
   ```bash
   git status
   git add .
   git commit -m "Preparar código para deployment"
   git push origin develop
   ```

2. **Verificar que el branch `develop` o `main` esté actualizado**

---

### Paso 3: Crear Cuenta y Proyecto en Vercel

1. **Ir a [vercel.com](https://vercel.com)**
2. **Iniciar sesión con GitHub** (recomendado para integración automática)
3. **Hacer clic en "Add New Project"**
4. **Importar el repositorio** `cpi-hub-fe`
5. **Seleccionar el repositorio** de la lista

---

### Paso 4: Configurar el Proyecto en Vercel

#### 4.1. Configuración del Framework Preset

- **Framework Preset**: Vite (debería detectarse automáticamente)
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build` (ya está en package.json)
- **Output Directory**: `dist` (default de Vite)
- **Install Command**: `npm install`

#### 4.2. Configurar Variables de Entorno

En la sección "Environment Variables", agregar:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `VITE_API_BASE_URL` | `https://cpi-hub-api.onrender.com` | Production, Preview, Development |
| `VITE_WS_BASE_URL` | `wss://cpi-hub-api.onrender.com` | Production, Preview, Development |

**Nota**: Vercel requiere el prefijo `VITE_` para que las variables sean accesibles en el código del frontend.

#### 4.3. Configuración Adicional

- **Node.js Version**: Dejar el default (o especificar 18.x si es necesario)
- **Override Settings**: No es necesario modificar nada más

---

### Paso 5: Deployar

1. **Hacer clic en "Deploy"**
2. **Esperar a que termine el build** (puede tomar 2-5 minutos la primera vez)
3. **Revisar los logs** si hay errores

---

### Paso 6: Verificar el Deployment

1. **Probar la aplicación** en la URL proporcionada por Vercel (ej: `https://cpi-hub-fe.vercel.app`)
2. **Verificar que las peticiones API funcionen**:
   - Abrir DevTools → Network
   - Intentar hacer login o cualquier acción que haga peticiones al backend
   - Verificar que las peticiones vayan a `https://cpi-hub-api.onrender.com/v1/...`
3. **Verificar WebSockets**:
   - Abrir DevTools → Network → WS
   - Verificar que las conexiones WebSocket se establezcan a `wss://cpi-hub-api.onrender.com/v1/ws/...`

---

### Paso 7: Configurar Dominio Personalizado (Opcional)

1. **Ir a Settings → Domains**
2. **Agregar dominio personalizado** si lo tienes
3. **Seguir las instrucciones** de Vercel para configurar DNS

---

## 🔧 Cambios de Código Realizados

### ✅ Archivo: `src/api/client.ts`

**Cambio aplicado**: Ahora usa variables de entorno para la baseURL
```typescript
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "") + "/v1",
  // ...
});
```

**Nota**: En desarrollo local, si `VITE_API_BASE_URL` está vacío, usará `/v1` (relativo), lo que funciona con el proxy de Vite. En producción, se debe configurar la variable de entorno.

### ✅ Archivo: `src/api/websocket.ts`

**Cambio aplicado**: Ahora usa variables de entorno para la URL del WebSocket
```typescript
const WEBSOCKET_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080') + '/v1/ws';
```

**Nota**: En desarrollo local, si no se define la variable, usará `ws://localhost:8080`. En producción, se debe configurar `wss://cpi-hub-api.onrender.com`.

---

## ✅ Checklist Pre-Deployment

- [x] Modificar `src/api/client.ts` para usar variable de entorno ✅ **COMPLETADO**
- [x] Modificar `src/api/websocket.ts` para usar variable de entorno ✅ **COMPLETADO**
- [x] Agregar reconexión automática a `useUserConnection.ts` ✅ **COMPLETADO**
- [x] Agregar reconexión automática a `useWebSocket.ts` ✅ **COMPLETADO**
- [ ] Crear archivo `.env.local` para desarrollo local (opcional)
- [ ] Probar build local: `npm run build`
- [ ] Verificar que el build se crea correctamente en la carpeta `dist`
- [ ] Verificar que no hay errores de TypeScript: `npm run build` (incluye `tsc -b`)
- [ ] Verificar que no hay errores de linting: `npm run lint`
- [ ] Commitear y pushear los cambios a GitHub
- [ ] Verificar que el backend tiene CORS configurado para aceptar peticiones desde Vercel
- [ ] Verificar que el backend soporta WebSockets (wss://)

---

## ✅ Checklist Post-Deployment

- [ ] Verificar que la aplicación carga correctamente
- [ ] Probar login/registro
- [ ] Verificar que las peticiones API funcionan (Network tab)
- [ ] Verificar que los WebSockets se conectan correctamente
- [ ] Probar funcionalidades principales de la aplicación
- [ ] Verificar en diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Verificar en dispositivos móviles (responsive)

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" o CORS

**Solución**: Verificar que el backend tenga configurado CORS para aceptar peticiones desde el dominio de Vercel.

```go
// Ejemplo de configuración CORS en Go (si es tu backend)
allowedOrigins := []string{
    "https://tu-app.vercel.app",
    "https://*.vercel.app", // Para preview deployments
}
```

### Error: WebSocket connection failed

**Posibles causas**:
1. El backend no soporta WebSockets
2. La URL del WebSocket está mal configurada (usar `wss://` no `ws://`)
3. El servicio en Render está dormido (plan gratuito)
4. Problemas de CORS o firewall

**Solución**: 
- ✅ Verificar que la variable `VITE_WS_BASE_URL` esté configurada como `wss://cpi-hub-api.onrender.com` en Vercel
- ✅ Verificar que el backend en Render.com tenga WebSockets habilitados
- ✅ Revisar los logs del backend en Render.com
- ✅ La reconexión automática debería manejar desconexiones temporales
- ✅ Si el servicio está dormido, la primera petición lo reactivará (puede tardar 30-60 segundos)

### Error: WebSocket se desconecta frecuentemente

**Causa probable**: El servicio en Render se duerme después de 15 minutos de inactividad (plan gratuito).

**Solución**:
- ✅ La reconexión automática ya está implementada en los hooks
- Considerar usar un servicio de ping periódico (ej: UptimeRobot) para mantener el servicio activo
- O actualizar a un plan de pago en Render que no se duerma

### Error: Variables de entorno no funcionan

**Solución**: 
- Verificar que las variables en Vercel tengan el prefijo `VITE_`
- Verificar que se hayan configurado para todos los entornos (Production, Preview, Development)
- Hacer un nuevo deploy después de agregar las variables

### Build falla en Vercel

**Solución**:
- Revisar los logs de build en Vercel
- Verificar que `package.json` tenga el script `build` correcto
- Verificar que no haya errores de TypeScript localmente antes de pushear

---

## 📝 Notas Adicionales

### Sobre Render.com y WebSockets

**✅ Buena noticia: Render soporta WebSockets**

Tu implementación con Gorilla WebSocket es compatible con Render. Sin embargo, hay consideraciones importantes:

#### 1. Protocolo: Usar WSS (no WS)

En producción, el frontend **debe usar `wss://` (WebSocket Secure)**, no `ws://`:

```typescript
// ❌ NO usar en producción:
const ws = new WebSocket('ws://cpi-hub-api.onrender.com/v1/ws/notifications?user_id=15');

// ✅ Usar en producción:
const ws = new WebSocket('wss://cpi-hub-api.onrender.com/v1/ws/notifications?user_id=15');
```

Render proporciona HTTPS automático, así que `wss://` funciona automáticamente.

**Nota**: El código ya está configurado para usar `VITE_WS_BASE_URL`, que debe ser `wss://cpi-hub-api.onrender.com` en producción.

#### 2. Servicio que se duerme (Plan Gratuito)

**Problema**: El servicio en Render se duerme después de **15 minutos de inactividad**.

**Consecuencias**:
- Las conexiones WebSocket se pierden cuando el servicio se duerme
- Se reactivan en la primera petición (puede tardar 30-60 segundos)
- Los usuarios pueden experimentar desconexiones inesperadas

**Solución implementada**: 
- ✅ `useNotifications.ts` ya tiene reconexión automática (3 segundos)
- ✅ `useUserConnection.ts` ahora tiene reconexión automática (3 segundos)
- ✅ `useWebSocket.ts` (chat) ahora tiene reconexión automática (3 segundos)

Todos los hooks de WebSocket ahora implementan reconexión automática para manejar desconexiones cuando el servicio en Render se duerme.

**Recomendaciones adicionales**:
- Considerar implementar un servicio de ping periódico para mantener el servicio activo
- O usar un servicio de monitoreo externo (ej: UptimeRobot) que haga peticiones cada 10-14 minutos

#### 3. Sin Sticky Sessions (No aplica en plan gratuito)

- Render no tiene sticky sessions
- En el plan gratuito solo hay **1 instancia**, así que no hay problema
- Si escalas a múltiples instancias en el futuro, las conexiones pueden ir a diferentes servidores

#### 4. Recursos Limitados (Plan Gratuito)

- RAM/CPU limitados
- Con muchas conexiones simultáneas puede haber problemas
- Tu configuración actual tiene `MaxConnections: 50`, lo cual es razonable

#### 5. Verificación Post-Deployment

Después del deploy, verificar:

1. ✅ Conectar desde el frontend usando `wss://`
2. ✅ Verificar que las conexiones se mantengan
3. ✅ Probar reconexión si el servicio se duerme
4. ✅ Monitorear los logs en Render para ver si hay errores
5. ✅ Verificar que el puerto se lea correctamente del entorno (`PORT`)

#### 6. Timeouts Recomendados

Tu backend ya tiene configurados timeouts razonables:
- `PongWait: 60 * time.Second`
- `PingPeriod: 54 * time.Second`

Estos valores son apropiados para mantener las conexiones vivas.

### Sobre Vercel

- **Plan Gratuito**: Incluye deployments ilimitados, 100GB de bandwidth, y dominio `.vercel.app`
- **Preview Deployments**: Cada push a una branch crea un preview deployment automáticamente
- **Build Time**: El plan gratuito tiene un límite de build time, pero es suficiente para proyectos pequeños/medianos

### Variables de Entorno en Desarrollo Local

Para desarrollo local, crear un archivo `.env.local` (no commitearlo):

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080
```

Y actualizar `vite.config.ts` para que el proxy use la variable de entorno si está disponible.

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a la branch principal (o la branch conectada), Vercel automáticamente:
1. Detectará los cambios
2. Ejecutará el build
3. Desplegará la nueva versión

Los preview deployments se crean automáticamente para cada pull request.

---

## 📞 Soporte

Si encuentras problemas durante el deployment:
1. Revisar los logs de build en Vercel
2. Revisar los logs del backend en Render.com
3. Verificar la consola del navegador (F12) para errores
4. Verificar la pestaña Network para ver las peticiones fallidas

---

**Última actualización**: Enero 2025
