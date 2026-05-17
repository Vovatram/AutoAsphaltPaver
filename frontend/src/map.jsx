import { useState, useEffect } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import axios from 'axios';
import LeftPanel from './components/LeftPanel.jsx';
import PanelRoad from './components/PanelRoad.jsx';
import PanelVehicle from './components/PanelVehicle.jsx';

const API = 'http://localhost:8000/api';

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
            defaultState={{ center: [55.751, 37.618], zoom: 12 }}
            style={{ width: '100%', height: '100%' }}
            options={{ suppressMapOpenBlock: true }}
          >
            {roads.map(r => (
              <Placemark
                key={`road-${r.id}`}
                geometry={r.coords}
                properties={{ iconContent: r.name.split(',')[0] }}
                options={{ preset: 'islands#orangeStretchyIcon', openBalloonOnClick: false }}
                onClick={() => openRoad(r.id)}
              />
            ))}

            {factories.map(f => (
              <Placemark
                key={`factory-${f.id}`}
                geometry={f.coords}
                properties={{ iconContent: f.name }}
                options={{ preset: 'islands#darkGreenStretchyIcon', openBalloonOnClick: false }}
              />
            ))}

            {parkings.map(p => (
              <Placemark
                key={`parking-${p.id}`}
                geometry={p.coords}
                properties={{ iconContent: p.name }}
                options={{ preset: 'islands#blueStretchyIcon', openBalloonOnClick: false }}
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
