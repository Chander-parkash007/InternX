FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/internx-project-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
