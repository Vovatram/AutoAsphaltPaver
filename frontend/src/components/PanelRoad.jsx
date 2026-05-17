import { useState } from 'react';
import LinePanel from './LinePanel.jsx';
import PlanPanel from './PlanPanel.jsx';
import RoadScheme from './RoadScheme.jsx';

function pluralDays(n) {
  if (n % 100 >= 11 && n % 100 <= 19) return 'дней';
  const r = n % 10;
  if (r === 1) return 'день';
  if (r >= 2 && r <= 4) return 'дня';
  return 'дней';
}

export default function PanelRoad({ road, dark, onClose, polyEdit, onStartPolyEdit, onUndoPolyEdit, onFinishPolyEdit, onCancelPolyEdit }) {
  const [selectedLane, setSelectedLane] = useState(null);
  const [showPlan, setShowPlan] = useState(false);

  const days = Math.ceil(road.repair_hours / 24);

  const handleDone = (plan) => {
    console.log('Задание сформировано:', plan);
    setShowPlan(false);
    setSelectedLane(null);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl overflow-y-auto z-10 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div>
          <h2 className="font-bold text-gray-900 text-sm leading-tight">{road.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Участок дороги</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Road photo */}
      <div className={dark ? 'photo-reset' : ''}>
        <img
          src={road.photo}
          alt="Фото участка дороги"
          className="w-full h-44 object-cover"
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Road scheme */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Схема дороги
          </h3>
          <RoadScheme
            lanes={road.lanes}
            selectedLane={selectedLane}
            onSelectLane={(lane) => { setSelectedLane(lane); setShowPlan(false); }}
          />
        </section>

        {/* Weather */}
        <section className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Окна для ремонта
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-2">{road.weather_note}</p>
          {road.weather_windows?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {road.weather_windows.map((w, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {w}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
              <span>⛔</span> Окон для ремонта нет
            </span>
          )}
        </section>

        {/* Repair time */}
        <section className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Расчётное время перекладки
          </h3>
          <p className="text-3xl font-bold text-gray-900">{road.repair_hours} ч</p>
          <p className="text-sm text-gray-500 mt-0.5">
            ≈ {days} {pluralDays(days)} непрерывной работы
          </p>
        </section>
      </div>

      {/* Lane detail popup */}
      {selectedLane && !showPlan && (
        <LinePanel
          lane={selectedLane}
          road={road}
          onClose={() => setSelectedLane(null)}
          onStartPlan={() => setShowPlan(true)}
        />
      )}

      {/* Plan panel */}
      {selectedLane && showPlan && (
        <PlanPanel
          road={road}
          lane={selectedLane}
          onClose={() => setShowPlan(false)}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
