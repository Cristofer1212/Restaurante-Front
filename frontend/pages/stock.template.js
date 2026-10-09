/**
 * TEMPLATE HTML: MÓDULO DE CONTROL DE STOCK E INVENTARIOS
 */

export const stockHtml = `
<div class="stock-view animate-fade-in">
  <header class="stock-header">
    <div class="stock-branding">
      <span class="brand-badge">Square Stock • Almacén</span>
      <h1 class="text-h2" style="margin: 0;">Control de Insumos y Stock</h1>
    </div>

    <div class="stock-operator-status">
      <div class="badge badge-warning" id="stock-security-badge">
        🔒 Auto-bloqueo: 90s
      </div>
      <div class="stock-user-pill">
        <span id="stock-operator-name">Alex Vega</span>
        <span class="operator-role-pill role-almacenero">Almacenero</span>
      </div>
      <button type="button" id="btn-stock-attendance" class="btn btn-secondary" style="padding: 0.5rem 1rem; min-height: 40px; font-size: 0.85rem;">
        Marcación
      </button>
      <button type="button" id="btn-stock-lock" class="btn btn-secondary" style="padding: 0.5rem 1rem; min-height: 40px; font-size: 0.85rem;">
        Bloquear
      </button>
    </div>
  </header>

  <!-- Banner de Alerta de Umbral Mínimo (#F59E0B) -->
  <div class="stock-alert-banner">
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <div>
        <strong>Alerta Crítica de Reposición:</strong> 2 insumos se encuentran por debajo del punto de pedido.
      </div>
    </div>
    <span class="badge badge-warning">2 Alertas Activas</span>
  </div>

  <main class="stock-content">
    <div class="stock-table-card glass-panel">
      <div class="stock-table-header">
        <h3 class="text-h3">Insumos Críticos del Restaurante</h3>
        <button type="button" class="btn btn-brand" style="min-height: 42px; padding: 0.5rem 1rem; font-size: 0.88rem;">
          + Registrar Entrada de Insumo
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table class="stock-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Insumo</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-warning">
              <td class="text-mono">INS-001</td>
              <td><strong>Lomo Fino de Res</strong></td>
              <td>Carnes</td>
              <td><span class="stock-qty-val val-low">4.5 kg</span></td>
              <td>12.0 kg</td>
              <td><span class="badge badge-warning">Bajo Umbral</span></td>
              <td><button class="btn-ghost text-caption" style="font-weight: 700; color: var(--color-brand-primary);">Ajustar</button></td>
            </tr>
            <tr class="row-warning">
              <td class="text-mono">INS-004</td>
              <td><strong>Aceite de Oliva Extra Virgen</strong></td>
              <td>Abarrotes</td>
              <td><span class="stock-qty-val val-low">3.0 L</span></td>
              <td>8.0 L</td>
              <td><span class="badge badge-warning">Bajo Umbral</span></td>
              <td><button class="btn-ghost text-caption" style="font-weight: 700; color: var(--color-brand-primary);">Ajustar</button></td>
            </tr>
            <tr>
              <td class="text-mono">INS-008</td>
              <td><strong>Cebolla Roja Seleccionada</strong></td>
              <td>Verduras</td>
              <td><span class="stock-qty-val">28.0 kg</span></td>
              <td>15.0 kg</td>
              <td><span class="badge badge-success">Óptimo</span></td>
              <td><button class="btn-ghost text-caption" style="font-weight: 700; color: var(--color-brand-primary);">Ajustar</button></td>
            </tr>
            <tr>
              <td class="text-mono">INS-012</td>
              <td><strong>Ají Amarillo Fresco</strong></td>
              <td>Verduras</td>
              <td><span class="stock-qty-val">18.5 kg</span></td>
              <td>10.0 kg</td>
              <td><span class="badge badge-success">Óptimo</span></td>
              <td><button class="btn-ghost text-caption" style="font-weight: 700; color: var(--color-brand-primary);">Ajustar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</div>
`;
