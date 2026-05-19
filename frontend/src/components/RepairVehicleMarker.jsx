import { useMemo } from 'react';
import { Placemark, useYMaps } from '@pbe/react-yandex-maps';

// Vehicle names shown on map
const LABELS = {
  dump_truck:       'Самосвал',
  transfer_machine: 'Перегружатель',
  paver:            'Укладчик',
  roller:           'Каток',
};

// SVG icon bodies for each vehicle type (elements only, no outer <svg> tag)
// Coordinates taken directly from icons.html
const SVG_SPECS = {
  dump_truck: {
    viewBox: '15 57 103 85',
    w: 70, h: 48,
    body: `
      <rect x="22" y="80" width="36" height="34" rx="4" fill="#E8A020" stroke="#8B5E10" stroke-width="1.2"/>
      <rect x="26" y="84" width="22" height="14" rx="2" fill="#AED6F1" stroke="#1A5276" stroke-width="0.8"/>
      <polygon points="56,60 110,60 110,114 56,114" fill="#E8A020" stroke="#8B5E10" stroke-width="1.2"/>
      <polygon points="58,62 108,62 108,82 58,82" fill="#A0522D"/>
      <rect x="18" y="114" width="96" height="8" rx="2" fill="#5D5D5D" stroke="#333" stroke-width="1"/>
      <circle cx="36" cy="128" r="11" fill="#2C2C2C" stroke="#555" stroke-width="1"/>
      <circle cx="36" cy="128" r="5" fill="#888"/>
      <circle cx="88" cy="128" r="11" fill="#2C2C2C" stroke="#555" stroke-width="1"/>
      <circle cx="88" cy="128" r="5" fill="#888"/>
      <circle cx="104" cy="128" r="11" fill="#2C2C2C" stroke="#555" stroke-width="1"/>
      <circle cx="104" cy="128" r="5" fill="#888"/>
      <line x1="68" y1="85" x2="68" y2="114" stroke="#888" stroke-width="3" stroke-linecap="round"/>`,
  },
  transfer_machine: {
    viewBox: '163 57 133 81',
    w: 72, h: 44,
    body: `
      <rect x="178" y="100" width="100" height="18" rx="3" fill="#4A7FA5" stroke="#2C4F6B" stroke-width="1.2"/>
      <rect x="188" y="72" width="60" height="30" rx="4" fill="#4A7FA5" stroke="#2C4F6B" stroke-width="1.2"/>
      <polygon points="168,85 188,80 188,108 168,108" fill="#357599" stroke="#2C4F6B" stroke-width="1"/>
      <rect x="248" y="84" width="38" height="8" rx="3" fill="#2C5F7A" stroke="#1A3D50" stroke-width="1"/>
      <ellipse cx="252" cy="88" rx="5" ry="5" fill="#1A3D50"/>
      <ellipse cx="282" cy="88" rx="5" ry="5" fill="#1A3D50"/>
      <rect x="224" y="60" width="24" height="22" rx="3" fill="#5B8FB9" stroke="#2C4F6B" stroke-width="1"/>
      <rect x="227" y="63" width="14" height="9" rx="1.5" fill="#AED6F1" stroke="#1A5276" stroke-width="0.7"/>
      <circle cx="198" cy="124" r="11" fill="#2C2C2C" stroke="#555" stroke-width="1"/>
      <circle cx="198" cy="124" r="5" fill="#888"/>
      <circle cx="258" cy="124" r="11" fill="#2C2C2C" stroke="#555" stroke-width="1"/>
      <circle cx="258" cy="124" r="5" fill="#888"/>`,
  },
  paver: {
    viewBox: '325 54 145 92',
    w: 74, h: 47,
    body: `
      <rect x="358" y="78" width="90" height="32" rx="5" fill="#2E7D32" stroke="#1B5E20" stroke-width="1.2"/>
      <polygon points="340,82 360,76 360,112 340,112" fill="#388E3C" stroke="#1B5E20" stroke-width="1"/>
      <rect x="398" y="58" width="28" height="24" rx="3" fill="#43A047" stroke="#1B5E20" stroke-width="1"/>
      <rect x="402" y="62" width="16" height="10" rx="1.5" fill="#AED6F1" stroke="#1A5276" stroke-width="0.7"/>
      <rect x="343" y="112" width="110" height="8" rx="2" fill="#1B5E20" stroke="#0D3B12" stroke-width="1"/>
      <rect x="356" y="120" width="36" height="14" rx="4" fill="#333" stroke="#555" stroke-width="1"/>
      <rect x="402" y="120" width="36" height="14" rx="4" fill="#333" stroke="#555" stroke-width="1"/>
      <circle cx="362" cy="127" r="4" fill="#666"/>
      <circle cx="386" cy="127" r="4" fill="#666"/>
      <circle cx="408" cy="127" r="4" fill="#666"/>
      <circle cx="432" cy="127" r="4" fill="#666"/>
      <rect x="330" y="134" width="126" height="6" rx="1" fill="#333" opacity="0.7"/>`,
  },
  roller: {
    viewBox: '510 60 140 82',
    w: 72, h: 42,
    body: `
      <rect x="520" y="90" width="120" height="16" rx="3" fill="#B71C1C" stroke="#7B0000" stroke-width="1.2"/>
      <rect x="564" y="65" width="34" height="28" rx="3" fill="#C62828" stroke="#7B0000" stroke-width="1.2"/>
      <rect x="568" y="69" width="22" height="12" rx="2" fill="#AED6F1" stroke="#1A5276" stroke-width="0.7"/>
      <ellipse cx="536" cy="116" rx="22" ry="22" fill="#8B1A1A" stroke="#5B0000" stroke-width="1.5"/>
      <ellipse cx="536" cy="116" rx="14" ry="14" fill="#7B1818" stroke="#5B0000" stroke-width="0.8"/>
      <ellipse cx="536" cy="116" rx="6" ry="6" fill="#5B0000"/>
      <ellipse cx="624" cy="116" rx="22" ry="22" fill="#8B1A1A" stroke="#5B0000" stroke-width="1.5"/>
      <ellipse cx="624" cy="116" rx="14" ry="14" fill="#7B1818" stroke="#5B0000" stroke-width="0.8"/>
      <ellipse cx="624" cy="116" rx="6" ry="6" fill="#5B0000"/>
      <line x1="514" y1="138" x2="646" y2="138" stroke="#555" stroke-width="2" stroke-linecap="round"/>`,
  },
};

