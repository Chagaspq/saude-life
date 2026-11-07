// Configuração do site.
// Endereço da API (servidor em Java). Vazio = o site salva tudo só no navegador (modo demonstração).
// Depois de publicar a API no Render, coloque o endereço aqui (ou no arquivo .env.production) e rode "npm run build".
export const API_URL = import.meta.env.VITE_API_URL || "";
