# ============================================================
# Stage 1: Build (Maven + JDK 21)
# ============================================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Download dependencies first (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Build JAR (skip tests — tests run in CI pipeline)
COPY src ./src
RUN mvn clean package -DskipTests -B -q

# ============================================================
# Stage 2: Runtime (minimal JRE 21 Alpine)
# ============================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root security user
RUN addgroup -S securecart && adduser -S securecart -G securecart

COPY --from=build /app/target/securecart-backend-*.jar app.jar
RUN chown -R securecart:securecart /app

USER securecart

EXPOSE 8080

# JVM tuning: container-aware heap, reduced overhead for cloud
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+OptimizeStringConcat -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
