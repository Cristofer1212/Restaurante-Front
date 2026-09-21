/**
 * COMPONENTE PIN-PAD TÁCTIL (4 Dígitos)
 * 
 * Gestiona el búfer del PIN, eventos de teclado táctil y físico,
 * y feedback háptico/acústico en milisegundos.
 */

import { audioFeedback } from '../../../shared/utils/dom.js';

export class PinPadComponent {
  constructor({ container, onComplete }) {
    this.container = container;
    this.onComplete = onComplete;
    this.pin = '';
    this.isProcessing = false;

    this.dots = Array.from(container.querySelectorAll('.pin-dot'));
    this.dotsContainer = container.querySelector('#pin-dots-container');
    this.keypad = container.querySelector('#touch-keypad');

    this._bindEvents();
  }

  _bindEvents() {
    // 1. Delegación de eventos táctiles y clics sobre el teclado numérico
    this.keypad.addEventListener('click', (e) => {
      if (this.isProcessing) return;

      const btn = e.target.closest('.keypad-btn');
      if (!btn) return;

      const key = btn.dataset.key;
      this._handleKey(key);
    });

    // 2. Soporte para teclado físico (para terminales de caja con teclado)
    this._keydownHandler = (e) => {
      if (this.isProcessing) return;

      // Ignorar si el usuario está escribiendo en un input de texto
      if (e.target.tagName === 'INPUT') return;

      if (e.key >= '0' && e.key <= '9') {
        this._handleKey(e.key);
      } else if (e.key === 'Backspace') {
        this._handleKey('backspace');
      } else if (e.key === 'Escape') {
        this._handleKey('clear');
      }
    };
    window.addEventListener('keydown', this._keydownHandler);
  }

  _handleKey(key) {
    if (key === 'clear') {
      audioFeedback.playKeyTap();
      this.clear();
      return;
    }

    if (key === 'backspace') {
      audioFeedback.playKeyTap();
      this.backspace();
      return;
    }

    if (/^\d$/.test(key)) {
      if (this.pin.length < 4) {
        audioFeedback.playKeyTap();
        this.pin += key;
        this._updateView();

        if (this.pin.length === 4) {
          this._submit();
        }
      }
    }
  }

  _updateView() {
    this.dots.forEach((dot, index) => {
      if (index < this.pin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled', 'error');
      }
    });
  }

  async _submit() {
    this.isProcessing = true;
    const completedPin = this.pin;

    try {
      if (this.onComplete) {
        await this.onComplete(completedPin);
      }
    } catch (err) {
      this.triggerError();
    } finally {
      this.isProcessing = false;
    }
  }

  triggerError() {
    audioFeedback.playError();
    
    // Activar animación shake y color de alerta de error (#EF4444)
    this.dotsContainer.classList.add('animate-shake');
    this.dots.forEach(d => d.classList.add('error'));

    setTimeout(() => {
      this.dotsContainer.classList.remove('animate-shake');
      this.clear();
    }, 600);
  }

  clear() {
    this.pin = '';
    this._updateView();
    this.dots.forEach(d => d.classList.remove('error'));
  }

  backspace() {
    if (this.pin.length > 0) {
      this.pin = this.pin.slice(0, -1);
      this._updateView();
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._keydownHandler);
  }
}
