FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/Notification-Service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 9091

ENTRYPOINT ["java","-jar","app.jar"]