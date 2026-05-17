import { useState, useEffect } from 'react';
import { YMaps, Map, Placemark, Polygon } from '@pbe/react-yandex-maps';
import axios from 'axios';
import LeftPanel from './components/LeftPanel.jsx';
import PanelRoad from './components/PanelRoad.jsx';
import PanelVehicle from './components/PanelVehicle.jsx';

const API = 'http://localhost:8000/api';

const MAP_CENTER = [57.0, 35.5];
const MAP_ZOOM = 7;

export default function MapPage() {
  const [dark, setDark] = useState(false);
  const [roads, setRoads] = useState([]);
  const [factories, setFactories] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [panel, setPanel] = useState(null); // { type: 'road'|'parking'|'vehicle', data }

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

  const openRoad = async (id) => {
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
      />

      <div className="flex-1 relative">
        <YMaps query={{ lang: 'ru_RU', load: 'package.full' }}>
          <Map
            defaultState={{ center: MAP_CENTER, zoom: MAP_ZOOM }}
            style={{ width: '100%', height: '100%' }}
            options={{ suppressMapOpenBlock: true }}
          >
            {/* Road polygons */}
            {roads.map(r => (
              <Polygon
                key={`road-${r.id}`}
                geometry={[r.polygon]}
                options={{
                  fillColor: '#f97316',
                  strokeColor: '#c2410c',
                  fillOpacity: 0.55,
                  strokeWidth: 2,
                  openBalloonOnClick: false,
                }}
                properties={{ hintContent: r.name }}
                onClick={() => openRoad(r.id)}
              />
            ))}

            {/* Factory placemarks with icon + label + vehicle count */}
            {factories.map(f => (
              <Placemark
                key={`factory-${f.id}`}
                geometry={f.coords}
                properties={{
                  iconContent: f.vehicle_count > 0 ? String(f.vehicle_count) : '🏭',
                  iconCaption: f.name,
                  hintContent: `${f.name} — ${f.capacity_tons_day} т/сут`,
                }}
                options={{
                  preset: f.vehicle_count > 0
                    ? 'islands#darkGreenCircleIcon'
                    : 'islands#darkGreenDotIconWithCaption',
                  openBalloonOnClick: false,
                  iconColor: '#15803d',
                }}
              />
            ))}

            {/* Parking placemarks with icon + label + vehicle count */}
            {parkings.map(p => (
              <Placemark
                key={`parking-${p.id}`}
                geometry={p.coords}
                properties={{
                  iconContent: p.vehicle_count > 0 ? String(p.vehicle_count) : 'P',
                  iconCaption: p.name,
                  hintContent: `${p.name} — ${p.vehicle_count} ед. техники`,
                }}
                options={{
                  preset: 'islands#blueCircleIcon',
                  openBalloonOnClick: false,
                  iconColor: '#1d4ed8',
                }}
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

        {(panel?.type === 'parking' || panel?.type === 'vehicle') && (
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
