FROM maven:3.9.6-eclipse-temurin-21
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package
EXPOSE 3002
CMD ["java", "-jar", "target/render-service-0.1.0.jar"]
