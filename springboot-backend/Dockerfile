# Stage 1: Build
FROM maven:3.8.3-openjdk-17 AS build

# Set the working directory
WORKDIR /home/app

# Copy only pom.xml first to leverage Docker cache
COPY pom.xml .

# Download dependencies (leverage caching)
RUN mvn dependency:go-offline

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /home/app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]


