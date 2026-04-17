class ConcernTabsShowcase extends HTMLElement {
  #activeIndex = 0;
  #intervalId = null;
  #visibilityHandler = null;

  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('[data-showcase-slide]'));
    this.buttons = Array.from(this.querySelectorAll('[data-showcase-tab]'));
    this.progress = Array.from(this.querySelectorAll('[data-showcase-progress]'));
    this.autoplay = this.hasAttribute('autoplay');
    this.autoplayMs = Number(this.dataset.autoplayMs || 5000);

    if (!this.slides.length) return;

    if (this.slides.length > 1) {
      this.buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
          this.goTo(index);
          this.restartAutoplay();
        });
      });

      this.addEventListener('mouseenter', () => this.stopAutoplay());
      this.addEventListener('mouseleave', () => this.startAutoplay());

      this.#visibilityHandler = () => {
        if (document.hidden) {
          this.stopAutoplay();
        } else {
          this.startAutoplay();
        }
      };
      document.addEventListener('visibilitychange', this.#visibilityHandler);
    }

    this.querySelectorAll('[data-hero-video-play]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slide = btn.closest('[data-showcase-slide]');
        const video = slide?.querySelector('video.concern-tabs-showcase__slide-video');
        if (!(video instanceof HTMLVideoElement)) return;
        video.muted = false;
        video.play().catch(() => {});
        btn.hidden = true;
      });
    });

    this.goTo(0);

    if (this.slides.length > 1) this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
    if (this.#visibilityHandler) {
      document.removeEventListener('visibilitychange', this.#visibilityHandler);
    }
  }

  goTo(index) {
    if (!this.slides.length) return;
    this.#activeIndex = (index + this.slides.length) % this.slides.length;

    this.slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === this.#activeIndex;
      slide.setAttribute('data-active', String(isActive));
      slide.setAttribute('aria-hidden', String(!isActive));
      const video = slide.querySelector('video.concern-tabs-showcase__slide-video');
      const playBtn = slide.querySelector('[data-hero-video-play]');
      if (video instanceof HTMLVideoElement && !isActive) {
        video.pause();
        if (playBtn) playBtn.hidden = false;
      }
    });

    this.buttons.forEach((button, buttonIndex) => {
      button.setAttribute('aria-selected', String(buttonIndex === this.#activeIndex));
    });

    this.resetProgress();
  }

  next() {
    this.goTo(this.#activeIndex + 1);
  }

  startAutoplay() {
    if (!this.autoplay || this.slides.length <= 1 || this.#intervalId) return;
    this.#intervalId = setInterval(() => this.next(), this.autoplayMs);
  }

  stopAutoplay() {
    if (!this.#intervalId) return;
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  resetProgress() {
    this.progress.forEach((bar) => {
      const cloned = bar.cloneNode(true);
      bar.replaceWith(cloned);
    });
    this.progress = Array.from(this.querySelectorAll('[data-showcase-progress]'));
  }
}

if (!customElements.get('concern-tabs-showcase')) {
  customElements.define('concern-tabs-showcase', ConcernTabsShowcase);
}
