const COND_BAR = {
  'Хорошее':            'bg-green-400',
  'Удовлетворительное': 'bg-yellow-400',
  'Плохое':             'bg-orange-400',
  'Критическое':        'bg-red-500',
};

const COND_BORDER = {
  'Хорошее':            'border-l-green-400',
  'Удовлетворительное': 'border-l-yellow-400',
  'Плохое':             'border-l-orange-400',
  'Критическое':        'border-l-red-500',
};

// Simulation current time: 09:30
const SIM_MINUTES = 9 * 60 + 30;

function parseTime(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function formatDiff(mins) {
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h} ч ${m} мин`;
  if (h > 0) return `${h} ч`;
  return `${m} мин`;
}

function TaskCard({ task, onClick }) {
  const isActive = task.status === 'in_progress';

  let timeLabel = null;
  let timeSub = null;
  if (isActive) {
    const diff = formatDiff(parseTime(task.end_time) - SIM_MINUTES);
    if (diff) { timeLabel = diff; timeSub = 'до завершения'; }
  } else {
    const diff = formatDiff(parseTime(task.start_time) - SIM_MINUTES);
    if (diff) { timeLabel = diff; timeSub = 'до начала'; }
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border-l-4 ${COND_BORDER[task.condition] ?? 'border-l-gray-300'} bg-white rounded-r-xl shadow-sm hover:shadow-md transition-shadow px-4 py-3 flex flex-col gap-1.5`}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">{task.road_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{task.lane_name} · {task.direction}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          isActive ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {isActive ? '● в работе' : '○ план'}
        </span>
      </div>

      {/* Condition bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full w-1/3 ${COND_BAR[task.condition] ?? 'bg-gray-300'}`} />
        </div>
        <span className="text-xs text-gray-400">{task.condition}</span>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
        <span className="flex items-center gap-1">
          <span>🕐</span>
          <span>{task.window}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>🚜</span>
          <span>{task.vehicle_count} ед. техники</span>
        </span>
        {timeLabel && (
          <span className={`font-semibold ${isActive ? 'text-orange-600' : 'text-blue-600'}`}>
            {timeLabel} {timeSub}
          </span>
        )}
      </div>
    </button>
  );
}

export default function TaskPanel({ tasks, onClose, onSelectTask }) {
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const planned    = tasks.filter(t => t.status === 'planned');

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-gray-50 shadow-2xl overflow-y-auto z-10 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div>
          <h2 className="font-bold text-gray-900 text-sm leading-tight">Задачи на укладку</h2>
          <p className="text-xs text-gray-400 mt-0.5">{tasks.length} активных задач · 18.05.2026</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {inProgress.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
              В работе сейчас
            </p>
            <div className="space-y-2">
              {inProgress.map(t => (
                <TaskCard key={t.id} task={t} onClick={() => onSelectTask(t.id)} />
              ))}
            </div>
          </section>
        )}

        {planned.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Запланировано
            </p>
            <div className="space-y-2">
              {planned.map(t => (
                <TaskCard key={t.id} task={t} onClick={() => onSelectTask(t.id)} />
              ))}
            </div>
          </section>
        )}

        {tasks.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm">Нет активных задач</p>
          </div>
        )}
      </div>
    </div>
  );
}
