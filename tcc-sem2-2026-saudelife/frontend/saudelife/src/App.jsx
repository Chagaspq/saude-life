import { Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Principal from './pages/Principal';
import ListaProdutos from './pages/ListaProdutos';
import NovoProduto from './pages/NovoProduto';
import EditarProduto from './pages/EditarProduto';
import ListaUsuarios from './pages/ListaUsuarios';
import NovoUsuario from './pages/NovoUsuario';
import EditarUsuario from './pages/EditarUsuario';

export default function App() {
  return (
    <>
      <Menu />
      <div className="container">
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/produtos" element={<ListaProdutos />} />
          <Route path="/produtos/novo" element={<NovoProduto />} />
          <Route path="/produtos/editar/:id" element={<EditarProduto />} />
          <Route path="/usuarios" element={<ListaUsuarios />} />
          <Route path="/usuarios/novo" element={<NovoUsuario />} />
          <Route path="/usuarios/editar/:id" element={<EditarUsuario />} />
        </Routes>
      </div>
    </>
  );
}
