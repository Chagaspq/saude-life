// Política de Privacidade.
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
function Politica() {
  // Conteúdo fixo (veio do HTML antigo)
  return (
    <PublicLayout atual="politica" classe="auth-container" topo>

      {/* Topo do cartão: logo, título e subtítulo */}
      <header className="auth-header">
        {/* Título principal da página */}
        <h1>Política de Privacidade</h1>
        {/* Texto de apoio abaixo do título */}
        <p className="auth-subtitle">Última atualização: 12 de setembro de 2026</p>
      </header>

      {/* Índice: links que pulam para cada seção */}
      <nav className="toc" aria-labelledby="toc-title">
        {/* Título da seção */}
        <h2 id="toc-title">Nesta página</h2>
        {/* Lista de itens */}
        <ol>
            {/* Link que pula para a seção "informacoes-que-podemos-coletar" desta mesma página */}
            <li><a href="#informacoes-que-podemos-coletar">1. Informações que podemos coletar</a></li>
            {/* Link que pula para a seção "como-utilizamos-as-informacoes" desta mesma página */}
            <li><a href="#como-utilizamos-as-informacoes">2. Como utilizamos as informações</a></li>
            {/* Link que pula para a seção "informacoes-de-saude-e-condicionamento-fisico" desta mesma página */}
            <li><a href="#informacoes-de-saude-e-condicionamento-fisico">3. Informações de saúde e condicionamento físico</a></li>
            {/* Link que pula para a seção "conteudos-publicados-pelo-usuario" desta mesma página */}
            <li><a href="#conteudos-publicados-pelo-usuario">4. Conteúdos publicados pelo usuário</a></li>
            {/* Link que pula para a seção "compartilhamento-de-informacoes" desta mesma página */}
            <li><a href="#compartilhamento-de-informacoes">5. Compartilhamento de informações</a></li>
            {/* Link que pula para a seção "dados-de-academias-e-profissionais" desta mesma página */}
            <li><a href="#dados-de-academias-e-profissionais">6. Dados de academias e profissionais</a></li>
            {/* Link que pula para a seção "cookies-e-tecnologias-semelhantes" desta mesma página */}
            <li><a href="#cookies-e-tecnologias-semelhantes">7. Cookies e tecnologias semelhantes</a></li>
            {/* Link que pula para a seção "armazenamento-e-seguranca" desta mesma página */}
            <li><a href="#armazenamento-e-seguranca">8. Armazenamento e segurança</a></li>
            {/* Link que pula para a seção "retencao-dos-dados" desta mesma página */}
            <li><a href="#retencao-dos-dados">9. Retenção dos dados</a></li>
            {/* Link que pula para a seção "direitos-do-usuario" desta mesma página */}
            <li><a href="#direitos-do-usuario">10. Direitos do usuário</a></li>
            {/* Link que pula para a seção "criancas-e-adolescentes" desta mesma página */}
            <li><a href="#criancas-e-adolescentes">11. Crianças e adolescentes</a></li>
            {/* Link que pula para a seção "servicos-de-terceiros" desta mesma página */}
            <li><a href="#servicos-de-terceiros">12. Serviços de terceiros</a></li>
            {/* Link que pula para a seção "pagamentos" desta mesma página */}
            <li><a href="#pagamentos">13. Pagamentos</a></li>
            {/* Link que pula para a seção "alteracoes-nesta-politica" desta mesma página */}
            <li><a href="#alteracoes-nesta-politica">14. Alterações nesta Política</a></li>
            {/* Link que pula para a seção "contato" desta mesma página */}
            <li><a href="#contato">15. Contato</a></li>
            {/* Link que pula para a seção "aceitacao" desta mesma página */}
            <li><a href="#aceitacao">16. Aceitação</a></li>
        </ol>
      </nav>

      {/* Texto do documento */}
      <div className="terms-content">
        {/* Parágrafo de texto */}
        <p>
          A Saúde Life valoriza a privacidade e a segurança das informações de
          seus usuários.
        </p>
        {/* Parágrafo de texto */}
        <p>
          Esta Política de Privacidade explica quais informações podem ser
          coletadas durante a utilização da plataforma, como elas podem ser
          utilizadas, armazenadas e protegidas, além dos direitos dos usuários
          relacionados aos seus dados pessoais.
        </p>
        {/* Parágrafo de texto */}
        <p>
          Ao utilizar a Saúde Life, o usuário declara estar ciente das práticas
          descritas nesta Política de Privacidade.
        </p>

        {/* Seção "informacoes-que-podemos-coletar" (o id deixa os links do índice pularem para cá) */}
        <section id="informacoes-que-podemos-coletar">
          {/* Título da seção */}
          <h2>1. Informações que podemos coletar</h2>
          {/* Parágrafo de texto */}
          <p>
            Dependendo das funcionalidades utilizadas, a Saúde Life poderá
            coletar informações fornecidas diretamente pelo usuário, incluindo:
          </p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>nome;</li>
            {/* Item da lista */}
            <li>endereço de e-mail;</li>
            {/* Item da lista */}
            <li>data de nascimento;</li>
            {/* Item da lista */}
            <li>informações de perfil;</li>
            {/* Item da lista */}
            <li>foto de perfil;</li>
            {/* Item da lista */}
            <li>altura e peso;</li>
            {/* Item da lista */}
            <li>objetivo fitness;</li>
            {/* Item da lista */}
            <li>nível de experiência;</li>
            {/* Item da lista */}
            <li>frequência de treinamento;</li>
            {/* Item da lista */}
            <li>preferências de treino;</li>
            {/* Item da lista */}
            <li>informações relacionadas à evolução física;</li>
            {/* Item da lista */}
            <li>conteúdos publicados pelo usuário;</li>
            {/* Item da lista */}
            <li>informações relacionadas aos treinos realizados;</li>
            {/* Item da lista */}
            <li>informações de contato fornecidas voluntariamente.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Também poderão ser coletadas informações relacionadas à utilização
            da plataforma, como páginas acessadas, funcionalidades utilizadas,
            interações e informações técnicas necessárias para o funcionamento
            do serviço.
          </p>
        </section>

        {/* Seção "como-utilizamos-as-informacoes" (o id deixa os links do índice pularem para cá) */}
        <section id="como-utilizamos-as-informacoes">
          {/* Título da seção */}
          <h2>2. Como utilizamos as informações</h2>
          {/* Parágrafo de texto */}
          <p>As informações poderão ser utilizadas para:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>criar e administrar a conta do usuário;</li>
            {/* Item da lista */}
            <li>personalizar a experiência na plataforma;</li>
            {/* Item da lista */}
            <li>recomendar treinos, conteúdos e profissionais;</li>
            {/* Item da lista */}
            <li>permitir a criação e acompanhamento de treinos;</li>
            {/* Item da lista */}
            <li>registrar evolução e metas;</li>
            <li>
              permitir interações entre usuários, profissionais e academias;
            </li>
            {/* Item da lista */}
            <li>melhorar a plataforma e seus recursos;</li>
            {/* Item da lista */}
            <li>enviar comunicações relacionadas aos serviços;</li>
            {/* Item da lista */}
            <li>oferecer planos e funcionalidades personalizadas;</li>
            {/* Item da lista */}
            <li>prevenir fraudes, abusos e acessos não autorizados;</li>
            {/* Item da lista */}
            <li>cumprir obrigações legais e regulatórias.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life buscará utilizar apenas as informações necessárias para
            as finalidades apresentadas.
          </p>
        </section>

        {/* Seção "informacoes-de-saude-e-condicionamento-fisico" (o id deixa os links do índice pularem para cá) */}
        <section id="informacoes-de-saude-e-condicionamento-fisico">
          {/* Título da seção */}
          <h2>3. Informações de saúde e condicionamento físico</h2>
          {/* Parágrafo de texto */}
          <p>
            Algumas funcionalidades da Saúde Life poderão envolver informações
            relacionadas ao corpo, treinamento, peso, medidas, desempenho e
            objetivos físicos.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Essas informações poderão ser utilizadas para personalização da
            experiência e acompanhamento da evolução dentro da plataforma.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life deverá adotar medidas adequadas para proteger essas
            informações e limitar seu acesso às finalidades necessárias para o
            funcionamento dos serviços.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A plataforma não deverá utilizar essas informações para diagnosticar
            doenças ou substituir acompanhamento realizado por profissionais de
            saúde.
          </p>
        </section>

        {/* Seção "conteudos-publicados-pelo-usuario" (o id deixa os links do índice pularem para cá) */}
        <section id="conteudos-publicados-pelo-usuario">
          {/* Título da seção */}
          <h2>4. Conteúdos publicados pelo usuário</h2>
          {/* Parágrafo de texto */}
          <p>A Saúde Life poderá permitir que o usuário publique:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>treinos;</li>
            {/* Item da lista */}
            <li>imagens;</li>
            {/* Item da lista */}
            <li>vídeos;</li>
            {/* Item da lista */}
            <li>comentários;</li>
            {/* Item da lista */}
            <li>avaliações;</li>
            {/* Item da lista */}
            <li>informações de perfil;</li>
            {/* Item da lista */}
            <li>outros conteúdos relacionados à plataforma.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Dependendo das configurações de privacidade e das funcionalidades
            disponíveis, esses conteúdos poderão ser visualizados por outros
            usuários, profissionais ou academias.
          </p>
          {/* Parágrafo de texto */}
          <p>
            O usuário deve evitar publicar informações pessoais que não deseja
            tornar públicas.
          </p>
        </section>

        {/* Seção "compartilhamento-de-informacoes" (o id deixa os links do índice pularem para cá) */}
        <section id="compartilhamento-de-informacoes">
          {/* Título da seção */}
          <h2>5. Compartilhamento de informações</h2>
          {/* Parágrafo de texto */}
          <p>A Saúde Life não deverá vender dados pessoais dos usuários.</p>
          {/* Parágrafo de texto */}
          <p>
            As informações poderão ser compartilhadas quando necessário para:
          </p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>funcionamento da plataforma;</li>
            {/* Item da lista */}
            <li>prestação de serviços contratados;</li>
            {/* Item da lista */}
            <li>processamento de pagamentos;</li>
            {/* Item da lista */}
            <li>armazenamento e infraestrutura tecnológica;</li>
            {/* Item da lista */}
            <li>atendimento ao usuário;</li>
            {/* Item da lista */}
            <li>cumprimento de obrigações legais;</li>
            {/* Item da lista */}
            <li>prevenção de fraudes e atividades ilícitas;</li>
            {/* Item da lista */}
            <li>proteção dos direitos da Saúde Life ou de seus usuários.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Quando terceiros participarem do processamento de dados, deverão
            utilizar as informações de acordo com as finalidades necessárias
            para a prestação dos respectivos serviços e com a legislação
            aplicável.
          </p>
        </section>

        {/* Seção "dados-de-academias-e-profissionais" (o id deixa os links do índice pularem para cá) */}
        <section id="dados-de-academias-e-profissionais">
          {/* Título da seção */}
          <h2>6. Dados de academias e profissionais</h2>
          {/* Parágrafo de texto */}
          <p>
            Quando o usuário estiver vinculado a uma academia ou profissional
            por meio da plataforma, determinadas informações poderão ser
            disponibilizadas a essas partes para permitir o funcionamento de
            recursos como:
          </p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>acompanhamento de alunos;</li>
            {/* Item da lista */}
            <li>criação de treinos personalizados;</li>
            {/* Item da lista */}
            <li>gestão de planos;</li>
            {/* Item da lista */}
            <li>acompanhamento de evolução;</li>
            {/* Item da lista */}
            <li>comunicação entre profissional e aluno.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            O acesso deverá ser limitado às informações necessárias para a
            finalidade do serviço.
          </p>
        </section>

        {/* Seção "cookies-e-tecnologias-semelhantes" (o id deixa os links do índice pularem para cá) */}
        <section id="cookies-e-tecnologias-semelhantes">
          {/* Título da seção */}
          <h2>7. Cookies e tecnologias semelhantes</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá utilizar cookies e tecnologias semelhantes para:
          </p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>manter funcionalidades da plataforma;</li>
            {/* Item da lista */}
            <li>lembrar preferências;</li>
            {/* Item da lista */}
            <li>melhorar a experiência do usuário;</li>
            {/* Item da lista */}
            <li>compreender como a plataforma é utilizada;</li>
            {/* Item da lista */}
            <li>realizar análises de desempenho;</li>
            {/* Item da lista */}
            <li>aumentar a segurança.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            O usuário poderá configurar o navegador para bloquear determinados
            cookies. Entretanto, isso poderá afetar algumas funcionalidades da
            plataforma.
          </p>
        </section>

        {/* Seção "armazenamento-e-seguranca" (o id deixa os links do índice pularem para cá) */}
        <section id="armazenamento-e-seguranca">
          {/* Título da seção */}
          <h2>8. Armazenamento e segurança</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life adotará medidas técnicas e organizacionais destinadas a
            proteger os dados pessoais contra acesso não autorizado, perda,
            alteração, divulgação ou destruição indevida.
          </p>
          {/* Parágrafo de texto */}
          <p>Entre essas medidas poderão estar:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>controle de acesso;</li>
            {/* Item da lista */}
            <li>autenticação;</li>
            {/* Item da lista */}
            <li>criptografia quando aplicável;</li>
            {/* Item da lista */}
            <li>monitoramento de segurança;</li>
            {/* Item da lista */}
            <li>backups;</li>
            {/* Item da lista */}
            <li>atualizações de sistemas;</li>
            {/* Item da lista */}
            <li>políticas internas de proteção de dados.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Nenhum sistema é completamente seguro. Portanto, apesar dos esforços
            para proteger as informações, não é possível garantir segurança
            absoluta.
          </p>
        </section>

        {/* Seção "retencao-dos-dados" (o id deixa os links do índice pularem para cá) */}
        <section id="retencao-dos-dados">
          {/* Título da seção */}
          <h2>9. Retenção dos dados</h2>
          {/* Parágrafo de texto */}
          <p>
            As informações pessoais poderão ser armazenadas pelo período
            necessário para:
          </p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>fornecer os serviços;</li>
            {/* Item da lista */}
            <li>manter a conta ativa;</li>
            {/* Item da lista */}
            <li>cumprir obrigações legais;</li>
            {/* Item da lista */}
            <li>solucionar disputas;</li>
            {/* Item da lista */}
            <li>prevenir fraudes;</li>
            {/* Item da lista */}
            <li>exercer ou defender direitos.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Quando os dados deixarem de ser necessários e não houver obrigação
            legal de mantê-los, poderão ser excluídos ou anonimizados.
          </p>
        </section>

        {/* Seção "direitos-do-usuario" (o id deixa os links do índice pularem para cá) */}
        <section id="direitos-do-usuario">
          {/* Título da seção */}
          <h2>10. Direitos do usuário</h2>
          {/* Parágrafo de texto */}
          <p>
            O usuário poderá, conforme a legislação aplicável, solicitar
            informações sobre o tratamento de seus dados e exercer direitos
            relacionados às suas informações pessoais.
          </p>
          {/* Parágrafo de texto */}
          <p>Entre esses direitos poderão estar:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>confirmação da existência de tratamento;</li>
            {/* Item da lista */}
            <li>acesso aos dados;</li>
            {/* Item da lista */}
            <li>correção de informações incorretas;</li>
            {/* Item da lista */}
            <li>atualização de dados;</li>
            {/* Item da lista */}
            <li>solicitação de exclusão, quando aplicável;</li>
            {/* Item da lista */}
            <li>informações sobre compartilhamento;</li>
            {/* Item da lista */}
            <li>revogação de consentimentos, quando aplicável;</li>
            <li>
              solicitação de revisão de determinadas decisões automatizadas,
              quando aplicável.
            </li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            As solicitações poderão estar sujeitas à verificação da identidade
            do solicitante e às limitações previstas na legislação.
          </p>
        </section>

        {/* Seção "criancas-e-adolescentes" (o id deixa os links do índice pularem para cá) */}
        <section id="criancas-e-adolescentes">
          {/* Título da seção */}
          <h2>11. Crianças e adolescentes</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá estabelecer regras específicas para usuários
            menores de idade, de acordo com a legislação aplicável e com as
            funcionalidades oferecidas.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Quando necessário, poderão ser solicitadas autorizações ou medidas
            adicionais de proteção.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A plataforma não deverá coletar intencionalmente dados de crianças
            em desacordo com as exigências legais.
          </p>
        </section>

        {/* Seção "servicos-de-terceiros" (o id deixa os links do índice pularem para cá) */}
        <section id="servicos-de-terceiros">
          {/* Título da seção */}
          <h2>12. Serviços de terceiros</h2>
          {/* Parágrafo de texto */}
          <p>A plataforma poderá utilizar serviços externos, como:</p>
          {/* Lista de itens */}
          <ul>
            {/* Item da lista */}
            <li>serviços de hospedagem;</li>
            {/* Item da lista */}
            <li>ferramentas de análise;</li>
            {/* Item da lista */}
            <li>provedores de autenticação;</li>
            {/* Item da lista */}
            <li>serviços de armazenamento;</li>
            {/* Item da lista */}
            <li>processadores de pagamento;</li>
            {/* Item da lista */}
            <li>plataformas de comunicação.</li>
          </ul>
          {/* Parágrafo de texto */}
          <p>
            Esses serviços poderão possuir suas próprias políticas de
            privacidade e regras de tratamento de dados.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life recomenda que o usuário consulte também as políticas
            aplicáveis desses serviços quando necessário.
          </p>
        </section>

        {/* Seção "pagamentos" (o id deixa os links do índice pularem para cá) */}
        <section id="pagamentos">
          {/* Título da seção */}
          <h2>13. Pagamentos</h2>
          {/* Parágrafo de texto */}
          <p>
            Quando a Saúde Life disponibilizar serviços pagos, informações
            necessárias para o processamento do pagamento poderão ser
            compartilhadas com provedores especializados.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá não armazenar diretamente informações completas
            de cartões de pagamento quando o processamento for realizado por um
            provedor especializado.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Os dados utilizados no pagamento serão tratados de acordo com as
            regras e políticas aplicáveis ao respectivo serviço.
          </p>
        </section>

        {/* Seção "alteracoes-nesta-politica" (o id deixa os links do índice pularem para cá) */}
        <section id="alteracoes-nesta-politica">
          {/* Título da seção */}
          <h2>14. Alterações nesta Política</h2>
          {/* Parágrafo de texto */}
          <p>
            A Saúde Life poderá atualizar esta Política de Privacidade para
            refletir mudanças na plataforma, nos serviços ou na legislação.
          </p>
          {/* Parágrafo de texto */}
          <p>
            Quando houver alterações relevantes, a plataforma poderá informar os
            usuários por meio dos canais disponíveis.
          </p>
          {/* Parágrafo de texto */}
          <p>
            A data de atualização apresentada no início desta Política será
            modificada quando uma nova versão for publicada.
          </p>
        </section>

        {/* Seção "contato" (o id deixa os links do índice pularem para cá) */}
        <section id="contato">
          {/* Título da seção */}
          <h2>15. Contato</h2>
          {/* Parágrafo de texto */}
          <p>
            Caso o usuário tenha dúvidas, solicitações ou reclamações
            relacionadas ao tratamento de seus dados pessoais, poderá entrar em
            contato com a Saúde Life pelos canais oficiais disponibilizados na
            plataforma.
          </p>
        </section>

        {/* Seção "aceitacao" (o id deixa os links do índice pularem para cá) */}
        <section id="aceitacao">
          {/* Título da seção */}
          <h2>16. Aceitação</h2>
          {/* Parágrafo de texto */}
          <p>
            Ao utilizar a Saúde Life e, quando aplicável, marcar a opção de
            concordância, o usuário declara que leu e compreendeu esta Política
            de Privacidade.
          </p>
          {/* Parágrafo de texto */}
          <p>
            {/* Texto em destaque (negrito) */}
            <strong>Saúde Life</strong><br  />Privacidade, segurança e
            transparência fazem parte do compromisso da plataforma com seus
            usuários.
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
export default Politica;
