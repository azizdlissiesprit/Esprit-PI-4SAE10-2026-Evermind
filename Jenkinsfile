pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
        jdk 'Java-17'
        nodejs 'Node-18'
    }

    stages {
        stage('Build Eureka Server') {
            steps {
                dir('Backend/Eureka/EurekaServer') {
                    echo 'Building Eureka Server JAR...'
                    sh 'mvn clean package -DskipTests'
                    
                    echo 'Building Eureka Docker image...'
                    sh 'docker build -t eureka-server:latest .'
                }
            }
        }

        stage('Build Spring Boot Microservices') {
            parallel {
                stage('API Gateway') {
                    steps {
                        dir('Backend/Gateway') {
                            echo 'Building Gateway JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Gateway Docker image...'
                            sh 'docker build -t api-gateway:latest .'
                        }
                    }
                }
                
                stage('Reclamation Service') {
                    steps {
                        dir('Backend/Reclamation') {
                            echo 'Building Reclamation JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Reclamation Docker image...'
                            sh 'docker build -t reclamation-service:latest .'
                        }
                    }
                }

                stage('Sensor Simulator') {
                    steps {
                        dir('Backend/SensorSimulator') {
                            echo 'Building Sensor Simulator JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Sensor Simulator Docker image...'
                            sh 'docker build -t sensor-simulator:latest .'
                        }
                    }
                }
                
                // You can add more backend microservices here such as AgendaMedical, Patient, User, etc.
                // e.g. dir('Backend/User/User') { ... } 
            }
        }

        stage('Build Angular Frontend') {
            steps {
                dir('Frontend/alzheimer-care-web') {
                    echo 'Installing npm dependencies...'
                    sh 'npm install'
                    
                    echo 'Building Angular application...'
                    sh 'npm run build' 
                    
                    echo 'Building Angular Docker image...'
                    sh 'docker build -t alzheimer-care-web:latest .'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }
        success {
            echo 'Build successful! All images have been built locally.'
        }
        failure {
            echo 'Build failed. Check the logs for details.'
        }
    }
}