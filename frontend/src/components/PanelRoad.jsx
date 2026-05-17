const CONDITION_STYLE = {
  'Хорошее':            'bg-green-500 text-white',
  'Удовлетворительное': 'bg-yellow-500 text-white',
  'Плохое':             'bg-orange-500 text-white',
  'Критическое':        'bg-red-500 text-white',
};

function pluralDays(n) {
  if (n % 100 >= 11 && n % 100 <= 19) return 'дней';
  const r = n % 10;
  if (r === 1) return 'день';
  if (r >= 2 && r <= 4) return 'дня';
  return 'дней';
}

export default function PanelRoad({ road, dark, onClose }) {
  const days = Math.ceil(road.repair_hours / 24);

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
        {/* Lanes */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Полосы движения
          </h3>
          <div className="space-y-2">
            {road.lanes.map(lane => (
              <div key={lane.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-sm font-medium text-gray-800 truncate">{lane.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${CONDITION_STYLE[lane.condition] ?? 'bg-gray-400 text-white'}`}>
                    {lane.condition}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Последняя укладка: <span className="font-medium text-gray-700">{lane.last_paved}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Weather */}
        <section className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Погодные условия
          </h3>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{road.weather_suitable ? '✅' : '⛔'}</span>
            <span className={`text-sm font-semibold ${road.weather_suitable ? 'text-green-700' : 'text-red-600'}`}>
              {road.weather_suitable ? 'Ремонт возможен' : 'Ремонт не рекомендуется'}
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{road.weather_note}</p>
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
    </div>
  );
}
