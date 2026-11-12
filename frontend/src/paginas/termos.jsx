// Termos de Uso.
import PublicLayout from "../componentes/PublicLayout.jsx";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssSite from "../estilos/site.css?inline";
import cssLegal from "../estilos/legal.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssSite, cssLegal];

// Página
function Termos() {
  // Conteúdo fixo (veio do HTML antigo)
  return (
    <PublicLayout atual="termos" classe="auth-container" topo>

      {/* Topo do cartão: logo, título e subtítulo */}
      <header className="auth-header">
        {/* Título principal da página */}
        <h1>Termos de Uso</h1>
        {/* Texto de apoio abaixo do título */}
        <p className="auth-subtitle">Última atualização: 12 de setembro de 2026</p>
      </header>

      {/* Índice: links que pulam para cada seção */}
      <nav className="toc" aria-labelledby="toc-title">
        {/* Título da seção */}
        <h2 id="toc-title">Nesta página</h2>
        {/* Lista de itens */}
        <ol>
            {/* Link que pula para a seção "sobre-a-saude-life" desta mesma página */}
            <li><a href="#sobre-a-saude-life">1. Sobre a Saúde Life</a></li>
            {/* Link que pula para a seção "cadastro-e-conta" desta mesma página */}
            <li><a href="#cadastro-e-conta">2. Cadastro e conta</a></li>
            {/* Link que pula para a seção "uso-da-plataforma" desta mesma página */}
            <li><a href="#uso-da-plataforma">3. Uso da plataforma</a></li>
            {/* Link que pula para a seção "treinos-e-informacoes-de-saude" desta mesma página */}
            <li><a href="#treinos-e-informacoes-de-saude">4. Treinos e informações de saúde</a></li>
            {/* Link que pula para a seção "conteudo-publicado-pelos-usuarios" desta mesma página */}
            <li><a href="#conteudo-publicado-pelos-usuarios">5. Conteúdo publicado pelos usuários</a></li>
            {/* Link que pula para a seção "profissionais-e-academias" desta mesma página */}
            <li><a href="#profissionais-e-academias">6. Profissionais e academias</a></li>
            {/* Link que pula para a seção "planos-e-servicos-pagos" desta mesma página */}
            <li><a href="#planos-e-servicos-pagos">7. Planos e serviços pagos</a></li>
            {/* Link que pula para a seção "propriedade-intelectual" desta mesma página */}
            <li><a href="#propriedade-intelectual">8. Propriedade intelectual</a></li>
            {/* Link que pula para a seção "disponibilidade-do-servico" desta mesma página */}
            <li><a href="#disponibilidade-do-servico">9. Disponibilidade do serviço</a></li>
            {/* Link que pula para a seção "limitacao-de-responsabilidade" desta mesma página */}
            <li><a href="#limitacao-de-responsabilidade">10. Limitação de responsabilidade</a></li>
            {/* Link que pula para a seção "privacidade" desta mesma página */}
            <li><a href="#privacidade">11. Privacidade</a></li>
            {/* Link que pula para a seção "alteracoes-destes-termos" desta mesma página */}
            <li><a href="#alteracoes-destes-termos">12. Alterações destes Termos</a></li>
            {/* Link que pula para a seção "encerramento-da-conta" desta mesma página */}
            <li><a href="#encerramento-da-conta">13. Encerramento da conta</a></li>
            {/* Link que pula para a seção "legislacao-aplicavel" desta mesma página */}
            <li><a href="#legislacao-aplicavel">14. Legislação aplicável</a></li>
            {/* Link que pula para a seção "contato" desta mesma página */}
            <li><a href="#contato">15. Contato</a></li>
        </ol>
      </nav>

      {/* Texto do documento */}
      <div className="terms-content">
        {/* Parágrafo de texto */}
        <p>Bem-vindo à Saúde Life.</p>
        {/* Parágrafo de texto */}
        <p>
          Estes Termos de Uso estabelecem as regras para utilização da
          plataforma Saúde Life, incluindo o site, aplicativos, serviços,
          conteúdos, ferramentas, funcionalidades e demais recursos
          disponibilizados pela plataforma.
        </p>
        {/* Parágrafo de texto */}
        <p>
          Ao criar uma conta, acessar ou utilizar a Saúde Life, você declara que
          leu, compreendeu e concorda com estes Termos de Uso e com a Política
          de Privacidade.
        </p>

        {/* Seção "sobre-a-saude-life" (o id deixa os links do índice pularem para cá) */}
        <section id="sobre-a-saude-life">
          {/* Título da seção */}
          <h2>1. Sobre a Saúde Life</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life é uma plataforma digital voltada para fitness,
            atividade física, acompanhamento de evolução, conteúdos relacionados
            a treinamento, profissionais e academias.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A plataforma tem como objetivo facilitar o acesso a informações,
            ferramentas e experiências relacionadas à atividade física e ao
            bem-estar.
          </p>
        </section>

        {/* Seção "cadastro-e-conta" (o id deixa os links do índice pularem para cá) */}
        <section id="cadastro-e-conta">
          {/* Título da seção */}
          <h2>2. Cadastro e conta</h2>
          {/* Parágrafo de texto */}
          <p>
            Para utilizar determinadas funcionalidades, o usuário poderá
            precisar criar uma conta.
          </p>
          {/* Parágrafo de texto */}
          <p>Ao realizar o cadastro, o usuário se compromete a:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>fornecer informações verdadeiras, atualizadas e completas;</li>
            {/* Item da lista */}
            <li>manter seus dados de acesso em segurança;</li>
            <li>
              não compartilhar sua senha ou permitir que terceiros utilizem sua
              conta;
            </li>
            <li>
              informar a Saúde Life caso identifique acesso não autorizado à sua
              conta.
            </li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Cada usuário é responsável pelas atividades realizadas por meio de
            sua conta.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá restringir, suspender ou encerrar contas que
            violem estes Termos de Uso ou apresentem comportamento inadequado na
            plataforma.
          </p>
        </section>

        {/* Seção "uso-da-plataforma" (o id deixa os links do índice pularem para cá) */}
        <section id="uso-da-plataforma">
          {/* Título da seção */}
          <h2>3. Uso da plataforma</h2>
          {/* Parágrafo de texto */}
          <p>
            O usuário concorda em utilizar a Saúde Life de maneira legal,
            responsável e respeitosa.
          </p>
          {/* Parágrafo de texto */}
          <p>É proibido:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>utilizar a plataforma para atividades ilegais;</li>
            <li>
              tentar acessar contas, sistemas ou dados de outros usuários sem
              autorização;
            </li>
            <li>
              distribuir vírus, códigos maliciosos ou qualquer conteúdo
              destinado a prejudicar a plataforma;
            </li>
            <li>
              utilizar mecanismos automatizados para copiar ou coletar dados da
              plataforma sem autorização;
            </li>
            <li>
              publicar conteúdo ofensivo, discriminatório, ameaçador ou ilegal;
            </li>
            <li>
              utilizar a plataforma para enganar, fraudar ou prejudicar outros
              usuários.
            </li>
          </ul>
        </section>

        {/* Seção "treinos-e-informacoes-de-saude" (o id deixa os links do índice pularem para cá) */}
        <section id="treinos-e-informacoes-de-saude">
          {/* Título da seção */}
          <h2>4. Treinos e informações de saúde</h2>
          {/* Parágrafo de texto */}
          <p>
            Os conteúdos, treinos, sugestões, recomendações e informações
            disponibilizados pela Saúde Life têm caráter informativo e de apoio.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A plataforma não substitui avaliação, diagnóstico, tratamento ou
            acompanhamento realizado por médicos, nutricionistas, educadores
            físicos ou outros profissionais habilitados.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Antes de iniciar um programa de exercícios ou realizar mudanças
            significativas em sua rotina de alimentação ou atividade física, o
            usuário deve procurar orientação de um profissional qualificado
            quando necessário.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life não garante que determinado treino, exercício, plano ou
            recomendação seja adequado para todas as pessoas.
          </p>
          {/* Parágrafo de texto */}
          <p>
            O usuário é responsável por respeitar seus próprios limites físicos
            e interromper uma atividade caso apresente dor, mal-estar ou
            qualquer sinal de risco.
          </p>
        </section>

        {/* Seção "conteudo-publicado-pelos-usuarios" (o id deixa os links do índice pularem para cá) */}
        <section id="conteudo-publicado-pelos-usuarios">
          {/* Título da seção */}
          <h2>5. Conteúdo publicado pelos usuários</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá permitir que usuários e profissionais publiquem
            treinos, textos, imagens, vídeos, comentários e outros conteúdos.
          </p>
          {/* Parágrafo de texto */}
          <p>
            O usuário declara que possui os direitos necessários para publicar o
            conteúdo enviado à plataforma e que esse conteúdo não viola direitos
            de terceiros ou a legislação aplicável.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Ao publicar conteúdo, o usuário concede à Saúde Life uma licença
            para armazenar, exibir, reproduzir e disponibilizar esse conteúdo
            dentro da plataforma, exclusivamente para a operação e divulgação
            dos serviços da Saúde Life, respeitando a legislação aplicável.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá remover conteúdos que violem estes Termos de
            Uso, a legislação ou as regras da comunidade.
          </p>
        </section>

        {/* Seção "profissionais-e-academias" (o id deixa os links do índice pularem para cá) */}
        <section id="profissionais-e-academias">
          {/* Título da seção */}
          <h2>6. Profissionais e academias</h2>
          {/* Parágrafo de texto */}
          <p>
            A plataforma poderá disponibilizar perfis e serviços destinados a
            profissionais de educação física, personal trainers, academias e
            outros parceiros.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A presença de um profissional ou academia na plataforma não
            significa, por si só, que a Saúde Life garanta ou certifique todos
            os serviços oferecidos por esse profissional ou estabelecimento.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Os usuários devem avaliar as informações e serviços oferecidos de
            acordo com suas próprias necessidades.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Academias e profissionais são responsáveis pelas informações,
            serviços, conteúdos e orientações que disponibilizarem por meio da
            plataforma.
          </p>
        </section>

        {/* Seção "planos-e-servicos-pagos" (o id deixa os links do índice pularem para cá) */}
        <section id="planos-e-servicos-pagos">
          {/* Título da seção */}
          <h2>7. Planos e serviços pagos</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá oferecer planos gratuitos e pagos, incluindo
            planos destinados a usuários, profissionais e academias.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Quando houver cobrança, as informações sobre preço, período,
            renovação, benefícios e condições do plano serão apresentadas antes
            da contratação.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A contratação de um serviço pago estará sujeita às condições
            apresentadas no momento da compra.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Cancelamentos, reembolsos e eventuais cobranças recorrentes seguirão
            as condições apresentadas no plano contratado e a legislação
            aplicável.
          </p>
        </section>

        {/* Seção "propriedade-intelectual" (o id deixa os links do índice pularem para cá) */}
        <section id="propriedade-intelectual">
          {/* Título da seção */}
          <h2>8. Propriedade intelectual</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life e seus respectivos elementos, incluindo nome, marca,
            logotipo, design, interface, código, textos, gráficos,
            funcionalidades e demais materiais próprios, são protegidos pela
            legislação aplicável.
          </p>
          {/* Parágrafo de texto */}
          <p>
            O usuário não poderá copiar, modificar, distribuir, vender,
            reproduzir ou explorar comercialmente elementos da Saúde Life sem
            autorização prévia.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Os conteúdos publicados por usuários continuam sujeitos aos direitos
            de seus respectivos autores.
          </p>
        </section>

        {/* Seção "disponibilidade-do-servico" (o id deixa os links do índice pularem para cá) */}
        <section id="disponibilidade-do-servico">
          {/* Título da seção */}
          <h2>9. Disponibilidade do serviço</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life buscará manter a plataforma disponível e funcionando
            corretamente, mas não garante funcionamento ininterrupto.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A plataforma poderá ficar temporariamente indisponível em razão de
            manutenção, atualizações, falhas técnicas, problemas de terceiros ou
            outros eventos fora de seu controle razoável.
          </p>
        </section>

        {/* Seção "limitacao-de-responsabilidade" (o id deixa os links do índice pularem para cá) */}
        <section id="limitacao-de-responsabilidade">
          {/* Título da seção */}
          <h2>10. Limitação de responsabilidade</h2>
          {/* Parágrafo de texto */}
          <p>A Saúde Life não será responsável por danos decorrentes de:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>uso inadequado da plataforma;</li>
            {/* Item da lista */}
            <li>execução incorreta de exercícios;</li>
            <li>
              utilização de treinos ou informações sem avaliação adequada;
            </li>
            {/* Item da lista */}
            <li>informações incorretas fornecidas pelo usuário;</li>
            {/* Item da lista */}
            <li>indisponibilidade temporária do serviço;</li>
            {/* Item da lista */}
            <li>conteúdos publicados por terceiros;</li>
            {/* Item da lista */}
            <li>problemas em serviços externos utilizados pela plataforma.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Nada nestes Termos de Uso deverá ser interpretado como exclusão de
            direitos ou responsabilidades que não possam ser afastados pela
            legislação aplicável.
          </p>
        </section>

        {/* Seção "privacidade" (o id deixa os links do índice pularem para cá) */}
        <section id="privacidade">
          {/* Título da seção */}
          <h2>11. Privacidade</h2>
          {/* Parágrafo de texto */}
          <p>
            A utilização de dados pessoais pela Saúde Life será realizada de
            acordo com sua Política de Privacidade.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Política de Privacidade deverá explicar quais dados são coletados,
            como são utilizados, armazenados e protegidos, bem como os direitos
            dos usuários.
          </p>
        </section>

        {/* Seção "alteracoes-destes-termos" (o id deixa os links do índice pularem para cá) */}
        <section id="alteracoes-destes-termos">
          {/* Título da seção */}
          <h2>12. Alterações destes Termos</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá atualizar estes Termos de Uso para refletir
            mudanças na plataforma, nos serviços ou na legislação.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Quando necessário, os usuários serão informados sobre alterações
            relevantes.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A continuidade de utilização da plataforma após a publicação das
            alterações poderá representar a aceitação dos novos termos, conforme
            a legislação aplicável.
          </p>
        </section>

        {/* Seção "encerramento-da-conta" (o id deixa os links do índice pularem para cá) */}
        <section id="encerramento-da-conta">
          {/* Título da seção */}
          <h2>13. Encerramento da conta</h2>
          {/* Parágrafo de texto */}
          <p>
            O usuário poderá solicitar o encerramento de sua conta de acordo com
            os recursos disponibilizados pela plataforma.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life também poderá suspender ou encerrar contas que violem
            estes Termos de Uso, cometem abusos ou utilizem a plataforma de
            maneira inadequada.
          </p>
        </section>

        {/* Seção "legislacao-aplicavel" (o id deixa os links do índice pularem para cá) */}
        <section id="legislacao-aplicavel">
          {/* Título da seção */}
          <h2>14. Legislação aplicável</h2>
          {/* Parágrafo de texto */}
          <p>
            Estes Termos de Uso serão interpretados de acordo com a legislação
            aplicável.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Em caso de conflito, serão preservados os direitos garantidos ao
            consumidor pela legislação vigente.
          </p>
        </section>

        {/* Seção "contato" (o id deixa os links do índice pularem para cá) */}
        <section id="contato">
          {/* Título da seção */}
          <h2>15. Contato</h2>
          {/* Parágrafo de texto */}
          <p>
            Em caso de dúvidas, solicitações ou questões relacionadas a estes
            Termos de Uso, o usuário poderá entrar em contato com a Saúde Life
            pelos kanals oficiais disponibilizados na plataforma.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Ao marcar a opção “Aceito os Termos de Uso”, o usuário declara que
            leu, compreendeu e concorda com estes Termos de Uso.
          </p>
        </section>
      </div>

      {/* Rodapé do cartão */}
      <footer className="auth-footer">
        {/* Parágrafo de texto */}
        <p>
          {/* Link que leva para a tela de cadastro */}
          <Link to="/cadastro" className="btn-comecar"
            >← Voltar ao cadastro</Link
          >
        </p>
      </footer>
    
    </PublicLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Termos;
