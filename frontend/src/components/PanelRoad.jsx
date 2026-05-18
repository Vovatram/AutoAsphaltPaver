import { useState } from 'react';
import axios from 'axios';
import LinePanel from './LinePanel.jsx';
import PlanPanel from './PlanPanel.jsx';
import RoadScheme from './RoadScheme.jsx';
import RepairAnimation from './RepairAnimation.jsx';

const API = 'http://localhost:8000/api';

function pluralDays(n) {
  if (n % 100 >= 11 && n % 100 <= 19) return 'дней';
  const r = n % 10;
  if (r === 1) return 'день';
  if (r >= 2 && r <= 4) return 'дня';
  return 'дней';
}

export default function PanelRoad({ road, dark, onClose, polyEdit, onStartPolyEdit, onUndoPolyEdit, onFinishPolyEdit, onCancelPolyEdit, onRepairStarted }) {
  const [selectedLane, setSelectedLane] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [showAnim, setShowAnim] = useState(false);

  const days = Math.ceil(road.repair_hours / 24);

  const [planning, setPlanning] = useState(false);

  const handleDone = async (plan) => {
    setPlanning(true);
    try {
      await axios.post(`${API}/repair/plan`, {
        road_id: road.id,
        lane_id: selectedLane.id,
        window:  plan.window ?? '',
      });
    } catch (e) {
      console.error('Ошибка расчёта плана:', e);
    } finally {
      setPlanning(false);
    }
    setShowPlan(false);
    setSelectedLane(null);
    setShowAnim(true);
    onRepairStarted?.();
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

        {/* Polygon editor */}
        <section className={`rounded-lg p-3 border transition-colors ${polyEdit ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-100'}`}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Редактор полигона
          </h3>

          {!polyEdit ? (
            <button
              onClick={onStartPolyEdit}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
            >
              <span>✏️</span>
              <span>Редактировать полигон</span>
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-indigo-700 font-medium">
                Кликайте на карту для добавления точек
              </p>

              {/* Points list */}
              <div className="bg-white rounded-lg border border-indigo-200 p-2 max-h-36 overflow-y-auto">
                {polyEdit.points.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">Точек пока нет</p>
                ) : (
                  <div className="space-y-0.5">
                    {polyEdit.points.map((pt, i) => (
                      <p key={i} className="text-xs font-mono text-gray-700 leading-relaxed">
                        <span className="text-indigo-400 mr-1 select-none">{i + 1}.</span>
                        [{pt[0].toFixed(6)}, {pt[1].toFixed(6)}]
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onUndoPolyEdit}
                  disabled={polyEdit.points.length === 0}
                  className="flex-1 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 disabled:opacity-40 transition-colors"
                >
                  ↩ Отменить
                </button>
                <button
                  onClick={onFinishPolyEdit}
                  disabled={polyEdit.points.length < 3}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  📋 В консоль
                </button>
                <button
                  onClick={onCancelPolyEdit}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  ✕
                </button>
              </div>

              {polyEdit.points.length >= 3 && (
                <p className="text-xs text-indigo-500 text-center">
                  Готово — {polyEdit.points.length} точек расставлено
                </p>
              )}
            </div>
          )}
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
          submitting={planning}
        />
      )}

      {showAnim && <RepairAnimation onClose={() => setShowAnim(false)} />}
    </div>
  );
}
