# Square Gastro POS & KDS - Frontend de Alto Rendimiento

Sistema Frontend de Punto de Venta (POS) y Comandero Digital de Cocina (KDS) diseñado específicamente para el sector gastronómico de alto volumen en América Latina.

Este software refleja la arquitectura real de un sistema **tipo Square**:
- **Conexión 100% Real:** Sin simulaciones ni modo demo. Consume directamente los endpoints del backend Java SE puro (`http://localhost:8080`) conectado a PostgreSQL.
- **Separación de Espacios:**
  - **Backoffice Web (`#/admin`):** Pantalla administrativa para gestión y alta de colaboradores (asignación de Rol, DNI, nombres y PIN de 4 dígitos persistidos en base de datos vía `POST /api/v1/auth/register`).
  - **Terminal de Control Táctil (`#/terminal`):** Pantalla táctil para operarios con teclado numérico on-screen (PIN Pad) y marcación de asistencia (Clock-In y Clock-Out), libre de formularios de registro para máxima agilidad operativa.
  - **Comandero Digital KDS (`#/kitchen`):** Pantalla fija para jefes de cocina sin auto-bloqueo.
  - **Control de Stock (`#/stock`):** Panel de almacén con auto-bloqueo preventivo a los 90 segundos.

---

## 1. Estructura del Proyecto

```text
restaurant-front/
├── index.html                                 # Punto de entrada SPA
├── package.json                               # Scripts de desarrollo y dependencias
├── src/
│   ├── app.js                                 # Bootstrapper y coordinador global
│   ├── assets/styles/
│   │   ├── variables.css                      # Design Tokens (Paleta 60-30-10, ergonomía)
│   │   ├── reset.css                          # Reset táctil para 60/120 fps
│   │   └── base.css                           # Glassmorphism y microanimaciones
│   ├── core/
│   │   ├── config/env.js                      # Configuración de URLs y roles
│   │   ├── http/api-client.js                 # Adaptador HTTP nativo hacia :8080
│   │   ├── http/http-error.js                 # Wrapper simétrico a ErrorResponse
│   │   ├── storage/session-store.js           # Almacén de sesión y tokens JWT
│   │   ├── security/inactivity-timer.js       # Gestor de auto-bloqueo vs pantalla fija
│   │   ├── router/router.js                   # Enrutador cliente (Hash Router)
│   │   └── events/event-bus.js                # Bus de eventos desacoplado
│   ├── modules/
│   │   ├── admin/                             # VISTA DE ADMINISTRADOR (BACKOFFICE)
│   │   │   ├── admin.template.js              # Template HTML de gestión y registro
│   │   │   ├── admin.css                      # Estilos del panel gerencial
│   │   │   └── admin.controller.js            # Lógica de alta de usuarios (POST /register)
│   │   ├── auth/                              # TERMINAL DE CONTROL TÁCTIL (OPERARIOS)
│   │   │   ├── auth.template.js               # Template con Numpad táctil y reloj oficial
│   │   │   ├── auth.css                       # Estilos táctiles (Dual-pane, Glassmorphism)
│   │   │   ├── auth.service.js                # Adaptador de salida HTTP (/login-pin, /asistencia)
│   │   │   ├── auth.controller.js             # Controlador del PIN Pad y navegación
│   │   │   ├── components/
│   │   │   │   ├── pin-pad.component.js       # Teclado táctil on-screen 4 dígitos
│   │   │   │   └── attendance-modal.component.js # Modal Clock-In / Clock-Out
│   │   │   └── models/auth.models.js          # DTOs simétricos a Java
│   │   ├── kitchen/                           # PRODUCCIÓN EN COCINA (KDS)
│   │   │   ├── kitchen.template.js
│   │   │   ├── kitchen.css
│   │   │   └── kitchen.controller.js
│   │   └── stock/                             # CONTROL DE STOCK E INSUMOS
│   │       ├── stock.template.js
│   │       ├── stock.css
│   │       └── stock.controller.js
│   └── shared/
│       ├── components/toast.component.js      # Alertas flotantes de alta visibilidad
│       └── utils/dom.js                       # Utilidades DOM y Web Audio háptico
```

