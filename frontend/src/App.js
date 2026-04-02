import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './component/Home/Home';
import AfterLoginHome from './component/Home/AfterLoginHome';
import Register from './component/Register/Register';
import Login from './component/Login/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/after-login" element={<AfterLoginHome />} />
      {/* User Management */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
