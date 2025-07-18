# Start from an OpenJDK 17 runtime image
FROM openjdk:17-jdk-slim as runtime

# Set the working directory
WORKDIR /app

# Copy the built JAR from the target directory
COPY target/Reclamation-0.0.1-SNAPSHOT.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"] 