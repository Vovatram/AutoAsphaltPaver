import { useState, useEffect, useMemo, useRef } from 'react';
import { YMaps, Map, Placemark, Polygon, useYMaps } from '@pbe/react-yandex-maps';
import axios from 'axios';
import LeftPanel from './components/LeftPanel.jsx';
import PanelRoad from './components/PanelRoad.jsx';
import PanelVehicle, { VEHICLE_ICON } from './components/PanelVehicle.jsx';
import LineInformation from './components/LineInformation.jsx';
import TaskPanel from './components/TaskPanel.jsx';
import TaskLine from './components/TaskLine.jsx';

const API = 'http://localhost:8000/api';
const MAP_CENTER = [57.0, 35.5];
const MAP_ZOOM = 7;

// Condition → fill color (hex)
const COND_COLOR = {
  'Хорошее':            '#22c55e',
  'Удовлетворительное': '#eab308',
  'Плохое':             '#f97316',
  'Критическое':        '#ef4444',
};
const COLOR_NO_WINDOW = '#3b82f6'; // blue — no weather windows

function makeIconHtml(emoji, name, count) {
  const badge = count > 0
    ? `<div style="position:absolute;top:-6px;right:-8px;background:#dc2626;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35)">${count}</div>`
    : '';
  return (
    `<div style="position:relative;display:inline-block;text-align:center;transform:translate(-50%,-100%);cursor:pointer">` +
      `<div style="font-size:30px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))">${emoji}</div>` +
      badge +
      `<div style="margin-top:3px;background:rgba(30,30,30,.82);color:#fff;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 4px rgba(0,0,0,.3)">${name}</div>` +
    `</div>`
  );
}

function RoadLabel({ road, isActive, onClick }) {
  const ymaps = useYMaps(['templateLayoutFactory']);

  const layout = useMemo(() => {
    if (!ymaps?.templateLayoutFactory) return null;
    const bg = isActive ? 'rgba(234,88,12,0.95)' : 'rgba(30,30,30,0.80)';
    const border = isActive ? '#7c2d12' : '#475569';
    const shadow = isActive ? '0 2px 8px rgba(124,45,18,.5)' : '0 1px 4px rgba(0,0,0,.3)';
    return ymaps.templateLayoutFactory.createClass(
      `<div style="transform:translate(-50%,-100%);cursor:pointer;text-align:center">` +
        `<div style="display:inline-block;background:${bg};color:#fff;font-size:11px;font-weight:700;` +
        `padding:3px 8px;border-radius:6px;border:1.5px solid ${border};` +
        `box-shadow:${shadow};white-space:nowrap;letter-spacing:0.01em">` +
          `🛣️ ${road.name}` +
        `</div>` +
        `<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;` +
        `border-top:5px solid ${border};margin:0 auto"></div>` +
      `</div>`
    );
  }, [ymaps, road.name, isActive]);

  if (!layout) return null;

  return (
    <Placemark
      geometry={road.coords}
      options={{
        iconLayout: layout,
        iconShape: { type: 'Rectangle', coordinates: [[-80, -36], [80, 6]] },
        openBalloonOnClick: false,
        zIndex: isActive ? 20 : 5,
      }}
      onClick={onClick}
    />
  );
}

function FactoryMarker({ factory, onClick }) {
  const ymaps = useYMaps(['templateLayoutFactory']);
  const layout = useMemo(() => {
    if (!ymaps?.templateLayoutFactory) return null;
    return ymaps.templateLayoutFactory.createClass(
      makeIconHtml('🏭', factory.name, factory.vehicle_count)
    );
  }, [ymaps, factory.name, factory.vehicle_count]);
  if (!layout) return null;
  return (
    <Placemark
      geometry={factory.coords}
      options={{ iconLayout: layout, iconShape: { type: 'Rectangle', coordinates: [[-70, -65], [70, 8]] }, openBalloonOnClick: false }}
      properties={{ hintContent: factory.capacity_t_per_hour != null ? `${factory.name} — ${factory.capacity_t_per_hour} т/ч` : factory.name }}
      onClick={onClick}
    />
  );
}

