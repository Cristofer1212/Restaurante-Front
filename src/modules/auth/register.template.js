/**
 * PLANTILLA HTML: REGISTRO Y LOGIN DE ADMINISTRADOR / DUEÑO (register.template.js)
 * 
 * Flujo de inicio para el Dueño del Negocio al pulsar "Empezar":
 * - Formulario de creación de cuenta de Administrador (rolId: 1)
 * - Pestaña alternativa de inicio de sesión para administradores existentes
 * - Guardado en PostgreSQL vía POST /api/v1/auth/register y login ágil por PIN.
 */

export const registerHtml = `
<div class="register-view animate-fade-in">

  <!-- Barra Superior del Registro -->
  <header class="register-topbar">
    <a href="#/" class="btn btn-ghost btn-back-home" title="Volver a la portada">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Volver al Inicio
    </a>

    <div class="register-topbar-brand">
      <div class="landing-brand-logo" style="width: 32px; height: 32px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <span class="text-h3" style="margin: 0;">Square Gastro POS</span>
    </div>

    <!-- Acceso alternativo para personal -->
    <a href="#/terminal" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.9rem; min-height: 38px;">
      ¿Eres empleado? Terminal →
    </a>
  </header>

  <!-- Contenedor Central de Registro -->
  <div class="register-main-container">
    
    <div class="register-card glass-panel-elevated">
      
      <!-- Pestañas de Alternancia: Registro vs Login -->
      <div class="register-tabs">
        <button type="button" class="tab-btn active" id="tab-register-btn">
          ✨ Empezar: Crear Cuenta de Dueño
        </button>
        <button type="button" class="tab-btn" id="tab-login-btn">
          🔑 Iniciar Sesión Administrador
        </button>
      </div>

      <!-- ================================================================
           FORMULARIO 1: REGISTRO DE DUEÑO / ADMINISTRADOR
           ================================================================ -->
      <div id="section-register" class="register-section animate-fade-in">
        <div class="section-heading">
          <span class="badge badge-brand" style="margin-bottom: 0.35rem;">Paso 1 de 2 • Alta Gerencial</span>
          <h1 class="text-h2">Crea tu cuenta de Administrador</h1>
          <p class="text-caption">
            Al registrarte tendrás acceso inmediato al <strong>Dashboard Principal / Backoffice</strong> 
            para gestionar tu restaurante y dar de alta a tus empleados.
          </p>
        </div>

        <form id="form-owner-register" class="owner-form" novalidate>
          
          <div class="form-row-2">
            <!-- Nombres -->
            <div class="form-group">
              <label for="owner-nombre" class="form-label">
                Nombres: <span class="required-star">*</span>
              </label>
              <input 
                type="text" 
                id="owner-nombre" 
                class="form-input" 
                placeholder="Ej. Roberto" 
                required
                autocomplete="given-name"
              />
            </div>

            <!-- Apellidos -->
            <div class="form-group">
              <label for="owner-apellido" class="form-label">
                Apellidos: <span class="required-star">*</span>
              </label>
              <input 
                type="text" 
                id="owner-apellido" 
                class="form-input" 
                placeholder="Ej. Gómez Bolaños" 
                required
                autocomplete="family-name"
              />
            </div>
          </div>

          <div class="form-row-2">
            <!-- Tipo Documento -->
            <div class="form-group">
              <label for="owner-tipo-doc" class="form-label">Tipo de Documento:</label>
              <select id="owner-tipo-doc" class="form-select">
                <option value="DNI" selected>DNI (Documento Nacional de Identidad)</option>
                <option value="CE">Carnet de Extranjería (CE)</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </div>

            <!-- Número Documento (DNI) -->
            <div class="form-group">
              <label for="owner-num-doc" class="form-label">
                N° de Documento (DNI): <span class="required-star">*</span>
              </label>
              <input 
                type="text" 
                id="owner-num-doc" 
                class="form-input" 
                placeholder="Ej. 10293847" 
                maxlength="15" 
                required
              />
            </div>
          </div>

          <div class="form-group">
            <!-- Nombre de Usuario -->
            <label for="owner-username" class="form-label">
              Nombre de Usuario (Para accesos y auditoría): <span class="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="owner-username" 
              class="form-input" 
              placeholder="Ej. roberto.gerente" 
              required
              autocomplete="username"
            />
          </div>

          <div class="form-row-2">
            <!-- PIN de 4 Dígitos -->
            <div class="form-group">
              <label for="owner-pin" class="form-label">
                PIN de Seguridad (4 Dígitos): <span class="required-star">*</span>
              </label>
              <div style="position: relative;">
                <input 
                  type="password" 
                  id="owner-pin" 
                  class="form-input text-mono" 
                  placeholder="Ej. 1234" 
                  maxlength="4" 
                  pattern="\\d{4}" 
                  style="letter-spacing: 0.35em; font-size: 1.15rem;"
                  required
                />
                <button type="button" class="btn-toggle-pin-field" data-target="owner-pin" title="Ver PIN">
                  👁️
                </button>
              </div>
            </div>

            <!-- Confirmar PIN -->
            <div class="form-group">
              <label for="owner-pin-confirm" class="form-label">
                Confirmar PIN de Seguridad: <span class="required-star">*</span>
              </label>
              <div style="position: relative;">
                <input 
                  type="password" 
                  id="owner-pin-confirm" 
                  class="form-input text-mono" 
                  placeholder="Repetir PIN" 
                  maxlength="4" 
                  pattern="\\d{4}" 
                  style="letter-spacing: 0.35em; font-size: 1.15rem;"
                  required
                />
                <button type="button" class="btn-toggle-pin-field" data-target="owner-pin-confirm" title="Ver PIN">
                  👁️
                </button>
              </div>
            </div>
          </div>

          <!-- Banner Informativo del Rol Asignado -->
          <div class="role-assigned-banner">
            <div class="role-badge-icon">👑</div>
            <div class="role-badge-text">
              <strong>Rol asignado: Administrador (ADMIN)</strong>
              <span>Control total del Backoffice, creación de personal y configuración operativa.</span>
            </div>
          </div>

          <!-- Botón Enviar Registro -->
          <button type="submit" id="btn-submit-owner-register" class="btn btn-brand btn-submit-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            Crear Cuenta & Entrar al Dashboard →
          </button>

        </form>
      </div>

      <!-- ================================================================
           FORMULARIO 2: LOGIN DIRECTO DE ADMINISTRADOR EXISTENTE
           ================================================================ -->
      <div id="section-login" class="register-section animate-fade-in" style="display: none;">
        <div class="section-heading">
          <span class="badge badge-navy" style="margin-bottom: 0.35rem;">Acceso Gerencial</span>
          <h2 class="text-h2">Iniciar Sesión como Administrador</h2>
          <p class="text-caption">
            Ingresa tu DNI o nombre de usuario y tu PIN numérico de 4 dígitos.
          </p>
        </div>

        <form id="form-owner-login" class="owner-form" novalidate>
          <div class="form-group">
            <label for="login-admin-identifier" class="form-label">
              DNI o Usuario de Administrador: <span class="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="login-admin-identifier" 
              class="form-input" 
              placeholder="Ej. 10293847 o roberto.gerente" 
              required
            />
          </div>

          <div class="form-group">
            <label for="login-admin-pin" class="form-label">
              PIN de Acceso (4 Dígitos): <span class="required-star">*</span>
            </label>
            <div style="position: relative;">
              <input 
                type="password" 
                id="login-admin-pin" 
                class="form-input text-mono" 
                placeholder="4 dígitos numéricos" 
                maxlength="4" 
                pattern="\\d{4}" 
                style="letter-spacing: 0.35em; font-size: 1.15rem;"
                required
              />
              <button type="button" class="btn-toggle-pin-field" data-target="login-admin-pin" title="Ver PIN">
                👁️
              </button>
            </div>
          </div>

          <button type="submit" id="btn-submit-owner-login" class="btn btn-brand btn-submit-lg">
            Ingresar al Dashboard Backoffice →
          </button>
        </form>
      </div>

    </div>

    <!-- Panel Lateral de Información y Ayuda -->
    <aside class="register-sidebar glass-panel">
      <h3 class="text-h3" style="color: var(--color-navy-900); margin-bottom: 0.75rem;">
        🏢 ¿Por qué registrarte como dueño?
      </h3>
      <p class="text-caption" style="line-height: 1.55; margin-bottom: 1.25rem;">
        Al registrar tu cuenta de administrador, el sistema crea tu perfil gerencial de forma segura 
        y te otorga acceso al <strong>Backoffice</strong>.
      </p>

      <div class="sidebar-feature-item">
        <div class="feature-num">1</div>
        <div>
          <strong>Crea a tus colaboradores</strong>
          <p class="text-caption">Asigna Cocineros, Almaceneros, Mozos o Cajeros con su propio PIN de 4 dígitos.</p>
        </div>
      </div>

      <div class="sidebar-feature-item">
        <div class="feature-num">2</div>
        <div>
          <strong>Configuración por Rol</strong>
          <p class="text-caption">Cocina disfruta de pantalla fija permanente, y Almacén cuenta con auto-bloqueo preventivo.</p>
        </div>
      </div>

      <div class="sidebar-feature-item">
        <div class="feature-num">3</div>
        <div>
          <strong>Seguridad Square</strong>
          <p class="text-caption">Tus empleados nunca tocan credenciales maestras; solo operan en sus terminales con PIN.</p>
        </div>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color-light);">
        <div class="text-caption">
          ¿Buscabas la pantalla operativa de empleados?
        </div>
        <a href="#/terminal" class="landing-link-highlight" style="display: inline-block; margin-top: 0.35rem;">
          Ir a Terminal de Personal (DNI + PIN) →
        </a>
      </div>
    </aside>

  </div>

</div>
`;
