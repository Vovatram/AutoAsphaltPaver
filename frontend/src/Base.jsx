import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPage from './map.jsx';

function Base() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Base;
