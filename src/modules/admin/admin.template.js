/**
 * PLANTILLA HTML: VISTA DE ADMINISTRADOR (BACKOFFICE WEB)
 * 
 * Espacio de gestión central para el Administrador / Gerente:
 * - Creación de cuentas de colaboradores con asignación de Rol, DNI y PIN de 4 dígitos.
 * - Sincronización directa con PostgreSQL a través de POST /api/v1/auth/register.
 * - Acceso directo hacia la Terminal de Control Táctil (POS / KDS).
 */

export const adminHtml = `
<div class="admin-view animate-fade-in">
  
  <!-- Barra de Navegación Superior del Backoffice -->
  <header class="admin-header glass-panel">
    <div class="admin-header-brand">
      <span class="brand-badge">Square Backoffice</span>
      <div>
        <h1 class="text-h2" style="margin: 0; line-height: 1.1;">Gestión de Personal & Roles</h1>
        <span class="text-caption">Panel de Administración del Restaurante</span>
      </div>
    </div>

    <div class="admin-header-actions">
      <!-- Indicador de Salud del Backend Real -->
      <div id="admin-backend-status" class="badge badge-navy">
        <span class="status-dot"></span> Comprobando servidor...
      </div>

      <!-- Enlace directo a la Terminal Táctil Operativa -->
      <a href="#/terminal" class="btn btn-brand" id="btn-go-terminal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        Ir a Terminal Táctil (POS / KDS) →
      </a>
    </div>
  </header>

  <!-- Contenido Principal del Backoffice -->
  <main class="admin-content-grid">
    
    <!-- COLUMNA IZQUIERDA: Formulario de Registro de Colaboradores -->
    <section class="admin-card glass-panel">
      <div class="card-header">
        <div>
          <span class="badge badge-brand" style="margin-bottom: 0.35rem;">Alta de Personal</span>
          <h2 class="text-h2">Registrar Nuevo Colaborador</h2>
          <p class="text-caption">Crea una cuenta operativa con PIN de 4 dígitos para acceso en terminales.</p>
        </div>
      </div>

      <form id="form-register-collaborator" class="register-form" novalidate>
        
        <!-- Selección de Rol Operativo -->
        <div class="form-group">
          <label for="reg-rol" class="form-label">
            Rol en el Restaurante: <span class="required-star">*</span>
          </label>
          <select id="reg-rol" class="form-select" required>
            <option value="3" selected>Cocina (KDS) — Pantalla fija permanente</option>
            <option value="2">Almacenero — Control de insumos (Auto-bloqueo 90s)</option>
            <option value="5">Cajero — Cobro y terminal TPV</option>
            <option value="4">Mozo — Salón y atención de mesas</option>
            <option value="1">Administrador — Gestión general y backoffice</option>
          </select>
          <div id="role-hint" class="text-caption" style="margin-top: 0.35rem; color: var(--color-navy-500);">
            💡 <strong>Comportamiento UI:</strong> Pantalla fija permanente sin suspensión para despacho ágil de comandas.
          </div>
        </div>

        <div class="form-row-2">
          <!-- Tipo de Documento -->
          <div class="form-group">
            <label for="reg-tipo-doc" class="form-label">Tipo Documento:</label>
            <select id="reg-tipo-doc" class="form-select">
              <option value="DNI" selected>DNI</option>
              <option value="CE">Carnet de Extranjería (CE)</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </div>

          <!-- Número de Documento -->
          <div class="form-group">
            <label for="reg-num-doc" class="form-label">
              N° de Documento (DNI): <span class="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="reg-num-doc" 
              class="form-input" 
              placeholder="Ej. 72849102" 
              maxlength="15" 
              required
            />
          </div>
        </div>

        <div class="form-row-2">
          <!-- Nombre -->
          <div class="form-group">
            <label for="reg-nombre" class="form-label">
              Nombres: <span class="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="reg-nombre" 
              class="form-input" 
              placeholder="Ej. Marco" 
              required
            />
          </div>

          <!-- Apellido -->
          <div class="form-group">
            <label for="reg-apellido" class="form-label">
              Apellidos: <span class="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="reg-apellido" 
              class="form-input" 
              placeholder="Ej. Bartra" 
              required
            />
          </div>
        </div>

        <div class="form-row-2">
          <!-- Nombre de Usuario -->
          <div class="form-group">
            <label for="reg-username" class="form-label">
              Usuario de Acceso: <span class="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="reg-username" 
              class="form-input" 
              placeholder="Ej. chef.marco" 
              required
            />
          </div>

          <!-- PIN de Acceso (4 Dígitos) -->
          <div class="form-group">
            <label for="reg-pin" class="form-label">
              PIN de Acceso (4 Dígitos): <span class="required-star">*</span>
            </label>
            <div style="position: relative;">
              <input 
                type="password" 
                id="reg-pin" 
                class="form-input text-mono" 
                placeholder="4 dígitos numéricos" 
                maxlength="4" 
                pattern="\\d{4}" 
                style="letter-spacing: 0.3em; font-size: 1.15rem;"
                required
              />
              <button type="button" id="btn-toggle-pin-visibility" class="btn-ghost" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); padding: 4px;" title="Ver PIN">
                👁️
              </button>
            </div>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <button type="submit" id="btn-submit-register" class="btn btn-brand" style="width: 100%;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Guardar Colaborador en PostgreSQL
          </button>
        </div>

      </form>
    </section>

    <!-- COLUMNA DERECHA: Colaboradores del Restaurante y Estado Operativo -->
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      
      <!-- Lista de Colaboradores Registrados -->
      <section class="admin-card glass-panel" style="flex: 1;">
        <div class="card-header" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 class="text-h3">Equipo Registrado</h3>
            <span class="text-caption">Cuentas habilitadas para inicio de sesión táctil</span>
          </div>
          <button type="button" id="btn-refresh-team" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;">
            ↻ Actualizar
          </button>
        </div>

        <div class="collaborators-list-container">
          <div id="collaborators-list" class="collaborators-list">
            <!-- Renderizado dinámicamente -->
          </div>
        </div>
      </section>

      <!-- Guía Rápida de Arquitectura Square para el Administrador -->
      <section class="admin-card glass-panel" style="background-color: var(--color-navy-900); color: #FFFFFF; border: none;">
        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; color: #FFFFFF;">
          🏢 Arquitectura Multiusuario Tipo Square
        </h4>
        <p style="font-size: 0.85rem; color: var(--color-navy-300); line-height: 1.5; margin-bottom: 1rem;">
          Este panel web es de uso gerencial para registrar personal. Los colaboradores operativos 
          (cocineros, almaceneros y cajeros) <strong>no ven formularios de registro</strong>; 
          ellos acceden exclusivamente desde la <strong>Terminal Táctil</strong> usando su PIN de 4 dígitos.
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="#/terminal" class="btn btn-secondary" style="background: rgba(255,255,255,0.12); color: #FFFFFF; border-color: rgba(255,255,255,0.2); font-size: 0.85rem; min-height: 40px;">
            Probar Terminal Táctil →
          </a>
        </div>
      </section>

    </div>

  </main>

</div>
`;
