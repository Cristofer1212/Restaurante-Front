/**
 * CONTROLADOR: LANDING PAGE CORPORATIVA (PANTALLA INICIAL)
 * 
 * Orquesta la vista principal de la aplicación ("/") según el flujo Square:
 * - Botón "Empezar": Redirige al registro de Administrador / Dueño (#/register).
 * - Botón "Soy empleado": Redirige a la Terminal de Personal (#/terminal).
 * - Carrusel con desplazamiento automático continuo (auto-scroll/infinite loop)
 *   y soporte completo de arrastre táctil y con ratón/trackpad.
 * - Reproducción garantizada de videos en bucle silencioso.
 * - Indicador de salud del backend Java SE y PostgreSQL.
 * - Reconocimiento de sesión activa con espaciado amplio y contraste nítido.
 */

import { DOM } from '../utils/dom.js';
import { authService } from '../services/auth.service.js';
import { sessionStore } from '../core/storage/session-store.js';
import { router } from '../core/router/router.js';
import { Toast } from '../components/toast.component.js';

export class LandingController {
  constructor() {
    this.container = null;
    this.healthTimer = null;
    this.carouselCleanup = null;
  }

  async mount(container) {
    this.container = container;
    await DOM.loadTemplate('/src/views/landing.html', this.container);

    this._initBackendStatus();
    this._checkActiveSession();
    this._initNavActions();
    this._initCarousel();
    this._initVideos();
  }

  async _initBackendStatus() {
    const badge = this.container.querySelector('#landing-backend-badge');
    if (!badge) return;

    const check = async () => {
      const isOnline = await authService.checkBackendHealth();
      if (isOnline) {
        badge.className = 'hidden md:inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all shadow-xs';
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> En Línea';
      } else {
        badge.className = 'hidden md:inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border border-rose-200 bg-rose-50 text-rose-700 transition-all shadow-xs';
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500"></span> Sin Conexión';
      }
    };

    await check();
    this.healthTimer = setInterval(check, 12000);
  }

