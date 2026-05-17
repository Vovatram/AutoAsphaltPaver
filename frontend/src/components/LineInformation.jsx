import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PlanPanel from './PlanPanel.jsx';

const API = 'http://localhost:8000/api';

const CONDITION_ORDER = { 'Критическое': 0, 'Плохое': 1, 'Удовлетворительное': 2, 'Хорошее': 3 };

const CONDITION_BADGE = {
  'Хорошее':            'bg-green-100 text-green-800 border-green-200',
  'Удовлетворительное': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Плохое':             'bg-orange-100 text-orange-800 border-orange-200',
  'Критическое':        'bg-red-100 text-red-800 border-red-200',
};

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function daysSince(iso) {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function SortIcon({ active, dir }) {
  if (!active) return <span className="ml-1 text-gray-300">⇅</span>;
  return <span className="ml-1 text-blue-500">{dir === 'asc' ? '↑' : '↓'}</span>;
}

const COLUMNS = [
  { key: 'name',             label: 'Участок / Полоса' },
  { key: 'condition',        label: 'Состояние' },
  { key: 'last_paved',       label: 'Последний ремонт' },
  { key: 'weather_suitable', label: 'Окна для ремонта' },
];

function sortLanes(lanes, key, dir) {
  return [...lanes].sort((a, b) => {
    let va, vb;
    if (key === 'condition') {
      va = CONDITION_ORDER[a.condition] ?? 99;
      vb = CONDITION_ORDER[b.condition] ?? 99;
    } else if (key === 'last_paved') {
      va = new Date(a.last_paved).getTime();
      vb = new Date(b.last_paved).getTime();
    } else if (key === 'weather_suitable') {
      va = a.weather_windows?.length ?? 0;
      vb = b.weather_windows?.length ?? 0;
    } else if (key === 'name') {
      va = `${(a.road_name ?? '').toLowerCase()}\x00${(a.name ?? '').toLowerCase()}`;
      vb = `${(b.road_name ?? '').toLowerCase()}\x00${(b.name ?? '').toLowerCase()}`;
    } else {
      va = (a[key] ?? '').toLowerCase();
      vb = (b[key] ?? '').toLowerCase();
    }
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

export default function LineInformation({ onClose }) {
  const [lanes, setLanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: 'condition', dir: 'asc' });
  const [filter, setFilter] = useState('');
  const [planTarget, setPlanTarget] = useState(null); // { road, lane }

  useEffect(() => {
    axios.get(`${API}/lanes`)
      .then(r => setLanes(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const displayed = useMemo(() => {
    const q = filter.toLowerCase();
    const filtered = q
      ? lanes.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.road_name.toLowerCase().includes(q) ||
          l.condition.toLowerCase().includes(q)
        )
      : lanes;
    return sortLanes(filtered, sort.key, sort.dir);
  }, [lanes, sort, filter]);

  return (
    <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-full overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Все полосы движения</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? 'Загрузка...' : `${displayed.length} из ${lanes.length} полос`}
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Поиск..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 w-44"
              />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Загрузка данных...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="w-6 px-4 py-3 text-left text-xs font-semibold text-gray-400">#</th>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 hover:bg-gray-100 transition-colors select-none whitespace-nowrap"
                    >
                      {col.label}
                      <SortIcon active={sort.key === col.key} dir={sort.dir} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Действие
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">Ничего не найдено</td>
                  </tr>
                )}
                {displayed.map((lane, i) => {
                  const days = daysSince(lane.last_paved);
                  return (
                    <tr
                      key={`${lane.road_id}-${lane.id}`}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-300 tabular-nums">{i + 1}</td>

                      {/* Road + lane */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{lane.road_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{lane.name}</p>
                      </td>

                      {/* Condition */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${CONDITION_BADGE[lane.condition] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {lane.condition}
                        </span>
                      </td>

                      {/* Last paved */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-800">{formatDate(lane.last_paved)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {days} {days % 10 === 1 && days % 100 !== 11 ? 'день' : days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20) ? 'дня' : 'дней'} назад
                        </p>
                      </td>

                      {/* Weather windows */}
                      <td className="px-4 py-3">
                        {lane.weather_windows?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {lane.weather_windows.map((w, wi) => (
                              <span key={wi} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                {w}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-red-500">Нет окон</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        {lane.weather_windows?.length > 0 ? (
                          <button
                            onClick={() => setPlanTarget({
                              road: { id: lane.road_id, name: lane.road_name, repair_hours: lane.repair_hours },
                              lane: { id: lane.id, name: lane.name },
                            })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            <span>🚜</span>
                            <span>Начать ремонт</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer summary */}
        {!loading && lanes.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4 text-xs text-gray-500">
            {['Критическое', 'Плохое', 'Удовлетворительное', 'Хорошее'].map(cond => {
              const count = lanes.filter(l => l.condition === cond).length;
              return (
                <span key={cond} className="flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    cond === 'Хорошее' ? 'bg-green-500' :
                    cond === 'Удовлетворительное' ? 'bg-yellow-500' :
                    cond === 'Плохое' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  {cond}: <strong>{count}</strong>
                </span>
              );
            })}
            <span className="ml-auto flex items-center gap-1">
              Доступно для ремонта: <strong className="text-green-700">{lanes.filter(l => l.weather_suitable).length}</strong>
            </span>
          </div>
        )}
      </div>

      {/* PlanPanel opens on top when a lane repair is initiated */}
      {planTarget && (
        <PlanPanel
          road={planTarget.road}
          lane={planTarget.lane}
          onClose={() => setPlanTarget(null)}
          onDone={() => { setPlanTarget(null); onClose(); }}
        />
      )}
    </div>
  );
}
