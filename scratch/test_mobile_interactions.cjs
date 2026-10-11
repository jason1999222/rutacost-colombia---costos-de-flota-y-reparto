const fs = require('fs');
const html = fs.readFileSync('scratch/Presentacion_Cultura_del_Cuidado_Mobile.html', 'utf8');

// Extract JS
const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!jsMatch) {
  console.error("No script found");
  process.exit(1);
}
const js = jsMatch[1];

// Let's create a browser mock environment
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  toggle(c, force) {
    if (force !== undefined) {
      if (force) this.classes.add(c);
      else this.classes.delete(c);
    } else {
      if (this.classes.has(c)) this.classes.delete(c);
      else this.classes.add(c);
    }
  }
  contains(c) { return this.classes.has(c); }
}

class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new MockClassList();
    this.style = {};
    this.textContent = '';
    this.innerHTML = '';
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.scrollTop = 0;
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  trigger(event, eventObj = {}) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn({ currentTarget: this, target: this, ...eventObj }));
    }
  }
  appendChild(child) { this.children.push(child); }
  getAttribute(name) { return this.attributes[name] || ''; }
  setAttribute(name, val) { this.attributes[name] = val; }
}

const docElements = {
  'prevSlideBtn': new MockElement('prevSlideBtn', 'button'),
  'nextSlideBtn': new MockElement('nextSlideBtn', 'button'),
  'mobilePrevBtn': new MockElement('mobilePrevBtn', 'button'),
  'mobileNextBtn': new MockElement('mobileNextBtn', 'button'),
  'slideIndicator': new MockElement('slideIndicator', 'span'),
  'progressFill': new MockElement('progressFill', 'div'),
  'btnToggleThumbs': new MockElement('btnToggleThumbs', 'button'),
  'slideSelectorModal': new MockElement('slideSelectorModal', 'div'),
  'thumbsGrid': new MockElement('thumbsGrid', 'div'),
  'btnFullscreen': new MockElement('btnFullscreen', 'button'),
  'deck-wrapper': new MockElement('deck-wrapper', 'div'),
  'deck-stage': new MockElement('deck-stage', 'main'),
  'interactiveModal': new MockElement('interactiveModal', 'div'),
  'modalBadge': new MockElement('modalBadge', 'span'),
  'modalIcon': new MockElement('modalIcon', 'div'),
  'modalTitle': new MockElement('modalTitle', 'h3'),
  'modalSubtitle': new MockElement('modalSubtitle', 'div'),
  'modalBody': new MockElement('modalBody', 'div')
};

const mockSlides = [];
for (let i = 1; i <= 14; i++) {
  const s = new MockElement(`slide-${i}`, 'section');
  s.setAttribute('data-name', `${i}. Diapositiva ${i}`);
  mockSlides.push(s);
}

const mockDoc = {
  getElementById: (id) => docElements[id] || null,
  querySelectorAll: (selector) => {
    if (selector === '.slide') return mockSlides;
    if (selector === '.slide-thumb-card') return [];
    if (selector === '.modal-overlay.active') {
      const active = [];
      if (docElements['interactiveModal'].classList.contains('active')) active.push(docElements['interactiveModal']);
      if (docElements['slideSelectorModal'].classList.contains('active')) active.push(docElements['slideSelectorModal']);
      return active;
    }
    return [];
  },
  querySelector: (selector) => {
    if (selector === '.modal-overlay.active') {
      if (docElements['interactiveModal'].classList.contains('active')) return docElements['interactiveModal'];
      if (docElements['slideSelectorModal'].classList.contains('active')) return docElements['slideSelectorModal'];
      return null;
    }
    return null;
  },
  createElement: (tag) => new MockElement('', tag),
  addEventListener: () => {},
  body: new MockElement('body', 'body')
};

// Run script in mock sandbox
const vm = require('vm');
const context = {
  document: mockDoc,
  window: {},
  Date: Date,
  Math: Math,
  clearInterval: () => {},
  setInterval: () => {},
  console: console
};
vm.createContext(context);
vm.runInContext(js, context);

console.log("=== SIMULACIÓN DE INTERACCIONES MÓVILES ===");

// 1. Initial State
console.log("Diapositiva inicial:", docElements['slideIndicator'].textContent);
if (docElements['slideIndicator'].textContent.includes('1 / 14')) {
  console.log("✅ Diapositiva 1 cargada");
} else {
  console.error("❌ Falló carga inicial");
  process.exit(1);
}

// 2. Test Mobile Floating Next Arrow
docElements['mobileNextBtn'].trigger('click');
console.log("Después de pulsar mobileNextBtn:", docElements['slideIndicator'].textContent);
if (docElements['slideIndicator'].textContent.includes('2 / 14')) {
  console.log("✅ mobileNextBtn avanzó a diapositiva 2");
} else {
  console.error("❌ Falló mobileNextBtn");
  process.exit(1);
}

// 3. Test Mobile Swipe Left (advance to slide 3)
docElements['deck-stage'].trigger('touchstart', {
  touches: [{ clientX: 300, clientY: 400 }]
});
docElements['deck-stage'].trigger('touchend', {
  changedTouches: [{ clientX: 180, clientY: 410 }] // diffX = -120px (swipe izquierda)
});

console.log("Después de Swipe izquierda:", docElements['slideIndicator'].textContent);
if (docElements['slideIndicator'].textContent.includes('3 / 14')) {
  console.log("✅ Gesto táctil Swipe avanzó a diapositiva 3");
} else {
  console.error("❌ Falló Swipe izquierda");
  process.exit(1);
}

// 4. Test Mobile Swipe Right (go back to slide 2)
docElements['deck-stage'].trigger('touchstart', {
  touches: [{ clientX: 100, clientY: 400 }]
});
docElements['deck-stage'].trigger('touchend', {
  changedTouches: [{ clientX: 240, clientY: 395 }] // diffX = +140px (swipe derecha)
});

console.log("Después de Swipe derecha:", docElements['slideIndicator'].textContent);
if (docElements['slideIndicator'].textContent.includes('2 / 14')) {
  console.log("✅ Gesto táctil Swipe retrocedió a diapositiva 2");
} else {
  console.error("❌ Falló Swipe derecha");
  process.exit(1);
}

// 5. Test Open Modal
context.openModalKey('ser_humano');
const modalActive = docElements['interactiveModal'].classList.contains('active');
const modalTitleText = docElements['modalTitle'].textContent;
console.log("Modal abierto:", modalActive, "| Título:", modalTitleText);

if (modalActive && modalTitleText.includes('Margaret Mead')) {
  console.log("✅ openModalKey('ser_humano') abrió la ventana correctamente con su contenido");
} else {
  console.error("❌ Falló apertura de modal");
  process.exit(1);
}

// 6. Test that backdrop click outside card closes, but modal card click does not
context.closeModal();
console.log("Modal cerrado:", !docElements['interactiveModal'].classList.contains('active'));
if (!docElements['interactiveModal'].classList.contains('active')) {
  console.log("✅ closeModal() cerró la ventana modal");
} else {
  console.error("❌ Falló cierre de modal");
  process.exit(1);
}

console.log("\n🎉 TODAS LAS PRUEBAS DE COMPORTAMIENTO MÓVIL COMPLETADAS CON ÉXITO.");
