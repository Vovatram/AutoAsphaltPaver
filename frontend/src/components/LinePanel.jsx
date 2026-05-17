const CONDITION_STYLE = {
  'Хорошее':            { bar: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800' },
  'Удовлетворительное': { bar: 'bg-yellow-500', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  'Плохое':             { bar: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
  'Критическое':        { bar: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800' },
};

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function daysSince(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 86400000);
}

export default function LinePanel({ lane, road, onClose, onStartPlan }) {
  const style = CONDITION_STYLE[lane.condition] ?? { bar: 'bg-gray-400', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' };
  const days = daysSince(lane.last_paved);

  return (
    <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Полоса движения</p>
            <h3 className="font-bold text-gray-900 text-base mt-0.5">{lane.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{road.name}{lane.direction ? ` · ${lane.direction}` : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Condition */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Состояние дороги
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${style.bar} ${
                  lane.condition === 'Хорошее' ? 'w-full' :
                  lane.condition === 'Удовлетворительное' ? 'w-2/3' :
                  lane.condition === 'Плохое' ? 'w-1/3' : 'w-1/6'
                }`} />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                {lane.condition}
              </span>
            </div>
          </div>

          {/* Last paved */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Последняя перекладка
            </p>
            <p className="text-xl font-bold text-gray-900">{formatDate(lane.last_paved)}</p>
            {days !== null && (
              <p className="text-xs text-gray-500 mt-0.5">
                {days} {days % 10 === 1 && days % 100 !== 11 ? 'день' : days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20) ? 'дня' : 'дней'} назад
              </p>
            )}
          </div>

          {/* Weather */}
          <div className={`rounded-xl p-3.5 border ${road.weather_windows?.length > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Окна для укладки
            </p>
            {road.weather_windows?.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {road.weather_windows.map((w, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      {w}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600">{road.weather_note}</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⛔</span>
                  <p className="text-sm font-semibold text-red-700">Нет окон для укладки</p>
                </div>
                <p className="text-xs text-gray-600">{road.weather_note}</p>
              </>
            )}
          </div>

          {/* Action */}
          {road.weather_windows?.length > 0 && (
            <button
              onClick={onStartPlan}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>🚜</span>
              <span>Начать укладку</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
