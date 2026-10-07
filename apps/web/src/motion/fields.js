function commitValue(element, value) {
  const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

let panel = null;
let detach = () => {};

function closeMenu() {
  detach();
  panel?.remove();
  panel = null;
  detach = () => {};
}

function place(anchor) {
  if (!panel) return;
  const rect = anchor.getBoundingClientRect();
  const width = Math.max(rect.width, panel.dataset.kind === 'calendar' ? 280 : 200);
  panel.style.width = `${Math.min(width, window.innerWidth - 16)}px`;
  const height = panel.offsetHeight;
  const below = rect.bottom + 8 + height < window.innerHeight;
  panel.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
  panel.style.top = `${below ? rect.bottom + 6 : Math.max(8, rect.top - height - 6)}px`;
  panel.style.transformOrigin = below ? 'top center' : 'bottom center';
}

function openPanel(anchor, content, onKey, kind) {
  closeMenu();
  panel = document.createElement('div');
  panel.className = 'orison-menu liquid-pop';
  panel.dataset.kind = kind;
  panel.append(content);
  document.body.append(panel);
  place(anchor);
  const onPointer = (event) => {
    if (panel?.contains(event.target) || event.target === anchor) return;
    closeMenu();
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      anchor.focus();
      return;
    }
    onKey?.(event);
  };
  const reposition = () => place(anchor);
  document.addEventListener('mousedown', onPointer, true);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, true);
  detach = () => {
    document.removeEventListener('mousedown', onPointer, true);
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition, true);
  };
}

function openSelect(select) {
  const options = [...select.options];
  const list = document.createElement('div');
  list.setAttribute('role', 'listbox');
  let active = Math.max(0, options.findIndex((option) => option.selected));
  const buttons = options.map((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'orison-option';
    button.textContent = option.text || 'Select';
    button.disabled = option.disabled;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(option.selected));
    button.addEventListener('click', () => {
      commitValue(select, option.value);
      closeMenu();
    });
    list.append(button);
    return button;
  });
  const paint = () => {
    buttons.forEach((button, index) => button.classList.toggle('is-active', index === active));
    buttons[active]?.scrollIntoView({ block: 'nearest' });
  };
  paint();
  openPanel(select, list, (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); active = Math.min(buttons.length - 1, active + 1); paint(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); active = Math.max(0, active - 1); paint(); }
    if (event.key === 'Enter') { event.preventDefault(); buttons[active]?.click(); }
  }, 'list');
}

function monthLabel(date) {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function openDate(input) {
  const parsed = input.value ? new Date(`${input.value}T00:00:00`) : new Date();
  const cursor = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  const root = document.createElement('div');
  root.className = 'orison-calendar';

  const render = () => {
    root.replaceChildren();
    const bar = document.createElement('div');
    bar.className = 'orison-calendar-bar';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.textContent = '‹';
    prev.addEventListener('click', () => { cursor.setMonth(cursor.getMonth() - 1); render(); place(input); });
    const title = document.createElement('span');
    title.textContent = monthLabel(cursor);
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '›';
    next.addEventListener('click', () => { cursor.setMonth(cursor.getMonth() + 1); render(); place(input); });
    bar.append(prev, title, next);
    const grid = document.createElement('div');
    grid.className = 'orison-calendar-grid';
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((day) => {
      const label = document.createElement('span');
      label.textContent = day;
      grid.append(label);
    });
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    for (let i = 0; i < start.getDay(); i += 1) grid.append(document.createElement('span'));
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= days; day += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(day);
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (iso === input.value) button.className = 'is-selected';
      button.addEventListener('click', () => { commitValue(input, iso); closeMenu(); });
      grid.append(button);
    }
    root.append(bar, grid);
  };
  render();
  openPanel(input, root, null, 'calendar');
}

function openTime(input) {
  const [hour = '09', minute = '00'] = (input.value || '').split(':');
  const root = document.createElement('div');
  root.className = 'orison-time';
  const hours = document.createElement('div');
  const minutes = document.createElement('div');
  for (let value = 0; value < 24; value += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    const label = String(value).padStart(2, '0');
    button.textContent = label;
    if (label === hour) button.className = 'is-selected';
    button.addEventListener('click', () => commitValue(input, `${label}:${minute.padStart(2, '0')}`));
    hours.append(button);
  }
  for (let value = 0; value < 60; value += 5) {
    const button = document.createElement('button');
    button.type = 'button';
    const label = String(value).padStart(2, '0');
    button.textContent = label;
    if (label === minute.slice(0, 2)) button.className = 'is-selected';
    button.addEventListener('click', () => { commitValue(input, `${hour.padStart(2, '0')}:${label}`); closeMenu(); });
    minutes.append(button);
  }
  root.append(hours, minutes);
  openPanel(input, root, null, 'calendar');
}

function openMonth(input) {
  const [yearText] = (input.value || new Date().toISOString().slice(0, 7)).split('-');
  let year = Number(yearText) || new Date().getFullYear();
  const root = document.createElement('div');
  const render = () => {
    root.replaceChildren();
    const bar = document.createElement('div');
    bar.className = 'orison-calendar-bar';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.textContent = '‹';
    prev.addEventListener('click', () => { year -= 1; render(); place(input); });
    const title = document.createElement('span');
    title.textContent = String(year);
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = '›';
    next.addEventListener('click', () => { year += 1; render(); place(input); });
    bar.append(prev, title, next);
    const grid = document.createElement('div');
    grid.className = 'orison-month-grid';
    for (let month = 1; month <= 12; month += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      const iso = `${year}-${String(month).padStart(2, '0')}`;
      button.textContent = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
      if (iso === input.value) button.className = 'is-selected';
      button.addEventListener('click', () => { commitValue(input, iso); closeMenu(); });
      grid.append(button);
    }
    root.append(bar, grid);
  };
  render();
  openPanel(input, root, null, 'calendar');
}

const FIELD = 'select, input[type="date"], input[type="time"], input[type="month"]';

function openField(field) {
  if (!field || field.disabled || field.dataset.native === 'true') return;
  if (field instanceof HTMLSelectElement) openSelect(field);
  else if (field.type === 'time') openTime(field);
  else if (field.type === 'month') openMonth(field);
  else openDate(field);
}

export function installFieldMenus(root = document) {
  const onMouseDown = (event) => {
    const field = event.target instanceof Element ? event.target.closest(FIELD) : null;
    if (!field || panel?.contains(event.target)) return;
    event.preventDefault();
    field.focus({ preventScroll: true });
    openField(field);
  };
  const onKeyDown = (event) => {
    if (!['Enter', ' ', 'ArrowDown'].includes(event.key)) return;
    const field = event.target instanceof Element ? event.target.closest(FIELD) : null;
    if (!field || panel) return;
    event.preventDefault();
    openField(field);
  };
  const onClick = (event) => {
    const field = event.target instanceof Element ? event.target.closest(FIELD) : null;
    if (!field || field.dataset.native === 'true') return;
    event.preventDefault();
  };
  root.addEventListener('mousedown', onMouseDown, true);
  root.addEventListener('click', onClick, true);
  root.addEventListener('keydown', onKeyDown);
  return () => {
    root.removeEventListener('mousedown', onMouseDown, true);
    root.removeEventListener('click', onClick, true);
    root.removeEventListener('keydown', onKeyDown);
    closeMenu();
  };
}
