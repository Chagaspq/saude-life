// Calculadoras: IMC, calorias do dia, água e carga máxima (1RM).
import { useState } from "react";
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import { num } from "../lib/formato.js";
import "../estilos/kit-publico.js";
import "../estilos/paginas.css";

// Contas de cada calculadora: recebem os campos e devolvem [valor, explicação]
const CONTAS = {
  // IMC = peso / altura²
  imc: (c) => {
    // Conta
    const imc = c.peso / (c.altura / 100) ** 2;
    // Faixa
    const faixa = imc < 18.5 ? "abaixo do peso" : imc < 25 ? "peso adequado" : imc < 30 ? "sobrepeso" : "obesidade";
    // Resultado
    return [num(imc, 1), `Faixa: ${faixa}. O IMC não separa músculo de gordura.`];
  },
  // Calorias (Mifflin-St Jeor × atividade)
  calorias: (c) => {
    // Gasto parado
    const basal = 10 * c.peso + 6.25 * c.altura - 5 * c.idade + (c.sexo === "m" ? 5 : -161);
    // Gasto do dia
    const dia = basal * Number(c.atividade);
    // Resultado
    return [`${num(dia)} kcal`, `Para emagrecer: cerca de ${num(dia - 400)} kcal. Para ganhar massa: cerca de ${num(dia + 300)} kcal.`];
  },
  // Água: 35 ml por kg + 500 ml a cada 30 min de treino
  agua: (c) => {
    // Litros
    const litros = (c.peso * 35 + Math.ceil((c.treino || 0) / 30) * 500) / 1000;
    // Resultado
    return [`${num(litros, 1)} litros`, `Mais ou menos ${Math.round((litros * 1000) / 250)} copos de 250 ml ao longo do dia.`];
  },
  // 1RM (fórmula de Epley)
  rm: (c) => {
    // Carga máxima
    const rm = c.carga * (1 + c.reps / 30);
    // Resultado
    return [`${num(rm, 1)} kg`, `Para ganhar massa, treine com ${num(rm * 0.7)} a ${num(rm * 0.8)} kg (70% a 80%).`];
  },
};

// Cartão de uma calculadora (o formulário usa os campos nativos do navegador)
function Calculadora({ tipo, titulo, children }) {
  // Resultado [valor, texto]
  const [res, setRes] = useState(null);
  // Cartão
  return (
    <form
      className="calc-card"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Junta os campos (números viram número)
        const campos = {};
        // Um por um
        new FormData(e.currentTarget).forEach((v, k) => (campos[k] = isNaN(Number(v)) || v === "" ? v : Number(v)));
        // Calcula
        setRes(CONTAS[tipo](campos));
      }}
    >
      {/* Título */}
      <h2>{titulo}</h2>
      {/* Campos */}
      {children}
      {/* Botão */}
      <button type="submit" className="btn-hero-primary">
        Calcular
      </button>
      {/* Resultado */}
      <output className="calc-resultado" aria-live="polite">
        {res && (
          <>
            <strong>{res[0]}</strong>
            {res[1]}
          </>
        )}
      </output>
    </form>
  );
}

// Campos que se repetem
const Peso = () => (
  <label>
    Peso (kg) <input type="number" name="peso" min="30" max="300" step="0.1" required />
  </label>
);
// Altura
const Altura = () => (
  <label>
    Altura (cm) <input type="number" name="altura" min="120" max="230" required />
  </label>
);

// Página
function Calculadoras() {
  // Página
  return (
    <PublicLayout>
      {/* Topo */}
      <section className="plans-hero">
        <p className="hero-kicker">Calculadoras</p>
        <h1>Faça as contas em segundos</h1>
        <p className="plans-hero-lead">IMC, calorias do dia, água e carga máxima (1RM). Resultados são estimativas: um profissional ajusta para você.</p>
      </section>
      {/* Grade */}
      <div className="pg-largura calc-grade">
        {/* IMC */}
        <Calculadora tipo="imc" titulo="IMC">
          <Peso />
          <Altura />
        </Calculadora>
        {/* Calorias */}
        <Calculadora tipo="calorias" titulo="Calorias do dia">
          <label>
            Sexo
            <select name="sexo">
              <option value="f">Feminino</option>
              <option value="m">Masculino</option>
            </select>
          </label>
          <label>
            Idade <input type="number" name="idade" min="13" max="100" required />
          </label>
          <Peso />
          <Altura />
          <label>
            Atividade
            <select name="atividade" defaultValue="1.55">
              <option value="1.2">Parado (sem exercício)</option>
              <option value="1.375">Leve (1 a 3 treinos por semana)</option>
              <option value="1.55">Moderada (3 a 5 treinos)</option>
              <option value="1.725">Alta (6 a 7 treinos)</option>
            </select>
          </label>
        </Calculadora>
        {/* Água */}
        <Calculadora tipo="agua" titulo="Água">
          <Peso />
          <label>
            Minutos de treino hoje <input type="number" name="treino" min="0" max="300" defaultValue="0" />
          </label>
        </Calculadora>
        {/* 1RM */}
        <Calculadora tipo="rm" titulo="Carga máxima (1RM)">
          <label>
            Carga usada (kg) <input type="number" name="carga" min="1" max="500" step="0.5" required />
          </label>
          <label>
            Repetições feitas <input type="number" name="reps" min="1" max="12" required />
          </label>
        </Calculadora>
      </div>
      {/* Aviso */}
      <p className="pg-largura calc-aviso">Estimativas educativas. Não substituem a avaliação de um profissional de saúde.</p>
    </PublicLayout>
  );
}

// Desenha
montar(Calculadoras);
