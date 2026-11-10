/* Se carga en <head> (bloqueante, ~150 bytes): activa las animaciones solo si el visitante no pidió reducir movimiento
   y JavaScript funciona. Sin esta clase todo el contenido queda visible (regla del kit Oros). */
if (!window.matchMedia || !matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');
