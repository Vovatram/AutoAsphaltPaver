import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

const VEHICLE_TYPES = [
  { type: 'dump_truck',       icon: '🚛', label: 'Автомобили-самосвалы' },
  { type: 'transfer_machine', icon: '🏗️', label: 'Перегружатель смеси' },
  { type: 'paver',            icon: '🚜', label: 'Асфальтоукладчик (гусеничный)' },
  { type: 'roller',           icon: '🛞', label: 'Каток гладковальцовый' },
  { type: 'closure_vehicle',  icon: '🚧', label: 'Спецавтомобиль перекрытия дороги' },
];

function vehicleLocation(v) {
  if (!v.location_type) return null;
  if (v.location_type === 'transit') {
    if (v.coords) return `в пути (${v.coords[0].toFixed(4)}, ${v.coords[1].toFixed(4)})`;
    return 'в пути';
  }
  return v.location_name ?? null;
}

function VehicleSelector({ vehicleType, allVehicles, selected, onAdd, onRemove }) {
  const pool = allVehicles[vehicleType] || [];
  const available = pool.filter(v => !selected.some(s => s.id === v.id));

  return (
    <div className="space-y-1.5">
      {selected.map(v => {
        const loc = vehicleLocation(v);
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

export default function PlanPanel({ road, lane, onClose, onDone, submitting = false }) {
  const [loading, setLoading] = useState(true);
  const [allVehicles, setAllVehicles] = useState({});
  const [selected, setSelected] = useState({
    dump_truck: [], transfer_machine: [], paver: [], roller: [], closure_vehicle: [],
  });
  const [selectedWindow, setSelectedWindow] = useState(null);

  const windows = road.weather_windows ?? [];

  useEffect(() => {
    if (windows.length === 1) setSelectedWindow(windows[0]);
  }, []);

  useEffect(() => {
    Promise.all([
      axios.post(`${API}/plans`, { road_id: road.id, lane_id: lane.id }),
      axios.get(`${API}/vehicles`),
    ]).then(([planRes, vehiclesRes]) => {
      const plan = planRes.data;
      const vehicles = vehiclesRes.data;

      const byType = {};
      vehicles.forEach(v => {
        if (!byType[v.type]) byType[v.type] = [];
        byType[v.type].push(v);
      });
      setAllVehicles(byType);

      const sv = plan.suggested_vehicles || {};
      setSelected({
        dump_truck:       sv.dump_truck       || (byType.dump_truck       || []).slice(0, plan.dump_trucks || 2),
        transfer_machine: sv.transfer_machine || (byType.transfer_machine || []).slice(0, 1),
        paver:            sv.paver            || (byType.paver            || []).slice(0, 1),
        roller:           sv.roller           || (byType.roller           || []).slice(0, 2),
        closure_vehicle:  sv.closure_vehicle  || [],
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [road.id, lane.id]);

  const addVehicle    = (type, v)  => setSelected(s => ({ ...s, [type]: [...s[type], v] }));
  const removeVehicle = (type, id) => setSelected(s => ({ ...s, [type]: s[type].filter(v => v.id !== id) }));

  const totalSelected = Object.values(selected).reduce((n, arr) => n + arr.length, 0);
  const canSubmit = !loading && !submitting && totalSelected > 0 && (windows.length === 0 || selectedWindow !== null);

  return (
    <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-orange-500 px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-orange-100 text-xs uppercase tracking-wider">План укладки</p>
            <h3 className="text-white font-bold text-base mt-0.5 truncate">{road.name}</h3>
            <p className="text-orange-100 text-xs mt-0.5 truncate">{lane.name}</p>
          </div>
          <button onClick={onClose} className="text-orange-200 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-600 transition-colors shrink-0">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Window selector */}
          {windows.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Рабочее окно
              </p>
              <div className="flex flex-col gap-1.5">
                {windows.map((w, i) => {
                  const active = selectedWindow === w;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedWindow(w)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-green-500 border-green-500 text-white shadow-sm'
                          : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-green-500'}`} />
                      {w}
                      {active && <span className="ml-auto text-white text-base leading-none">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vehicle types */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Состав техники
            </p>

            {loading ? (
              <div className="py-10 text-center text-gray-400 text-sm">Расчёт оптимального состава...</div>
            ) : (
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
                      allVehicles={allVehicles}
                      selected={selected[type]}
                      onAdd={v => addVehicle(type, v)}
                      onRemove={id => removeVehicle(type, id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 shrink-0 border-t border-gray-100">
          {windows.length > 0 && !selectedWindow && (
            <p className="text-xs text-amber-600 text-center mb-2 mt-2">Выберите рабочее окно</p>
          )}
          <p className="text-xs text-gray-400 text-center mb-3 mt-2">
            Итого выбрано: <strong className="text-gray-800">{totalSelected} ед.</strong>
            {selectedWindow && <span className="ml-2 text-green-700 font-semibold">· {selectedWindow}</span>}
          </p>
          <button
            onClick={() => onDone({ vehicles: selected, window: selectedWindow })}
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>✅</span>
            <span>Готово — сформировать задание</span>
          </button>
        </div>
      </div>
    </div>
  );
}