  _checkActiveSession() {
    const banner = this.container.querySelector('#landing-active-session-banner');
    if (!banner) return;

    if (sessionStore.isAuthenticated()) {
      const user = sessionStore.getUser();
      if (user) {
        banner.style.display = 'block';
        const nameEl = this.container.querySelector('#landing-session-user-name');
        const roleEl = this.container.querySelector('#landing-session-user-role');
        const resumeLink = this.container.querySelector('#landing-session-resume-link');
        const logoutBtn = this.container.querySelector('#landing-session-logout-btn');

        if (nameEl) nameEl.textContent = user.nombreCompleto || user.nombreUsuario;
        if (roleEl) roleEl.textContent = user.rol;

        if (resumeLink) {
          const targetRoute = user.rol === 'ADMIN' ? '#/admin' : 
                              user.rol === 'COCINA' ? '#/kitchen' : 
                              user.rol === 'ALMACENERO' ? '#/stock' : '#/kitchen';
          resumeLink.href = targetRoute;
          resumeLink.textContent = user.rol === 'ADMIN' ? 'Continuar al Panel →' : 'Continuar a Estación →';
        }

        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => {
            authService.logout();
            banner.style.display = 'none';
            Toast.info('Sesión cerrada correctamente');
          });
        }
      }
    } else {
      banner.style.display = 'none';
    }
  }

  _initNavActions() {
    // Escuchar enlace "¿Ya tienes cuenta? Iniciar sesión aquí"
    const loginLink = this.container.querySelector('#link-admin-login');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/register?mode=login');
      });
    }
  }

  _initCarousel() {
    const carousel = this.container.querySelector('#areas-carousel');
    const prevBtn = this.container.querySelector('#areas-carousel-prev');
    const nextBtn = this.container.querySelector('#areas-carousel-next');

    if (!carousel) return;

    let isPaused = false;
    let resumeTimeout = null;
    let animationFrameId = null;
    const scrollSpeed = 0.85; // Velocidad de auto-scroll suave a 60fps

    // 1. Script de auto-scroll suave y continuo hacia la derecha (bucle infinito)
    const runAutoScroll = () => {
      if (!isPaused && carousel) {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (maxScroll > 0) {
          if (carousel.scrollLeft >= maxScroll - 2) {
            carousel.scrollLeft = 0; // Retorno suave al inicio para bucle infinito
          } else {
            carousel.scrollLeft += scrollSpeed;
          }
        }
      }
      animationFrameId = requestAnimationFrame(runAutoScroll);
    };

    animationFrameId = requestAnimationFrame(runAutoScroll);

    const pause = () => {
      isPaused = true;
      if (resumeTimeout) clearTimeout(resumeTimeout);
    };

    const resumeWithDelay = (delay = 2000) => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isPaused = false;
      }, delay);
    };

    // 2. Navegación por botones manuales
    const scrollAmount = 370;

    const handlePrev = () => {
      pause();
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      resumeWithDelay(2500);
    };

    const handleNext = () => {
      pause();
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      resumeWithDelay(2500);
    };

    if (prevBtn) prevBtn.addEventListener('click', handlePrev);
    if (nextBtn) nextBtn.addEventListener('click', handleNext);

    // 3. Pausar en hover (escritorio)
    const onMouseEnter = () => pause();
    const onMouseLeave = () => resumeWithDelay(1000);
    carousel.addEventListener('mouseenter', onMouseEnter);
    carousel.addEventListener('mouseleave', onMouseLeave);

    // 4. Soporte táctil en móviles
    const onTouchStart = () => pause();
    const onTouchEnd = () => resumeWithDelay(2200);
    carousel.addEventListener('touchstart', onTouchStart, { passive: true });
    carousel.addEventListener('touchend', onTouchEnd, { passive: true });

    // 5. Arrastre manual fluido con ratón (Drag-to-scroll)
    let isMouseDown = false;
    let startX = 0;
    let initialScrollLeft = 0;

    const onMouseDown = (e) => {
      isMouseDown = true;
      pause();
      startX = e.pageX - carousel.offsetLeft;
      initialScrollLeft = carousel.scrollLeft;
      carousel.classList.add('cursor-grabbing');
      carousel.classList.remove('cursor-grab');
    };

    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const currentX = e.pageX - carousel.offsetLeft;
      const walk = (currentX - startX) * 1.4;
      carousel.scrollLeft = initialScrollLeft - walk;
    };

    const onMouseUp = () => {
      if (isMouseDown) {
        isMouseDown = false;
        carousel.classList.remove('cursor-grabbing');
        carousel.classList.add('cursor-grab');
        resumeWithDelay(2000);
      }
    };

    carousel.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    this.carouselCleanup = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resumeTimeout) clearTimeout(resumeTimeout);
      if (prevBtn) prevBtn.removeEventListener('click', handlePrev);
      if (nextBtn) nextBtn.removeEventListener('click', handleNext);
      carousel.removeEventListener('mouseenter', onMouseEnter);
      carousel.removeEventListener('mouseleave', onMouseLeave);
      carousel.removeEventListener('touchstart', onTouchStart);
      carousel.removeEventListener('touchend', onTouchEnd);
      carousel.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }

  _initVideos() {
    // Asegurar reproducción fluida de todos los videos incrustados
    const videos = this.container.querySelectorAll('video');
    videos.forEach((video) => {
      video.muted = true;
      video.setAttribute('playsinline', '');
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const unlock = () => {
            video.play().catch(() => {});
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
          };
          window.addEventListener('click', unlock, { once: true });
          window.addEventListener('touchstart', unlock, { once: true });
        });
      }
    });
  }

  unmount() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
    if (this.carouselCleanup) {
      this.carouselCleanup();
      this.carouselCleanup = null;
    }
  }
}

export const landingController = new LandingController();
