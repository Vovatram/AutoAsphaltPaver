import { VEHICLE_ICON, VEHICLE_LABEL } from './PanelVehicle.jsx';

const COND_BADGE = {
  'Хорошее':            'bg-green-100 text-green-800',
  'Удовлетворительное': 'bg-yellow-100 text-yellow-800',
  'Плохое':             'bg-orange-100 text-orange-800',
  'Критическое':        'bg-red-100 text-red-800',
};

// Simulation current time: 09:30
const SIM_MINUTES = 9 * 60 + 30;

function parseTime(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function formatDiff(mins) {
  if (mins <= 0) return '0 мин';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h} ч ${m} мин`;
  if (h > 0) return `${h} ч`;
  return `${m} мин`;
}

function TimeCountdown({ task }) {
  const isActive = task.status === 'in_progress';
  const refTime = isActive ? parseTime(task.end_time) : parseTime(task.start_time);
  const diff = refTime - SIM_MINUTES;
  const label = diff > 0 ? formatDiff(diff) : '—';
  const sub   = isActive ? 'до завершения работ' : 'до начала работ';

  return (
    <div className={`rounded-2xl p-5 text-center ${isActive ? 'bg-orange-500' : 'bg-blue-500'}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isActive ? 'text-orange-100' : 'text-blue-100'}`}>
        {sub}
      </p>
      <p className="text-4xl font-black text-white leading-none">{label}</p>
      <p className={`text-xs mt-2 ${isActive ? 'text-orange-100' : 'text-blue-100'}`}>
        {isActive
          ? `Идёт с ${task.start_time} · завершение в ${task.end_time}`
          : `Старт в ${task.start_time} · окончание в ${task.end_time}`}
      </p>
    </div>
  );
}

function VehicleCard({ v }) {
  const isTransit = v.location_type === 'transit';
  const locationText = isTransit
    ? (v.coords ? `в пути (${v.coords[0].toFixed(4)}, ${v.coords[1].toFixed(4)})` : 'в пути')
    : (v.location_name ?? '—');

  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 space-y-2">
      {/* Vehicle header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0">{VEHICLE_ICON[v.type] ?? '🚗'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{v.name}</p>
          <p className="text-xs text-gray-400">{VEHICLE_LABEL[v.type]}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          isTransit ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {isTransit ? 'в пути' : 'на месте'}
        </span>
      </div>

      {/* Role */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 shrink-0">Роль:</span>
        <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
          {v.role}
        </span>
      </div>

      {/* Status rows */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="text-gray-400">Задача: </span>
          <span className="text-gray-800 font-medium">{v.current_task ?? '—'}</span>
        </div>
        <div>
          <span className="text-gray-400">Скорость: </span>
          <span className="text-gray-800 font-medium">{v.speed_kmh ?? 0} км/ч</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400">Место: </span>
          <span className={`font-medium ${isTransit ? 'font-mono text-blue-700' : 'text-gray-800'}`}>
            {locationText}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TaskLine({ task, onClose, onBack }) {
  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-gray-50 shadow-2xl overflow-y-auto z-10 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 z-10">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">{task.road_name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{task.lane_name} · {task.direction}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Countdown */}
        <TimeCountdown task={task} />

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
            <p className="text-xs text-gray-400 mb-0.5">Состояние полосы</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COND_BADGE[task.condition] ?? 'bg-gray-100 text-gray-700'}`}>
              {task.condition}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
            <p className="text-xs text-gray-400 mb-0.5">Рабочее окно</p>
            <p className="text-xs font-semibold text-gray-900">{task.window}</p>
          </div>
        </div>

        {/* Vehicles */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Задействованная техника — {task.vehicles?.length ?? 0} ед.
          </p>
          <div className="space-y-2">
            {(task.vehicles ?? []).map(v => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
