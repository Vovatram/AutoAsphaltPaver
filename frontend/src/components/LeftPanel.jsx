import { useState } from 'react';

const VEHICLE_FLEET = [
  { type: 'dump_truck',       icon: '🚛', label: 'Автомобили-самосвалы' },
  { type: 'transfer_machine', icon: '🏗️', label: 'Перегружатель смеси' },
  { type: 'paver',            icon: '🚜', label: 'Асфальтоукладчик (гусеничный)' },
  { type: 'roller',           icon: '🛞', label: 'Каток гладковальцовый' },
  { type: 'closure_vehicle',  icon: '🚧', label: 'Спецавтомобиль перекрытия дороги' },
];

export default function LeftPanel({ dark, onToggleDark, roads, parkings, factories, onSelectRoad, onSelectParking, onSelectFactory, onSelectVehicleType, onShowLanes, vehicleCounts = {}, activeRoadId }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState(null); // null | 'login' | 'register'
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [regData, setRegData] = useState({ username: '', email: '', password: '', confirm: '' });
  const [regError, setRegError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username) {
      setIsLoggedIn(true);
      setMode(null);
      setLoginData({ username: '', password: '' });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirm) {
      setRegError('Пароли не совпадают');
      return;
    }
    if (!regData.username || !regData.email) {
      setRegError('Заполните все поля');
      return;
    }
    setIsLoggedIn(true);
    setMode(null);
    setRegData({ username: '', email: '', password: '', confirm: '' });
    setRegError('');
  };

  return (
    <div className="w-72 h-full bg-slate-800 text-white flex flex-col overflow-hidden shrink-0 border-r border-slate-700">
      {/* Title */}
      <div className="px-4 py-4 border-b border-slate-700">
        <h1 className="text-sm font-bold text-white">AutoAsphaltPaver</h1>
        <p className="text-xs text-slate-400 mt-0.5">Управление асфальтоукладкой</p>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-b border-slate-700 flex flex-col gap-2">
        <button
          onClick={onToggleDark}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors text-left"
        >
          <span className="text-base">{dark ? '☀️' : '🌙'}</span>
          <span>{dark ? 'Светлая тема' : 'Тёмная тема'}</span>
        </button>

        {isLoggedIn ? (
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors text-left"
          >
            <span className="text-base">👤</span>
            <span>Выйти из аккаунта</span>
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setMode(mode === 'login' ? null : 'login')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm transition-colors"
              >
                <span>🔐</span>
                <span>Войти</span>
              </button>
              <button
                onClick={() => setMode(mode === 'register' ? null : 'register')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm transition-colors"
              >
                <span>📝</span>
                <span>Регистрация</span>
              </button>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Логин"
                  value={loginData.username}
                  onChange={e => setLoginData(d => ({ ...d, username: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm border border-slate-600 focus:outline-none focus:border-blue-400 placeholder-slate-500"
                />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={loginData.password}
                  onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm border border-slate-600 focus:outline-none focus:border-blue-400 placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm transition-colors font-medium"
                >
                  Войти
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Логин"
                  value={regData.username}
                  onChange={e => setRegData(d => ({ ...d, username: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm border border-slate-600 focus:outline-none focus:border-emerald-400 placeholder-slate-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={regData.email}
                  onChange={e => setRegData(d => ({ ...d, email: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm border border-slate-600 focus:outline-none focus:border-emerald-400 placeholder-slate-500"
                />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={regData.password}
                  onChange={e => setRegData(d => ({ ...d, password: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm border border-slate-600 focus:outline-none focus:border-emerald-400 placeholder-slate-500"
                />
                <input
                  type="password"
                  placeholder="Повторите пароль"
                  value={regData.confirm}
                  onChange={e => setRegData(d => ({ ...d, confirm: e.target.value }))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm border border-slate-600 focus:outline-none focus:border-emerald-400 placeholder-slate-500"
                />
                {regError && <p className="text-xs text-red-400">{regError}</p>}
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm transition-colors font-medium"
                >
                  Зарегистрироваться
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Scrollable lists */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Road sections */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Участки дороги
            </p>
            <button
              onClick={onShowLanes}
              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              <span>📋</span>
              <span>Все полосы</span>
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {roads.length === 0 && (
              <p className="text-xs text-slate-500 px-1">Загрузка...</p>
            )}
            {roads.map(road => (
              <button
                key={road.id}
                onClick={() => onSelectRoad(road.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors w-full flex items-center gap-2 ${
                  activeRoadId === road.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 hover:bg-orange-600'
                }`}
              >
                <span>🛣️</span>
                <span className="truncate">{road.name}</span>
                {activeRoadId === road.id && (
                  <span className="ml-auto shrink-0 text-xs bg-white/20 px-1.5 py-0.5 rounded">●</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-4 border-t border-slate-700 my-1" />

        {/* Parkings */}
        <div className="px-4 pt-3 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Стоянки техники
          </p>
          <div className="flex flex-col gap-1">
            {parkings.length === 0 && (
              <p className="text-xs text-slate-500 px-1">Загрузка...</p>
            )}
            {parkings.map(parking => (
              <button
                key={parking.id}
                onClick={() => onSelectParking(parking.id)}
                className="text-left px-3 py-2 rounded-lg bg-slate-700 hover:bg-blue-700 text-sm transition-colors w-full flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span>🅿️</span>
                  <span className="truncate">{parking.name}</span>
                </span>
                <span className="text-xs text-slate-400 shrink-0 bg-slate-600 px-1.5 py-0.5 rounded">
                  {parking.vehicle_count} ед.
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-4 border-t border-slate-700 my-1" />

        {/* Vehicle fleet legend */}
        <div className="px-4 pt-3 pb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Парк техники
          </p>
          <div className="flex flex-col gap-1">
            {VEHICLE_FLEET.map(v => {
              const count = vehicleCounts[v.type] ?? 0;
              return (
                <button
                  key={v.type}
                  onClick={() => onSelectVehicleType?.(v.type, v.label, v.icon)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors w-full text-left"
                >
                  <span className="text-lg w-7 text-center shrink-0">{v.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white leading-tight truncate">{v.label}</p>
                    <p className="text-xs text-slate-400">{count} ед.</p>
                  </div>
                  <span className="text-slate-500 text-xs shrink-0">›</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between px-1 pt-2 border-t border-slate-700">
            <span className="text-xs text-slate-400">Итого в парке:</span>
            <span className="text-xs font-bold text-white bg-slate-600 px-2 py-0.5 rounded-full">
              {parkings.reduce((n, p) => n + p.vehicle_count, 0)} ед.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
