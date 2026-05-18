import { useEffect } from 'react';

const CONVOY_DUR = 18;   // convoy traversal seconds
const TRIP_DUR   = 2.1;  // seconds per dump truck trip
const TRIPS      = 5;

const CSS = `
  @keyframes ra-convoy {
    from { transform: translateX(920px); }
    to   { transform: translateX(-650px); }
  }
  @keyframes ra-truck-x {
    0%    { left: 920px; }
    40%   { left: 175px; }
    58%   { left: 175px; }
    100%  { left: 920px; }
  }
  @keyframes ra-truck-flip {
    0%    { transform: scaleX(1);  }
    39.9% { transform: scaleX(1);  }
    40%   { transform: scaleX(-1); }
    99.9% { transform: scaleX(-1); }
    100%  { transform: scaleX(1);  }
  }
  @keyframes ra-asphalt {
    from { width: 0px; }
    to   { width: 860px; }
  }
`;

export default function RepairAnimation({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, (CONVOY_DUR + 3) * 1000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{CSS}</style>

      <div style={{
        background: '#0f172a', borderRadius: 20,
        padding: '24px 24px 20px', width: 908,
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>🚧 Ремонт начат</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>
              Колонна движется к объекту · самосвал совершает {TRIPS} рейса
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1e293b', color: '#64748b', border: 'none',
              borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Scene */}
        <div style={{
          position: 'relative', width: 860, height: 195,
          borderRadius: 12, overflow: 'hidden',
        }}>
          {/* Sky */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 135,
            background: 'linear-gradient(180deg, #3a7bd5 0%, #87ceeb 65%, #b0d8f5 100%)',
          }} />
          {/* Ground */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 68,
            background: 'linear-gradient(180deg, #6b5230 0%, #4a3820 100%)',
          }} />
          {/* Road bed */}
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, height: 54, background: '#555' }} />
          {/* Old road surface */}
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, height: 28, background: '#888' }} />

          {/* Fresh asphalt — grows right → left behind paver */}
          <div style={{
            position: 'absolute', right: 0, bottom: 20, height: 28,
            background: '#1c1c1c',
            width: 0,
            animation: `ra-asphalt ${CONVOY_DUR - 2}s linear 2s forwards`,
            zIndex: 2,
          }} />

          {/* Road edge lines */}
          <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.45)', zIndex: 3 }} />
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, height: 1, background: '#3a3a3a', zIndex: 3 }} />
          {/* Centre dashes */}
          <div style={{ position: 'absolute', bottom: 33, left: 0, right: 0, height: 0, borderTop: '2px dashed rgba(255,255,255,0.3)', zIndex: 3 }} />

          {/* ── Convoy: Transfer → Paver → Roller ── */}
          <div style={{
            position: 'absolute', bottom: 20, left: 0,
            display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 4,
            animation: `ra-convoy ${CONVOY_DUR}s linear forwards`,
            zIndex: 4,
          }}>
            {/* Перегружатель смеси */}
            <svg width="108" height="70" viewBox="163 57 133 81">
              <rect x="178" y="100" width="100" height="18" rx="3" fill="#4A7FA5" stroke="#2C4F6B" strokeWidth="1.2"/>
              <rect x="188" y="72" width="60" height="30" rx="4" fill="#4A7FA5" stroke="#2C4F6B" strokeWidth="1.2"/>
              <polygon points="168,85 188,80 188,108 168,108" fill="#357599" stroke="#2C4F6B" strokeWidth="1"/>
              <rect x="248" y="84" width="38" height="8" rx="3" fill="#2C5F7A" stroke="#1A3D50" strokeWidth="1"/>
              <ellipse cx="252" cy="88" rx="5" ry="5" fill="#1A3D50"/>
              <ellipse cx="282" cy="88" rx="5" ry="5" fill="#1A3D50"/>
              <rect x="224" y="60" width="24" height="22" rx="3" fill="#5B8FB9" stroke="#2C4F6B" strokeWidth="1"/>
              <rect x="227" y="63" width="14" height="9" rx="1.5" fill="#AED6F1" stroke="#1A5276" strokeWidth="0.7"/>
              <circle cx="198" cy="124" r="11" fill="#2C2C2C" stroke="#555" strokeWidth="1"/>
              <circle cx="198" cy="124" r="5" fill="#888"/>
              <circle cx="258" cy="124" r="11" fill="#2C2C2C" stroke="#555" strokeWidth="1"/>
              <circle cx="258" cy="124" r="5" fill="#888"/>
            </svg>

            {/* Асфальтоукладчик */}
            <svg width="115" height="75" viewBox="325 54 145 92">
              <rect x="358" y="78" width="90" height="32" rx="5" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1.2"/>
              <polygon points="340,82 360,76 360,112 340,112" fill="#388E3C" stroke="#1B5E20" strokeWidth="1"/>
              <rect x="398" y="58" width="28" height="24" rx="3" fill="#43A047" stroke="#1B5E20" strokeWidth="1"/>
              <rect x="402" y="62" width="16" height="10" rx="1.5" fill="#AED6F1" stroke="#1A5276" strokeWidth="0.7"/>
              <rect x="343" y="112" width="110" height="8" rx="2" fill="#1B5E20" stroke="#0D3B12" strokeWidth="1"/>
              <rect x="356" y="120" width="36" height="14" rx="4" fill="#333" stroke="#555" strokeWidth="1"/>
              <rect x="402" y="120" width="36" height="14" rx="4" fill="#333" stroke="#555" strokeWidth="1"/>
              <circle cx="362" cy="127" r="4" fill="#666"/>
              <circle cx="386" cy="127" r="4" fill="#666"/>
              <circle cx="408" cy="127" r="4" fill="#666"/>
              <circle cx="432" cy="127" r="4" fill="#666"/>
              <rect x="330" y="134" width="126" height="6" rx="1" fill="#333" opacity="0.7"/>
            </svg>

            {/* Каток гладковальцовый */}
            <svg width="112" height="68" viewBox="510 60 140 82">
              <rect x="520" y="90" width="120" height="16" rx="3" fill="#B71C1C" stroke="#7B0000" strokeWidth="1.2"/>
              <rect x="564" y="65" width="34" height="28" rx="3" fill="#C62828" stroke="#7B0000" strokeWidth="1.2"/>
              <rect x="568" y="69" width="22" height="12" rx="2" fill="#AED6F1" stroke="#1A5276" strokeWidth="0.7"/>
              <ellipse cx="536" cy="116" rx="22" ry="22" fill="#8B1A1A" stroke="#5B0000" strokeWidth="1.5"/>
              <ellipse cx="536" cy="116" rx="14" ry="14" fill="#7B1818" stroke="#5B0000" strokeWidth="0.8"/>
              <ellipse cx="536" cy="116" rx="6" ry="6" fill="#5B0000"/>
              <ellipse cx="624" cy="116" rx="22" ry="22" fill="#8B1A1A" stroke="#5B0000" strokeWidth="1.5"/>
              <ellipse cx="624" cy="116" rx="14" ry="14" fill="#7B1818" stroke="#5B0000" strokeWidth="0.8"/>
              <ellipse cx="624" cy="116" rx="6" ry="6" fill="#5B0000"/>
              <line x1="514" y1="138" x2="646" y2="138" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* ── Самосвал (5 рейсов) ── */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 920,
            width: 88,
            height: 72,
            animation: `ra-truck-x ${TRIP_DUR}s linear ${TRIPS}`,
            zIndex: 5,
          }}>
            <svg
              width="88" height="72"
              viewBox="15 57 103 85"
              style={{ display: 'block', transformOrigin: '50% 50%', animation: `ra-truck-flip ${TRIP_DUR}s linear ${TRIPS}` }}
            >
              <rect x="22" y="80" width="36" height="34" rx="4" fill="#E8A020" stroke="#8B5E10" strokeWidth="1.2"/>
              <rect x="26" y="84" width="22" height="14" rx="2" fill="#AED6F1" stroke="#1A5276" strokeWidth="0.8"/>
              <polygon points="56,60 110,60 110,114 56,114" fill="#E8A020" stroke="#8B5E10" strokeWidth="1.2"/>
              <polygon points="58,62 108,62 108,82 58,82" fill="#A0522D"/>
              <rect x="18" y="114" width="96" height="8" rx="2" fill="#5D5D5D" stroke="#333" strokeWidth="1"/>
              <circle cx="36" cy="128" r="11" fill="#2C2C2C" stroke="#555" strokeWidth="1"/>
              <circle cx="36" cy="128" r="5" fill="#888"/>
              <circle cx="88" cy="128" r="11" fill="#2C2C2C" stroke="#555" strokeWidth="1"/>
              <circle cx="88" cy="128" r="5" fill="#888"/>
              <circle cx="104" cy="128" r="11" fill="#2C2C2C" stroke="#555" strokeWidth="1"/>
              <circle cx="104" cy="128" r="5" fill="#888"/>
              <line x1="68" y1="85" x2="68" y2="114" stroke="#888" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginTop: 14, justifyContent: 'center' }}>
          {[
            { color: '#E8A020', label: 'Самосвал ×5' },
            { color: '#4A7FA5', label: 'Перегружатель' },
            { color: '#2E7D32', label: 'Укладчик' },
            { color: '#B71C1C', label: 'Каток' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94a3b8', fontSize: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 28px', background: '#f97316',
              color: 'white', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
