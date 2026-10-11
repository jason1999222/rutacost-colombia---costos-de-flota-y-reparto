const fs = require('fs');
const html = fs.readFileSync('C:/Users/lenovo/Desktop/trabajos andres/Presentacion_Cultura_del_Cuidado.html', 'utf8');

// Extract script
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Let's create a realistic mock of DOM elements
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
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  click() {
    if (this.listeners['click']) {
      this.listeners['click'].forEach(fn => fn({ currentTarget: this, target: this }));
    }
  }
  appendChild(child) { this.children.push(child); }
  getAttribute(name) { return this.attributes[name] || ''; }
  setAttribute(name, val) { this.attributes[name] = val; }
}

const elements = {};
function getEl(id) {
  if (!elements[id]) elements[id] = new MockElement(id);
  return elements[id];
}

const mockSlides = [];
for (let i = 1; i <= 14; i++) {
  const s = new MockElement(`slide-${i}`);
  s.setAttribute('data-name', `Slide ${i}`);
  mockSlides.push(s);
}

const context = {
  document: {
    querySelectorAll: (sel) => {
      if (sel === '.slide') return mockSlides;
      if (sel === '.thumb-item') return [];
      if (sel === '.poll-option-row') return [];
      if (sel === '.battery-level-card') return [];
      return [];
    },
    getElementById: (id) => getEl(id),
    createElement: (tag) => new MockElement('', tag),
    addEventListener: () => {},
    fullscreenElement: null,
    exitFullscreen: () => {}
  },
  window: {
    addEventListener: () => {}
  },
  setInterval: setInterval,
  clearInterval: clearInterval,
  Math: Math,
  console: console
};

const vm = require('vm');
vm.createContext(context);

try {
  vm.runInContext(js, context);
  console.log("SUCCESS: Script parsed and executed in mock browser!");
  
  // Test navigation
  console.log("Initial slide indicator:", getEl('slideIndicator').textContent);
  
  // Click Next button
  getEl('nextSlideBtn').click();
  console.log("After Next click, indicator:", getEl('slideIndicator').textContent);
  
  getEl('nextSlideBtn').click();
  console.log("After Next click 2, indicator:", getEl('slideIndicator').textContent);
  
  // Test modal
  console.log("Testing openModalKey('ser_humano')...");
  context.openModalKey('ser_humano');
  console.log("Modal active class:", getEl('interactiveModal').classList.contains('active'));
  console.log("Modal Title:", getEl('modalTitle').textContent);
  console.log("Modal Body length:", getEl('modalBody').innerHTML.length);
  
} catch (e) {
  console.error("FAIL:", e);
}
