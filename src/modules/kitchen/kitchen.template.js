/**
 * TEMPLATE HTML: MÓDULO DE PRODUCCIÓN EN COCINA (KDS)
 * Pantalla Fija de Despacho Rápido (Fixed Screen KDS)
 */

export const kitchenHtml = `
<div class="kitchen-view animate-fade-in">
  <!-- Barra Superior del KDS -->
  <header class="kds-header">
    <div class="kds-branding">
      <span class="brand-badge">Square KDS • Cocina</span>
      <h1 class="text-h2" style="margin: 0; color: var(--color-navy-900);">Comandero Digital de Producción</h1>
    </div>

    <div class="kds-operator-status">
      <div class="badge badge-success" id="kds-attendance-status">
        <span class="status-dot online"></span> En Turno Activo
      </div>
      <div class="kds-user-pill">
        <span id="kds-operator-name">Marco Bartra</span>
        <span class="operator-role-pill role-cocina">KDS Cocina</span>
      </div>
      <button type="button" id="btn-kds-attendance" class="btn btn-secondary" style="padding: 0.5rem 1rem; min-height: 40px; font-size: 0.85rem;">
        Marcación
      </button>
      <button type="button" id="btn-kds-lock" class="btn btn-secondary" style="padding: 0.5rem 1rem; min-height: 40px; font-size: 0.85rem;" title="Bloquear Terminal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Bloquear
      </button>
    </div>
  </header>

  <!-- Banner de configuración de pantalla según RoleUiMetadata -->
  <div class="kds-metadata-bar">
    <span>🖥️ <strong>Modo KDS Activo:</strong> Pantalla fija permanente (Sin auto-bloqueo para despacho continuo).</span>
    <span class="badge badge-navy">Latencia: < 15ms</span>
  </div>

  <!-- Tablero de Comandas y Pedidos en Producción -->
  <main class="kds-grid">
    
    <!-- Ticket 1: Urgente / Preparación -->
    <article class="kds-ticket-card status-preparing glass-panel">
      <div class="ticket-header">
        <div>
          <span class="ticket-number">#MESA-04</span>
          <span class="badge badge-warning" style="margin-left: 0.5rem;">En Preparación</span>
        </div>
        <div class="ticket-timer timer-warning">⏱️ 08:42 min</div>
      </div>
      <div class="ticket-items">
        <div class="ticket-item">
          <span class="item-qty">2x</span>
          <span class="item-name">Lomo Saltado Clásico</span>
          <span class="item-note">Término 3/4, sin cebolla</span>
        </div>
        <div class="ticket-item">
          <span class="item-qty">1x</span>
          <span class="item-name">Ceviche Mixto Tradicional</span>
          <span class="item-note">Ají limo moderado</span>
        </div>
      </div>
      <div class="ticket-actions">
        <button type="button" class="btn btn-brand" style="width: 100%;">
          Despachar a Pase →
        </button>
      </div>
    </article>

    <!-- Ticket 2: Nuevo / Pendiente -->
    <article class="kds-ticket-card status-pending glass-panel">
      <div class="ticket-header">
        <div>
          <span class="ticket-number">#DELIVERY-18</span>
          <span class="badge badge-navy" style="margin-left: 0.5rem;">Nuevo Pedido</span>
        </div>
        <div class="ticket-timer">⏱️ 02:15 min</div>
      </div>
      <div class="ticket-items">
        <div class="ticket-item">
          <span class="item-qty">1x</span>
          <span class="item-name">Arroz con Mariscos</span>
        </div>
        <div class="ticket-item">
          <span class="item-qty">2x</span>
          <span class="item-name">Chicha Morada Especial 1L</span>
        </div>
      </div>
      <div class="ticket-actions">
        <button type="button" class="btn btn-secondary" style="width: 100%;">
          Iniciar Marcha
        </button>
      </div>
    </article>

    <!-- Ticket 3: Concluido / Listo -->
    <article class="kds-ticket-card status-ready glass-panel">
      <div class="ticket-header">
        <div>
          <span class="ticket-number">#MESA-12</span>
          <span class="badge badge-success" style="margin-left: 0.5rem;">Listo</span>
        </div>
        <div class="ticket-timer" style="color: var(--color-success);">✓ 00:00</div>
      </div>
      <div class="ticket-items">
        <div class="ticket-item done">
          <span class="item-qty">1x</span>
          <span class="item-name">Ají de Gallina Cremoso</span>
        </div>
      </div>
      <div class="ticket-actions">
        <button type="button" class="btn btn-success" style="width: 100%;" disabled>
          Esperando Mozo
        </button>
      </div>
    </article>

  </main>
</div>
`;
