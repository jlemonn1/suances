# syntax=docker/dockerfile:1.6

FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -q -e -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

ENV JAVA_OPTS=""

COPY --from=builder /app/target/reservas-service-*.jar /app/reservas-service.jar

EXPOSE 8087

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/reservas-service.jar"]