function ParkingMarker({ parking, onClick }) {
  const ymaps = useYMaps(['templateLayoutFactory']);
  const layout = useMemo(() => {
    if (!ymaps?.templateLayoutFactory) return null;
    return ymaps.templateLayoutFactory.createClass(
      makeIconHtml('🅿️', parking.name, parking.vehicle_count)
    );
  }, [ymaps, parking.name, parking.vehicle_count]);
  if (!layout) return null;
  return (
    <Placemark
      geometry={parking.coords}
      options={{ iconLayout: layout, iconShape: { type: 'Rectangle', coordinates: [[-70, -65], [70, 8]] }, openBalloonOnClick: false }}
      properties={{ hintContent: `${parking.name} — ${parking.vehicle_count} ед. техники` }}
      onClick={onClick}
    />
  );
}

function EditDotMarker({ point, index }) {
  const ymaps = useYMaps(['templateLayoutFactory']);
  const layout = useMemo(() => {
    if (!ymaps?.templateLayoutFactory) return null;
    return ymaps.templateLayoutFactory.createClass(
      `<div style="width:20px;height:20px;background:#6366f1;border:2px solid #fff;border-radius:50%;` +
      `transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;` +
      `font-size:9px;font-weight:700;color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.5);cursor:default">${index + 1}</div>`
    );
  }, [ymaps, index]);
  if (!layout) return null;
  return (
    <Placemark
      geometry={point}
      options={{ iconLayout: layout, iconShape: { type: 'Circle', coordinates: [0, 0], radius: 10 }, openBalloonOnClick: false, zIndex: 60 }}
      properties={{ hintContent: `Точка ${index + 1}: [${point[0].toFixed(6)}, ${point[1].toFixed(6)}]` }}
    />
  );
}

function VehicleMarker({ vehicle, onClick }) {
  const ymaps = useYMaps(['templateLayoutFactory']);
  const icon = VEHICLE_ICON[vehicle.type] ?? '🚗';
  const layout = useMemo(() => {
    if (!ymaps?.templateLayoutFactory) return null;
    const speedBadge = vehicle.speed_kmh > 0
      ? `<div style="position:absolute;top:-6px;right:-8px;background:#2563eb;color:#fff;font-size:9px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)">${vehicle.speed_kmh}</div>`
      : '';
    return ymaps.templateLayoutFactory.createClass(
      `<div style="position:relative;display:inline-block;text-align:center;transform:translate(-50%,-100%);cursor:pointer">` +
        `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))">${icon}</div>` +
        speedBadge +
        `<div style="margin-top:2px;background:rgba(30,30,30,.85);color:#fff;font-size:9px;font-weight:600;padding:1px 5px;border-radius:4px;white-space:nowrap;max-width:130px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 3px rgba(0,0,0,.3)">${vehicle.name}</div>` +
      `</div>`
    );
  }, [ymaps, vehicle.type, vehicle.name, vehicle.speed_kmh]);
  if (!layout) return null;
  return (
    <Placemark
      geometry={vehicle.coords}
      options={{
        iconLayout: layout,
        iconShape: { type: 'Rectangle', coordinates: [[-65, -60], [65, 8]] },
        openBalloonOnClick: false,
        zIndex: 30,
      }}
      properties={{ hintContent: `${icon} ${vehicle.name} — ${vehicle.current_task}` }}
      onClick={onClick}
    />
  );
}

