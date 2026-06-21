# 🎓 QuizLY placement Interview Preparation Guide

This document is designed to help you prepare for technical interviews. It breaks down the high-level system architecture and advanced engineering patterns implemented in **QuizLY** into easy-to-understand concepts, complete with **"How to Explain This in an Interview"** scripts.

---

## 📂 Table of Contents
1. [Eureka Service Discovery](#1-service-discovery-eureka)
2. [Spring Cloud Config Server](#2-centralized-configuration-config-server)
3. [API Gateway & JWT Authentication](#3-api-gateway-jwt-authentication)
4. [OpenFeign & Resilience4j Circuit Breakers](#4-interservice-communication--fault-tolerance-feign--resilience4j)
5. [Redis Caching & Sorted Sets (Leaderboards)](#5-high-performance-leaderboards-using-redis)
6. [Apache Kafka Event-Driven Pipelines](#6-event-driven-architecture-using-kafka)
7. [WebSockets & STOMP for Real-time Duels](#7-real-time-matchmaking-via-websockets)
8. [RAG, Vector DBs & Spring AI Integration](#8-retrieval-augmented-generation-rag--spring-ai)
9. [Distributed Tracing (observability)](#9-distributed-tracing-observability)
10. [Real-World Troubleshooting Scenarios](#10-real-world-troubleshooting-scenarios)

---

## 1. Service Discovery (Eureka)

### 💡 What is it?
In a microservices system, individual services boot up on dynamic ports and IP addresses (especially in cloud environments like AWS or Kubernetes). Instead of hardcoding URLs, services register themselves with a central registry called the **Eureka Server**.

### ⚙️ How it works
- **Registration**: When a service starts, it sends its network coordinates (IP, port, name) to Eureka.
- **Heartbeats**: Every 30 seconds (configured as `lease-renewal-interval-in-seconds` in properties), the service sends a lightweight request to Eureka. If Eureka doesn't hear from a service for 90 seconds, it assumes it died and removes it from the list.
- **Self-Preservation Mode**: If a sudden network glitch causes many services to lose heartbeat, Eureka stops removing them to prevent catastrophic cascades. It preserves the registry until communication stabilizes.

### 🗣️ How to explain in an interview:
> *"In QuizLY, I used Netflix Eureka as a Service Registry. Instead of hardcoding port values (like `localhost:6060` for Quiz Service), every service registers its name (e.g. `quiz-service`) with Eureka at startup. When the API Gateway or another service wants to talk to `quiz-service`, it queries Eureka to get a healthy instance's IP and port, enabling dynamic load balancing and failovers."*

---

## 2. Centralized Configuration (Config Server)

### 💡 What is it?
Configuring databases, security keys, and port numbers separately inside each microservice (`application.properties`) becomes unmanageable as the system scales. A **Config Server** centralizes these settings in one central repository.

### ⚙️ How it works
- **Git Backend**: The Config Server reads properties from a dedicated Git repository (`config-repo`).
- **Dynamic Retrieval**: At bootstrap, microservices hit the Config Server endpoint (`http://localhost:8888`) using `spring.config.import=optional:configserver:http://localhost:8888` to fetch their environment variables.
- **Hot Reloading (`@RefreshScope`)**: If a property is modified in the Git repository, you don't need to rebuild the microservices. You commit the change, send a POST request to `/actuator/refresh`, and Spring dynamically re-injects the values into classes annotated with `@RefreshScope`.

### 🗣️ How to explain in an interview:
> *"I built a central Spring Cloud Config Server backed by a local Git repository. Rather than keeping duplicate datasource properties in every service, all configurations are stored in a Git repository. At startup, each microservice imports its configuration from the Config Server. If I need to change database credentials or feature toggles, I commit the change to the git config-repo and use Spring Actuator's `/actuator/refresh` to hot-reload the variables without restarting any services."*

---

## 3. API Gateway & JWT Authentication

### 💡 What is it?
Clients (like the React frontend) should not talk to individual microservices directly because it creates complex routing and security concerns. The **API Gateway** acts as the single point of entry.

### ⚙️ How it works
- **Routing**: Intercepts requests on port `6063` and forwards them based on path rules (e.g. routes `/auth/**` to `auth-service`, `/api/ai/**` to `ai-service`).
- **Global Filter**: We implement a custom filter that validates the **JWT Token** inside the `Authorization` header.
- **Header Propagation**: Once the Gateway decrypts and validates the JWT token, it extracts key user information (`userId`, `role`, `email`) and injects them as downstream headers (`X-User-Id`, `X-User-Role`, `X-User-Email`). Downstream microservices can trust these headers blindly without re-authenticating the request.

### 🗣️ How to explain in an interview:
> *"The API Gateway acts as the gatekeeper for our backend. It routes user requests to downstream microservices using Eureka service names (e.g. `lb://quiz-service`). To implement secure authentication, I built a custom Gateway Filter that intercepts incoming HTTP requests, decodes and validates the JWT bearer token, and then forwards the request with custom headers containing user details. This means downstream microservices do not need complex security logic; they simply read the headers."*

---

## 4. Interservice Communication & Fault Tolerance (Feign + Resilience4j)

### 💡 What is it?
Microservices often need data from each other. For example, `quiz-service` needs to know if a user has completed attempts. We use **OpenFeign** for clean REST clients, and **Resilience4j** to make sure a failure in one service doesn't crash the other.

### ⚙️ How it works
- **OpenFeign**: Instead of writing boilerplates with `RestTemplate` or `WebClient`, OpenFeign allows us to define a simple Java Interface annotated with `@FeignClient`. Spring generates the HTTP requests automatically.
- **Circuit Breaker Pattern**: If the Attempt service goes down, calling it would normally hang the thread pool and crash Quiz Service. A Circuit Breaker intercepts calls.
  - **Closed**: Everything is healthy. Requests pass through.
  - **Open**: Too many requests failed (e.g., >50% failure rate). Requests are immediately blocked, and fallback data is returned.
  - **Half-Open**: After a cooldown timer, some trial requests are let through to see if the target service recovered.
- **Fallbacks**: When the circuit is Open, OpenFeign triggers a local fallback class returning mock or cached data so the user experience is not disrupted.

### 🗣️ How to explain in an interview:
> *"For service-to-service communication, I used declarative OpenFeign clients. To make the system resilient, I integrated Resilience4j Circuit Breakers. If the Attempt service experiences downtime, the circuit breaker opens, blocking further HTTP calls to prevent thread exhaustion, and immediately routes requests to a local fallback method. This keeps the Quiz service responsive even if secondary dependencies fail."*

---

## 5. High-Performance Leaderboards using Redis

### 💡 What is it?
Generating leaderboards by running `SELECT SUM(score) ... GROUP BY user_id ORDER BY score DESC` on a relational database (PostgreSQL) is extremely slow and will crash under heavy traffic. We cache live scores in **Redis**.

### ⚙️ How it works
- **Sorted Sets (ZSets)**: Redis has a data structure called a Sorted Set where every entry is mapped to a unique floating-point score.
- **Commands**:
  - `ZADD leaderboard <score> <username>`: Adds or updates a user's score in logarithmic `O(log(N))` time.
  - `ZREVRANGE leaderboard 0 9 WITHSCORES`: Fetches the top 10 users in reverse order immediately.
- **Syncing**: When a user completes a quiz, the Attempt Service publishes the result to Kafka. The consumer receives the event and updates Redis, keeping it synchronized in real-time.

### 🗣️ How to explain in an interview:
> *"To support real-time high-performance leaderboards, I avoided slow database queries and instead used Redis Sorted Sets (ZSets). Whenever a user submits a quiz, Attempt Service updates their score in Redis using ZADD. We retrieve the top players instantly using ZREVRANGE in O(log(N)) time. This offloads read queries from PostgreSQL, allowing the leaderboard to scale to thousands of active users."*

---

## 6. Event-Driven Architecture using Kafka

### 💡 What is it?
When a major action happens (like submitting a quiz), many components want to react (e.g., record analytics, award badges, update XP, send emails). Using synchronous REST calls slows down the response. We use **Apache Kafka** to distribute these events asynchronously.

### ⚙️ How it works
- **Producer**: The service that performs the action publishes a JSON payload to a Kafka Topic (e.g. `quiz-attempts-topic`).
- **Broker**: Kafka stores this event in a persistent log.
- **Consumer**: Other services subscribe to this topic. They process the event in their own thread at their own pace. If a consumer goes offline, it picks up right where it left off (using commit offsets).
- **Retry & DLQ (Dead Letter Queue)**: If a consumer fails to process a message due to a database lock, it retries. If it continues to fail, the message is routed to a Dead Letter Queue (DLQ) topic so it doesn't block the rest of the queue.

### 🗣️ How to explain in an interview:
> *"I implemented an asynchronous event-driven pipeline using Apache Kafka. When a user submits a quiz attempt, an event is published to a Kafka topic. Subscribing microservices—like the analytics engine and the gamification tracker—consume this event asynchronously to calculate XP, update badges, and detect weak topics. This decouples the services, ensuring that even if the gamification service is down, the quiz submission still completes successfully."*

---

## 7. Real-Time Matchmaking via WebSockets

### 💡 What is it?
Standard HTTP is request-response. The server cannot push data to the client. For a live multiplayer quiz tournament, we need real-time bi-directional communication, which we implement using **WebSockets** and **STOMP**.

### ⚙️ How it works
- **WebSocket Protocol**: Upgrades an HTTP connection to a persistent TCP connection.
- **STOMP Broker**: A messaging protocol that defines routing frames (SEND, SUBSCRIBE, CONNECT).
- **Flow**:
  1. Users join a room and subscribe to `/topic/competition/{roomCode}`.
  2. When an opponent answers a question or scores a point, the client sends a message to the server.
  3. The server broadcasts the event to all subscribers on the room's topic channel, updating the live score list instantly on all screens.

### 🗣️ How to explain in an interview:
> *"For live multiplayer quiz tournaments, I used WebSockets with STOMP messaging protocol. Instead of having clients continuously poll the server for state updates (which wastes CPU and network bandwidth), WebSockets create a persistent bi-directional connection. Players subscribe to a room-specific topic, and when any player answers a question, the Competition Service broadcasts a score update payload. All opponents receive it instantly."*

---

## 8. Retrieval-Augmented Generation (RAG), Vector DBs & Spring AI

### 💡 What is it?
Large Language Models (LLMs like GPT-3.5 or Gemini) know general programming concepts but lack access to private project documents or local quiz context. **RAG** solves this by searching a database for relevant context and appending it to the LLM prompt.

### ⚙️ How it works
- **Embeddings**: Text is converted into mathematical vectors (arrays of numbers) representing its semantic meaning.
- **Vector DB (Qdrant)**: We store these embeddings in a specialized database like Qdrant.
- **Similarity Search**: When a user chats with the AI Learning Assistant:
  1. The assistant converts the user's query into an embedding.
  2. Qdrant performs a Cosine Similarity Search to find the most relevant document chunks.
  3. The assistant retrieves these text chunks, compiles a custom prompt (Context + Query), and sends it to the LLM.
  4. The LLM generates a highly accurate answer based on the local documents.
- **PDF parsing**: We use Apache PDFBox to parse uploaded study manuals, break them into chunks, generate embeddings, and load them into Qdrant in real-time.

### 🗣️ How to explain in an interview:
> *"To build the AI study features, I integrated Spring AI and implemented the RAG pattern using a Qdrant Vector Database. When a user uploads a study PDF, we parse it into chunks, convert those chunks into vector embeddings, and save them in Qdrant. When the user asks a question, we retrieve similar chunks using vector cosine similarity, inject them into the LLM system prompt as context, and get a precise, hallucination-free answer. I also used this to generate custom structured learning pathways."*

---

## 9. Distributed Tracing (Observability)

### 💡 What is it?
In microservices, a single click can trigger 5 different HTTP and Kafka calls. If something fails or takes 10 seconds, it's impossible to debug by looking at separate logs. **Distributed Tracing** links logs together.

### ⚙️ How it works
- **Micrometer Tracing**: Intercepts outgoing requests and creates a **Trace ID** (which identifies the overall transaction flow) and a **Span ID** (which identifies individual service tasks).
- **Propagation**: Micrometer automatically injects the Trace ID into HTTP headers (`traceparent`) and Kafka headers.
- **Zipkin**: Downstream services report their trace metrics to a central **Zipkin Server**, which displays a visual timeline showing how much time was spent in the Gateway, database queries, and microservices.

### 🗣️ How to explain in an interview:
> *"To make the system production-ready, I added observability using distributed tracing. Using Micrometer, every incoming user request gets a unique Trace ID injected into its headers. As the request travels from the Gateway to the Quiz Service, and publishes events via Kafka, this Trace ID is carried along. I used Zipkin to visualize these traces. This lets me identify performance bottlenecks and see exactly where an error occurred across the network."*

---

## 10. Real-World Troubleshooting Scenarios

Interviewers frequently ask: *"Tell me about a time you had to debug a complex issue in a microservice environment."* Here are three concrete, real-world troubleshooting scenarios based on QuizLY's development:

### Scenario A: Feign Client Security Context & Header Propagation
- **The Issue**: After adding Broken Object Level Authorization (BOLA) security checks in `attempt-service` (verifying `X-User-Id` request headers from the Gateway), recommendations in the AI service and quiz submission results stopped working. The logs showed Feign client requests were hitting the `AttemptServiceClientFallback`, returning empty lists.
- **The Cause**: The API Gateway propagates `X-User-Id` when requests come from clients, but service-to-service calls using OpenFeign bypass the Gateway. Because the Feign clients did not propagate these headers, the downstream `attempt-service` rejected them as unauthorized.
- **The Fix**: Updated the declarative `@FeignClient` interfaces to accept `@RequestHeader("X-User-Id")` parameters and pass them through when calling the endpoints.
- **🗣️ How to explain**:
  > *"When we implemented BOLA verification in our attempt service, we realized our service-to-service OpenFeign calls were failing silently because security headers injected by the API Gateway were not automatically propagated to downstream Feign calls. I modified the Feign interface declarations to accept request headers explicitly, propagating user security contexts across the internal microservice mesh."*

### Scenario B: AI Model Output Schema Alignment
- **The Issue**: Quizzes generated via the AI service evaluated to `0` score on submission, even when users selected the correct answers.
- **The Cause**: Admin-created quizzes stored the `correctAnswer` field as the option key (`optionA`, `optionB`, etc.). However, the LLM prompts and fallbacks in `ai-service` generated `correctAnswer` as the option's text value (e.g., `"Centralized configuration management"`). During submission, the scoring logic did a direct string check between user choices and correct answers, resulting in a mismatch.
- **The Fix**: Refined the LLM prompts in `AiQuizGeneratorService` and mock responses in `FallbackAiConfig` to strictly output option keys (`optionA`/`optionB`/etc.) rather than raw text.
- **🗣️ How to explain**:
  > *"We faced a data format misalignment where our AI service generated quiz answers as raw strings, but our backend and frontend expected structured option keys like 'optionA' or 'optionB'. I updated the system prompt templates and mock fallbacks to explicitly enforce JSON response schemas with option keys, restoring correct scoring computation."*

### Scenario C: WebSocket Type Safety & ClassCastException
- **The Issue**: During live multiplayer quiz lobbies, the server connection randomly dropped for some players, throwing `ClassCastException` in the console.
- **The Cause**: In `LobbyWebSocketController`, client payloads were parsed by directly casting values: `((Number) payload.get("userId")).longValue()`. If the user ID was serialized as a string from the client, the JVM threw a `ClassCastException` and abruptly terminated the socket session.
- **The Fix**: Refactored payload parsing by writing helper methods (`getLongValue` and `getIntegerValue`) that inspect the object type and dynamically parse strings if necessary, preventing class-cast failures.
- **🗣️ How to explain**:
  > *"In our WebSocket lobby server, we encountered random connection drops due to ClassCastExceptions when parsing incoming Stomp payloads. Clients occasionally serialized user IDs as strings instead of numbers. I refactored the payload parsing logic to use type-safe utility functions that validate payload types and dynamically parse strings, increasing real-time lobby stability."*
