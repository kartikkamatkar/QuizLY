# QuizLY 🚀 — DevOps, Deployment & Observability Infrastructure

This directory contains all the configuration files, orchestrations, and deployment manifests required to build, deploy, scale, and monitor the QuizLY microservices platform.

---

## 📂 Directory Layout

| Directory | Core Component | Key Files | Description |
| :--- | :--- | :--- | :--- |
| [**/postgres**](file:///d:/Project/QuizLY/devops/postgres) | Database Bootstrapping | [init.sql](file:///d:/Project/QuizLY/devops/postgres/init.sql) | Script to automatically initialize application schemas/databases. |
| [**/prometheus**](file:///d:/Project/QuizLY/devops/prometheus) | Metrics Collector | [prometheus.yml](file:///d:/Project/QuizLY/devops/prometheus/prometheus.yml) | Scrape jobs configuration pointing to Micrometer Actuator endpoints. |
| [**/grafana**](file:///d:/Project/QuizLY/devops/grafana) | Monitoring Dashboard | `/provisioning` | Auto-provisions Loki and Prometheus data sources and imports custom dashboards. |
| [**/loki**](file:///d:/Project/QuizLY/devops/loki) | Log Storage Database | [loki-config.yml](file:///d:/Project/QuizLY/devops/loki/loki-config.yml) | Storage and ingestion endpoints settings for the Loki log system. |
| [**/promtail**](file:///d:/Project/QuizLY/devops/promtail) | Container Log Agent | [promtail-config.yml](file:///d:/Project/QuizLY/devops/promtail/promtail-config.yml) | Daemon that scrapes stdout logs from the Docker socket and ships to Loki. |
| [**/logstash**](file:///d:/Project/QuizLY/devops/logstash) | ELK Pipeline Router | [logstash.conf](file:///d:/Project/QuizLY/devops/logstash/logstash.conf) | Receives JSON-encoded log streams from Spring Boot and writes to Elasticsearch. |
| [**/k8s**](file:///d:/Project/QuizLY/devops/k8s) | Kubernetes Orchestration | `*.yaml` | Declarative manifests to launch all services on a Kubernetes cluster. |

---

## 🗄️ Database Bootstrapping (`/postgres`)
To ensure downstream microservices do not fail during their initial database migrations, PostgreSQL requires pre-existing databases. 
- **[init.sql](file:///d:/Project/QuizLY/devops/postgres/init.sql)**: Executes during container startup. It creates the two separate databases used by our services:
  ```sql
  CREATE DATABASE auth_core;
  CREATE DATABASE quizly;
  ```
- **How it works**: This SQL script is mounted inside the PostgreSQL container at `/docker-entrypoint-initdb.d/init.sql`. The standard PostgreSQL Docker image automatically runs any `.sql` files placed in this folder upon cluster initialization.

---

## 📊 Metrics Collection & Scraping (`/prometheus`)
Every Spring Boot microservice uses **Micrometer** to expose Prometheus-formatted metrics at `/actuator/prometheus`.
- **[prometheus.yml](file:///d:/Project/QuizLY/devops/prometheus/prometheus.yml)**: Defines global polling intervals and targets:
  - **Scrape Interval**: Configured to `5s` for high-granularity metric updates.
  - **Scrape Targets**: Dynamically tracks each of the Spring Boot services:
    - `api-gateway` (Port `6063`)
    - `auth-service` (Port `9090`)
    - `quiz-service` (Port `6060`)
    - `attempt-service` (Port `6061`)
    - `competition-service` (Port `6062`)
    - `eureka-server` (Port `8761`)
    - `config-server` (Port `8888`)

---

## 🪵 Log Aggregation Stack (`/loki`, `/promtail`, `/logstash`)
QuizLY supports two alternative log aggregation pipelines:

### 1. The Loki + Promtail Pipeline (Recommended for local dev)
- **[promtail-config.yml](file:///d:/Project/QuizLY/devops/promtail/promtail-config.yml)**: Mounts the Docker engine socket (`unix:///var/run/docker.sock`) to discover running containers dynamically. It extracts container names (`container`) and stdout streams (`stream`) and pushes them to Loki.
- **[loki-config.yml](file:///d:/Project/QuizLY/devops/loki/loki-config.yml)**: Configures Loki as a single-binary datastore. It stores indices using BoltDB (`boltdb-shipper`) and logs inside chunks on the local filesystem storage path `/tmp/loki`.

### 2. The ELK Stack Pipeline (Enterprise-grade)
- **[logstash.conf](file:///d:/Project/QuizLY/devops/logstash/logstash.conf)**: Listens for JSON TCP and UDP logs on port `5000`. Spring Boot logs are encoded as JSON using the `logstash-logback-encoder` dependency. 
- Logstash extracts the Spring application name metadata and indexes the events into Elasticsearch under `quizly-logs-YYYY.MM.dd`.

---

## 📈 Visualizing Metrics and Logs (`/grafana`)
- **Grafana Provisioning**: Inside the `/grafana/provisioning/` folder, configurations define data sources dynamically:
  - **Datasources**: Registers the local Prometheus instance (`http://prometheus:9090`) and Loki instance (`http://loki:3100`).
  - **Dashboards**: Auto-imports predefined JSON dashboard panels rendering JVM heap space, garbage collection, HTTP latency, and active circuit-breaker configurations.

---

## ⚓ Kubernetes Deployment manifests (`/k8s`)
For production deployment, the Kubernetes manifests are separated logically into infrastructure, stateful databases, and stateless application microservices.

### 🔑 Security & Configuration
1. **[secrets.yaml](file:///d:/Project/QuizLY/devops/k8s/secrets.yaml)**: Stores sensitive Base64 credentials:
   - `postgres-password`: Database credentials.
   - `jwt-secret`: Signing key used by the `auth-service` and validated by the `api-gateway`.
2. **[configmap.yaml](file:///d:/Project/QuizLY/devops/k8s/configmap.yaml)**: Holds non-sensitive environment variables shared globally (e.g., Spring Config Server endpoint, Eureka URLs, Redis server port).

### 🗄️ State Store & Messaging Pods
1. **[postgres-k8s.yaml](file:///d:/Project/QuizLY/devops/k8s/postgres-k8s.yaml)**: Sets up PostgreSQL deployment using a Persistent Volume Claim (`postgres-pvc`) to persist data across pod restarts. It initializes databases using an inline ConfigMap containing our SQL seeder.
2. **[redis-k8s.yaml](file:///d:/Project/QuizLY/devops/k8s/redis-k8s.yaml)**: Standard caching pod on port `6379`.
3. **[kafka-k8s.yaml](file:///d:/Project/QuizLY/devops/k8s/kafka-k8s.yaml)**: Configures ZooKeeper and a single Kafka Broker pod mapped on port `9092` to coordinate asynchronous domain events.
4. **[qdrant-k8s.yaml](file:///d:/Project/QuizLY/devops/k8s/qdrant-k8s.yaml)**: Deploys the Qdrant vector database for RAG capabilities, exposing port `6333` (HTTP) and `6334` (gRPC).

### 🛠️ Infrastructure Services
- **[infra-services.yaml](file:///d:/Project/QuizLY/devops/k8s/infra-services.yaml)**: 
  - **Config Server**: Deploys Spring Cloud Config Server mapping all Spring `.properties` configurations inside a local Kubernetes ConfigMap `config-server-files`.
  - **Eureka Server**: Deploys the discovery node, featuring an init-container that pauses until Config Server is fully listening on port `8888`.

### 📦 Application Microservices
- **[app-services.yaml](file:///d:/Project/QuizLY/devops/k8s/app-services.yaml)**:
  Contains Stateless Deployments and Services for:
  - `api-gateway` (Exposing port `6063`)
  - `auth-service` (Exposing port `9090`)
  - `quiz-service` (Exposing port `6060`)
  - `attempt-service` (Exposing port `6061`)
  - `competition-service` (Exposing port `6062`)
  - `ai-service` (Exposing port `6065`)
  
  > [!NOTE]
  > Stateless services include **Liveness** and **Readiness** probes hitting Spring Boot Actuator endpoints `/actuator/health/liveness` and `/actuator/health/readiness` respectively to ensure the ingress traffic is routed only to fully ready instances.

### 🌐 Traffic Entrypoint
- **[ingress.yaml](file:///d:/Project/QuizLY/devops/k8s/ingress.yaml)**: Uses an Nginx Ingress Controller. It points traffic matching hostname `quizly.local` directly into the `api-gateway` service (Port `6063`) and enables CORS requests.
