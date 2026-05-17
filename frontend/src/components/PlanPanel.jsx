import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000/api';

const VEHICLE_TYPES = [
  { key: 'dump_trucks',        icon: '🚛', label: 'Автомобили-самосвалы',              unit: 'ед.' },
  { key: 'transfer_machines',  icon: '🏗️', label: 'Перегружатель смеси',               unit: 'ед.' },
  { key: 'pavers',             icon: '🚜', label: 'Асфальтоукладчик (гусеничный)',      unit: 'ед.' },
  { key: 'rollers',            icon: '🛞', label: 'Каток гладковальцовый',             unit: 'ед.' },
  { key: 'closure_vehicles',   icon: '🚧', label: 'Спецавтомобиль перекрытия дороги',  unit: 'ед.' },
];

function Counter({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base flex items-center justify-center transition-colors"
      >
        −
      </button>
      <span className="w-8 text-center font-bold text-gray-900 text-sm">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base flex items-center justify-center transition-colors"
      >
        +
      </button>
    </div>
  );
}

export default function PlanPanel({ road, lane, onClose, onDone }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.post(`${API}/plans`, { road_id: road.id, lane_id: lane.id })
      .then(r => setPlan(r.data))
      .catch(() => setPlan({ dump_trucks: 2, transfer_machines: 1, pavers: 1, rollers: 2, closure_vehicles: 1 }))
      .finally(() => setLoading(false));
  }, [road.id, lane.id]);

  const setField = (key, val) => setPlan(p => ({ ...p, [key]: val }));

  const handleDone = () => {
    console.log('Plan submitted:', plan);
    onDone(plan);
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-orange-100 text-xs uppercase tracking-wider">План укладки</p>
            <h3 className="text-white font-bold text-base mt-0.5">{road.name}</h3>
            <p className="text-orange-100 text-xs mt-0.5">{lane.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-orange-200 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-600 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Оптимальный состав техники
          </p>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Расчёт...</div>
          ) : (
            <div className="space-y-2">
              {VEHICLE_TYPES.map(({ key, icon, label }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <span className="text-2xl w-8 text-center shrink-0">{icon}</span>
                  <p className="flex-1 text-xs font-medium text-gray-800 leading-tight">{label}</p>
                  <Counter value={plan[key]} onChange={v => setField(key, v)} />
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3 mb-4 text-center">
            Вы можете изменить состав с помощью кнопок ±
          </p>

          <button
            onClick={handleDone}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>✅</span>
            <span>Готово — сформировать задание</span>
          </button>
        </div>
      </div>
    </div>
  );
}
