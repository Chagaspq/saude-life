# Receita para rodar a API em qualquer servidor (o Render usa este arquivo)

# Etapa 1: gera o .jar com Maven e Java 17
FROM maven:3.9-eclipse-temurin-17 AS construir
# Pasta de trabalho
WORKDIR /app
# Copia a lista de bibliotecas primeiro (fica guardada entre uma publicação e outra)
COPY pom.xml .
# Baixa as bibliotecas
RUN mvn -q dependency:go-offline
# Copia o código
COPY src ./src
# Gera o .jar (sem rodar os testes, para publicar mais rápido)
RUN mvn -q package -DskipTests

# Etapa 2: só o Java para rodar (imagem menor)
FROM eclipse-temurin:17-jre
# Pasta de trabalho
WORKDIR /app
# Pega o .jar da etapa 1
COPY --from=construir /app/target/saude-life-api-1.0.0.jar app.jar
# Porta (o Render troca pela variável PORT)
EXPOSE 8080
# Liga a API com o banco PostgreSQL e pouca memória (plano grátis)
ENTRYPOINT ["java", "-Xmx300m", "-jar", "app.jar", "--spring.profiles.active=postgres"]
