import { Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu';
import Principal from './pages/Principal';
import ListaUsuarios from './pages/ListaUsuarios';
import NovoUsuario from './pages/NovoUsuario';
import EditarUsuario from './pages/EditarUsuario';

// Rotas do site: cada endereço mostra uma tela
export default function App() {
  return (
    <>
      <Menu />
      <div className="container">
        <Routes>
          {/* Página inicial */}
          <Route path="/" element={<Principal />} />
          {/* Usuários: lista, novo e editar */}
          <Route path="/usuarios" element={<ListaUsuarios />} />
          <Route path="/usuarios/novo" element={<NovoUsuario />} />
          <Route path="/usuarios/editar/:id" element={<EditarUsuario />} />
          {/* Endereço antigo de produtos: leva para usuários */}
          <Route path="/produtos/*" element={<Navigate to="/usuarios" replace />} />
        </Routes>
      </div>
    </>
  );
}
