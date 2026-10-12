document.documentElement.classList.add('js');
document.querySelectorAll('[data-switch]').forEach(group => {
  const panels = [...document.querySelectorAll(`[data-panel="${group.dataset.switch}"]`)];
  const buttons = [...group.querySelectorAll('button')];
  function select(button) {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panels.forEach(panel => { panel.hidden = panel.dataset.value !== button.dataset.select; });
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button)));
  select(buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0]);
});
