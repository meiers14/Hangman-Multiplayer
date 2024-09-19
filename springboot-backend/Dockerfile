# Stage 1: Build Stage
FROM maven:3.8.3-openjdk-17 AS backend-build
WORKDIR /home/app
COPY pom.xml /home/app/
COPY src /home/app/src
RUN mvn clean package

# Stage 2: Final Stage 
FROM openjdk:17-jdk-slim
WORKDIR /home/app
COPY --from=backend-build /home/app/target/spring_rest_docker.jar /home/app/spring_rest_docker.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/home/app/spring_rest_docker.jar"]