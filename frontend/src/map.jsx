import { useState, useEffect, useMemo, useRef } from 'react';
import { YMaps, Map, Placemark, Polygon, useYMaps } from '@pbe/react-yandex-maps';
import axios from 'axios';
import LeftPanel from './components/LeftPanel.jsx';
import PanelRoad from './components/PanelRoad.jsx';
import PanelVehicle from './components/PanelVehicle.jsx';

const API = 'http://localhost:8000/api';
const MAP_CENTER = [57.0, 35.5];
const MAP_ZOOM = 7;

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
    const bg = isActive ? 'rgba(234,88,12,0.95)' : 'rgba(249,115,22,0.88)';
    const border = isActive ? '#7c2d12' : '#c2410c';
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
      options={{
        iconLayout: layout,
        iconShape: { type: 'Rectangle', coordinates: [[-70, -65], [70, 8]] },
        openBalloonOnClick: false,
      }}
      properties={{ hintContent: `${factory.name} — ${factory.capacity_tons_day} т/сут` }}
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
      options={{
        iconLayout: layout,
        iconShape: { type: 'Rectangle', coordinates: [[-70, -65], [70, 8]] },
        openBalloonOnClick: false,
      }}
      properties={{ hintContent: `${parking.name} — ${parking.vehicle_count} ед. техники` }}
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

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/roads`),
      axios.get(`${API}/factories`),
      axios.get(`${API}/parkings`),
    ]).then(([r, f, p]) => {
      setRoads(r.data);
      setFactories(f.data);
      setParkings(p.data);
    }).catch(console.error);
  }, []);

  const flyToRoad = (id) => {
    const road = roads.find(r => r.id === id);
    if (road && mapRef.current) {
      mapRef.current.setCenter(road.coords, 14, { duration: 600, checkZoomRange: true });
    }
  };

  const openRoad = async (id) => {
    flyToRoad(id);
    const { data } = await axios.get(`${API}/roads/${id}`);
    setPanel({ type: 'road', data });
  };

  const openParking = async (id) => {
    const { data } = await axios.get(`${API}/parkings/${id}`);
    setPanel({ type: 'parking', data });
  };

  const openVehicle = async (id) => {
    const { data } = await axios.get(`${API}/vehicles/${id}`);
    setPanel({ type: 'vehicle', data });
  };

  const openFactory = async (id) => {
    const { data } = await axios.get(`${API}/factories/${id}`);
    setPanel({ type: 'factory', data });
  };

  const openVehicleType = async (type, typeName, typeIcon) => {
    const { data } = await axios.get(`${API}/vehicles`, { params: { type } });
    setPanel({ type: 'fleet', data: { vehicles: data, typeName, typeIcon } });
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={dark ? { filter: 'invert(1) hue-rotate(180deg)' } : {}}
    >
      <LeftPanel
        dark={dark}
        onToggleDark={() => setDark(d => !d)}
        roads={roads}
        parkings={parkings}
        onSelectRoad={openRoad}
        onSelectParking={openParking}
        onSelectVehicleType={openVehicleType}
        activeRoadId={panel?.type === 'road' ? panel.data?.id : null}
      />

      <div className="flex-1 relative">
        <YMaps query={{ lang: 'ru_RU', load: 'package.full' }}>
          <Map
            defaultState={{ center: MAP_CENTER, zoom: MAP_ZOOM }}
            style={{ width: '100%', height: '100%' }}
            options={{ suppressMapOpenBlock: true }}
            instanceRef={mapRef}
          >
            {/* Road polygons + label markers */}
            {roads.map(r => {
              const isActive = panel?.type === 'road' && panel.data?.id === r.id;
              return [
                <Polygon
                  key={`road-poly-${r.id}`}
                  geometry={[r.polygon]}
                  options={{
                    fillColor: isActive ? '#ea580c' : '#f97316',
                    strokeColor: isActive ? '#7c2d12' : '#c2410c',
                    fillOpacity: isActive ? 0.85 : 0.55,
                    strokeWidth: isActive ? 4 : 2,
                    openBalloonOnClick: false,
                    zIndex: isActive ? 10 : 1,
                  }}
                  properties={{ hintContent: r.name }}
                  onClick={() => openRoad(r.id)}
                />,
                <RoadLabel
                  key={`road-label-${r.id}`}
                  road={r}
                  isActive={isActive}
                  onClick={() => openRoad(r.id)}
                />,
              ];
            })}

            {/* Factory markers — emoji icon + label + optional vehicle count badge */}
            {factories.map(f => (
              <FactoryMarker key={`factory-${f.id}`} factory={f} onClick={() => openFactory(f.id)} />
            ))}

            {/* Parking markers — emoji icon + label + vehicle count badge */}
            {parkings.map(p => (
              <ParkingMarker
                key={`parking-${p.id}`}
                parking={p}
                onClick={() => openParking(p.id)}
              />
            ))}
          </Map>
        </YMaps>

        {panel?.type === 'road' && (
          <PanelRoad
            road={panel.data}
            dark={dark}
            onClose={() => setPanel(null)}
          />
        )}

        {(panel?.type === 'parking' || panel?.type === 'factory' || panel?.type === 'fleet' || panel?.type === 'vehicle') && (
          <PanelVehicle
            panel={panel}
            dark={dark}
            onClose={() => setPanel(null)}
            onSelectVehicle={openVehicle}
          />
        )}
      </div>
    </div>
  );
}
