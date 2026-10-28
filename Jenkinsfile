
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out Hospital Management System'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                bat 'npm ci'
                bat 'npm run build'
            }
        }

        stage('Test') {
            steps {
                bat 'npm run lint'
                bat 'npm test --if-present'
            }
        }

        stage('Result') {
            steps {
                echo 'Build and test stages completed successfully!'
            }
        }
    }

    post {
        success {
            echo 'FINAL RESULT: SUCCESS'
        }

        failure {
            echo 'FINAL RESULT: FAILURE - Check Console Output'
        }

        always {
            echo 'Jenkins pipeline execution finished.'
        }
    }
}

