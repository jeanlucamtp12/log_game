const ICONS = {
  catalog:
    '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M4 5.5v17A2.5 2.5 0 0 1 6.5 20M8 7h8M8 11h6"/>',
  terminal:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  message:
    '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  scan:
    '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/>',
  crosshair:
    '<circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  guide:
    '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
  weight:
    '<path d="M6 8h12l2 13H4z"/><circle cx="12" cy="6" r="3"/><path d="M12 6h.01"/>',
  ruler:
    '<path d="m4 17 13-13 3 3L7 20z"/><path d="m14 7 3 3M11 10l2 2M8 13l3 3"/>',
  manual:
    '<path d="M12 6.5C10.5 5 8 4.5 4 4.5v14c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-14c-4 0-6.5.5-8 2z"/><path d="M12 6.5v14"/>',
  report:
    '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  alert:
    '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v5M12 17.5h.01"/>',
  bulb:
    '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  // ícones dos filtros de tipo do catálogo (mesma ordem de RELIC_TYPES)
  "type-rover":
    '<path d="M4 9.2h15a1 1 0 0 1 1 1V14H3v-3.8a1 1 0 0 1 1-1z"/><path d="M15.8 9.2V6.2"/><rect x="13.6" y="3.6" width="4.8" height="2.6" rx=".7"/><path d="M6.4 9.2V7.2M5.1 7h2.6"/><path d="M5.4 14v1.5M11.5 14v1.5M17.6 14v1.5"/><circle cx="5.4" cy="17.7" r="2.1"/><circle cx="11.5" cy="17.7" r="2.1"/><circle cx="17.6" cy="17.7" r="2.1"/>',
  "type-lander":
    '<path d="M8.6 4.6h6.8l2.6 4v4.2H6V8.6z"/><path d="M12 4.6V2.4"/><path d="M10.4 12.8 9.7 15.2h4.6l-.7-2.4"/><path d="M6.6 12.8 3.2 19.4M17.4 12.8l3.4 6.6M1.6 19.4h3.2M19.2 19.4h3.2"/>',
  "type-probe":
    '<path d="M3.4 7.6c2.7 3.8 14.5 3.8 17.2 0z"/><path d="M12 7.6V4.8"/><circle cx="12" cy="3.9" r=".9"/><rect x="9.6" y="11.8" width="4.8" height="4.4" rx=".7"/><path d="M12 10.4v1.4M9.6 15.4 5.3 19.2M14.4 15.4l4.3 3.8"/><circle cx="4.5" cy="19.9" r="1.2"/><circle cx="19.5" cy="19.9" r="1.2"/>',
  "type-debris":
    '<g transform="translate(-.8 .9) rotate(-6 7 12)"><path d="M2.6 7.6h8.8l-1.5 2.7 1.6 2.4-1.5 3.1H2.6z"/><path d="M6.6 7.6v8.2M2.6 11.7h8.2"/></g><g transform="translate(1 -1.4) rotate(14 17 11)"><path d="M14 7.6h7.4v8.2h-8.8l1.5-3.1-1.6-2.4z"/><path d="M17.5 7.6v8.2M13.4 11.7h8"/></g><path d="M10.8 19.4l1.6-.5-.3 1.6z"/><path d="M14.4 20.2h.01"/>',
  "type-objects":
    '<path d="M7 21.2V3"/><path d="M7 4h11l-2.6 3.3L18 10.6H7"/><path d="M3.4 21.2c1.6-1.4 5.6-1.4 7.2 0"/>',
};

export function iconSvg(name, size = 20) {
  return `<svg aria-hidden="true" fill="none" height="${size}" width="${size}" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7">${ICONS[name] ?? ""}</svg>`;
}

// Ícone do filtro de tipo (rover, lander, probe, debris, objects). Retorna "" se não houver.
export function typeIconSvg(id, size = 20) {
  return ICONS[`type-${id}`] ? iconSvg(`type-${id}`, size) : "";
}

export function mountIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    if (node.dataset.iconMounted === "1") return;
    node.innerHTML = iconSvg(node.dataset.icon, Number(node.dataset.size || 20));
    node.dataset.iconMounted = "1";
  });
}