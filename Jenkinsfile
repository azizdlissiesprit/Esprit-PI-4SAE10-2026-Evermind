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
                stage('User Service') {
                    steps {
                        // 1. Move into the specific microservice folder
                        dir('Backend/User/User') { 
                            echo 'Building User Service JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building User Service Docker image...'
                            // 2. Change the name to 'user-service'
                            sh 'docker build -t user-service:latest .'
                        }
                    }
                }
                stage('Alert Service') {
                    steps {
                        dir('Backend/Alert/Alert') { 
                            echo 'Building Alert Service JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Alert Service Docker image...'
                            sh 'docker build -t alert-service:latest .'
                        }
                    }
                }
                stage('Intervention Service') {
                    steps {
                        dir('Backend/Intervention/Intervention') { 
                            echo 'Building Intervention Service JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Intervention Service Docker image...'
                            sh 'docker build -t intervention-service:latest .'
                        }
                    }
                }
                stage('Chatbot Service') {
                    steps {
                        dir('Backend/Chatbot/Chatbot') { 
                            echo 'Building Chatbot Service JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Chatbot Service Docker image...'
                            sh 'docker build -t chatbot-service:latest .'
                        }
                    }
                }
                stage('Patient Service') {
                    steps {
                        dir('Backend/Patient/Patient') { 
                            echo 'Building Patient Service JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Patient Service Docker image...'
                            sh 'docker build -t patient-service:latest .'
                        }
                    }
                }
                stage('Stock Service') {
                    steps {
                        dir('Backend/Stock/service-stock') { 
                            echo 'Building Stock Service JAR...'
                            sh 'mvn clean package -DskipTests'
                            
                            echo 'Building Stock Service Docker image...'
                            sh 'docker build -t stock-service:latest .'
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
                    sh 'npm install --legacy-peer-deps'
                    
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