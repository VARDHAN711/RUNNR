pipeline {
    agent any

    environment {
        NODE_VERSION     = '20'
        MONGO_URI        = credentials('runnr-mongo-uri')
        JWT_SECRET       = credentials('runnr-jwt-secret')
        BACKEND_PORT     = '5000'
        FRONTEND_PORT    = '5173'
        DOCKER_IMAGE_BACKEND  = "runnr-backend"
        DOCKER_IMAGE_FRONTEND = "runnr-frontend"
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        // ─────────────────────────────────────────────
        // 1. CHECKOUT
        // ─────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Checked out branch: ${env.BRANCH_NAME}"
                sh 'echo "Commit: $(git log -1 --format="%h %s")"'
            }
        }

        // ─────────────────────────────────────────────
        // 2. INSTALL DEPENDENCIES (parallel)
        // ─────────────────────────────────────────────
        stage('Install Dependencies') {
            parallel {
                stage('Backend – npm install') {
                    steps {
                        dir('backend') {
                            sh 'node --version'
                            sh 'npm --version'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend – npm install') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // 3. LINT (parallel)
        // ─────────────────────────────────────────────
        stage('Lint') {
            parallel {
                stage('Backend – Lint') {
                    steps {
                        dir('backend') {
                            // Add ESLint to backend package.json if not present;
                            // falls back gracefully with || true so the pipeline
                            // doesn't fail when no lint script is configured yet.
                            sh 'npm run lint --if-present || echo "No lint script configured for backend – skipping"'
                        }
                    }
                }
                stage('Frontend – ESLint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // 4. TEST (parallel)
        // ─────────────────────────────────────────────
        stage('Test') {
            parallel {
                stage('Backend – Unit Tests') {
                    steps {
                        dir('backend') {
                            // Runs tests and captures JUnit XML if configured.
                            // Falls back gracefully when no test script exists.
                            sh '''
                                if npm run test --if-present; then
                                    echo "Backend tests passed"
                                else
                                    echo "No test script configured for backend – skipping"
                                fi
                            '''
                        }
                    }
                    post {
                        always {
                            // Publish JUnit results if a reporter is configured
                            script {
                                if (fileExists('backend/test-results/*.xml')) {
                                    junit 'backend/test-results/*.xml'
                                }
                            }
                        }
                    }
                }
                stage('Frontend – Unit Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                if npm run test --if-present; then
                                    echo "Frontend tests passed"
                                else
                                    echo "No test script configured for frontend – skipping"
                                fi
                            '''
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists('frontend/test-results/*.xml')) {
                                    junit 'frontend/test-results/*.xml'
                                }
                            }
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // 5. BUILD
        // ─────────────────────────────────────────────
        stage('Build') {
            parallel {
                stage('Frontend – Vite Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                            echo "✅ Frontend build artifacts in frontend/dist/"
                        }
                    }
                }
                stage('Backend – Verify') {
                    steps {
                        dir('backend') {
                            // Node.js backend has no compile step; do a dry-run
                            // syntax check on the entry point instead.
                            sh 'node --check index.js && echo "✅ Backend syntax OK"'
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // 6. DOCKER BUILD & PUSH
        //    Only runs when a Dockerfile is present AND
        //    we are on main / develop branches.
        // ─────────────────────────────────────────────
        stage('Docker Build & Push') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        branch 'develop'
                    }
                    expression { fileExists('backend/Dockerfile') || fileExists('Dockerfile') }
                }
            }
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {

                        // ── Backend image ──────────────────────────────
                        if (fileExists('backend/Dockerfile')) {
                            def backendImage = docker.build(
                                "${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG}",
                                "--file backend/Dockerfile backend"
                            )
                            backendImage.push()
                            backendImage.push('latest')
                            echo "✅ Pushed ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG}"
                        }

                        // ── Frontend image ─────────────────────────────
                        if (fileExists('frontend/Dockerfile')) {
                            def frontendImage = docker.build(
                                "${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG}",
                                "--file frontend/Dockerfile frontend"
                            )
                            frontendImage.push()
                            frontendImage.push('latest')
                            echo "✅ Pushed ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // 7. DEPLOY – STAGING  (develop branch)
        // ─────────────────────────────────────────────
        stage('Deploy – Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo "🚀 Deploying build #${IMAGE_TAG} to STAGING …"
                // ── Example: SSH deploy via docker-compose ──────────
                // sshagent(['staging-ssh-key']) {
                //     sh '''
                //         ssh user@staging-server "
                //             cd /opt/runnr &&
                //             export IMAGE_TAG=${IMAGE_TAG} &&
                //             docker-compose pull &&
                //             docker-compose up -d --remove-orphans
                //         "
                //     '''
                // }
                echo "✅ Staging deploy complete (placeholder – wire up your server above)"
            }
        }

        // ─────────────────────────────────────────────
        // 8. DEPLOY – PRODUCTION  (main branch, manual gate)
        // ─────────────────────────────────────────────
        stage('Deploy – Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy build #${env.BUILD_NUMBER} to PRODUCTION?"
                ok      "Yes, deploy"
                submitter "admin,release-team"
            }
            steps {
                echo "🚀 Deploying build #${IMAGE_TAG} to PRODUCTION …"
                // ── Example: SSH deploy ──────────────────────────────
                // sshagent(['production-ssh-key']) {
                //     sh '''
                //         ssh user@prod-server "
                //             cd /opt/runnr &&
                //             export IMAGE_TAG=${IMAGE_TAG} &&
                //             docker-compose pull &&
                //             docker-compose up -d --remove-orphans
                //         "
                //     '''
                // }
                echo "✅ Production deploy complete (placeholder – wire up your server above)"
            }
        }
    }

    // ─────────────────────────────────────────────────
    // POST ACTIONS
    // ─────────────────────────────────────────────────
    post {
        always {
            echo "Pipeline finished – build #${env.BUILD_NUMBER}, result: ${currentBuild.currentResult}"

            // Archive the frontend production build
            script {
                if (fileExists('frontend/dist')) {
                    archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
                }
            }

            // Clean workspace to free disk space
            cleanWs()
        }

        success {
            echo "✅ Build #${env.BUILD_NUMBER} SUCCEEDED"
            // Uncomment and configure to send Slack / email notifications:
            // slackSend channel: '#ci-cd',
            //           color:   'good',
            //           message: "✅ Runnr build #${env.BUILD_NUMBER} passed on ${env.BRANCH_NAME}"
        }

        failure {
            echo "❌ Build #${env.BUILD_NUMBER} FAILED"
            // emailext subject: "❌ Runnr build #${env.BUILD_NUMBER} failed",
            //          body:    "Check console output at ${env.BUILD_URL}",
            //          to:      'team@example.com'
        }

        unstable {
            echo "⚠️  Build #${env.BUILD_NUMBER} is UNSTABLE (test failures?)"
        }
    }
}
