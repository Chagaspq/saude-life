document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.querySelector(".modal-body");

  function openModal(title, htmlContent) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = htmlContent;
    if (modalOverlay) modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.add("hidden");
  }

  document.querySelectorAll('[data-action="close-modal"]').forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener("click", (e) => {
    const action = e.target.getAttribute("data-action");
    if (action === "open-settings") {
      e.preventDefault();
      openModal(
        "Configurações",
        "<p>Opções de configuração da conta e preferências do sistema.</p>",
      );
    } else if (action === "logout") {
      e.preventDefault();
    } else if (action === "open-workout-modal") {
      openModal(
        "Detalhes do Treino",
        "<p>Visualização completa dos exercícios, cargas, séries e intervalos programados.</p>",
      );
    } else if (action === "create-workout") {
      openModal(
        "Criar Novo Treino",
        '<form style="display:flex; flex-direction:column; gap:12px;"><div class="form-group"><label>Nome do Treino</label><input type="text" placeholder="Ex: Membros Superiores B"></div><button type="submit" class="btn-primary">Salvar Treino</button></form>',
      );
    } else if (action === "edit-profile") {
      openModal(
        "Editar Perfil",
        '<form style="display:flex; flex-direction:column; gap:12px;"><div class="form-group"><label>Nome</label><input type="text" value="Biel Silva"></div><div class="form-group"><label>Bio</label><input type="text" value="Foco em hipertrofia e consistência diária. 🚀"></div><button type="submit" class="btn-primary">Salvar Alterações</button></form>',
      );
    }
  });

  const globalSearch = document.getElementById("global-search");
  const searchDropdown = document.getElementById("search-results-dropdown");
  if (globalSearch && searchDropdown) {
    globalSearch.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (val.length > 0) {
        searchDropdown.innerHTML = `<div style="padding: 10px; color: #a1a1aa; font-size: 0.85rem;">Buscando por "${val}"...</div>`;
        searchDropdown.classList.remove("hidden");
      } else {
        searchDropdown.classList.add("hidden");
      }
    });
  }
});
