(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();const r={API_BASE_URL:typeof window<"u"&&window.RESTAURANT_API_URL?window.RESTAURANT_API_URL:"http://localhost:8080",ENDPOINTS:{AUTH_LOGIN_PIN:"/api/v1/auth/login-pin",AUTH_REGISTER:"/api/v1/auth/register",ASISTENCIA_CLOCK_IN:"/api/v1/asistencia/clock-in",ASISTENCIA_CLOCK_OUT:"/api/v1/asistencia/clock-out"},TIMEOUT_MS:8e3,STORAGE_KEYS:{TOKEN:"restaurant_pos_token",USER:"restaurant_pos_user",UI_METADATA:"restaurant_pos_ui_meta",LAST_ATTENDANCE:"restaurant_pos_last_attendance",REGISTERED_COLLABORATORS:"restaurant_registered_collaborators"}};class O{constructor(){this._listeners=new Set,this._memoryStorage={}}_getItem(e){return typeof localStorage<"u"?localStorage.getItem(e):this._memoryStorage[e]||null}_setItem(e,t){typeof localStorage<"u"?localStorage.setItem(e,t):this._memoryStorage[e]=String(t)}_removeItem(e){typeof localStorage<"u"?localStorage.removeItem(e):delete this._memoryStorage[e]}saveSession({token:e,usuarioId:t,nombreCompleto:s,nombreUsuario:a,rol:n,requiresClockIn:o,uiMetadata:l}){const p={usuarioId:t,nombreCompleto:s,nombreUsuario:a,rol:n,requiresClockIn:o,loginAt:new Date().toISOString()};this._setItem(r.STORAGE_KEYS.TOKEN,e),this._setItem(r.STORAGE_KEYS.USER,JSON.stringify(p)),this._setItem(r.STORAGE_KEYS.UI_METADATA,JSON.stringify(l)),this._notify({type:"LOGIN",session:p,token:e,uiMetadata:l})}getToken(){return this._getItem(r.STORAGE_KEYS.TOKEN)||null}getUser(){const e=this._getItem(r.STORAGE_KEYS.USER);try{return e?JSON.parse(e):null}catch{return null}}getUiMetadata(){const e=this._getItem(r.STORAGE_KEYS.UI_METADATA);try{return e?JSON.parse(e):null}catch{return null}}saveAttendance(e){this._setItem(r.STORAGE_KEYS.LAST_ATTENDANCE,JSON.stringify(e));const t=this.getUser();t&&e.estado==="ACTIVO"&&(t.requiresClockIn=!1,this._setItem(r.STORAGE_KEYS.USER,JSON.stringify(t))),this._notify({type:"ATTENDANCE_UPDATED",attendance:e})}getLastAttendance(){const e=this._getItem(r.STORAGE_KEYS.LAST_ATTENDANCE);try{return e?JSON.parse(e):null}catch{return null}}isAuthenticated(){return!!this.getToken()&&!!this.getUser()}clearSession(){this._removeItem(r.STORAGE_KEYS.TOKEN),this._removeItem(r.STORAGE_KEYS.USER),this._removeItem(r.STORAGE_KEYS.UI_METADATA),this._notify({type:"LOGOUT"})}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}_notify(e){for(const t of this._listeners)try{t(e)}catch(s){console.error("[SessionStore] Error en suscriptor:",s)}}}const c=new O;class L{constructor(){this.events=new Map}on(e,t){return this.events.has(e)||this.events.set(e,new Set),this.events.get(e).add(t),()=>this.off(e,t)}off(e,t){this.events.has(e)&&this.events.get(e).delete(t)}emit(e,t){this.events.has(e)&&this.events.get(e).forEach(s=>{try{s(t)}catch(a){console.error(`[EventBus] Error en manejador de evento '${e}':`,a)}})}}const g=new L,v={AUTH_SUCCESS:"auth:success",AUTH_LOGOUT:"auth:logout",CLOCK_IN_SUCCESS:"attendance:clock-in:success",CLOCK_OUT_SUCCESS:"attendance:clock-out:success",SESSION_LOCKED:"session:locked",NAVIGATE:"router:navigate",TOAST:"ui:toast"};class N{constructor(){this.routes=new Map,this.currentRoute=null,this.containerElement=null,window.addEventListener("hashchange",()=>this._handleHashChange())}init(e){if(this.containerElement=document.querySelector(e),!this.containerElement)throw new Error(`Contenedor de rutas '${e}' no encontrado en el DOM.`);this._handleHashChange()}register(e,{component:t,requiresAuth:s=!0,allowedRoles:a=[]}){this.routes.set(e,{component:t,requiresAuth:s,allowedRoles:a})}navigate(e){window.location.hash=e}async _handleHashChange(){let e=window.location.hash.slice(1);(!e||e==="/")&&(e=c.isAuthenticated()?this._getDefaultRouteForRole():"/terminal"),e==="/auth"&&(e="/terminal");const t=this.routes.get(e)||this.routes.get("/terminal");if(!t)return;if(t.requiresAuth&&!c.isAuthenticated()){console.warn("[Router] Ruta protegida. Redirigiendo a /terminal"),this.navigate("/terminal");return}const s=c.getUser();if(t.requiresAuth&&t.allowedRoles.length>0&&s&&!t.allowedRoles.includes(s.rol)){console.warn(`[Router] Rol ${s.rol} no autorizado para ${e}`),this.navigate(this._getDefaultRouteForRole());return}this.currentRoute=e,this.containerElement&&t.component&&(this.containerElement.innerHTML="",await t.component.mount(this.containerElement)),g.emit(v.NAVIGATE,{path:e,user:s})}_getDefaultRouteForRole(){const e=c.getUser();if(!e)return"/terminal";switch(e.rol){case"ADMIN":return"/admin";case"COCINA":return"/kitchen";case"ALMACENERO":return"/stock";case"CAJERO":case"MOZO":default:return"/kitchen"}}}const d=new N;class R{constructor(){this.timer=null,this.warningTimer=null,this.timeoutSeconds=0,this.isFixedScreen=!1,this.isActive=!1,this._onUserActivity=this._onUserActivity.bind(this)}configure(e){if(this.stop(),!!e){if(this.isFixedScreen=!!e.fixedScreen,this.timeoutSeconds=e.inactivityTimeoutSeconds||0,this.isFixedScreen||!e.autoLock||this.timeoutSeconds<=0){console.log(`[InactivityTimer] Pantalla configurada como fija o sin auto-bloqueo (${e.roleName||"ROLE"}).`);return}console.log(`[InactivityTimer] Activando auto-bloqueo a los ${this.timeoutSeconds}s para ${e.roleName}.`),this.start()}}start(){this.isActive=!0,this._attachListeners(),this._resetTimer()}stop(){this.isActive=!1,this._detachListeners(),this._clearTimers()}_resetTimer(){if(this._clearTimers(),!this.isActive||this.timeoutSeconds<=0)return;const e=Math.max((this.timeoutSeconds-15)*1e3,5e3),t=this.timeoutSeconds*1e3;this.warningTimer=setTimeout(()=>{g.emit(v.TOAST,{type:"warning",title:"Bloqueo por Inactividad",message:"La pantalla del terminal se bloqueará en 15 segundos por seguridad.",duration:8e3})},e),this.timer=setTimeout(()=>{console.warn("[InactivityTimer] Tiempo de inactividad expirado. Bloqueando terminal."),g.emit(v.SESSION_LOCKED,{reason:"TIMEOUT"})},t)}_clearTimers(){this.timer&&clearTimeout(this.timer),this.warningTimer&&clearTimeout(this.warningTimer),this.timer=null,this.warningTimer=null}_onUserActivity(){this.isActive&&this._resetTimer()}_attachListeners(){if(typeof window>"u")return;["pointerdown","keydown","touchstart","mousemove"].forEach(t=>window.addEventListener(t,this._onUserActivity,{passive:!0}))}_detachListeners(){if(typeof window>"u")return;["pointerdown","keydown","touchstart","mousemove"].forEach(t=>window.removeEventListener(t,this._onUserActivity))}}const C=new R;class q{constructor(){this.ctx=null,this.enabled=!0}_initContext(){if(!this.ctx&&(window.AudioContext||window.webkitAudioContext)){const e=window.AudioContext||window.webkitAudioContext;this.ctx=new e}}playKeyTap(){if(this.enabled)try{if(this._initContext(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const e=this.ctx.createOscillator(),t=this.ctx.createGain();e.type="sine",e.frequency.setValueAtTime(440,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(880,this.ctx.currentTime+.03),t.gain.setValueAtTime(.06,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.03),e.connect(t),t.connect(this.ctx.destination),e.start(),e.stop(this.ctx.currentTime+.035)}catch{}}playSuccess(){if(this.enabled)try{if(this._initContext(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const e=this.ctx.currentTime,t=this.ctx.createOscillator(),s=this.ctx.createGain();t.type="triangle",t.frequency.setValueAtTime(523.25,e),t.frequency.setValueAtTime(659.25,e+.08),t.frequency.setValueAtTime(783.99,e+.16),s.gain.setValueAtTime(.08,e),s.gain.exponentialRampToValueAtTime(.001,e+.28),t.connect(s),s.connect(this.ctx.destination),t.start(),t.stop(e+.3)}catch{}}playError(){if(this.enabled)try{if(this._initContext(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const e=this.ctx.currentTime,t=this.ctx.createOscillator(),s=this.ctx.createGain();t.type="sawtooth",t.frequency.setValueAtTime(220,e),t.frequency.linearRampToValueAtTime(140,e+.15),s.gain.setValueAtTime(.07,e),s.gain.exponentialRampToValueAtTime(.001,e+.18),t.connect(s),s.connect(this.ctx.destination),t.start(),t.stop(e+.2)}catch{}}}const u=new q,S={get(i,e=document){return e.querySelector(i)},getAll(i,e=document){return Array.from(e.querySelectorAll(i))},create(i,e={},...t){const s=document.createElement(i);return Object.entries(e).forEach(([a,n])=>{a==="className"?s.className=n:a.startsWith("on")&&typeof n=="function"?s.addEventListener(a.slice(2).toLowerCase(),n):s.setAttribute(a,n)}),t.forEach(a=>{typeof a=="string"||typeof a=="number"?s.appendChild(document.createTextNode(String(a))):a instanceof HTMLElement&&s.appendChild(a)}),s},htmlToElement(i){const e=document.createElement("template");return e.innerHTML=i.trim(),e.content.firstElementChild}};class P{constructor(){this.container=null,this._init()}_init(){let e=document.getElementById("toast-container");e||(e=S.create("div",{id:"toast-container"}),document.body.appendChild(e)),this.container=e,g.on(v.TOAST,t=>this.show(t))}show({type:e="info",title:t="",message:s="",duration:a=4500}){this.container||this._init();const n=S.create("div",{className:`toast toast-${e} glass-panel`}),o=this._getIconSvg(e);return n.innerHTML=`
      <div style="flex-shrink: 0; margin-top: 2px;">
        ${o}
      </div>
      <div style="flex: 1; min-width: 0;">
        ${t?`<div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 2px; color: var(--color-navy-900);">${t}</div>`:""}
        <div style="font-size: 0.875rem; color: var(--color-navy-700); line-height: 1.4;">${s}</div>
      </div>
      <button class="toast-close" style="flex-shrink: 0; color: var(--color-navy-500); padding: 4px; border-radius: 4px; line-height: 1;" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `,n.querySelector(".toast-close").addEventListener("click",()=>this._removeToast(n)),this.container.appendChild(n),a>0&&setTimeout(()=>this._removeToast(n),a),n}_removeToast(e){!e||!e.parentElement||(e.style.opacity="0",e.style.transform="translateY(-10px)",setTimeout(()=>{e.parentElement&&e.remove()},200))}_getIconSvg(e){switch(e){case"success":return`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
        </svg>`}}success(e,t="Operación Exitosa"){return this.show({type:"success",title:t,message:e})}warning(e,t="Atención"){return this.show({type:"warning",title:t,message:e})}danger(e,t="Error"){return this.show({type:"danger",title:t,message:e})}info(e,t="Información"){return this.show({type:"info",title:t,message:e})}}const h=new P;class f extends Error{constructor({status:e=500,error:t="Error de Servidor",message:s="Ha ocurrido un error inesperado",data:a=null,timestamp:n=new Date().toISOString()}){super(s),this.name="HttpError",this.status=e,this.error=t,this.data=a,this.timestamp=n}static fromBackendJson(e,t){return t&&typeof t=="object"?new f({status:t.status||e,error:t.error||"Error de Petición",message:t.message||"Error no especificado por el servidor",timestamp:t.timestamp||new Date().toISOString()}):new f({status:e,error:"HTTP "+e,message:"Error en la respuesta del servidor"})}static networkError(e){return new f({status:0,error:"Error de Conexión",message:"No se pudo contactar con el servidor POS. Verifique que el backend esté encendido."})}}class D{constructor(e=r.API_BASE_URL){this.baseUrl=e}async request(e,t={}){const s=`${this.baseUrl}${e}`,a=c.getToken(),n={"Content-Type":"application/json",Accept:"application/json",...a?{Authorization:`Bearer ${a}`}:{},...t.headers||{}},o={...t,headers:n},l=new AbortController,p=setTimeout(()=>l.abort(),r.TIMEOUT_MS);o.signal=l.signal;try{const m=await fetch(s,o);clearTimeout(p);let y;const E=m.headers.get("content-type");if(E&&E.includes("application/json")?y=await m.json():y=await m.text(),!m.ok)throw f.fromBackendJson(m.status,y);return y}catch(m){throw clearTimeout(p),m instanceof f?m:new f({status:0,error:"Conexión Rechazada",message:`No se pudo conectar con el servidor backend en ${this.baseUrl}. Verifique que el servicio Java (RestaurantApplication) esté ejecutándose.`})}}async get(e,t={}){return this.request(e,{...t,method:"GET"})}async post(e,t,s={}){return this.request(e,{...s,method:"POST",body:JSON.stringify(t)})}async checkHealth(){try{const e=new AbortController,t=setTimeout(()=>e.abort(),2e3),s=await fetch(`${this.baseUrl}/api/v1/auth/login-pin`,{method:"OPTIONS",signal:e.signal});return clearTimeout(t),s.status===204||s.ok}catch{return!1}}}const k=new D;class U{constructor({rolId:e,tipoDocumento:t,numeroDocumento:s,nombre:a,apellido:n,nombreUsuario:o,pin:l}){this.rolId=Number(e),this.tipoDocumento=(t||"DNI").trim(),this.numeroDocumento=(s||"").trim(),this.nombre=(a||"").trim(),this.apellido=(n||"").trim(),this.nombreUsuario=(o||"").trim().toLowerCase(),this.pin=String(l||"").trim()}validate(){if(!this.rolId||this.rolId<=0)throw new Error("Debe seleccionar un Rol válido para el colaborador");if(!this.tipoDocumento)throw new Error("El tipo de documento es obligatorio (ej. DNI, CE)");if(!this.numeroDocumento)throw new Error("El número de documento es obligatorio");if(!this.nombre)throw new Error("El nombre del colaborador es obligatorio");if(!this.apellido)throw new Error("El apellido del colaborador es obligatorio");if(!this.nombreUsuario)throw new Error("El nombre de usuario es obligatorio");if(!/^\d{4}$/.test(this.pin))throw new Error("El PIN debe constar exactamente de 4 dígitos numéricos")}toJSON(){return{rolId:this.rolId,tipoDocumento:this.tipoDocumento,numeroDocumento:this.numeroDocumento,nombre:this.nombre,apellido:this.apellido,nombreUsuario:this.nombreUsuario,pin:this.pin}}}class M{constructor(e,t){this.identifier=(e||"").trim(),this.pin=String(t||"").trim()}validate(){if(!this.identifier)throw new Error("El identificador (DNI o nombre de usuario) es obligatorio");if(!/^\d{4}$/.test(this.pin))throw new Error("El PIN de acceso debe contener exactamente 4 dígitos numéricos")}toJSON(){return{identifier:this.identifier,pin:this.pin,rawPin:this.pin}}}class x{constructor(e){this.usuarioId=Number(e)}validate(){if(!this.usuarioId||this.usuarioId<=0)throw new Error("El ID de usuario debe ser un número entero positivo válido")}toJSON(){return{usuarioId:this.usuarioId}}}class B{async register(e){const t=new U(e);t.validate();const a=(await k.post(r.ENDPOINTS.AUTH_REGISTER,t.toJSON())).data;return this._saveRegisteredCollaborator(a),a}async loginWithPin(e,t){const s=new M(e,t);s.validate();const n=(await k.post(r.ENDPOINTS.AUTH_LOGIN_PIN,s.toJSON())).data;return c.saveSession(n),n.uiMetadata&&C.configure(n.uiMetadata),g.emit(v.AUTH_SUCCESS,n),n}async clockIn(e){const t=new x(e);t.validate();const a=(await k.post(r.ENDPOINTS.ASISTENCIA_CLOCK_IN,t.toJSON())).data;return c.saveAttendance(a),g.emit(v.CLOCK_IN_SUCCESS,a),a}async clockOut(e){const t=new x(e);t.validate();const a=(await k.post(r.ENDPOINTS.ASISTENCIA_CLOCK_OUT,t.toJSON())).data;return c.saveAttendance(a),g.emit(v.CLOCK_OUT_SUCCESS,a),a}logout(){C.stop(),c.clearSession(),g.emit(v.AUTH_LOGOUT)}getCurrentUser(){return c.getUser()}getLastAttendance(){return c.getLastAttendance()}isAuthenticated(){return c.isAuthenticated()}async checkBackendHealth(){return k.checkHealth()}getRegisteredCollaborators(){const e=localStorage.getItem(r.STORAGE_KEYS.REGISTERED_COLLABORATORS);if(!e)return[];try{return JSON.parse(e)}catch{return[]}}_saveRegisteredCollaborator(e){const s=this.getRegisteredCollaborators().filter(a=>a.numeroDocumento!==e.numeroDocumento);s.unshift(e),localStorage.setItem(r.STORAGE_KEYS.REGISTERED_COLLABORATORS,JSON.stringify(s))}}const b=new B;class H{constructor({container:e,onComplete:t}){this.container=e,this.onComplete=t,this.pin="",this.isProcessing=!1,this.dots=Array.from(e.querySelectorAll(".pin-dot")),this.dotsContainer=e.querySelector("#pin-dots-container"),this.keypad=e.querySelector("#touch-keypad"),this._bindEvents()}_bindEvents(){this.keypad.addEventListener("click",e=>{if(this.isProcessing)return;const t=e.target.closest(".keypad-btn");if(!t)return;const s=t.dataset.key;this._handleKey(s)}),this._keydownHandler=e=>{this.isProcessing||e.target.tagName!=="INPUT"&&(e.key>="0"&&e.key<="9"?this._handleKey(e.key):e.key==="Backspace"?this._handleKey("backspace"):e.key==="Escape"&&this._handleKey("clear"))},window.addEventListener("keydown",this._keydownHandler)}_handleKey(e){if(e==="clear"){u.playKeyTap(),this.clear();return}if(e==="backspace"){u.playKeyTap(),this.backspace();return}/^\d$/.test(e)&&this.pin.length<4&&(u.playKeyTap(),this.pin+=e,this._updateView(),this.pin.length===4&&this._submit())}_updateView(){this.dots.forEach((e,t)=>{t<this.pin.length?e.classList.add("filled"):e.classList.remove("filled","error")})}async _submit(){this.isProcessing=!0;const e=this.pin;try{this.onComplete&&await this.onComplete(e)}catch{this.triggerError()}finally{this.isProcessing=!1}}triggerError(){u.playError(),this.dotsContainer.classList.add("animate-shake"),this.dots.forEach(e=>e.classList.add("error")),setTimeout(()=>{this.dotsContainer.classList.remove("animate-shake"),this.clear()},600)}clear(){this.pin="",this._updateView(),this.dots.forEach(e=>e.classList.remove("error"))}backspace(){this.pin.length>0&&(this.pin=this.pin.slice(0,-1),this._updateView())}destroy(){window.removeEventListener("keydown",this._keydownHandler)}}class A{constructor({container:e,onProceed:t}){this.container=e,this.onProceed=t,this.currentUser=null,this.modal=e.querySelector("#attendance-modal"),this.nameEl=e.querySelector("#attendance-user-name"),this.roleEl=e.querySelector("#attendance-user-role"),this.userIdEl=e.querySelector("#attendance-user-id"),this.statusTextEl=e.querySelector("#attendance-current-status"),this.statusBadgeEl=e.querySelector("#attendance-status-badge"),this.btnClockIn=e.querySelector("#btn-clock-in"),this.btnClockOut=e.querySelector("#btn-clock-out"),this.btnProceed=e.querySelector("#btn-proceed-station"),this.btnClose=e.querySelector("#btn-close-attendance-modal"),this._bindEvents()}_bindEvents(){this.btnClockIn.addEventListener("click",()=>this._handleClockIn()),this.btnClockOut.addEventListener("click",()=>this._handleClockOut()),this.btnProceed.addEventListener("click",()=>this._handleProceed()),this.btnClose.addEventListener("click",()=>this.hide()),window.addEventListener("keydown",e=>{e.key==="Escape"&&this.isVisible()&&this.hide()})}show(e,t={}){if(this.currentUser=e||b.getCurrentUser(),!this.currentUser)return;this.nameEl.textContent=this.currentUser.nombreCompleto||this.currentUser.nombreUsuario,this.roleEl.textContent=this.currentUser.rol,this.userIdEl.textContent=`ID: ${this.currentUser.usuarioId}`,this.roleEl.className="operator-role-pill";const s=(this.currentUser.rol||"").toLowerCase();this.roleEl.classList.add(`role-${s}`);const a=b.getLastAttendance();this._updateAttendanceState(a),this.modal.classList.add("active")}hide(){this.modal.classList.remove("active")}isVisible(){return this.modal.classList.contains("active")}async _handleClockIn(){if(this.currentUser)try{this.btnClockIn.disabled=!0;const e=await b.clockIn(this.currentUser.usuarioId);u.playSuccess(),h.success(`Entrada registrada a las ${new Date().toLocaleTimeString("es-PE")}`,"Clock-In Exitoso"),this._updateAttendanceState(e)}catch(e){u.playError(),h.danger(e.message||"Error al registrar Clock-In","Falla de Asistencia")}finally{this.btnClockIn.disabled=!1}}async _handleClockOut(){if(this.currentUser)try{this.btnClockOut.disabled=!0;const e=await b.clockOut(this.currentUser.usuarioId);u.playSuccess(),h.info(`Salida y fin de jornada registrados a las ${new Date().toLocaleTimeString("es-PE")}`,"Clock-Out Exitoso"),this._updateAttendanceState(e)}catch(e){u.playError(),h.warning(e.message||"Error al registrar Clock-Out","Falla de Salida")}finally{this.btnClockOut.disabled=!1}}_updateAttendanceState(e){if(!e||!e.estado){this.statusTextEl.textContent="Sin Marcación Registrada Hoy",this.statusBadgeEl.className="badge badge-warning",this.statusBadgeEl.textContent="Pendiente",this.btnClockIn.disabled=!1,this.btnClockOut.disabled=!0;return}if(e.estado==="ACTIVO"){const t=e.fechaIngreso?new Date(e.fechaIngreso).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}):"";this.statusTextEl.textContent=`Jornada Activa (Ingreso: ${t})`,this.statusBadgeEl.className="badge badge-success",this.statusBadgeEl.textContent="En Turno",this.btnClockIn.disabled=!0,this.btnClockOut.disabled=!1}else if(e.estado==="CERRADO"){const t=e.fechaSalida?new Date(e.fechaSalida).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"}):"";this.statusTextEl.textContent=`Jornada Concluida (${t})`,this.statusBadgeEl.className="badge badge-navy",this.statusBadgeEl.textContent="Cerrado",this.btnClockIn.disabled=!1,this.btnClockOut.disabled=!0}}_handleProceed(){this.hide(),this.onProceed?this.onProceed(this.currentUser):d.navigate(this._getRouteForRole(this.currentUser.rol))}_getRouteForRole(e){switch(e){case"COCINA":return"/kitchen";case"ALMACENERO":return"/stock";default:return"/kitchen"}}}const T=`
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
`;class F{constructor(){this.container=null,this.clockInterval=null,this.healthInterval=null,this.pinPad=null,this.attendanceModal=null,this.selectedIdentifier=""}async mount(e){this.container=e,this.container.innerHTML=T,this._initClock(),this._initBackendStatus(),this._initOperatorSelector(),this._initPinPad(),this._initAttendanceModal()}_initClock(){const e=this.container.querySelector("#live-clock-time"),t=this.container.querySelector("#live-clock-date"),s=()=>{const a=new Date;e.textContent=a.toLocaleTimeString("es-PE",{hour12:!1}),t.textContent=a.toLocaleDateString("es-PE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})};s(),this.clockInterval=setInterval(s,1e3)}async _initBackendStatus(){const e=this.container.querySelector("#connection-badge"),t=this.container.querySelector("#backend-status-dot"),s=this.container.querySelector("#backend-status-text"),a=async()=>{await b.checkBackendHealth()?(e&&(e.className="badge badge-success",e.innerHTML='<span class="status-dot online"></span> Backend :8080 En Línea'),t&&(t.className="status-dot online"),s&&(s.textContent="Backend Java SE :8080 Conectado")):(e&&(e.className="badge badge-danger",e.innerHTML='<span class="status-dot error"></span> Servidor Desconectado'),t&&(t.className="status-dot error"),s&&(s.textContent="Sin conexión con :8080"))};await a(),this.healthInterval=setInterval(a,1e4)}_initOperatorSelector(){const e=this.container.querySelector("#operator-grid"),t=this.container.querySelector("#identifier-input"),s=this.container.querySelector("#active-operator-label"),a=b.getRegisteredCollaborators();a.length>0?e.innerHTML=a.map((n,o)=>{const l=this._resolveRoleName(n.rolId),p=o===0;return p&&!this.selectedIdentifier&&(this.selectedIdentifier=n.numeroDocumento,t.value=n.numeroDocumento,s.textContent=`${n.nombreCompleto||n.nombre} • ${l}`),`
          <button type="button" class="operator-card ${p?"selected":""}" 
                  data-id="${n.numeroDocumento}" 
                  data-name="${n.nombreCompleto||n.nombre+" "+n.apellido}" 
                  data-role="${l}">
            <span class="operator-name">${n.nombreCompleto||n.nombre+" "+n.apellido}</span>
            <span class="operator-role-pill role-${l.toLowerCase()}">${l}</span>
          </button>
        `}).join(""):e.innerHTML=`
        <div style="grid-column: 1 / -1; padding: 1rem; background: var(--color-bg-subtle); border-radius: var(--border-radius-md); font-size: 0.88rem; color: var(--color-navy-600);">
          <strong>ℹ️ Sin colaboradores guardados localmente:</strong> Ingrese su DNI abajo o diríjase a 
          <a href="#/admin" style="color: var(--color-brand-primary); font-weight: 700; text-decoration: underline;">Backoffice Administrador</a> 
          para registrar cuentas en PostgreSQL.
        </div>
      `,e.addEventListener("click",n=>{const o=n.target.closest(".operator-card");if(!o)return;u.playKeyTap(),e.querySelectorAll(".operator-card").forEach(y=>y.classList.remove("selected")),o.classList.add("selected");const l=o.dataset.id,p=o.dataset.name,m=o.dataset.role;this.selectedIdentifier=l,t.value=l,s.textContent=`${p} • ${m}`,this.pinPad&&this.pinPad.clear()}),t.addEventListener("input",n=>{this.selectedIdentifier=n.target.value.trim(),s.textContent=this.selectedIdentifier?`Identificador: ${this.selectedIdentifier}`:"Ingrese su Identificador",e.querySelectorAll(".operator-card").forEach(o=>{o.dataset.id===this.selectedIdentifier?o.classList.add("selected"):o.classList.remove("selected")})})}_resolveRoleName(e){switch(Number(e)){case 1:return"ADMIN";case 2:return"ALMACENERO";case 3:return"COCINA";case 4:return"MOZO";case 5:return"CAJERO";default:return"OPERADOR"}}_initPinPad(){const e=this.container.querySelector(".auth-right-pane");this.pinPad=new H({container:e,onComplete:async t=>{await this._handleLogin(this.selectedIdentifier,t)}})}_initAttendanceModal(){this.attendanceModal=new A({container:this.container,onProceed:e=>{this._navigateToRoleView(e.rol)}})}async _handleLogin(e,t){if(!e)throw u.playError(),h.warning("Por favor ingrese o seleccione su DNI o usuario","Identificador Requerido"),new Error("Identificador no especificado");try{const s=await b.loginWithPin(e,t);u.playSuccess(),h.success(`Acceso concedido a ${s.nombreCompleto}`,"Autenticación Exitosa"),s.requiresClockIn?setTimeout(()=>{this.attendanceModal.show(s)},300):setTimeout(()=>{this._navigateToRoleView(s.rol)},500)}catch(s){throw u.playError(),h.danger(s.message||"Credenciales o PIN inválido","Error de Autenticación"),s}}_navigateToRoleView(e){switch(e){case"COCINA":d.navigate("/kitchen");break;case"ALMACENERO":d.navigate("/stock");break;case"ADMIN":d.navigate("/admin");break;case"CAJERO":case"MOZO":default:d.navigate("/kitchen");break}}unmount(){this.clockInterval&&(clearInterval(this.clockInterval),this.clockInterval=null),this.healthInterval&&(clearInterval(this.healthInterval),this.healthInterval=null),this.pinPad&&(this.pinPad.destroy(),this.pinPad=null)}}const I=new F,K=`
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
`;class ${constructor(){this.container=null,this.healthCheckTimer=null}async mount(e){this.container=e,this.container.innerHTML=K,this._initHealthCheck(),this._initForm(),this._initRoleHints(),this._initPinToggle(),this._renderCollaboratorsList();const t=this.container.querySelector("#btn-refresh-team");t&&t.addEventListener("click",()=>{this._renderCollaboratorsList(),this._initHealthCheck(),h.info("Lista de colaboradores actualizada")})}async _initHealthCheck(){const e=this.container.querySelector("#admin-backend-status");if(!e)return;await b.checkBackendHealth()?(e.className="badge badge-success",e.innerHTML='<span class="status-dot online"></span> Backend Java :8080 Conectado'):(e.className="badge badge-danger",e.innerHTML='<span class="status-dot error"></span> Backend Desconectado (:8080)')}_initForm(){const e=this.container.querySelector("#form-register-collaborator"),t=this.container.querySelector("#btn-submit-register");e.addEventListener("submit",async s=>{s.preventDefault();const a=Number(this.container.querySelector("#reg-rol").value),n=this.container.querySelector("#reg-tipo-doc").value,o=this.container.querySelector("#reg-num-doc").value.trim(),l=this.container.querySelector("#reg-nombre").value.trim(),p=this.container.querySelector("#reg-apellido").value.trim(),m=this.container.querySelector("#reg-username").value.trim(),y=this.container.querySelector("#reg-pin").value.trim();if(!/^\d{4}$/.test(y)){u.playError(),h.danger("El PIN debe constar exactamente de 4 dígitos numéricos","Validación de PIN");return}const E={rolId:a,tipoDocumento:n,numeroDocumento:o,nombre:l,apellido:p,nombreUsuario:m,pin:y};try{t.disabled=!0,t.innerHTML="Enviando a PostgreSQL...";const w=await b.register(E);u.playSuccess(),h.success(`Colaborador ${w.nombreCompleto} registrado con éxito en la base de datos`,"Registro Exitoso"),e.reset(),this._renderCollaboratorsList()}catch(w){u.playError(),h.danger(w.message||"Error al registrar colaborador en el backend","Error de Registro")}finally{t.disabled=!1,t.innerHTML=`
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Guardar Colaborador en PostgreSQL
        `}})}_initRoleHints(){const e=this.container.querySelector("#reg-rol"),t=this.container.querySelector("#role-hint");e.addEventListener("change",()=>{switch(e.value){case"3":t.innerHTML="💡 <strong>Comportamiento UI:</strong> Pantalla fija permanente sin suspensión para despacho ágil de comandas.";break;case"2":t.innerHTML="🔒 <strong>Comportamiento UI:</strong> Auto-bloqueo preventivo de seguridad a los 90 segundos de inactividad.";break;case"5":t.innerHTML="💳 <strong>Comportamiento UI:</strong> Terminal de caja con bloqueo estándar a los 120 segundos.";break;case"4":t.innerHTML="🍽️ <strong>Comportamiento UI:</strong> Terminal móvil de salón para pedidos de mesa.";break;case"1":t.innerHTML="⚙️ <strong>Comportamiento UI:</strong> Acceso completo a paneles de configuración y auditoría.";break}})}_initPinToggle(){const e=this.container.querySelector("#reg-pin"),t=this.container.querySelector("#btn-toggle-pin-visibility");t.addEventListener("click",()=>{const s=e.type==="password";e.type=s?"text":"password",t.textContent=s?"🔒":"👁️"})}_renderCollaboratorsList(){const e=this.container.querySelector("#collaborators-list");if(!e)return;const t=b.getRegisteredCollaborators();if(t.length===0){e.innerHTML=`
        <div class="empty-state-box">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">👥</div>
          <strong>No hay colaboradores creados en esta sesión</strong>
          <p style="margin-top: 0.3rem;">Complete el formulario a la izquierda para dar de alta al personal.</p>
        </div>
      `;return}e.innerHTML=t.map(s=>{const a=this._resolveRoleName(s.rolId),n=`role-${a.toLowerCase()}`;return`
        <div class="collaborator-item">
          <div class="collab-info">
            <span class="collab-name">${s.nombreCompleto||s.nombre+" "+s.apellido}</span>
            <span class="collab-meta">DNI: <strong>${s.numeroDocumento}</strong> • Usuario: @${s.nombreUsuario}</span>
          </div>
          <div class="collab-actions">
            <span class="operator-role-pill ${n}">${a}</span>
            <button type="button" class="btn-copy-dni" data-dni="${s.numeroDocumento}" title="Copiar DNI">
              Copiar DNI
            </button>
          </div>
        </div>
      `}).join(""),e.querySelectorAll(".btn-copy-dni").forEach(s=>{s.addEventListener("click",()=>{var n;const a=s.dataset.dni;(n=navigator.clipboard)==null||n.writeText(a),h.info(`DNI ${a} copiado al portapapeles. Listo para ingresar en la Terminal Táctil.`)})})}_resolveRoleName(e){switch(Number(e)){case 1:return"ADMIN";case 2:return"ALMACENERO";case 3:return"COCINA";case 4:return"MOZO";case 5:return"CAJERO";default:return"OPERADOR"}}unmount(){this.healthCheckTimer&&(clearInterval(this.healthCheckTimer),this.healthCheckTimer=null)}}const j=new $,V=`
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
`;class G{constructor(){this.container=null,this.attendanceModal=null}async mount(e){this.container=e,this.container.innerHTML=V;const t=c.getUser();if(t){const n=this.container.querySelector("#kds-operator-name");n&&(n.textContent=t.nombreCompleto||t.nombreUsuario)}const s=this.container.querySelector("#btn-kds-lock");s&&s.addEventListener("click",()=>{d.navigate("/auth")});const a=this.container.querySelector("#btn-kds-attendance");a&&a.addEventListener("click",()=>{this._openAttendanceModal()})}_openAttendanceModal(){let e=document.getElementById("kds-modal-root");if(!e){e=S.create("div",{id:"kds-modal-root"});const s=document.createElement("div");s.innerHTML=T;const a=s.querySelector("#attendance-modal");a&&e.appendChild(a),document.body.appendChild(e)}const t=new A({container:e,onProceed:()=>t.hide()});t.show(c.getUser())}unmount(){const e=document.getElementById("kds-modal-root");e&&e.remove()}}const z=new G,J=`
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
`;class Y{constructor(){this.container=null}async mount(e){this.container=e,this.container.innerHTML=J;const t=c.getUser();if(t){const n=this.container.querySelector("#stock-operator-name");n&&(n.textContent=t.nombreCompleto||t.nombreUsuario)}const s=this.container.querySelector("#btn-stock-lock");s&&s.addEventListener("click",()=>{d.navigate("/auth")});const a=this.container.querySelector("#btn-stock-attendance");a&&a.addEventListener("click",()=>{this._openAttendanceModal()})}_openAttendanceModal(){let e=document.getElementById("stock-modal-root");if(!e){e=S.create("div",{id:"stock-modal-root"});const s=document.createElement("div");s.innerHTML=T;const a=s.querySelector("#attendance-modal");a&&e.appendChild(a),document.body.appendChild(e)}const t=new A({container:e,onProceed:()=>t.hide()});t.show(c.getUser())}unmount(){const e=document.getElementById("stock-modal-root");e&&e.remove()}}const Q=new Y;class Z{constructor(){this.isInitialized=!1}async init(){if(!this.isInitialized){if(console.log("%c[Square Gastro POS & KDS] Iniciando Sistema de Alto Rendimiento","color: #E15A2B; font-weight: bold; font-size: 14px;"),this._setupEventSubscriptions(),d.register("/admin",{component:j,requiresAuth:!1}),d.register("/terminal",{component:I,requiresAuth:!1}),d.register("/auth",{component:I,requiresAuth:!1}),d.register("/kitchen",{component:z,requiresAuth:!0,allowedRoles:["COCINA","ADMIN","CAJERO"]}),d.register("/stock",{component:Q,requiresAuth:!0,allowedRoles:["ALMACENERO","ADMIN"]}),c.isAuthenticated()){const e=c.getUiMetadata();e&&C.configure(e)}d.init("#main-content"),this.isInitialized=!0}}_setupEventSubscriptions(){g.on(v.SESSION_LOCKED,({reason:e})=>{h.warning("Terminal bloqueado por seguridad.","Sesión Pausada"),d.navigate("/terminal")}),g.on(v.AUTH_LOGOUT,()=>{h.info("Sesión cerrada correctamente.","Desconectado"),d.navigate("/terminal")}),g.on(v.CLOCK_IN_SUCCESS,e=>{console.log("[App] Marcación de entrada confirmada:",e)}),g.on(v.CLOCK_OUT_SUCCESS,e=>{console.log("[App] Marcación de salida confirmada:",e)})}}const _=new Z;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>_.init()):_.init();