function svgDataUri(type) {
  const spec = SVG_SPECS[type];
  if (!spec) return '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.w}" height="${spec.h}" viewBox="${spec.viewBox}">${spec.body}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export default function RepairVehicleMarker({ vehicle }) {
  const ymaps  = useYMaps(['templateLayoutFactory']);
  const label  = LABELS[vehicle.type] ?? vehicle.type;
  const imgSrc = svgDataUri(vehicle.type);
  const spec   = SVG_SPECS[vehicle.type] ?? { w: 70, h: 44 };

  const layout = useMemo(() => {
    if (!ymaps?.templateLayoutFactory) return null;
    return ymaps.templateLayoutFactory.createClass(
      `<div style="display:inline-flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:default">` +
        `<img src="${imgSrc}" width="${spec.w}" height="${spec.h}" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.55))">` +
        `<div style="margin-top:2px;background:rgba(10,10,10,.82);color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.4)">${label}</div>` +
      `</div>`
    );
  }, [ymaps, vehicle.type]);  // one layout class per vehicle type

  if (!layout || !vehicle.coords) return null;

  return (
    <Placemark
      geometry={vehicle.coords}
      options={{
        iconLayout:  layout,
        iconShape:   { type: 'Rectangle', coordinates: [[-spec.w/2, -spec.h - 16], [spec.w/2, 4]] },
        openBalloonOnClick: false,
        zIndex: 55,
      }}
      properties={{ hintContent: label }}
    />
  );
}
