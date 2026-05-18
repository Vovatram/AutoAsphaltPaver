import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

const VEHICLE_TYPES = [
  { type: 'closure_vehicle',  icon: '🚧', label: 'Спецавт. перекрытия дороги' },
  { type: 'dump_truck',       icon: '🚛', label: 'Автомобили-самосвалы' },
  { type: 'transfer_machine', icon: '🏗️', label: 'Перегружатель смеси' },
  { type: 'paver',            icon: '🚜', label: 'Асфальтоукладчик (гусеничный)' },
  { type: 'roller',           icon: '🛞', label: 'Каток гладковальцовый' },
];

function vehicleLocation(v) {
  if (!v.location_type) return null;
  if (v.location_type === 'transit') {
    return v.coords ? `в пути (${v.coords[0].toFixed(4)}, ${v.coords[1].toFixed(4)})` : 'в пути';
  }
  return v.location_name ?? null;
}

function VehicleSelector({ vehicleType, allVehicles, selected, onAdd, onRemove }) {
  const pool      = allVehicles[vehicleType] || [];
  const available = pool.filter(v => !selected.some(s => s.id === v.id));

  return (
    <div className="space-y-1.5">
      {selected.map(v => {
        const loc       = vehicleLocation(v);
        const isTransit = v.location_type === 'transit';
        return (
          <div key={v.id} className="flex items-start justify-between bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5 gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{v.name}</p>
              {loc && (
                <p className={`text-xs mt-0.5 ${isTransit ? 'text-blue-600 font-mono' : 'text-gray-500'}`}>
                  {loc}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(v.id)}
              className="text-gray-300 hover:text-red-500 transition-colors shrink-0 text-sm leading-none mt-0.5"
            >
              ✕
            </button>
          </div>
        );
      })}

      {available.length > 0 ? (
        <select
          value=""
          onChange={e => {
            if (!e.target.value) return;
            const found = pool.find(v => v.id === parseInt(e.target.value));
            if (found) onAdd(found);
            e.target.value = '';
          }}
          className="w-full text-xs border border-dashed border-gray-300 rounded-lg px-2 py-1.5 text-gray-500 bg-white focus:outline-none focus:border-orange-400 cursor-pointer"
        >
          <option value="">+ Добавить технику...</option>
          {available.map(v => (
            <option key={v.id} value={v.id}>
              {v.name}{vehicleLocation(v) ? ` — ${vehicleLocation(v)}` : ''}
            </option>
          ))}
        </select>
      ) : selected.length === 0 ? (
        <p className="text-xs text-gray-400 italic px-1">Нет доступной техники</p>
      ) : null}
    </div>
  );
}

const EMPTY_SELECTED = {
  closure_vehicle: [], dump_truck: [], transfer_machine: [], paver: [], roller: [],
};

export default function PlanPanel({ road, lane, onClose, onDone, submitting = false }) {
  const windows = road.weather_windows ?? [];

  // pool всей техники для ручного добавления
  const [vehiclePool, setVehiclePool] = useState({});
  useEffect(() => {
    axios.get(`${API}/vehicles`).then(({ data }) => {
      const byType = {};
      data.forEach(v => { byType[v.type] = [...(byType[v.type] || []), v]; });
      setVehiclePool(byType);
    }).catch(() => {});
  }, []);

  // Статус каждого окна: null | 'checking' | { ok: true, suggested, arrival, end_time } | { ok: false, error }
  const [windowStatus, setWindowStatus] = useState({});
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [selected, setSelected]             = useState(EMPTY_SELECTED);

  const handleWindowClick = async (w) => {
    const st = windowStatus[w];
    // уже проверено как ошибка — нельзя выбрать
    if (st && !st.ok && st !== 'checking') return;
    // уже выбрано — ничего не делаем
    if (w === selectedWindow) return;

    setWindowStatus(prev => ({ ...prev, [w]: 'checking' }));

    try {
      const { data } = await axios.post(`${API}/repair/check`, {
        road_id: road.id,
        lane_id: lane.id,
        window:  w,
      });

      if (!data.feasible) {
        setWindowStatus(prev => ({ ...prev, [w]: { ok: false, error: data.error } }));
        // не выбираем окно
      } else {
        setWindowStatus(prev => ({ ...prev, [w]: { ok: true, arrival: data.arrival, end_time: data.end_time } }));
        setSelectedWindow(w);
        // пре-заполняем из suggested
        const newSel = { ...EMPTY_SELECTED };
        if (data.suggested) {
          for (const [type, vehicles] of Object.entries(data.suggested)) {
            if (type in newSel) newSel[type] = vehicles;
          }
        }
        setSelected(newSel);
      }
    } catch {
      // сетевая ошибка — всё равно разрешаем выбор
      setWindowStatus(prev => ({ ...prev, [w]: { ok: true } }));
      setSelectedWindow(w);
    }
  };

  const addVehicle    = (type, v)  => setSelected(s => ({ ...s, [type]: [...s[type], v] }));
  const removeVehicle = (type, id) => setSelected(s => ({ ...s, [type]: s[type].filter(v => v.id !== id) }));

  const totalSelected  = Object.values(selected).reduce((n, arr) => n + arr.length, 0);
  const selectedStatus = selectedWindow ? windowStatus[selectedWindow] : null;
  const canSubmit      = !submitting && selectedWindow && selectedStatus?.ok && totalSelected > 0;

  return (
    <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-orange-500 px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-orange-100 text-xs uppercase tracking-wider">Подготовка к ремонту</p>
            <h3 className="text-white font-bold text-base mt-0.5 truncate">{road.name}</h3>
            <p className="text-orange-100 text-xs mt-0.5 truncate">{lane.name} · {lane.direction}</p>
          </div>
          <button onClick={onClose} className="text-orange-200 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-600 transition-colors shrink-0">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* ── Шаг 1: Окна ── */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              1. Выберите рабочее окно
            </p>

            {windows.length === 0 && (
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
                <span>⛔</span>
                <span>Нет окон для укладки — ремонт невозможен</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              {windows.map(w => {
                const st        = windowStatus[w];
                const isChecking = st === 'checking';
                const isError    = st && st !== 'checking' && !st.ok;
                const isActive   = w === selectedWindow;

                return (
                  <div key={w}>
                    <button
                      onClick={() => handleWindowClick(w)}
                      disabled={isError || isChecking}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors w-full text-left ${
                        isError
                          ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-70'
                          : isActive
                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                            : isChecking
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-wait'
                              : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                      }`}
                    >
                      {isChecking ? (
                        <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0 animate-pulse" />
                      ) : isError ? (
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-green-500'}`} />
                      )}
                      <span>{isChecking ? 'Проверка...' : w}</span>
                      {isActive && <span className="ml-auto text-lg leading-none">✓</span>}
                      {isError  && <span className="ml-auto text-xs">✗ недоступно</span>}
                    </button>

                    {/* Сообщение об ошибке под окном */}
                    {isError && st.error && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-1">
                        {st.error}
                      </p>
                    )}

                    {/* Время прибытия если выбрано */}
                    {isActive && st?.ok && st.arrival && (
                      <p className="text-xs text-green-700 px-1 mt-1">
                        Колонна на объекте в {st.arrival} · окончание в {st.end_time}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Шаг 2: Техника (только после выбора окна) ── */}
          {selectedWindow && selectedStatus?.ok && (
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                2. Состав техники (подобрано автоматически)
              </p>
              <div className="space-y-3">
                {VEHICLE_TYPES.map(({ type, icon, label }) => (
                  <div key={type} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{label}</p>
                        <p className="text-xs text-gray-400">
                          {selected[type].length > 0 ? `${selected[type].length} ед. выбрано` : 'не выбрано'}
                        </p>
                      </div>
                    </div>
                    <VehicleSelector
                      vehicleType={type}
                      allVehicles={vehiclePool}
                      selected={selected[type]}
                      onAdd={v => addVehicle(type, v)}
                      onRemove={id => removeVehicle(type, id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Подсказка если окно не выбрано */}
          {!selectedWindow && windows.length > 0 && (
            <div className="py-8 text-center text-gray-400">
              <p className="text-3xl mb-2">☝️</p>
              <p className="text-sm">Выберите рабочее окно выше</p>
              <p className="text-xs mt-1">После этого система подберёт оптимальный состав техники</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 shrink-0 border-t border-gray-100">
          {selectedWindow && selectedStatus?.ok && (
            <p className="text-xs text-gray-400 text-center mb-3 mt-2">
              Итого: <strong className="text-gray-800">{totalSelected} ед.</strong>
              <span className="ml-2 text-green-700 font-semibold">· {selectedWindow}</span>
            </p>
          )}
          <button
            onClick={() => onDone({ vehicles: selected, window: selectedWindow })}
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Расчёт плана...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>Начать ремонт — сформировать план</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
