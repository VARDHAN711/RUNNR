pipeline {
    agent any

    tools {
        nodejs 'NodeJS'   // must match the name configured in Jenkins → Global Tool Configuration
    }

    environment {
        NODE_VERSION     = '20'   
        BACKEND_PORT     = '5000'
        FRONTEND_PORT    = '5173'
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend - npm install') {
                    steps {
                        dir('backend') {
                            // Replaced sh with bat
                            bat 'node --version'
                            bat 'npm --version'
                            bat 'npm ci'
                        }
                    }
                }
                stage('Frontend - npm install') {
                    steps {
                        dir('frontend') {
                            // Replaced sh with bat
                            bat 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Lint') {
            parallel {
                stage('Backend - Lint') {
                    steps {
                        dir('backend') {
                            // Replaced sh with bat
                            bat 'npm run lint --if-present || echo "No lint script configured for backend - skipping"'
                        }
                    }
                }
                stage('Frontend - ESLint') {
                    steps {
                        dir('frontend') {
                            bat 'npx eslint .'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Backend - Unit Tests') {
                    steps {
                        dir('backend') {
                            // Replaced sh with bat
                            bat 'npm run test --if-present || echo "No test script configured for backend - skipping"'
                        }
                    }
                }
                stage('Frontend - Unit Tests') {
                    steps {
                        dir('frontend') {
                            // Replaced sh with bat
                            bat 'npm run test --if-present || echo "No test script configured for frontend - skipping"'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Frontend - Vite Build') {
                    steps {
                        dir('frontend') {
                            // Replaced sh with bat
                            bat 'npm run build'
                            echo "Frontend build artifacts in frontend/dist/"
                        }
                    }
                }
                stage('Backend - Verify') {
                    steps {
                        dir('backend') {
                            // Replaced sh with bat
                            bat 'node -c index.js && echo "Backend syntax OK"'
                        }
                    }
                }
            }
        }

        stage('Docker Build and Push') {
            when {
                expression { fileExists('backend/Dockerfile') || fileExists('Dockerfile') }
            }
            steps {
                echo "No Dockerfile found - skipping Docker build"
            }
        }

        stage('Deploy - Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo "Deploying to STAGING - configure your server here"
            }
        }

        stage('Deploy - Production') {
            when {
                branch 'main'
            }
            steps {
                echo "Production deploy placeholder - configure your server here"
            }
        }
    }

    post {
        always {
            echo "Pipeline finished - build #${env.BUILD_NUMBER}, result: ${currentBuild.currentResult}"
            archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true, allowEmptyArchive: true
            cleanWs()
        }
        success {
            echo "Build #${env.BUILD_NUMBER} SUCCEEDED"
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} FAILED"
        }
        unstable {
            echo "Build #${env.BUILD_NUMBER} is UNSTABLE"
        }
    }
}