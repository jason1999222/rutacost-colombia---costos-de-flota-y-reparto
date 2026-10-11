const fs = require('fs');
const html = fs.readFileSync('C:/Users/lenovo/Desktop/trabajos andres/Presentacion_Cultura_del_Cuidado.html', 'utf8');

// Check script section for openModalKey
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Let's check if modalData has any syntax issues or undefined keys
const vm = require('vm');
const context = {
  document: {
    querySelectorAll: () => [],
    getElementById: (id) => ({
      textContent: '',
      innerHTML: '',
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      appendChild: () => {},
      addEventListener: () => {}
    }),
    addEventListener: () => {}
  },
  console: console
};

try {
  vm.createContext(context);
  vm.runInContext(js, context);
  console.log("Executed successfully in VM!");
  
  // Test openModalKey
  if (context.openModalKey) {
    context.openModalKey('ser_humano');
    console.log("openModalKey('ser_humano') executed successfully!");
  } else {
    console.log("openModalKey NOT found in context!");
  }
} catch (e) {
  console.error("VM Execution Error:", e);
}
