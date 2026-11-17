// Janela modal genérica: recebe a mensagem e os botões a exibir.
export default function Modal({ mensagem, children }) {
  return (
    <div className="modal-fundo">
      <div className="modal-caixa" role="dialog" aria-modal="true">
        <p className="modal-mensagem">{mensagem}</p>
        <div className="modal-botoes">{children}</div>
      </div>
    </div>
  );
}