export default function MapPage() {
  const mapRef = useRef(null);
  const [dark, setDark] = useState(false);
  const [roads, setRoads] = useState([]);
  const [factories, setFactories] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [panel, setPanel] = useState(null);
  const [showLanes, setShowLanes] = useState(false);
  const [vehicleCounts, setVehicleCounts] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskView, setTaskView] = useState(null); // null | 'list' | task-object
  const [polyEdit, setPolyEdit] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/roads`),
      axios.get(`${API}/factories`),
      axios.get(`${API}/parkings`),
      axios.get(`${API}/vehicles`),
      axios.get(`${API}/tasks`),
    ]).then(([r, f, p, v, t]) => {
      setRoads(r.data);
      setFactories(f.data);
      setParkings(p.data);
      setVehicles(v.data);
      setTasks(t.data);
      const counts = {};
      v.data.forEach(vh => { counts[vh.type] = (counts[vh.type] || 0) + 1; });
      setVehicleCounts(counts);
    }).catch(console.error);
  }, []);

  // ── Polygon editor ──────────────────────────────────────────────────────────
  const addPolyPoint = (e) => {
    if (!polyEdit) return;
    setPolyEdit(prev => prev ? { ...prev, points: [...prev.points, e.get('coords')] } : null);
  };
  const startPolyEdit  = (roadId) => setPolyEdit({ roadId, points: [] });
  const undoPolyEdit   = () => setPolyEdit(prev => prev ? { ...prev, points: prev.points.slice(0, -1) } : null);
  const cancelPolyEdit = () => setPolyEdit(null);
  const finishPolyEdit = () => {
    const pts = polyEdit?.points ?? [];
    if (pts.length >= 3) {
      console.log(`%c[Полигон участка id=${polyEdit.roadId}]`, 'color:#6366f1;font-weight:bold;font-size:13px');
      console.log('"polygon": [');
      pts.forEach(([lat, lng]) => console.log(`    [${lat.toFixed(6)}, ${lng.toFixed(6)}],`));
      console.log('],');
      console.log('\nJSON:', JSON.stringify(pts));
    }
    setPolyEdit(null);
  };
  // ──────────────────────────────────────────────────────────────────────────

  const flyToRoad = (id) => {
    const road = roads.find(r => r.id === id);
    if (road && mapRef.current) mapRef.current.setCenter(road.coords, 14, { duration: 600, checkZoomRange: true });
  };

  const openRoad = async (id) => {
    flyToRoad(id);
    const { data } = await axios.get(`${API}/roads/${id}`);
    setPanel({ type: 'road', data });
  };
  const flyToParking = (id) => {
    const parking = parkings.find(p => p.id === id);
    if (parking && mapRef.current) mapRef.current.setCenter(parking.coords, 13, { duration: 600, checkZoomRange: true });
  };

  const openParking    = async (id) => { flyToParking(id); const { data } = await axios.get(`${API}/parkings/${id}`);  setPanel({ type: 'parking', data }); };
  const openVehicle    = async (id) => { const { data } = await axios.get(`${API}/vehicles/${id}`);  setPanel({ type: 'vehicle', data }); };
  const flyToFactory = (id) => {
    const factory = factories.find(f => f.id === id);
    if (factory && mapRef.current) mapRef.current.setCenter(factory.coords, 13, { duration: 600, checkZoomRange: true });
  };

  const flyToVehicle = (coords) => {
    if (coords && mapRef.current) mapRef.current.setCenter(coords, 16, { duration: 600, checkZoomRange: true });
  };

  const openFactory    = async (id) => { const { data } = await axios.get(`${API}/factories/${id}`); setPanel({ type: 'factory', data }); };
  const openVehicleType = async (type, typeName, typeIcon) => {
    const { data } = await axios.get(`${API}/vehicles`, { params: { type } });
    setPanel({ type: 'fleet', data: { vehicles: data, typeName, typeIcon } });
  };

  const openTasks = () => { setPanel(null); cancelPolyEdit(); setTaskView('list'); };
  const openTaskDetail = async (id) => {
    const { data } = await axios.get(`${API}/tasks/${id}`);
    setTaskView(data);
  };
  const closeTasks = () => setTaskView(null);

  const closePanel = () => { setPanel(null); cancelPolyEdit(); };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={dark ? { filter: 'invert(1) hue-rotate(180deg)' } : {}}>
      <LeftPanel
        dark={dark}
        onToggleDark={() => setDark(d => !d)}
        roads={roads}
        parkings={parkings}
        factories={factories}
        onSelectRoad={openRoad}
        onSelectParking={openParking}
        onSelectFactory={(id) => { flyToFactory(id); openFactory(id); }}
        onSelectVehicleType={openVehicleType}
        onShowLanes={() => setShowLanes(true)}
        vehicleCounts={vehicleCounts}
        activeRoadId={panel?.type === 'road' ? panel.data?.id : null}
      />

      <div className="flex-1 relative">
        <YMaps query={{ lang: 'ru_RU', load: 'package.full' }}>
          <Map
            defaultState={{ center: MAP_CENTER, zoom: MAP_ZOOM }}
            style={{ width: '100%', height: '100%' }}
            options={{ suppressMapOpenBlock: true }}
            instanceRef={mapRef}
            onClick={addPolyPoint}
          >
            {/* Road lane polygons */}
            {roads.map(r => {
              const isActive = panel?.type === 'road' && panel.data?.id === r.id;
              const hasWindows = r.weather_windows?.length > 0;
              const fillOpacity = isActive ? 0.90 : 0.72;

              const handleClick = (e) => polyEdit ? addPolyPoint(e) : openRoad(r.id);

              const lanePolygons = (r.lane_polygons ?? []).map(lp => {
                const lane = r.lanes?.find(l => l.id === lp.lane_id);
                const fill = hasWindows ? (COND_COLOR[lane?.condition] ?? '#94a3b8') : COLOR_NO_WINDOW;
                return (
                  <Polygon
                    key={`road-lane-${r.id}-${lp.lane_id}`}
                    geometry={[lp.polygon]}
                    options={{
                      fillColor: fill,
                      fillOpacity,
                      strokeColor: '#ffffff',
                      strokeOpacity: 0.25,
                      strokeWidth: 0.5,
                      openBalloonOnClick: false,
                      zIndex: isActive ? 10 : 1,
                    }}
                    properties={{ hintContent: lane ? `${r.name} · ${lane.name} (${lane.condition})` : r.name }}
                    onClick={handleClick}
                  />
                );
              });

              return [
                ...lanePolygons,
                // Road boundary outline
                <Polygon
                  key={`road-outline-${r.id}`}
                  geometry={[r.polygon]}
                  options={{
                    fillOpacity: 0,
                    strokeColor: isActive ? '#ffffff' : '#1e293b',
                    strokeOpacity: isActive ? 0.9 : 0.5,
                    strokeWidth: isActive ? 2 : 1,
                    openBalloonOnClick: false,
                    zIndex: isActive ? 12 : 2,
                  }}
                  onClick={handleClick}
                />,
                <RoadLabel
                  key={`road-label-${r.id}`}
                  road={r}
                  isActive={isActive}
                  onClick={handleClick}
                />,
              ];
            })}

            {/* Factory markers */}
            {factories.map(f => (
              <FactoryMarker key={`factory-${f.id}`} factory={f} onClick={(e) => polyEdit ? addPolyPoint(e) : openFactory(f.id)} />
            ))}

            {/* Parking markers */}
            {parkings.map(p => (
              <ParkingMarker key={`parking-${p.id}`} parking={p} onClick={(e) => polyEdit ? addPolyPoint(e) : openParking(p.id)} />
            ))}

            {/* Vehicle markers (transit + working on site) */}
            {vehicles.filter(v => v.location_type === 'transit').map(v => (
              <VehicleMarker
                key={`vehicle-${v.id}`}
                vehicle={v}
                onClick={(e) => polyEdit ? addPolyPoint(e) : openVehicle(v.id)}
              />
            ))}

            {/* Polygon editor preview */}
            {polyEdit?.points.length >= 3 && (
              <Polygon
                geometry={[polyEdit.points]}
                options={{ fillColor: '#6366f1', fillOpacity: 0.2, strokeColor: '#6366f1', strokeWidth: 2, strokeStyle: 'dash', openBalloonOnClick: false, zIndex: 50 }}
              />
            )}
            {polyEdit?.points.map((pt, i) => (
              <EditDotMarker key={`edit-pt-${i}`} point={pt} index={i} />
            ))}
          </Map>
        </YMaps>

        {/* Edit mode banner */}
        {polyEdit && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg pointer-events-none flex items-center gap-2 whitespace-nowrap">
            <span>✏️</span>
            <span>Режим редактирования полигона — кликайте на карту</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full">{polyEdit.points.length} точек</span>
          </div>
        )}

        {showLanes && <LineInformation onClose={() => setShowLanes(false)} />}

        {panel?.type === 'road' && (
          <PanelRoad
            road={panel.data}
            dark={dark}
            onClose={closePanel}
            polyEdit={polyEdit?.roadId === panel.data?.id ? polyEdit : null}
            onStartPolyEdit={() => startPolyEdit(panel.data.id)}
            onUndoPolyEdit={undoPolyEdit}
            onFinishPolyEdit={finishPolyEdit}
            onCancelPolyEdit={cancelPolyEdit}
          />
        )}

        {(panel?.type === 'parking' || panel?.type === 'factory' || panel?.type === 'fleet' || panel?.type === 'vehicle') && (
          <PanelVehicle panel={panel} dark={dark} onClose={() => setPanel(null)} onSelectVehicle={openVehicle} onFlyToVehicle={flyToVehicle} />
        )}
      </div>
    </div>
  );
}