---

## 2. Flujo de Navegación y Vistas (Arquitectura Square)

### A. Vista de Administrador — Backoffice Web (`#/admin`)
- **Acceso:** Destinado a administradores, gerentes y encargados de recursos humanos desde navegadores de escritorio o tablets gerenciales.
- **Funcionalidades:**
  - **Alta de Colaboradores:** Formulario validado para registrar personal asignando Rol (`ADMIN`, `ALMACENERO`, `COCINA`, `MOZO`, `CAJERO`), Tipo y Número de Documento (DNI), Nombres, Apellidos, Nombre de Usuario y PIN de 4 dígitos numéricos.
  - **Persistencia Directa:** Envía la petición `POST /api/v1/auth/register` al backend Java, el cual hashea criptográficamente el PIN y lo almacena en PostgreSQL.
  - **Directorio del Equipo:** Lista en tiempo real de colaboradores registrados con botones para copiar su DNI y probarlos de inmediato en la terminal.
  - **Enlace Rápido:** Botón en la cabecera *"Ir a Terminal Táctil (POS / KDS) ➔"*.

### B. Vista de Terminal de Control — Acceso Operativo Táctil (`#/terminal`)
- **Acceso:** Pantallas táctiles POS situadas en cajas, estaciones de mozo, mesas de despacho o handhelds de almacén.
- **Diseño Operativo:** **Cero formularios de registro**. Los operarios sólo ven:
  1. Reloj oficial del restaurante sincronizado en tiempo real.
  2. Selector rápido de colaborador o ingreso de DNI/Usuario.
  3. **Teclado Táctil 3x4 (Numpad):** Botones ergonómicos de gran tamaño (mínimo 72px) para ingreso instantáneo del PIN de 4 dígitos.
  4. **Marcación de Asistencia (Planilla Perú):** Si el colaborador aún no ha marcado entrada hoy (`requiresClockIn: true`), el sistema despliega automáticamente el modal de **Clock-In / Clock-Out** antes de permitir el acceso.
  5. **Redirección por Rol:**
     - `COCINA` ➔ Comandero Digital KDS (`#/kitchen`)
     - `ALMACENERO` ➔ Control de Insumos (`#/stock`)
     - `ADMIN` ➔ Backoffice Administrativo (`#/admin`)
     - `CAJERO` / `MOZO` ➔ Terminal de Caja / KDS

---

## 3. Principios de Diseño UI/UX

- **Regla de Color 60-30-10:**
  - **60% Fondo:** `#F8FAFC` (Slate neutro limpio anti-fatiga para jornadas largas).
  - **30% Estructura y Textos:** `#0F172A` (Azul marino profundo para tarjetas, barras y jerarquía tipográfica).
  - **10% Color de Marca:** `#E15A2B` (Naranja terracotta reservado para botones interactivos principales y confirmaciones).
- **Acentos Funcionales:**
  - **Éxito (`#10B981`):** Marcaciones de entrada (`Clock-In`), turnos activos, stock óptimo.
  - **Alerta (`#F59E0B`):** Marcaciones de salida (`Clock-Out`), insumos bajo umbral mínimo.
  - **Peligro (`#EF4444`):** Feedback de PIN incorrecto con animación física *shake*.
- **Ergonomía Táctil:** Retroalimentación acústica mediante **Web Audio API** que reproduce un sutil clic háptico al pulsar el numpad.

---

## 4. Endpoints del Backend Java SE (`http://localhost:8080`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Registro de nuevos colaboradores (Backoffice). |
| `POST` | `/api/v1/auth/login-pin` | Autenticación rápida por PIN de 4 dígitos (Terminal). |
| `POST` | `/api/v1/asistencia/clock-in` | Registro de marcación de entrada (Planilla Perú). |
| `POST` | `/api/v1/asistencia/clock-out` | Registro de salida y fin de jornada laboral. |

---

## 5. Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abra el navegador en:
- **Terminal Operativo Táctil:** `http://localhost:5173/#/terminal`
- **Backoffice Administrador:** `http://localhost:5173/#/admin`
