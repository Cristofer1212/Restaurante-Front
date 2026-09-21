/**
 * PLANTILLA HTML: TERMINAL DE CONTROL TÁCTIL (POS / KDS / ALMACÉN)
 * 
 * Diseñada para máxima velocidad de ingreso de trabajadores operativos:
 * - Cero formularios de registro.
 * - Teclado numérico táctil de alta respuesta para PIN de 4 dígitos.
 * - Modal automático de Clock-In / Clock-Out para Planilla Perú.
 * - Enlace directo al Backoffice Administrador para gerencia.
 */

export const authHtml = `
<div class="auth-view animate-fade-in">
  
  <!-- Barra Superior del Terminal Táctil -->
  <div class="terminal-topbar">
    <div class="terminal-brand-group">
      <span class="brand-badge">Square POS • Terminal Operativo</span>
      <div id="connection-badge" class="badge badge-navy" title="Estado de Conexión con el Backend Java SE">
        <span class="status-dot"></span> Comprobando Backend...
      </div>
    </div>

    <!-- Enlace exclusivo para Gerencia / Administrador hacia el Backoffice -->
    <a href="#/admin" class="btn btn-secondary terminal-admin-btn" title="Ir al Panel de Administración">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
      </svg>
      Acceso Administrador (Backoffice)
    </a>
  </div>

  <div class="auth-container">
    
    <!-- ====================================================================
         PANEL IZQUIERDO: Reloj Oficial y Selección Rápida de Identificador
         ==================================================================== -->
    <div class="auth-left-pane">
      <div>
        <h1 class="text-h1" style="margin-bottom: 0.25rem;">Terminal de Personal</h1>
        <p class="text-caption" style="margin-bottom: 1.5rem;">
          Acceso rápido para operarios de Cocina, Almacén, Caja y Salón.
        </p>

        <!-- Reloj Digital Oficial para Operarios -->
        <div class="live-clock-card">
          <div class="text-caption" style="color: var(--color-navy-300); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">
            Hora Oficial del Restaurante
          </div>
          <div id="live-clock-time" class="live-time">12:00:00</div>
          <div id="live-clock-date" class="live-date">Cargando fecha...</div>
        </div>

        <!-- Selector Rápido de Colaboradores del Restaurante -->
        <div class="operator-selection-title">
          <span class="text-h3">Equipo en Turno</span>
          <span class="text-caption">Pulse para seleccionar su cuenta</span>
        </div>

        <div class="operator-grid" id="operator-grid">
          <!-- Colaboradores cargados dinámicamente o creados en Backoffice -->
        </div>
      </div>

      <!-- Entrada de Identificador (DNI o Nombre de Usuario) -->
      <div class="manual-input-box">
        <label for="identifier-input" class="text-caption" style="display: block; margin-bottom: 0.4rem; font-weight: 700; color: var(--color-navy-800);">
          Documento de Identidad (DNI) o Usuario:
        </label>
        <div style="position: relative;">
          <input 
            type="text" 
            id="identifier-input" 
            class="input-field" 
            placeholder="Ingrese DNI o nombre de usuario" 
            value=""
            autocomplete="off"
            maxlength="20"
          />
        </div>
      </div>
    </div>

    <!-- ====================================================================
         PANEL DERECHO: Tarjeta Flotante Glassmorphism & Teclado Táctil de PIN
         ==================================================================== -->
    <div class="auth-right-pane glass-panel">
      <div class="pin-pad-header">
        <div id="active-operator-badge" class="active-operator-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span id="active-operator-label">Ingrese su Identificador</span>
        </div>
        <h2 class="text-h2">PIN de Seguridad</h2>
        <p class="text-caption" style="margin-top: 0.25rem;">Digite sus 4 dígitos en el teclado táctil</p>
      </div>

      <!-- Indicadores Visuales de los 4 Dígitos del PIN -->
      <div id="pin-dots-container" class="pin-display-container">
        <div class="pin-dot" data-index="0"></div>
        <div class="pin-dot" data-index="1"></div>
        <div class="pin-dot" data-index="2"></div>
        <div class="pin-dot" data-index="3"></div>
      </div>

      <!-- Teclado Numérico Táctil de Alta Velocidad (On-screen Numpad) -->
      <div class="touch-keypad" id="touch-keypad">
        <button type="button" class="keypad-btn" data-key="1">
          <span class="keypad-digit">1</span>
        </button>
        <button type="button" class="keypad-btn" data-key="2">
          <span class="keypad-digit">2</span>
          <span class="keypad-sub">ABC</span>
        </button>
        <button type="button" class="keypad-btn" data-key="3">
          <span class="keypad-digit">3</span>
          <span class="keypad-sub">DEF</span>
        </button>

        <button type="button" class="keypad-btn" data-key="4">
          <span class="keypad-digit">4</span>
          <span class="keypad-sub">GHI</span>
        </button>
        <button type="button" class="keypad-btn" data-key="5">
          <span class="keypad-digit">5</span>
          <span class="keypad-sub">JKL</span>
        </button>
        <button type="button" class="keypad-btn" data-key="6">
          <span class="keypad-digit">6</span>
          <span class="keypad-sub">MNO</span>
        </button>

        <button type="button" class="keypad-btn" data-key="7">
          <span class="keypad-digit">7</span>
          <span class="keypad-sub">PQRS</span>
        </button>
        <button type="button" class="keypad-btn" data-key="8">
          <span class="keypad-digit">8</span>
          <span class="keypad-sub">TUV</span>
        </button>
        <button type="button" class="keypad-btn" data-key="9">
          <span class="keypad-digit">9</span>
          <span class="keypad-sub">WXYZ</span>
        </button>

        <!-- Botón Limpiar Todo (C) -->
        <button type="button" class="keypad-btn keypad-btn-action" data-key="clear" title="Limpiar PIN">
          <span class="keypad-digit" style="font-size: 1.25rem; font-weight: 800;">C</span>
        </button>

        <button type="button" class="keypad-btn" data-key="0">
          <span class="keypad-digit">0</span>
        </button>

        <!-- Botón Retroceso (Backspace) -->
        <button type="button" class="keypad-btn keypad-btn-action" data-key="backspace" title="Borrar último dígito">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
            <line x1="18" y1="9" x2="12" y2="15"></line>
            <line x1="12" y1="9" x2="18" y2="15"></line>
          </svg>
        </button>
      </div>

      <!-- Pie Informativo del Terminal -->
      <div class="auth-footer-status">
        <div class="status-indicator-pill">
          <span id="backend-status-dot" class="status-dot"></span>
          <span id="backend-status-text">Backend Java :8080</span>
        </div>
        <span class="text-caption">Square POS v1.0</span>
      </div>
    </div>

  </div>

  <!-- ====================================================================
       MODAL DE CONTROL DE ASISTENCIA (CLOCK-IN / CLOCK-OUT - PLANILLA PERÚ)
       ==================================================================== -->
  <div id="attendance-modal" class="attendance-modal-backdrop">
    <div class="attendance-modal-card glass-panel-elevated">
      
      <div class="modal-header-strip">
        <div>
          <span class="badge badge-brand" style="margin-bottom: 0.35rem;">Planilla Perú • Marcaciones</span>
          <h2 class="text-h2" style="color: #FFFFFF;">Control de Asistencia</h2>
        </div>
        <button type="button" id="btn-close-attendance-modal" class="btn-ghost" style="color: #FFFFFF; font-size: 1.5rem; padding: 0.25rem 0.6rem;">
          ✕
        </button>
      </div>

      <div class="modal-body">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background-color: var(--color-brand-subtle); display: flex; align-items: center; justify-content: center; color: var(--color-brand-primary);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <div id="attendance-user-name" class="text-h3">Colaborador</div>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem;">
              <span id="attendance-user-role" class="operator-role-pill role-cocina">COCINA</span>
              <span class="text-caption" id="attendance-user-id">ID: 1</span>
            </div>
          </div>
        </div>

        <div class="attendance-status-box">
          <div>
            <div class="text-caption" style="font-weight: 600;">Estado de Jornada Hoy:</div>
            <div id="attendance-current-status" style="font-weight: 700; font-size: 1.1rem; color: var(--color-navy-900);">
              Sin Marcación de Entrada
            </div>
          </div>
          <span id="attendance-status-badge" class="badge badge-warning">Pendiente</span>
        </div>

        <div class="attendance-actions-grid">
          <!-- Botón Clock-In (Éxito Funcional #10B981) -->
          <button type="button" id="btn-clock-in" class="btn btn-success" style="font-size: 0.95rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Clock-In (Entrada)
          </button>

          <!-- Botón Clock-Out (Acento Alerta / Salida #F59E0B) -->
          <button type="button" id="btn-clock-out" class="btn btn-warning" style="font-size: 0.95rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
            Clock-Out (Salida)
          </button>
        </div>

        <button type="button" id="btn-proceed-station" class="btn btn-brand" style="width: 100%; margin-top: 0.5rem;">
          Continuar a Estación de Trabajo →
        </button>
      </div>

    </div>
  </div>

</div>
`;
