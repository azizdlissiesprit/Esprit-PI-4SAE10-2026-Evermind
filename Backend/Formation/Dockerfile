FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/formation-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8096
ENTRYPOINT ["java", "-jar", "app.jar"]
