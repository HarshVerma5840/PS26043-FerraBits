# ==============================================================================
# SAAMYUKT — Source Service Dockerfile
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

COPY pom.xml mvnw ./
COPY .mvn/ .mvn/
RUN chmod +x ./mvnw

COPY saamyukt-common/ saamyukt-common/
COPY saamyukt-security/ saamyukt-security/
COPY eureka-server/ eureka-server/
COPY source-service/ source-service/
COPY problem-service/ problem-service/
COPY evaluation-service/ evaluation-service/
COPY portal-service/ portal-service/
COPY codejudge-service/ codejudge-service/
COPY capability-matching-service/ capability-matching-service/

RUN set -e; \
    echo "==> Building microservice: source-service"; \
    ./mvnw -B -DskipTests clean package -pl source-service -am; \
    mkdir -p /output && \
    find source-service/target -maxdepth 1 -name "*.jar" ! -name "*sources.jar" ! -name "*original*.jar" -exec cp {} /output/service.jar \;

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /output/service.jar /app/service.jar

ARG DEFAULT_PORT=8081
ENV DEFAULT_PORT=${DEFAULT_PORT}

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "exec java -Dserver.address=0.0.0.0 -Dserver.port=${PORT:-${SERVER_PORT:-${DEFAULT_PORT}}} -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar /app/service.jar \"$@\"", "--"]
