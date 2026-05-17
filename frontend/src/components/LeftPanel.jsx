import { useState } from 'react';

export default function LeftPanel({ dark, onToggleDark, roads, parkings, onSelectRoad, onSelectParking }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username) {
      setIsLoggedIn(true);
      setShowLogin(false);
      setLoginData({ username: '', password: '' });
    }
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
            <button
              onClick={() => setShowLogin(s => !s)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm transition-colors text-left"
            >
              <span className="text-base">🔐</span>
              <span>Войти</span>
            </button>

            {showLogin && (
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
          </>
        )}
      </div>

      {/* Scrollable lists */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Road sections */}
        <div className="px-4 pt-2 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Участки дороги
          </p>
          <div className="flex flex-col gap-1">
            {roads.length === 0 && (
              <p className="text-xs text-slate-500 px-1">Загрузка...</p>
            )}
            {roads.map(road => (
              <button
                key={road.id}
                onClick={() => onSelectRoad(road.id)}
                className="text-left px-3 py-2 rounded-lg bg-slate-700 hover:bg-orange-600 text-sm transition-colors w-full flex items-center gap-2"
              >
                <span>🛣️</span>
                <span className="truncate">{road.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-4 border-t border-slate-700 my-1" />

        {/* Parkings */}
        <div className="px-4 pt-3 pb-4">
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
      </div>
    </div>
  );
}
