FROM openjdk:27-ea-trixie
ADD target/kuttit-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
EXPOSE 8080
LABEL authors="ayush"