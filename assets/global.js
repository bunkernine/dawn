function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function getFocusableElements(container) {
  return Array.from(container.querySelectorAll("summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"));
}
document.querySelectorAll('[id^="Details-"] summary').forEach(summary => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));
  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }
  summary.addEventListener('click', event => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });
  if (summary.closest('header-drawer, menu-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});
var trapFocusHandlers = {};
function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];
  removeTrapFocus();
  trapFocusHandlers.focusin = event => {
    if (event.target !== container && event.target !== last && event.target !== first) return;
    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };
  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };
  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault();
      last.focus();
    }
  };
  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);
  elementToFocus.focus();
  if (elementToFocus.tagName === 'INPUT' && ['search', 'text', 'email', 'url'].includes(elementToFocus.type) && elementToFocus.value) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible');
} catch (e) {
  focusVisiblePolyfill();
}
function focusVisiblePolyfill() {
  var navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN'];
  var currentFocusedElement = null;
  var mouseClick = null;
  window.addEventListener('keydown', event => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });
  window.addEventListener('mousedown', event => {
    mouseClick = true;
  });
  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');
    if (mouseClick) return;
    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');
  }, true);
}
function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach(video => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach(video => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach(video => video.pause());
  document.querySelectorAll('product-model').forEach(model => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}
function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);
  if (elementToFocus) elementToFocus.focus();
}
function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;
  var openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;
  var summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    _defineProperty(this, "quantityUpdateUnsubscriber", undefined);
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', {
      bubbles: true
    });
    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onButtonClick.bind(this)));
  }
  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
  }
  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }
  onInputChange(event) {
    this.validateQtyRules();
  }
  onButtonClick(event) {
    event.preventDefault();
    var previousValue = this.input.value;
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
  validateQtyRules() {
    var value = parseInt(this.input.value);
    if (this.input.min) {
      var min = parseInt(this.input.min);
      var buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      var max = parseInt(this.input.max);
      var buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }
}
customElements.define('quantity-input', QuantityInput);
function debounce(fn, wait) {
  var t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
function throttle(fn, delay) {
  var lastCall = 0;
  return function (...args) {
    var now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}
function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`
    }
  };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}
Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};
Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};
Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on' + eventName, callback);
};
Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};
  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);
  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);
  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));
  this.initCountry();
  this.initProvince();
};
Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },
  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },
  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);
    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }
      this.provinceContainer.style.display = '';
    }
  },
  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },
  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};
class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }
  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button:not(.localization-selector)').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }
  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;
    var openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;
    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }
  onSummaryClick(event) {
    var summaryElement = event.currentTarget;
    var detailsElement = summaryElement.parentNode;
    var parentMenuElement = detailsElement.closest('.has-submenu');
    var isOpen = detailsElement.hasAttribute('open');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }
    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }
  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;
    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
    if (event instanceof KeyboardEvent) elementToFocus === null || elementToFocus === void 0 || elementToFocus.setAttribute('aria-expanded', false);
  }
  onFocusOut() {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }
  onCloseButtonClick(event) {
    var detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }
  closeSubmenu(detailsElement) {
    var parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }
  closeAnimation(detailsElement) {
    var animationStart;
    var handleAnimation = time => {
      if (animationStart === undefined) {
        animationStart = time;
      }
      var elapsedTime = time - animationStart;
      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    };
    window.requestAnimationFrame(handleAnimation);
  }
}
customElements.define('menu-drawer', MenuDrawer);
class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
    _defineProperty(this, "onResize", () => {
      this.header && document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
      document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    });
  }
  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return;
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
  }
}
customElements.define('header-drawer', HeaderDrawer);
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener('click', this.hide.bind(this, false));
    this.addEventListener('keyup', event => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', event => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', event => {
        if (event.target === this) this.hide();
      });
    }
  }
  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }
  show(opener) {
    this.openedBy = opener;
    var popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }
  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);
class ModalOpener extends HTMLElement {
  constructor() {
    super();
    var button = this.querySelector('button');
    if (!button) return;
    button.addEventListener('click', () => {
      var modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);
class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    var poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }
  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      var content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));
      this.setAttribute('loaded', true);
      var deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
      if (deferredElement.nodeName == 'VIDEO' && deferredElement.getAttribute('autoplay')) {
        // force autoplay for safari
        deferredElement.play();
      }
    }
  }
}
customElements.define('deferred-media', DeferredMedia);
class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');
    if (!this.slider || !this.nextButton) return;
    this.initPages();
    var resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);
    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }
  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }
  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }
  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return;
    var previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;
    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }
    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', {
        detail: {
          currentPage: this.currentPage,
          currentElement: this.sliderItemsToShow[this.currentPage - 1]
        }
      }));
    }
    if (this.enableSliderLooping) return;
    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }
    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }
  isSlideVisible(element, offset = 0) {
    var lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }
  onButtonClick(event) {
    event.preventDefault();
    var step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + step * this.sliderItemOffset : this.slider.scrollLeft - step * this.sliderItemOffset;
    this.setSlidePosition(this.slideScrollPosition);
  }
  setSlidePosition(position) {
    this.slider.scrollTo({
      left: position
    });
  }
}
customElements.define('slider-component', SliderComponent);
class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;
    if (!this.sliderControlWrapper) return;
    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;
    this.announcementBarSlider = this.querySelector('.announcement-bar-slider');
    // Value below should match --duration-announcement-bar CSS value
    this.announcerBarAnimationDelay = this.announcementBarSlider ? 250 : 0;
    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();
    if (this.announcementBarSlider) {
      this.announcementBarArrowButtonWasClicked = false;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion.addEventListener('change', () => {
        if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
      });
      [this.prevButton, this.nextButton].forEach(button => {
        button.addEventListener('click', () => {
          this.announcementBarArrowButtonWasClicked = true;
        }, {
          once: true
        });
      });
    }
    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }
  setAutoPlay() {
    this.autoplaySpeed = this.slider.dataset.speed * 1000;
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));
    if (this.querySelector('.slideshow__autoplay')) {
      this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
      this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
      this.autoplayButtonIsSetToPlay = true;
      this.play();
    } else {
      this.reducedMotion.matches || this.announcementBarArrowButtonWasClicked ? this.pause() : this.play();
    }
  }
  onButtonClick(event) {
    super.onButtonClick(event);
    this.wasClicked = true;
    var isFirstSlide = this.currentPage === 1;
    var isLastSlide = this.currentPage === this.sliderItemsToShow.length;
    if (!isFirstSlide && !isLastSlide) {
      this.applyAnimationToAnnouncementBar(event.currentTarget.name);
      return;
    }
    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.setSlidePosition(this.slideScrollPosition);
    this.applyAnimationToAnnouncementBar(event.currentTarget.name);
  }
  setSlidePosition(position) {
    if (this.setPositionTimeout) clearTimeout(this.setPositionTimeout);
    this.setPositionTimeout = setTimeout(() => {
      this.slider.scrollTo({
        left: position
      });
    }, this.announcerBarAnimationDelay);
  }
  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');
    if (!this.sliderControlButtons.length) return;
    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }
  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }
  focusOutHandling(event) {
    if (this.sliderAutoplayButton) {
      var focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
      this.play();
    } else if (!this.reducedMotion.matches && !this.announcementBarArrowButtonWasClicked) {
      this.play();
    }
  }
  focusInHandling(event) {
    if (this.sliderAutoplayButton) {
      var focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
        this.play();
      } else if (this.autoplayButtonIsSetToPlay) {
        this.pause();
      }
    } else if (this.announcementBarSlider.contains(event.target)) {
      this.pause();
    }
  }
  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }
  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }
  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }
  autoRotateSlides() {
    var slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.sliderItemOffset;
    this.setSlidePosition(slideScrollPosition);
    this.applyAnimationToAnnouncementBar();
  }
  setSlideVisibility(event) {
    this.sliderItemsToShow.forEach((item, index) => {
      var linkElements = item.querySelectorAll('a');
      if (index === this.currentPage - 1) {
        if (linkElements.length) linkElements.forEach(button => {
          button.removeAttribute('tabindex');
        });
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (linkElements.length) linkElements.forEach(button => {
          button.setAttribute('tabindex', '-1');
        });
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
    this.wasClicked = false;
  }
  applyAnimationToAnnouncementBar(button = 'next') {
    if (!this.announcementBarSlider) return;
    var itemsCount = this.sliderItems.length;
    var increment = button === 'next' ? 1 : -1;
    var currentIndex = this.currentPage - 1;
    var nextIndex = (currentIndex + increment) % itemsCount;
    nextIndex = nextIndex === -1 ? itemsCount - 1 : nextIndex;
    var nextSlide = this.sliderItems[nextIndex];
    var currentSlide = this.sliderItems[currentIndex];
    var animationClassIn = 'announcement-bar-slider--fade-in';
    var animationClassOut = 'announcement-bar-slider--fade-out';
    var isFirstSlide = currentIndex === 0;
    var isLastSlide = currentIndex === itemsCount - 1;
    var shouldMoveNext = button === 'next' && !isLastSlide || button === 'previous' && isFirstSlide;
    var direction = shouldMoveNext ? 'next' : 'previous';
    currentSlide.classList.add(`${animationClassOut}-${direction}`);
    nextSlide.classList.add(`${animationClassIn}-${direction}`);
    setTimeout(() => {
      currentSlide.classList.remove(`${animationClassOut}-${direction}`);
      nextSlide.classList.remove(`${animationClassIn}-${direction}`);
    }, this.announcerBarAnimationDelay * 2);
  }
  linkToSlide(event) {
    event.preventDefault();
    var slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}
customElements.define('slideshow-component', SlideshowComponent);
class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }
  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateVariantStatuses();
    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }
  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), select => select.value);
  }
  updateMasterId() {
    this.currentVariant = this.getVariantData().find(variant => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }
  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    var mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
    mediaGalleries.forEach(mediaGallery => mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true));
    var modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    var newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }
  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }
  updateShareUrl() {
    var shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }
  updateVariantInput() {
    var productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach(productForm => {
      var input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', {
        bubbles: true
      }));
    });
  }
  updateVariantStatuses() {
    var selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1);
    var inputWrappers = [...this.querySelectorAll('.product-form__input')];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      var optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
      var previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
      var availableOptionInputsValue = selectedOptionOneVariants.filter(variant => variant.available && variant[`option${index}`] === previousOptionSelected).map(variantOption => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }
  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value');
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
      }
    });
  }
  updatePickupAvailability() {
    var pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;
    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }
  removeErrorMessage() {
    var section = this.closest('section');
    if (!section) return;
    var productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }
  renderProductInfo() {
    var requestedVariantId = this.currentVariant.id;
    var sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;
    fetch(`${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`).then(response => response.text()).then(responseText => {
      // prevent unnecessary ui changes from abandoned selections
      if (this.currentVariant.id !== requestedVariantId) return;
      var html = new DOMParser().parseFromString(responseText, 'text/html');
      var destination = document.getElementById(`price-${this.dataset.section}`);
      var source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
      var skuSource = html.getElementById(`Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
      var skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
      var inventorySource = html.getElementById(`Inventory-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
      var inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);
      var volumePricingSource = html.getElementById(`Volume-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
      var pricePerItemDestination = document.getElementById(`Price-Per-Item-${this.dataset.section}`);
      var pricePerItemSource = html.getElementById(`Price-Per-Item-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
      var volumePricingDestination = document.getElementById(`Volume-${this.dataset.section}`);
      var qtyRules = document.getElementById(`Quantity-Rules-${this.dataset.section}`);
      var volumeNote = document.getElementById(`Volume-Note-${this.dataset.section}`);
      if (volumeNote) volumeNote.classList.remove('hidden');
      if (volumePricingDestination) volumePricingDestination.classList.remove('hidden');
      if (qtyRules) qtyRules.classList.remove('hidden');
      if (source && destination) destination.innerHTML = source.innerHTML;
      if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;
      if (skuSource && skuDestination) {
        skuDestination.innerHTML = skuSource.innerHTML;
        skuDestination.classList.toggle('hidden', skuSource.classList.contains('hidden'));
      }
      if (volumePricingSource && volumePricingDestination) {
        volumePricingDestination.innerHTML = volumePricingSource.innerHTML;
      }
      if (pricePerItemSource && pricePerItemDestination) {
        pricePerItemDestination.innerHTML = pricePerItemSource.innerHTML;
        pricePerItemDestination.classList.toggle('hidden', pricePerItemSource.classList.contains('hidden'));
      }
      var price = document.getElementById(`price-${this.dataset.section}`);
      if (price) price.classList.remove('hidden');
      if (inventoryDestination) inventoryDestination.classList.toggle('hidden', inventorySource.innerText === '');
      var addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`);
      this.toggleAddButton(addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true, window.variantStrings.soldOut);
      publish(PUB_SUB_EVENTS.variantChange, {
        data: {
          sectionId,
          html,
          variant: this.currentVariant
        }
      });
    });
  }
  toggleAddButton(disable = true, text, modifyClass = true) {
    var productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    var addButton = productForm.querySelector('[name="add"]');
    var addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;
    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }
    if (!modifyClass) return;
  }
  setUnavailable() {
    var button = document.getElementById(`product-form-${this.dataset.section}`);
    var addButton = button.querySelector('[name="add"]');
    var addButtonText = button.querySelector('[name="add"] > span');
    var price = document.getElementById(`price-${this.dataset.section}`);
    var inventory = document.getElementById(`Inventory-${this.dataset.section}`);
    var sku = document.getElementById(`Sku-${this.dataset.section}`);
    var pricePerItem = document.getElementById(`Price-Per-Item-${this.dataset.section}`);
    var volumeNote = document.getElementById(`Volume-Note-${this.dataset.section}`);
    var volumeTable = document.getElementById(`Volume-${this.dataset.section}`);
    var qtyRules = document.getElementById(`Quantity-Rules-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('hidden');
    if (inventory) inventory.classList.add('hidden');
    if (sku) sku.classList.add('hidden');
    if (pricePerItem) pricePerItem.classList.add('hidden');
    if (volumeNote) volumeNote.classList.add('hidden');
    if (volumeTable) volumeTable.classList.add('hidden');
    if (qtyRules) qtyRules.classList.add('hidden');
  }
  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
customElements.define('variant-selects', VariantSelects);
class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }
  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }
  updateOptions() {
    var fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map(fieldset => {
      return Array.from(fieldset.querySelectorAll('input')).find(radio => radio.checked).value;
    });
  }
}
customElements.define('variant-radios', VariantRadios);
class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    var handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      fetch(this.dataset.url).then(response => response.text()).then(text => {
        var html = document.createElement('div');
        html.innerHTML = text;
        var recommendations = html.querySelector('product-recommendations');
        if (recommendations && recommendations.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
        }
        if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
          this.remove();
        }
        if (html.querySelector('.grid__item')) {
          this.classList.add('product-recommendations--loaded');
        }
      }).catch(e => {
        console.error(e);
      });
    };
    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: '0px 0px 400px 0px'
    }).observe(this);
  }
}
customElements.define('product-recommendations', ProductRecommendations);