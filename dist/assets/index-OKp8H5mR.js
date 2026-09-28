(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();var I={};const u={API_BASE_URL:typeof window<"u"&&window.RESTAURANT_API_URL?window.RESTAURANT_API_URL:typeof process<"u"&&I&&I.VITE_API_URL||"http://localhost:8080",ENDPOINTS:{AUTH_LOGIN_PIN:"/api/v1/auth/login-pin",AUTH_REGISTER:"/api/v1/auth/register",ASISTENCIA_CLOCK_IN:"/api/v1/asistencia/clock-in",ASISTENCIA_CLOCK_OUT:"/api/v1/asistencia/clock-out"},TIMEOUT_MS:8e3,STORAGE_KEYS:{TOKEN:"restaurant_pos_token",USER:"restaurant_pos_user",UI_METADATA:"restaurant_pos_ui_meta",LAST_ATTENDANCE:"restaurant_pos_last_attendance",REGISTERED_COLLABORATORS:"restaurant_registered_collaborators"}};class O{constructor(){this._listeners=new Set,this._memoryStorage={}}_getItem(e){return typeof localStorage<"u"?localStorage.getItem(e):this._memoryStorage[e]||null}_setItem(e,t){typeof localStorage<"u"?localStorage.setItem(e,t):this._memoryStorage[e]=String(t)}_removeItem(e){typeof localStorage<"u"?localStorage.removeItem(e):delete this._memoryStorage[e]}saveSession({token:e,usuarioId:t,nombreCompleto:a,nombreUsuario:s,rol:i,requiresClockIn:n,uiMetadata:l}){const m={usuarioId:t,nombreCompleto:a,nombreUsuario:s,rol:i,requiresClockIn:n,loginAt:new Date().toISOString()};this._setItem(u.STORAGE_KEYS.TOKEN,e),this._setItem(u.STORAGE_KEYS.USER,JSON.stringify(m)),this._setItem(u.STORAGE_KEYS.UI_METADATA,JSON.stringify(l)),this._notify({type:"LOGIN",session:m,token:e,uiMetadata:l})}getToken(){return this._getItem(u.STORAGE_KEYS.TOKEN)||null}getUser(){const e=this._getItem(u.STORAGE_KEYS.USER);try{return e?JSON.parse(e):null}catch{return null}}getUiMetadata(){const e=this._getItem(u.STORAGE_KEYS.UI_METADATA);try{return e?JSON.parse(e):null}catch{return null}}saveAttendance(e){this._setItem(u.STORAGE_KEYS.LAST_ATTENDANCE,JSON.stringify(e));const t=this.getUser();t&&e.estado==="ACTIVO"&&(t.requiresClockIn=!1,this._setItem(u.STORAGE_KEYS.USER,JSON.stringify(t))),this._notify({type:"ATTENDANCE_UPDATED",attendance:e})}getLastAttendance(){const e=this._getItem(u.STORAGE_KEYS.LAST_ATTENDANCE);try{return e?JSON.parse(e):null}catch{return null}}isAuthenticated(){return!!this.getToken()&&!!this.getUser()}clearSession(){this._removeItem(u.STORAGE_KEYS.TOKEN),this._removeItem(u.STORAGE_KEYS.USER),this._removeItem(u.STORAGE_KEYS.UI_METADATA),this._notify({type:"LOGOUT"})}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}_notify(e){for(const t of this._listeners)try{t(e)}catch(a){console.error("[SessionStore] Error en suscriptor:",a)}}}const p=new O;class R{constructor(){this.events=new Map}on(e,t){return this.events.has(e)||this.events.set(e,new Set),this.events.get(e).add(t),()=>this.off(e,t)}off(e,t){this.events.has(e)&&this.events.get(e).delete(t)}emit(e,t){this.events.has(e)&&this.events.get(e).forEach(a=>{try{a(t)}catch(s){console.error(`[EventBus] Error en manejador de evento '${e}':`,s)}})}}const v=new R,b={AUTH_SUCCESS:"auth:success",AUTH_LOGOUT:"auth:logout",CLOCK_IN_SUCCESS:"attendance:clock-in:success",CLOCK_OUT_SUCCESS:"attendance:clock-out:success",SESSION_LOCKED:"session:locked",NAVIGATE:"router:navigate",TOAST:"ui:toast"};class D{constructor(){this.routes=new Map,this.currentRoute=null,this.currentRouteConfig=null,this.containerElement=null,window.addEventListener("hashchange",()=>this._handleHashChange())}init(e){if(this.containerElement=document.querySelector(e),!this.containerElement)throw new Error(`Contenedor de rutas '${e}' no encontrado en el DOM.`);this._handleHashChange()}register(e,{component:t,requiresAuth:a=!0,allowedRoles:s=[]}){this.routes.set(e,{component:t,requiresAuth:a,allowedRoles:s})}navigate(e){window.location.hash=e}async _handleHashChange(){let e=window.location.hash;e.startsWith("#")&&(e=e.slice(1));const[t]=e.split("?");let a=t?t.trim():"";(!a||a===""||a==="/")&&(a="/"),a==="/auth"&&(a="/terminal");const s=this.routes.get(a)||this.routes.get("/")||this.routes.get("/terminal");if(!s)return;if(s.requiresAuth&&!p.isAuthenticated()){console.warn(`[Router] Acceso no autenticado a ruta protegida: ${a}`),a==="/admin"?this.navigate("/register"):this.navigate("/terminal");return}const i=p.getUser();if(s.requiresAuth&&s.allowedRoles.length>0&&i&&!s.allowedRoles.includes(i.rol)){console.warn(`[Router] Rol ${i.rol} no autorizado para ${a}`),this.navigate(this._getDefaultRouteForRole());return}if(this.currentRouteConfig&&this.currentRouteConfig.component&&typeof this.currentRouteConfig.component.unmount=="function")try{this.currentRouteConfig.component.unmount()}catch(n){console.error("[Router] Error al desmontar vista previa:",n)}this.currentRoute=a,this.currentRouteConfig=s,this.containerElement&&s.component&&(this.containerElement.innerHTML="",await s.component.mount(this.containerElement)),v.emit(b.NAVIGATE,{path:a,user:i})}_getDefaultRouteForRole(){const e=p.getUser();if(!e)return"/";switch(e.rol){case"ADMIN":return"/admin";case"COCINA":return"/kitchen";case"ALMACENERO":return"/stock";case"CAJERO":case"MOZO":default:return"/kitchen"}}}const d=new D;class P{constructor(){this.timer=null,this.warningTimer=null,this.timeoutSeconds=0,this.isFixedScreen=!1,this.isActive=!1,this._onUserActivity=this._onUserActivity.bind(this)}configure(e){if(this.stop(),!!e){if(this.isFixedScreen=!!e.fixedScreen,this.timeoutSeconds=e.inactivityTimeoutSeconds||0,this.isFixedScreen||!e.autoLock||this.timeoutSeconds<=0){console.log(`[InactivityTimer] Pantalla configurada como fija o sin auto-bloqueo (${e.roleName||"ROLE"}).`);return}console.log(`[InactivityTimer] Activando auto-bloqueo a los ${this.timeoutSeconds}s para ${e.roleName}.`),this.start()}}start(){this.isActive=!0,this._attachListeners(),this._resetTimer()}stop(){this.isActive=!1,this._detachListeners(),this._clearTimers()}_resetTimer(){if(this._clearTimers(),!this.isActive||this.timeoutSeconds<=0)return;const e=Math.max((this.timeoutSeconds-15)*1e3,5e3),t=this.timeoutSeconds*1e3;this.warningTimer=setTimeout(()=>{v.emit(b.TOAST,{type:"warning",title:"Bloqueo por Inactividad",message:"La pantalla del terminal se bloqueará en 15 segundos por seguridad.",duration:8e3})},e),this.timer=setTimeout(()=>{console.warn("[InactivityTimer] Tiempo de inactividad expirado. Bloqueando terminal."),v.emit(b.SESSION_LOCKED,{reason:"TIMEOUT"})},t)}_clearTimers(){this.timer&&clearTimeout(this.timer),this.warningTimer&&clearTimeout(this.warningTimer),this.timer=null,this.warningTimer=null}_onUserActivity(){this.isActive&&this._resetTimer()}_attachListeners(){if(typeof window>"u")return;["pointerdown","keydown","touchstart","mousemove"].forEach(t=>window.addEventListener(t,this._onUserActivity,{passive:!0}))}_detachListeners(){if(typeof window>"u")return;["pointerdown","keydown","touchstart","mousemove"].forEach(t=>window.removeEventListener(t,this._onUserActivity))}}const C=new P;class q{constructor(){this.ctx=null,this.enabled=!0}_initContext(){if(!this.ctx&&(window.AudioContext||window.webkitAudioContext)){const e=window.AudioContext||window.webkitAudioContext;this.ctx=new e}}playKeyTap(){if(this.enabled)try{if(this._initContext(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type="sine",e.frequency.setValueAtTime(440,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(880,this.ctx.currentTime+.03),t.gain.setValueAtTime(.06,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.03),e.connect(t),t.connect(this.ctx.destination),e.start(),e.stop(this.ctx.currentTime+.035)}catch{}}playSuccess(){if(this.enabled)try{if(this._initContext(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const e=this.ctx.currentTime,t=this.ctx.createOscillator(),a=this.ctx.createGain();t.type="triangle",t.frequency.setValueAtTime(523.25,e),t.frequency.setValueAtTime(659.25,e+.08),t.frequency.setValueAtTime(783.99,e+.16),a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.28),t.connect(a),a.connect(this.ctx.destination),t.start(),t.stop(e+.3)}catch{}}playError(){if(this.enabled)try{if(this._initContext(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const e=this.ctx.currentTime,t=this.ctx.createOscillator(),a=this.ctx.createGain();t.type="sawtooth",t.frequency.setValueAtTime(220,e),t.frequency.linearRampToValueAtTime(140,e+.15),a.gain.setValueAtTime(.07,e),a.gain.exponentialRampToValueAtTime(.001,e+.18),t.connect(a),a.connect(this.ctx.destination),t.start(),t.stop(e+.2)}catch{}}}const c=new q,S={get(o,e=document){return e.querySelector(o)},getAll(o,e=document){return Array.from(e.querySelectorAll(o))},create(o,e={},...t){const a=document.createElement(o);return Object.entries(e).forEach(([s,i])=>{s==="className"?a.className=i:s.startsWith("on")&&typeof i=="function"?a.addEventListener(s.slice(2).toLowerCase(),i):a.setAttribute(s,i)}),t.forEach(s=>{typeof s=="string"||typeof s=="number"?a.appendChild(document.createTextNode(String(s))):s instanceof HTMLElement&&a.appendChild(s)}),a},htmlToElement(o){const e=document.createElement("template");return e.innerHTML=o.trim(),e.content.firstElementChild}};class M{constructor(){this.container=null,this._init()}_init(){let e=document.getElementById("toast-container");e||(e=S.create("div",{id:"toast-container"}),document.body.appendChild(e)),this.container=e,v.on(b.TOAST,t=>this.show(t))}show({type:e="info",title:t="",message:a="",duration:s=4500}){this.container||this._init();const i=S.create("div",{className:`toast toast-${e} glass-panel`}),n=this._getIconSvg(e);return i.innerHTML=`
      <div style="flex-shrink: 0; margin-top: 2px;">
        ${n}
      </div>
      <div style="flex: 1; min-width: 0;">
        ${t?`<div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; color: var(--color-navy-900);">${t}</div>`:""}
        <div style="font-size: 0.875rem; color: var(--color-navy-700); line-height: 1.4;">${a}</div>
      </div>
      <button class="toast-close" style="flex-shrink: 0; color: var(--color-navy-500); padding: 4px; border-radius: 4px; line-height: 1;" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `,i.querySelector(".toast-close").addEventListener("click",()=>this._removeToast(i)),this.container.appendChild(i),s>0&&setTimeout(()=>this._removeToast(i),s),i}_removeToast(e){!e||!e.parentElement||(e.style.opacity="0",e.style.transform="translateY(-10px)",setTimeout(()=>{e.parentElement&&e.remove()},200))}_getIconSvg(e){switch(e){case"success":return`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;case"warning":return`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;case"danger":return`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`;case"info":default:return`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E15A2B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>`}}success(e,t="Operación Exitosa"){return this.show({type:"success",title:t,message:e})}warning(e,t="Atención"){return this.show({type:"warning",title:t,message:e})}danger(e,t="Error"){return this.show({type:"danger",title:t,message:e})}info(e,t="Información"){return this.show({type:"info",title:t,message:e})}}const r=new M,B=`
<div class="landing-view animate-fade-in">

  <!-- ====================================================================
       1. BARRA DE NAVEGACIÓN SUPERIOR (NAVBAR)
       ==================================================================== -->
  <header class="landing-navbar">
    <div class="landing-nav-container">
      
      <!-- Logotipo / Marca Corporativa -->
      <a href="#/" class="landing-brand">
        <div class="landing-brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div class="landing-brand-text">
          <span class="landing-brand-name">Square Gastro</span>
          <span class="landing-brand-tag">POS & KDS System</span>
        </div>
      </a>

      <!-- Enlaces de Navegación y Conexión -->
      <nav class="landing-nav-links">
        <a href="#features" class="landing-nav-link">Módulos</a>
        <a href="#architecture" class="landing-nav-link">Arquitectura</a>
        <div id="landing-backend-badge" class="badge badge-navy">
          <span class="status-dot"></span> Verificando conexión...
        </div>
      </nav>

      <!-- Acciones de Cabecera -->
      <div class="landing-nav-actions">
        <!-- Botón Soy Empleado (Acceso Rápido a Terminal) -->
        <a href="#/terminal" class="btn btn-secondary btn-nav-employee" id="nav-btn-employee">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Soy empleado
        </a>

        <!-- Botón Empezar (Registro de Administrador) -->
        <a href="#/register" class="btn btn-brand btn-nav-start" id="nav-btn-start">
          Empezar
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>

    </div>
  </header>

  <!-- Banner de Sesión Activa (visible si el usuario ya inició sesión previamente) -->
  <div id="landing-active-session-banner" class="active-session-banner" style="display: none;">
    <div class="session-banner-content">
      <span class="session-banner-icon">👤</span>
      <div>
        <strong>Sesión activa detectada:</strong>
        <span id="landing-session-user-name">Usuario</span> 
        (<span id="landing-session-user-role">ROL</span>)
      </div>
    </div>
    <div class="session-banner-actions">
      <a href="#/admin" id="landing-session-resume-link" class="btn btn-brand btn-sm">
        Continuar al Panel →
      </a>
      <button type="button" id="landing-session-logout-btn" class="btn btn-ghost btn-sm">
        Cerrar Sesión
      </button>
    </div>
  </div>

  <!-- ====================================================================
       2. SECCIÓN HERO (PORTADA PRINCIPAL Y CTAS CLAVE)
       ==================================================================== -->
  <section class="landing-hero-section">
    <div class="landing-hero-container">
      
      <div class="hero-badge-wrap">
        <span class="badge badge-brand">
          ✨ Arquitectura Multiusuario Tipo Square • Alta Disponibilidad
        </span>
      </div>

      <h1 class="landing-hero-title">
        El sistema operativo integral para tu restaurante
      </h1>

      <p class="landing-hero-subtitle">
        Una plataforma unificada para el <strong>Dueño del Negocio</strong> y su <strong>Equipo Operativo</strong>. 
        Controla cocina en tiempo real, gestión de inventario, punto de venta y asistencia laboral con la máxima velocidad.
      </p>

      <!-- Los Dos Botones Principales (CTAs Requeridos) -->
      <div class="landing-hero-ctas">
        
        <!-- CTA 1: Empezar -> Registro de Administrador / Dueño -->
        <a href="#/register" class="btn btn-brand btn-cta-main" id="hero-btn-start">
          <span class="cta-label">Empezar</span>
          <span class="cta-desc">Crear cuenta de Administrador</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="cta-arrow">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>

        <!-- CTA 2: Soy empleado -> Terminal de Personal (DNI + PIN) -->
        <a href="#/terminal" class="btn btn-secondary btn-cta-secondary" id="hero-btn-employee">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <div>
            <span class="cta-label">Soy empleado</span>
            <span class="cta-desc">Terminal táctil con DNI y PIN</span>
          </div>
        </a>

      </div>

      <!-- Enlace para Administradores Existentes -->
      <div class="landing-login-hint">
        ¿Ya tienes cuenta de Administrador? 
        <a href="#/register" class="landing-link-highlight" id="link-admin-login">Iniciar sesión aquí →</a>
      </div>

      <!-- Previsualización de Dispositivos / Estaciones de Trabajo -->
      <div class="landing-preview-grid">
        <div class="preview-card preview-backoffice">
          <div class="preview-tag">Dueño / Gerencia</div>
          <div class="preview-title">Dashboard Backoffice</div>
          <p>Métricas clave, configuración general y alta de colaboradores en el sistema.</p>
        </div>
        <div class="preview-card preview-kds">
          <div class="preview-tag">Jefe de Cocina</div>
          <div class="preview-title">KDS en Tiempo Real</div>
          <p>Pantalla fija permanente para despacho de comandas sin interrupciones.</p>
        </div>
        <div class="preview-card preview-terminal">
          <div class="preview-tag">Mozos & Cajeros</div>
          <div class="preview-title">Terminal Táctil</div>
          <p>Login ágil con PIN de 4 dígitos y marcación automática de asistencia.</p>
        </div>
        <div class="preview-card preview-stock">
          <div class="preview-tag">Almacenero</div>
          <div class="preview-title">Control de Insumos</div>
          <p>Seguridad reforzada con auto-bloqueo preventivo a los 90 segundos.</p>
        </div>
      </div>

    </div>
  </section>

  <!-- ====================================================================
       3. SECCIÓN DE ARQUITECTURA DE FLUJO (SQUARE FLOW EXPLAINED)
       ==================================================================== -->
  <section id="architecture" class="landing-flow-section">
    <div class="landing-section-container">
      
      <div class="section-header-center">
        <span class="badge badge-brand">Flujo de Navegación</span>
        <h2 class="text-h1">Diseñado para cada rol del restaurante</h2>
        <p class="text-body" style="max-width: 640px; margin: 0.5rem auto 0;">
          Inspirado en la separación de responsabilidades de Square: la gerencia gestiona desde la web, 
          mientras que el personal operativo interactúa mediante terminales táctiles con PIN.
        </p>
      </div>

      <div class="flow-columns-grid">
        
        <!-- Tarjeta Flujo Dueño -->
        <div class="flow-card glass-panel">
          <div class="flow-card-icon admin-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
          </div>
          <span class="badge badge-brand">Flujo 1 • Administrador / Dueño</span>
          <h3 class="text-h2" style="margin-top: 0.75rem;">1. Clic en "Empezar"</h3>
          <p class="text-body">
            El dueño o administrador crea su cuenta corporativa en el sistema.
          </p>
          <ul class="flow-steps-list">
            <li><strong>Registro directo:</strong> Ingreso de DNI, usuario y PIN maestro de 4 dígitos.</li>
            <li><strong>Autenticación automática:</strong> Inicio de sesión inmediato sin fricciones.</li>
            <li><strong>Dashboard Backoffice:</strong> Acceso al panel gerencial con métricas y configuraciones.</li>
            <li><strong>Alta de colaboradores:</strong> Crear empleados asignándoles rol, DNI y PIN de acceso.</li>
          </ul>
          <div style="margin-top: 1.5rem;">
            <a href="#/register" class="btn btn-brand" style="width: 100%;">
              Crear Cuenta de Dueño →
            </a>
          </div>
        </div>

        <!-- Tarjeta Flujo Empleados -->
        <div class="flow-card glass-panel">
          <div class="flow-card-icon employee-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <span class="badge badge-navy">Flujo 2 • Colaboradores Operativos</span>
          <h3 class="text-h2" style="margin-top: 0.75rem;">2. Clic en "Soy empleado"</h3>
          <p class="text-body">
            Los operarios no completan formularios de registro; acceden directamente a la terminal de trabajo.
          </p>
          <ul class="flow-steps-list">
            <li><strong>Terminal de Personal:</strong> Pantalla táctil optimizada para dedos y rapidez.</li>
            <li><strong>Login con DNI & PIN:</strong> Validación ágil de 4 dígitos en el teclado numérico.</li>
            <li><strong>Control de Asistencia:</strong> Marcación de Clock-In / Clock-Out para Planilla Perú.</li>
            <li><strong>Enrutamiento automático:</strong> Redirección instantánea a su estación (Cocina KDS, Almacén o Caja).</li>
          </ul>
          <div style="margin-top: 1.5rem;">
            <a href="#/terminal" class="btn btn-secondary" style="width: 100%;">
              Abrir Terminal de Personal →
            </a>
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- ====================================================================
       4. SECCIÓN DE CARACTERÍSTICAS Y MÓDULOS DEL POS
       ==================================================================== -->
  <section id="features" class="landing-features-section">
    <div class="landing-section-container">
      
      <div class="section-header-center">
        <span class="badge badge-brand">Potencia Operativa</span>
        <h2 class="text-h1">Todo lo que tu restaurante necesita</h2>
      </div>

      <div class="features-grid">
        
        <div class="feature-card glass-panel">
          <div class="feature-icon">⚡</div>
          <h3 class="text-h3">Terminal de Personal Táctil</h3>
          <p class="text-caption">
            Teclado numérico en pantalla de alta ergonomía. Permite a los colaboradores iniciar turno y autenticarse en segundos.
          </p>
        </div>

        <div class="feature-card glass-panel">
          <div class="feature-icon">🍳</div>
          <h3 class="text-h3">Cocina Digital (KDS)</h3>
          <p class="text-caption">
            Pantalla fija permanente (fixed_screen). No sufre bloqueos por inactividad para garantizar el despacho fluido de platos.
          </p>
        </div>

        <div class="feature-card glass-panel">
          <div class="feature-icon">📦</div>
          <h3 class="text-h3">Control de Insumos y Stock</h3>
          <p class="text-caption">
            Auto-bloqueo de seguridad a los 90 segundos para resguardar las operaciones de almacén y materias primas.
          </p>
        </div>

        <div class="feature-card glass-panel">
          <div class="feature-icon">⏱️</div>
          <h3 class="text-h3">Marcación de Asistencia (Planilla)</h3>
          <p class="text-caption">
            Registro automático de marcación de entrada y salida para el control de jornadas conforme a la normativa laboral.
          </p>
        </div>

        <div class="feature-card glass-panel">
          <div class="feature-icon">💾</div>
          <h3 class="text-h3">Almacenamiento Confiable</h3>
          <p class="text-caption">
            Información centralizada y respaldada en tiempo real para garantizar la disponibilidad continua de su restaurante.
          </p>
        </div>

        <div class="feature-card glass-panel">
          <div class="feature-icon">🛡️</div>
          <h3 class="text-h3">Máxima Seguridad y Protección</h3>
          <p class="text-caption">
            Protocolos de autenticación blindada y control de accesos por roles para proteger las operaciones de tu negocio.
          </p>
        </div>

      </div>

    </div>
  </section>

  <!-- ====================================================================
       5. PIE DE PÁGINA (FOOTER CORPORATIVO)
       ==================================================================== -->
  <footer class="landing-footer">
    <div class="landing-footer-container">
      <div class="footer-brand-col">
        <div class="landing-brand">
          <div class="landing-brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <span class="landing-brand-name">Square Gastro POS</span>
        </div>
        <p class="text-caption" style="margin-top: 0.5rem; max-width: 320px;">
          Sistema Integral de Alto Rendimiento para Restaurantes. Control de Stock y Producción en Cocina.
        </p>
      </div>

      <div class="footer-links-col">
        <span class="footer-col-title">Accesos Rápidos</span>
        <a href="#/register">Registro de Administrador ("Empezar")</a>
        <a href="#/terminal">Terminal de Personal ("Soy empleado")</a>
        <a href="#/admin">Dashboard Backoffice</a>
      </div>

      <div class="footer-links-col">
        <span class="footer-col-title">Estaciones</span>
        <a href="#/kitchen">Cocina KDS</a>
        <a href="#/stock">Almacén e Insumos</a>
      </div>
    </div>

    <div class="footer-bottom-bar">
      <span class="text-caption">Square Gastro POS & KDS • Sistema de Gestión Gastronómica</span>
      <span class="text-caption">Todos los derechos reservados</span>
    </div>
  </footer>

</div>
`;class k extends Error{constructor({status:e=500,error:t="Error de Servidor",message:a="Ha ocurrido un error inesperado",data:s=null,timestamp:i=new Date().toISOString()}){super(a),this.name="HttpError",this.status=e,this.error=t,this.data=s,this.timestamp=i}static fromBackendJson(e,t){return t&&typeof t=="object"?new k({status:t.status||e,error:t.error||"Error de Petición",message:t.message||"Error no especificado por el servidor",timestamp:t.timestamp||new Date().toISOString()}):new k({status:e,error:"HTTP "+e,message:"Error en la respuesta del servidor"})}static networkError(e){return new k({status:0,error:"Error de Conexión",message:"No se pudo conectar con el servidor. Verifique su conexión de red o intente más tarde."})}}class U{constructor(e=u.API_BASE_URL){this.baseUrl=e}async request(e,t={}){const a=`${this.baseUrl}${e}`,s=p.getToken(),i={"Content-Type":"application/json",Accept:"application/json",...s?{Authorization:`Bearer ${s}`}:{},...t.headers||{}},n={...t,headers:i},l=new AbortController,m=setTimeout(()=>l.abort(),u.TIMEOUT_MS);n.signal=l.signal;try{const h=await fetch(a,n);clearTimeout(m);let y;const E=h.headers.get("content-type");if(E&&E.includes("application/json")?y=await h.json():y=await h.text(),!h.ok)throw k.fromBackendJson(h.status,y);return y}catch(h){throw clearTimeout(m),h instanceof k?h:new k({status:0,error:"Conexión Rechazada",message:"No se pudo conectar con el servidor. Verifique su conexión de red o intente nuevamente más tarde."})}}async get(e,t={}){return this.request(e,{...t,method:"GET"})}async post(e,t,a={}){return this.request(e,{...a,method:"POST",body:JSON.stringify(t)})}async checkHealth(){try{const e=new AbortController,t=setTimeout(()=>e.abort(),2e3),a=await fetch(`${this.baseUrl}/api/v1/auth/login-pin`,{method:"OPTIONS",signal:e.signal});return clearTimeout(t),a.status===204||a.ok}catch{return!1}}}const w=new U;class H{constructor({rolId:e,tipoDocumento:t,numeroDocumento:a,nombre:s,apellido:i,nombreUsuario:n,pin:l}){this.rolId=Number(e),this.tipoDocumento=(t||"DNI").trim(),this.numeroDocumento=(a||"").trim(),this.nombre=(s||"").trim(),this.apellido=(i||"").trim(),this.nombreUsuario=(n||"").trim().toLowerCase(),this.pin=String(l||"").trim()}validate(){if(!this.rolId||this.rolId<=0)throw new Error("Debe seleccionar un Rol válido para el colaborador");if(!this.tipoDocumento)throw new Error("El tipo de documento es obligatorio (ej. DNI, CE)");if(!this.numeroDocumento)throw new Error("El número de documento es obligatorio");if(!this.nombre)throw new Error("El nombre del colaborador es obligatorio");if(!this.apellido)throw new Error("El apellido del colaborador es obligatorio");if(!this.nombreUsuario)throw new Error("El nombre de usuario es obligatorio");if(!/^\d{4}$/.test(this.pin))throw new Error("El PIN debe constar exactamente de 4 dígitos numéricos")}toJSON(){return{rolId:this.rolId,tipoDocumento:this.tipoDocumento,numeroDocumento:this.numeroDocumento,nombre:this.nombre,apellido:this.apellido,nombreUsuario:this.nombreUsuario,pin:this.pin}}}class F{constructor(e,t){this.identifier=(e||"").trim(),this.pin=String(t||"").trim()}validate(){if(!this.identifier)throw new Error("El identificador (DNI o nombre de usuario) es obligatorio");if(!/^\d{4}$/.test(this.pin))throw new Error("El PIN de acceso debe contener exactamente 4 dígitos numéricos")}toJSON(){return{identifier:this.identifier,pin:this.pin,rawPin:this.pin}}}class T{constructor(e){this.usuarioId=Number(e)}validate(){if(!this.usuarioId||this.usuarioId<=0)throw new Error("El ID de usuario debe ser un número entero positivo válido")}toJSON(){return{usuarioId:this.usuarioId}}}class j{async register(e){const t=new H(e);t.validate();const s=(await w.post(u.ENDPOINTS.AUTH_REGISTER,t.toJSON())).data;return this._saveRegisteredCollaborator(s),s}async loginWithPin(e,t){const a=new F(e,t);a.validate();const i=(await w.post(u.ENDPOINTS.AUTH_LOGIN_PIN,a.toJSON())).data;return p.saveSession(i),i.uiMetadata&&C.configure(i.uiMetadata),v.emit(b.AUTH_SUCCESS,i),i}async clockIn(e){const t=new T(e);t.validate();const s=(await w.post(u.ENDPOINTS.ASISTENCIA_CLOCK_IN,t.toJSON())).data;return p.saveAttendance(s),v.emit(b.CLOCK_IN_SUCCESS,s),s}async clockOut(e){const t=new T(e);t.validate();const s=(await w.post(u.ENDPOINTS.ASISTENCIA_CLOCK_OUT,t.toJSON())).data;return p.saveAttendance(s),v.emit(b.CLOCK_OUT_SUCCESS,s),s}logout(){C.stop(),p.clearSession(),v.emit(b.AUTH_LOGOUT)}getCurrentUser(){return p.getUser()}getLastAttendance(){return p.getLastAttendance()}isAuthenticated(){return p.isAuthenticated()}async checkBackendHealth(){return w.checkHealth()}getRegisteredCollaborators(){const e=localStorage.getItem(u.STORAGE_KEYS.REGISTERED_COLLABORATORS);if(!e)return[];try{return JSON.parse(e)}catch{return[]}}_saveRegisteredCollaborator(e){const a=this.getRegisteredCollaborators().filter(s=>s.numeroDocumento!==e.numeroDocumento);a.unshift(e),localStorage.setItem(u.STORAGE_KEYS.REGISTERED_COLLABORATORS,JSON.stringify(a))}}const g=new j;class z{constructor(){this.container=null,this.healthTimer=null}async mount(e){this.container=e,this.container.innerHTML=B,this._initBackendStatus(),this._checkActiveSession(),this._initNavActions()}async _initBackendStatus(){const e=this.container.querySelector("#landing-backend-badge");if(!e)return;const t=async()=>{await g.checkBackendHealth()?(e.className="badge badge-success",e.innerHTML='<span class="status-dot online"></span> En Línea'):(e.className="badge badge-danger",e.innerHTML='<span class="status-dot error"></span> Sin Conexión')};await t(),this.healthTimer=setInterval(t,12e3)}_checkActiveSession(){const e=this.container.querySelector("#landing-active-session-banner");if(e)if(p.isAuthenticated()){const t=p.getUser();if(t){e.style.display="flex";const a=this.container.querySelector("#landing-session-user-name"),s=this.container.querySelector("#landing-session-user-role"),i=this.container.querySelector("#landing-session-resume-link"),n=this.container.querySelector("#landing-session-logout-btn");if(a&&(a.textContent=t.nombreCompleto||t.nombreUsuario),s&&(s.textContent=t.rol),i){const l=t.rol==="ADMIN"?"#/admin":t.rol==="COCINA"?"#/kitchen":t.rol==="ALMACENERO"?"#/stock":"#/kitchen";i.href=l,i.textContent=`Continuar a ${t.rol==="ADMIN"?"Backoffice":"Estación"} →`}n&&n.addEventListener("click",()=>{g.logout(),e.style.display="none",r.info("Sesión cerrada correctamente")})}}else e.style.display="none"}_initNavActions(){const e=this.container.querySelector("#link-admin-login");e&&e.addEventListener("click",t=>{t.preventDefault(),d.navigate("/register?mode=login")})}unmount(){this.healthTimer&&(clearInterval(this.healthTimer),this.healthTimer=null)}}const K=new z,G=`
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
`;class V{constructor(){this.container=null,this.activeTab="register"}async mount(e){this.container=e,this.container.innerHTML=G,window.location.hash.includes("mode=login")?this.activeTab="login":this.activeTab="register",this._initTabs(),this._initRegisterForm(),this._initLoginForm(),this._initPinToggles()}_initTabs(){const e=this.container.querySelector("#tab-register-btn"),t=this.container.querySelector("#tab-login-btn"),a=this.container.querySelector("#section-register"),s=this.container.querySelector("#section-login"),i=n=>{this.activeTab=n,n==="register"?(e.classList.add("active"),t.classList.remove("active"),a.style.display="block",s.style.display="none"):(t.classList.add("active"),e.classList.remove("active"),a.style.display="none",s.style.display="block")};e.addEventListener("click",()=>i("register")),t.addEventListener("click",()=>i("login")),i(this.activeTab)}_initRegisterForm(){const e=this.container.querySelector("#form-owner-register"),t=this.container.querySelector("#btn-submit-owner-register");e.addEventListener("submit",async a=>{a.preventDefault();const s=this.container.querySelector("#owner-nombre").value.trim(),i=this.container.querySelector("#owner-apellido").value.trim(),n=this.container.querySelector("#owner-tipo-doc").value,l=this.container.querySelector("#owner-num-doc").value.trim(),m=this.container.querySelector("#owner-username").value.trim(),h=this.container.querySelector("#owner-pin").value.trim(),y=this.container.querySelector("#owner-pin-confirm").value.trim();if(!s||!i||!l||!m){c.playError(),r.warning("Por favor complete todos los campos obligatorios (*)","Campos Incompletos");return}if(!/^\d{4}$/.test(h)){c.playError(),r.danger("El PIN debe constar exactamente de 4 dígitos numéricos","Validación de PIN");return}if(h!==y){c.playError(),r.danger("Los PINs ingresados no coinciden","Validación de PIN");return}const E={rolId:1,tipoDocumento:n,numeroDocumento:l,nombre:s,apellido:i,nombreUsuario:m,pin:h};try{t.disabled=!0,t.innerHTML=`
          <span class="status-dot online"></span> Guardando cuenta...
        `;const f=await g.register(E);t.innerHTML=`
          <span class="status-dot online"></span> Autenticando sesión...
        `;const L=await g.loginWithPin(l,h);c.playSuccess(),r.success(`¡Bienvenido, ${L.nombreCompleto||f.nombre}! Tu cuenta de Administrador ha sido configurada.`,"Registro Exitoso"),setTimeout(()=>{d.navigate("/admin")},400)}catch(f){c.playError(),r.danger(f.message||"Error al crear la cuenta de Administrador","Error de Registro")}finally{t.disabled=!1,t.innerHTML=`
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <polyline points="17 11 19 13 23 9"></polyline>
          </svg>
          Crear Cuenta & Entrar al Dashboard →
        `}})}_initLoginForm(){const e=this.container.querySelector("#form-owner-login"),t=this.container.querySelector("#btn-submit-owner-login");e.addEventListener("submit",async a=>{a.preventDefault();const s=this.container.querySelector("#login-admin-identifier").value.trim(),i=this.container.querySelector("#login-admin-pin").value.trim();if(!s){c.playError(),r.warning("Ingrese su DNI o usuario de Administrador","Identificador Requerido");return}if(!/^\d{4}$/.test(i)){c.playError(),r.danger("El PIN debe constar exactamente de 4 dígitos numéricos","PIN Inválido");return}try{t.disabled=!0,t.innerHTML="Validando credenciales...";const n=await g.loginWithPin(s,i);c.playSuccess(),r.success(`Sesión iniciada como ${n.nombreCompleto}`,"Acceso Concedido"),setTimeout(()=>{n.rol,d.navigate("/admin")},300)}catch(n){c.playError(),r.danger(n.message||"Credenciales de Administrador incorrectas","Error de Acceso")}finally{t.disabled=!1,t.innerHTML="Ingresar al Dashboard Backoffice →"}})}_initPinToggles(){this.container.querySelectorAll(".btn-toggle-pin-field").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.target,s=this.container.querySelector(`#${a}`);if(!s)return;const i=s.type==="password";s.type=i?"text":"password",t.textContent=i?"🔒":"👁️"})})}unmount(){}}const $=new V;class J{constructor({container:e,onComplete:t}){this.container=e,this.onComplete=t,this.pin="",this.isProcessing=!1,this.dots=Array.from(e.querySelectorAll(".pin-dot")),this.dotsContainer=e.querySelector("#pin-dots-container"),this.keypad=e.querySelector("#touch-keypad"),this._bindEvents()}_bindEvents(){this.keypad.addEventListener("click",e=>{if(this.isProcessing)return;const t=e.target.closest(".keypad-btn");if(!t)return;const a=t.dataset.key;this._handleKey(a)}),this._keydownHandler=e=>{this.isProcessing||e.target.tagName!=="INPUT"&&(e.key>="0"&&e.key<="9"?this._handleKey(e.key):e.key==="Backspace"?this._handleKey("backspace"):e.key==="Escape"&&this._handleKey("clear"))},window.addEventListener("keydown",this._keydownHandler)}_handleKey(e){if(e==="clear"){c.playKeyTap(),this.clear();return}if(e==="backspace"){c.playKeyTap(),this.backspace();return}/^\d$/.test(e)&&this.pin.length<4&&(c.playKeyTap(),this.pin+=e,this._updateView(),this.pin.length===4&&this._submit())}_updateView(){this.dots.forEach((e,t)=>{t<this.pin.length?e.classList.add("filled"):e.classList.remove("filled","error")})}async _submit(){this.isProcessing=!0;const e=this.pin;try{this.onComplete&&await this.onComplete(e)}catch{this.triggerError()}finally{this.isProcessing=!1}}triggerError(){c.playError(),this.dotsContainer.classList.add("animate-shake"),this.dots.forEach(e=>e.classList.add("error")),setTimeout(()=>{this.dotsContainer.classList.remove("animate-shake"),this.clear()},600)}clear(){this.pin="",this._updateView(),this.dots.forEach(e=>e.classList.remove("error"))}backspace(){this.pin.length>0&&(this.pin=this.pin.slice(0,-1),this._updateView())}destroy(){window.removeEventListener("keydown",this._keydownHandler)}}class A{constructor({container:e,onProceed:t}){this.container=e,this.onProceed=t,this.currentUser=null,this.modal=e.querySelector("#attendance-modal"),this.nameEl=e.querySelector("#attendance-user-name"),this.roleEl=e.querySelector("#attendance-user-role"),this.userIdEl=e.querySelector("#attendance-user-id"),this.statusTextEl=e.querySelector("#attendance-current-status"),this.statusBadgeEl=e.querySelector("#attendance-status-badge"),this.btnClockIn=e.querySelector("#btn-clock-in"),this.btnClockOut=e.querySelector("#btn-clock-out"),this.btnProceed=e.querySelector("#btn-proceed-station"),this.btnClose=e.querySelector("#btn-close-attendance-modal"),this._bindEvents()}_bindEvents(){this.btnClockIn.addEventListener("click",()=>this._handleClockIn()),this.btnClockOut.addEventListener("click",()=>this._handleClockOut()),this.btnProceed.addEventListener("click",()=>this._handleProceed()),this.btnClose.addEventListener("click",()=>this.hide()),window.addEventListener("keydown",e=>{e.key==="Escape"&&this.isVisible()&&this.hide()})}show(e,t={}){if(this.currentUser=e||g.getCurrentUser(),!this.currentUser)return;this.nameEl.textContent=this.currentUser.nombreCompleto||this.currentUser.nombreUsuario,this.roleEl.textContent=this.currentUser.rol,this.userIdEl.textContent=`ID: ${this.currentUser.usuarioId}`,this.roleEl.className="operator-role-pill";const a=(this.currentUser.rol||"").toLowerCase();this.roleEl.classList.add(`role-${a}`);const s=g.getLastAttendance();this._updateAttendanceState(s),this.modal.classList.add("active")}hide(){this.modal.classList.remove("active")}isVisible(){return this.modal.classList.contains("active")}async _handleClockIn(){if(this.currentUser)try{this.btnClockIn.disabled=!0;const e=await g.clockIn(this.currentUser.usuarioId);c.playSuccess(),r.success(`Entrada registrada a las ${new Date().toLocaleTimeString("es-PE")}`,"Clock-In Exitoso"),this._updateAttendanceState(e)}catch(e){c.playError(),r.danger(e.message||"Error al registrar Clock-In","Falla de Asistencia")}finally{this.btnClockIn.disabled=!1}}async _handleClockOut(){if(this.currentUser)try{this.btnClockOut.disabled=!0;const e=await g.clockOut(this.currentUser.usuarioId);c.playSuccess(),r.info(`Salida y fin de jornada registrados a las ${new Date().toLocaleTimeString("es-PE")}`,"Clock-Out Exitoso"),this._updateAttendanceState(e)}catch(e){c.playError(),r.warning(e.message||"Error al registrar Clock-Out","Falla de Salida")}finally{this.btnClockOut.disabled=!1}}_updateAttendanceState(e){if(!e||!e.estado){this.statusTextEl.textContent="Sin Marcación Registrada Hoy",this.statusBadgeEl.className="badge badge-warning",this.statusBadgeEl.textContent="Pendiente",this.btnClockIn.disabled=!1,this.btnClockOut.disabled=!0;return}if(e.estado==="ACTIVO"){const t=e.fechaIngreso?new Date(e.fechaIngreso).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}):"";this.statusTextEl.textContent=`Jornada Activa (Ingreso: ${t})`,this.statusBadgeEl.className="badge badge-success",this.statusBadgeEl.textContent="En Turno",this.btnClockIn.disabled=!0,this.btnClockOut.disabled=!1}else if(e.estado==="CERRADO"){const t=e.fechaSalida?new Date(e.fechaSalida).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}):"";this.statusTextEl.textContent=`Jornada Concluida (${t})`,this.statusBadgeEl.className="badge badge-navy",this.statusBadgeEl.textContent="Cerrado",this.btnClockIn.disabled=!1,this.btnClockOut.disabled=!0}}_handleProceed(){this.hide(),this.onProceed?this.onProceed(this.currentUser):d.navigate(this._getRouteForRole(this.currentUser.rol))}_getRouteForRole(e){switch(e){case"COCINA":return"/kitchen";case"ALMACENERO":return"/stock";default:return"/kitchen"}}}const x=`
<div class="auth-view animate-fade-in">
  
  <!-- Barra Superior del Terminal Táctil -->
  <div class="terminal-topbar">
    <div class="terminal-brand-group">
      <a href="#/" class="btn btn-ghost btn-back-home" title="Volver a la portada">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Inicio
      </a>
      <span class="brand-badge">Square POS • Terminal Operativo</span>
      <div id="connection-badge" class="badge badge-navy" title="Estado de Conexión">
        <span class="status-dot"></span> Conectando...
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
          <span id="backend-status-text">Sistema En Línea</span>
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
`;class Y{constructor(){this.container=null,this.clockInterval=null,this.healthInterval=null,this.pinPad=null,this.attendanceModal=null,this.selectedIdentifier=""}async mount(e){this.container=e,this.container.innerHTML=x,this._initClock(),this._initBackendStatus(),this._initOperatorSelector(),this._initPinPad(),this._initAttendanceModal()}_initClock(){const e=this.container.querySelector("#live-clock-time"),t=this.container.querySelector("#live-clock-date"),a=()=>{const s=new Date;e.textContent=s.toLocaleTimeString("es-PE",{hour12:!1}),t.textContent=s.toLocaleDateString("es-PE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})};a(),this.clockInterval=setInterval(a,1e3)}async _initBackendStatus(){const e=this.container.querySelector("#connection-badge"),t=this.container.querySelector("#backend-status-dot"),a=this.container.querySelector("#backend-status-text"),s=async()=>{await g.checkBackendHealth()?(e&&(e.className="badge badge-success",e.innerHTML='<span class="status-dot online"></span> En Línea'),t&&(t.className="status-dot online"),a&&(a.textContent="Sistema En Línea")):(e&&(e.className="badge badge-danger",e.innerHTML='<span class="status-dot error"></span> Sin Conexión'),t&&(t.className="status-dot error"),a&&(a.textContent="Sin Conexión"))};await s(),this.healthInterval=setInterval(s,1e4)}_initOperatorSelector(){const e=this.container.querySelector("#operator-grid"),t=this.container.querySelector("#identifier-input"),a=this.container.querySelector("#active-operator-label"),s=g.getRegisteredCollaborators();s.length>0?e.innerHTML=s.map((i,n)=>{const l=this._resolveRoleName(i.rolId),m=n===0;return m&&!this.selectedIdentifier&&(this.selectedIdentifier=i.numeroDocumento,t.value=i.numeroDocumento,a.textContent=`${i.nombreCompleto||i.nombre} • ${l}`),`
          <button type="button" class="operator-card ${m?"selected":""}" 
                  data-id="${i.numeroDocumento}" 
                  data-name="${i.nombreCompleto||i.nombre+" "+i.apellido}" 
                  data-role="${l}">
            <span class="operator-name">${i.nombreCompleto||i.nombre+" "+i.apellido}</span>
            <span class="operator-role-pill role-${l.toLowerCase()}">${l}</span>
          </button>
        `}).join(""):e.innerHTML=`
        <div style="grid-column: 1 / -1; padding: 1rem; background: var(--color-bg-subtle); border-radius: var(--border-radius-md); font-size: 0.88rem; color: var(--color-navy-600);">
          <strong>ℹ️ Sin colaboradores guardados localmente:</strong> Ingrese su DNI abajo o diríjase a 
          <a href="#/admin" style="color: var(--color-brand-primary); font-weight: 700; text-decoration: underline;">Backoffice Administrador</a> 
          para registrar cuentas de personal.
        </div>
      `,e.addEventListener("click",i=>{const n=i.target.closest(".operator-card");if(!n)return;c.playKeyTap(),e.querySelectorAll(".operator-card").forEach(y=>y.classList.remove("selected")),n.classList.add("selected");const l=n.dataset.id,m=n.dataset.name,h=n.dataset.role;this.selectedIdentifier=l,t.value=l,a.textContent=`${m} • ${h}`,this.pinPad&&this.pinPad.clear()}),t.addEventListener("input",i=>{this.selectedIdentifier=i.target.value.trim(),a.textContent=this.selectedIdentifier?`Identificador: ${this.selectedIdentifier}`:"Ingrese su Identificador",e.querySelectorAll(".operator-card").forEach(n=>{n.dataset.id===this.selectedIdentifier?n.classList.add("selected"):n.classList.remove("selected")})})}_resolveRoleName(e){switch(Number(e)){case 1:return"ADMIN";case 2:return"ALMACENERO";case 3:return"COCINA";case 4:return"MOZO";case 5:return"CAJERO";default:return"OPERADOR"}}_initPinPad(){const e=this.container.querySelector(".auth-right-pane");this.pinPad=new J({container:e,onComplete:async t=>{await this._handleLogin(this.selectedIdentifier,t)}})}_initAttendanceModal(){this.attendanceModal=new A({container:this.container,onProceed:e=>{this._navigateToRoleView(e.rol)}})}async _handleLogin(e,t){if(!e)throw c.playError(),r.warning("Por favor ingrese o seleccione su DNI o usuario","Identificador Requerido"),new Error("Identificador no especificado");try{const a=await g.loginWithPin(e,t);c.playSuccess(),r.success(`Acceso concedido a ${a.nombreCompleto}`,"Autenticación Exitosa"),a.requiresClockIn?setTimeout(()=>{this.attendanceModal.show(a)},300):setTimeout(()=>{this._navigateToRoleView(a.rol)},500)}catch(a){throw c.playError(),r.danger(a.message||"Credenciales o PIN inválido","Error de Autenticación"),a}}_navigateToRoleView(e){switch(e){case"COCINA":d.navigate("/kitchen");break;case"ALMACENERO":d.navigate("/stock");break;case"ADMIN":d.navigate("/admin");break;case"CAJERO":case"MOZO":default:d.navigate("/kitchen");break}}unmount(){this.clockInterval&&(clearInterval(this.clockInterval),this.clockInterval=null),this.healthInterval&&(clearInterval(this.healthInterval),this.healthInterval=null),this.pinPad&&(this.pinPad.destroy(),this.pinPad=null)}}const N=new Y,W=`
<div class="admin-view animate-fade-in">
  
  <!-- ====================================================================
       1. BARRA SUPERIOR DEL BACKOFFICE (ADMIN NAVBAR)
       ==================================================================== -->
  <header class="admin-header glass-panel">
    <div class="admin-header-brand">
      <a href="#/" class="btn btn-ghost btn-back-home" title="Volver al inicio">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Inicio
      </a>
      <span class="brand-badge">Square Backoffice</span>
      <div>
        <h1 class="text-h2" style="margin: 0; line-height: 1.1;">Dashboard Principal</h1>
        <span class="text-caption">Panel Gerencial del Dueño de Negocio</span>
      </div>
    </div>

    <div class="admin-header-actions">
      <!-- Indicador de Estado del Sistema -->
      <div id="admin-backend-status" class="badge badge-navy">
        <span class="status-dot"></span> Comprobando servidor...
      </div>

      <!-- Perfil del Administrador Autenticado -->
      <div class="admin-profile-pill" id="admin-user-pill">
        <div class="admin-avatar">👑</div>
        <div class="admin-profile-text">
          <span class="admin-profile-name" id="admin-user-name">Administrador</span>
          <span class="badge badge-brand" style="font-size: 0.68rem; padding: 0.1rem 0.45rem;">ADMIN</span>
        </div>
      </div>

      <!-- Enlace directo a la Terminal Táctil Operativa -->
      <a href="#/terminal" class="btn btn-secondary" id="btn-go-terminal" title="Abrir terminal táctil para empleados">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        Terminal de Empleados
      </a>

      <!-- Botón Cerrar Sesión Administrador -->
      <button type="button" id="btn-admin-logout" class="btn btn-ghost" title="Cerrar sesión de administrador" style="color: var(--color-danger-text);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Salir
      </button>
    </div>
  </header>

  <!-- ====================================================================
       2. RESUMEN GERENCIAL Y KPIS (DASHBOARD METRICS BAR)
       ==================================================================== -->
  <section class="admin-metrics-grid">
    
    <div class="kpi-card glass-panel">
      <div class="kpi-header">
        <span class="kpi-title">Personal Registrado</span>
        <span class="kpi-icon">👥</span>
      </div>
      <div class="kpi-value" id="kpi-collaborators-count">0</div>
      <div class="kpi-footer">
        <span class="badge badge-success">Sistema Conectado</span>
        <span class="text-caption">Cuentas con PIN activo</span>
      </div>
    </div>

    <div class="kpi-card glass-panel">
      <div class="kpi-header">
        <span class="kpi-title">Estación Cocina (KDS)</span>
        <span class="kpi-icon">🍳</span>
      </div>
      <div class="kpi-value" style="font-size: 1.4rem; color: #92400E;">Pantalla Fija</div>
      <div class="kpi-footer">
        <span class="badge badge-warning">Sin auto-bloqueo</span>
        <a href="#/kitchen" style="color: var(--color-brand-primary); font-weight: 700; font-size: 0.8rem; text-decoration: underline;">Abrir KDS →</a>
      </div>
    </div>

    <div class="kpi-card glass-panel">
      <div class="kpi-header">
        <span class="kpi-title">Estación Almacén</span>
        <span class="kpi-icon">📦</span>
      </div>
      <div class="kpi-value" style="font-size: 1.4rem; color: #1E40AF;">Auto-Lock 90s</div>
      <div class="kpi-footer">
        <span class="badge badge-navy">Seguridad de insumos</span>
        <a href="#/stock" style="color: var(--color-brand-primary); font-weight: 700; font-size: 0.8rem; text-decoration: underline;">Abrir Almacén →</a>
      </div>
    </div>

    <div class="kpi-card glass-panel">
      <div class="kpi-header">
        <span class="kpi-title">Planilla & Asistencia</span>
        <span class="kpi-icon">⏱️</span>
      </div>
      <div class="kpi-value" style="font-size: 1.4rem; color: var(--color-navy-900);">Planilla Perú</div>
      <div class="kpi-footer">
        <span class="badge badge-success">Clock-In / Out</span>
        <span class="text-caption">Jornadas laborales</span>
      </div>
    </div>

  </section>

  <!-- ====================================================================
       3. CONTENIDO PRINCIPAL: GESTIÓN DE PERSONAL & ROLES
       ==================================================================== -->
  <main class="admin-content-grid">
    
    <!-- COLUMNA IZQUIERDA: Formulario para Gestionar y Crear Nuevos Empleados -->
    <section class="admin-card glass-panel">
      <div class="card-header">
        <div>
          <span class="badge badge-brand" style="margin-bottom: 0.35rem;">Gestión de Personal</span>
          <h2 class="text-h2">Dar de Alta a un Colaborador</h2>
          <p class="text-caption">
            Crea cuentas para tu personal asignándoles su <strong>rol, DNI y PIN de 4 dígitos</strong>, 
            los cuales se almacenarán de forma segura en el sistema.
          </p>
        </div>
      </div>

      <form id="form-register-collaborator" class="register-form" novalidate>
        
        <!-- Selección de Rol Operativo -->
        <div class="form-group">
          <label for="reg-rol" class="form-label">
            Rol en el Restaurante: <span class="required-star">*</span>
          </label>
          <select id="reg-rol" class="form-select" required>
            <option value="3" selected>Cocina (KDS) — Pantalla fija permanente sin suspensión</option>
            <option value="2">Almacenero — Control de insumos (Auto-bloqueo preventivo 90s)</option>
            <option value="5">Cajero — Cobro y facturación de cuentas (Bloqueo 120s)</option>
            <option value="4">Mozo — Salón y atención en mesas (Bloqueo 120s)</option>
            <option value="1">Administrador — Gestión general y acceso a este Backoffice</option>
          </select>
          <div id="role-hint" class="text-caption" style="margin-top: 0.35rem; color: var(--color-navy-600);">
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

          <!-- Número de Documento (DNI) -->
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
              Nombres del Empleado: <span class="required-star">*</span>
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
              Apellidos del Empleado: <span class="required-star">*</span>
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
              PIN de Seguridad (4 Dígitos): <span class="required-star">*</span>
            </label>
            <div style="position: relative;">
              <input 
                type="password" 
                id="reg-pin" 
                class="form-input text-mono" 
                placeholder="4 dígitos numéricos" 
                maxlength="4" 
                pattern="\\d{4}" 
                style="letter-spacing: 0.35em; font-size: 1.15rem;"
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
            Guardar Empleado
          </button>
        </div>

      </form>
    </section>

    <!-- COLUMNA DERECHA: Lista de Colaboradores y Monitoreo de Estaciones -->
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      
      <!-- Lista de Colaboradores Registrados -->
      <section class="admin-card glass-panel" style="flex: 1;">
        <div class="card-header" style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 class="text-h3">Equipo Registrado en el Restaurante</h3>
            <span class="text-caption">Empleados autorizados para ingresar en la Terminal Táctil</span>
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
          Como <strong>Administrador / Dueño</strong>, controlas este Dashboard central. 
          Tus empleados <strong>no acceden a esta vista</strong>; ellos usan el botón 
          <a href="#/terminal" style="color: var(--color-brand-primary); font-weight: 700; text-decoration: underline;">"Soy empleado"</a> 
          desde la página inicial para iniciar sesión con su DNI y PIN en la <strong>Terminal de Personal</strong>.
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="#/terminal" class="btn btn-secondary" style="background: rgba(255,255,255,0.12); color: #FFFFFF; border-color: rgba(255,255,255,0.2); font-size: 0.85rem; min-height: 40px;">
            Abrir Terminal de Personal →
          </a>
          <a href="#/kitchen" class="btn btn-secondary" style="background: rgba(255,255,255,0.12); color: #FFFFFF; border-color: rgba(255,255,255,0.2); font-size: 0.85rem; min-height: 40px;">
            Ver Pantalla KDS Cocina →
          </a>
        </div>
      </section>

    </div>

  </main>

</div>
`;class Z{constructor(){this.container=null,this.healthCheckTimer=null}async mount(e){this.container=e,this.container.innerHTML=W,this._initUserProfile(),this._initHealthCheck(),this._initForm(),this._initRoleHints(),this._initPinToggle(),this._renderCollaboratorsList(),this._initLogout();const t=this.container.querySelector("#btn-refresh-team");t&&t.addEventListener("click",()=>{this._renderCollaboratorsList(),this._initHealthCheck(),r.info("Lista de colaboradores actualizada")})}_initUserProfile(){const e=p.getUser(),t=this.container.querySelector("#admin-user-name");e&&t&&(t.textContent=e.nombreCompleto||e.nombreUsuario||"Administrador")}_initLogout(){const e=this.container.querySelector("#btn-admin-logout");e&&e.addEventListener("click",()=>{g.logout(),r.info("Sesión de Administrador cerrada","Desconectado"),d.navigate("/")})}async _initHealthCheck(){const e=this.container.querySelector("#admin-backend-status");if(!e)return;await g.checkBackendHealth()?(e.className="badge badge-success",e.innerHTML='<span class="status-dot online"></span> Sistema Conectado'):(e.className="badge badge-danger",e.innerHTML='<span class="status-dot error"></span> Sin Conexión')}_initForm(){const e=this.container.querySelector("#form-register-collaborator"),t=this.container.querySelector("#btn-submit-register");e.addEventListener("submit",async a=>{a.preventDefault();const s=Number(this.container.querySelector("#reg-rol").value),i=this.container.querySelector("#reg-tipo-doc").value,n=this.container.querySelector("#reg-num-doc").value.trim(),l=this.container.querySelector("#reg-nombre").value.trim(),m=this.container.querySelector("#reg-apellido").value.trim(),h=this.container.querySelector("#reg-username").value.trim(),y=this.container.querySelector("#reg-pin").value.trim();if(!l||!m||!n||!h){c.playError(),r.warning("Complete todos los campos obligatorios del colaborador (*)","Campos Faltantes");return}if(!/^\d{4}$/.test(y)){c.playError(),r.danger("El PIN debe constar exactamente de 4 dígitos numéricos","Validación de PIN");return}const E={rolId:s,tipoDocumento:i,numeroDocumento:n,nombre:l,apellido:m,nombreUsuario:h,pin:y};try{t.disabled=!0,t.innerHTML=`
          <span class="status-dot online"></span> Guardando colaborador...
        `;const f=await g.register(E);c.playSuccess(),r.success(`Colaborador ${f.nombreCompleto} registrado con éxito`,"Empleado Registrado"),e.reset(),this._renderCollaboratorsList()}catch(f){c.playError(),r.danger(f.message||"Error al registrar colaborador","Error de Registro")}finally{t.disabled=!1,t.innerHTML=`
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Guardar Empleado
        `}})}_initRoleHints(){const e=this.container.querySelector("#reg-rol"),t=this.container.querySelector("#role-hint");e.addEventListener("change",()=>{switch(e.value){case"3":t.innerHTML="💡 <strong>Comportamiento UI:</strong> Pantalla fija permanente sin suspensión para despacho ágil de comandas.";break;case"2":t.innerHTML="🔒 <strong>Comportamiento UI:</strong> Auto-bloqueo preventivo de seguridad a los 90 segundos de inactividad.";break;case"5":t.innerHTML="💳 <strong>Comportamiento UI:</strong> Terminal de caja con bloqueo estándar a los 120 segundos.";break;case"4":t.innerHTML="🍽️ <strong>Comportamiento UI:</strong> Terminal móvil de salón para pedidos de mesa.";break;case"1":t.innerHTML="⚙️ <strong>Comportamiento UI:</strong> Acceso completo a paneles de configuración y auditoría.";break}})}_initPinToggle(){const e=this.container.querySelector("#reg-pin"),t=this.container.querySelector("#btn-toggle-pin-visibility");t&&e&&t.addEventListener("click",()=>{const a=e.type==="password";e.type=a?"text":"password",t.textContent=a?"🔒":"👁️"})}_renderCollaboratorsList(){const e=this.container.querySelector("#collaborators-list"),t=this.container.querySelector("#kpi-collaborators-count");if(!e)return;const a=g.getRegisteredCollaborators();if(t&&(t.textContent=String(a.length)),a.length===0){e.innerHTML=`
        <div class="empty-state-box">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">👥</div>
          <strong>No hay colaboradores creados en esta sesión</strong>
          <p style="margin-top: 0.3rem;">Complete el formulario a la izquierda para dar de alta al personal.</p>
        </div>
      `;return}e.innerHTML=a.map(s=>{const i=this._resolveRoleName(s.rolId),n=`role-${i.toLowerCase()}`;return`
        <div class="collaborator-item">
          <div class="collab-info">
            <span class="collab-name">${s.nombreCompleto||s.nombre+" "+s.apellido}</span>
            <span class="collab-meta">DNI: <strong>${s.numeroDocumento}</strong> • Usuario: @${s.nombreUsuario}</span>
          </div>
          <div class="collab-actions">
            <span class="operator-role-pill ${n}">${i}</span>
            <button type="button" class="btn-copy-dni" data-dni="${s.numeroDocumento}" title="Copiar DNI para Terminal">
              Copiar DNI
            </button>
          </div>
        </div>
      `}).join(""),e.querySelectorAll(".btn-copy-dni").forEach(s=>{s.addEventListener("click",()=>{var n;const i=s.dataset.dni;(n=navigator.clipboard)==null||n.writeText(i),r.info(`DNI ${i} copiado. Listo para ingresar en la Terminal Táctil.`)})})}_resolveRoleName(e){switch(Number(e)){case 1:return"ADMIN";case 2:return"ALMACENERO";case 3:return"COCINA";case 4:return"MOZO";case 5:return"CAJERO";default:return"OPERADOR"}}unmount(){this.healthCheckTimer&&(clearInterval(this.healthCheckTimer),this.healthCheckTimer=null)}}const Q=new Z,X=`
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

  <!-- Banner de configuración de pantalla -->
  <div class="kds-metadata-bar">
    <span>🖥️ <strong>Modo KDS Activo:</strong> Pantalla fija permanente (Sin auto-bloqueo para despacho continuo).</span>
    <span class="badge badge-navy">Sincronizado</span>
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
`;class ee{constructor(){this.container=null,this.attendanceModal=null}async mount(e){this.container=e,this.container.innerHTML=X;const t=p.getUser();if(t){const i=this.container.querySelector("#kds-operator-name");i&&(i.textContent=t.nombreCompleto||t.nombreUsuario)}const a=this.container.querySelector("#btn-kds-lock");a&&a.addEventListener("click",()=>{d.navigate("/auth")});const s=this.container.querySelector("#btn-kds-attendance");s&&s.addEventListener("click",()=>{this._openAttendanceModal()})}_openAttendanceModal(){let e=document.getElementById("kds-modal-root");if(!e){e=S.create("div",{id:"kds-modal-root"});const a=document.createElement("div");a.innerHTML=x;const s=a.querySelector("#attendance-modal");s&&e.appendChild(s),document.body.appendChild(e)}const t=new A({container:e,onProceed:()=>t.hide()});t.show(p.getUser())}unmount(){const e=document.getElementById("kds-modal-root");e&&e.remove()}}const te=new ee,ae=`
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
`;class se{constructor(){this.container=null}async mount(e){this.container=e,this.container.innerHTML=ae;const t=p.getUser();if(t){const i=this.container.querySelector("#stock-operator-name");i&&(i.textContent=t.nombreCompleto||t.nombreUsuario)}const a=this.container.querySelector("#btn-stock-lock");a&&a.addEventListener("click",()=>{d.navigate("/auth")});const s=this.container.querySelector("#btn-stock-attendance");s&&s.addEventListener("click",()=>{this._openAttendanceModal()})}_openAttendanceModal(){let e=document.getElementById("stock-modal-root");if(!e){e=S.create("div",{id:"stock-modal-root"});const a=document.createElement("div");a.innerHTML=x;const s=a.querySelector("#attendance-modal");s&&e.appendChild(s),document.body.appendChild(e)}const t=new A({container:e,onProceed:()=>t.hide()});t.show(p.getUser())}unmount(){const e=document.getElementById("stock-modal-root");e&&e.remove()}}const ie=new se;class ne{constructor(){this.isInitialized=!1}async init(){if(!this.isInitialized){if(console.log("%c[Square Gastro POS & KDS] Iniciando Sistema Multiusuario","color: #E15A2B; font-weight: bold; font-size: 14px;"),this._setupEventSubscriptions(),d.register("/",{component:K,requiresAuth:!1}),d.register("/register",{component:$,requiresAuth:!1}),d.register("/admin",{component:Q,requiresAuth:!0,allowedRoles:["ADMIN"]}),d.register("/terminal",{component:N,requiresAuth:!1}),d.register("/auth",{component:N,requiresAuth:!1}),d.register("/kitchen",{component:te,requiresAuth:!0,allowedRoles:["COCINA","ADMIN","CAJERO","MOZO"]}),d.register("/stock",{component:ie,requiresAuth:!0,allowedRoles:["ALMACENERO","ADMIN"]}),p.isAuthenticated()){const e=p.getUiMetadata();e&&C.configure(e)}d.init("#main-content"),this.isInitialized=!0}}_setupEventSubscriptions(){v.on(b.SESSION_LOCKED,({reason:e})=>{r.warning("Terminal bloqueado por seguridad.","Sesión Pausada"),d.navigate("/terminal")}),v.on(b.AUTH_LOGOUT,()=>{r.info("Sesión cerrada correctamente.","Desconectado"),d.navigate("/")}),v.on(b.CLOCK_IN_SUCCESS,e=>{console.log("[App] Marcación de entrada confirmada:",e)}),v.on(b.CLOCK_OUT_SUCCESS,e=>{console.log("[App] Marcación de salida confirmada:",e)})}}const _=new ne;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>_.init()):_.init();
