const PRESSABLE = 'button, .login-tile, [role="tab"]';

export function installLiquidPress(root = document) {
  const clear = (node) => {
    window.setTimeout(() => node.classList.remove('liquid-pressing'), 460);
  };

  const onPointerDown = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = event.target instanceof Element ? event.target.closest(PRESSABLE) : null;
    if (!target || target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--liquid-x', `${event.clientX - rect.left}px`);
    target.style.setProperty('--liquid-y', `${event.clientY - rect.top}px`);
    target.classList.remove('liquid-pressing');
    void target.offsetWidth;
    target.classList.add('liquid-pressing');
    clear(target);
  };

  const onKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = event.target instanceof Element ? event.target.closest(PRESSABLE) : null;
    if (!target || target.hasAttribute('disabled')) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--liquid-x', `${rect.width / 2}px`);
    target.style.setProperty('--liquid-y', `${rect.height / 2}px`);
    target.classList.remove('liquid-pressing');
    void target.offsetWidth;
    target.classList.add('liquid-pressing');
    clear(target);
  };

  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('keydown', onKeyDown);
  return () => {
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('keydown', onKeyDown);
  };
}
