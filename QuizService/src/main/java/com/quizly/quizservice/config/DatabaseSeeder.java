package com.quizly.quizservice.config;

import com.quizly.quizservice.entity.Question;
import com.quizly.quizservice.entity.Quiz;
import com.quizly.quizservice.enums.Category;
import com.quizly.quizservice.enums.Difficulty;
import com.quizly.quizservice.repository.QuestionRepository;
import com.quizly.quizservice.repository.QuizRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public DatabaseSeeder(QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (quizRepository.count() > 0) {
            System.out.println("Database already contains seeded data. Skipping seeder.");
            return;
        }

        System.out.println("Initializing database seeding for QuizLY...");

        // 1. JAVA QUIZ
        Quiz javaQuiz = createQuiz("Java Core & OOP Essentials", 
                "Test your knowledge of Java runtime architecture, memory model, multithreading, and Object-Oriented Design patterns.", 
                Category.JAVA, Difficulty.MEDIUM, 20);
        javaQuiz = quizRepository.save(javaQuiz);
        seedJavaQuestions(javaQuiz);

        // 2. SPRING QUIZ
        Quiz springQuiz = createQuiz("Spring Boot & Enterprise Security", 
                "Covers Dependency Injection, Bean Lifecycles, Spring MVC, Spring Data JPA, and Spring Security filters.", 
                Category.SPRING, Difficulty.HARD, 25);
        springQuiz = quizRepository.save(springQuiz);
        seedSpringQuestions(springQuiz);

        // 3. REACT QUIZ
        Quiz reactQuiz = createQuiz("Modern React & Rendering Patterns", 
                "Test your understanding of the Virtual DOM, Hooks rules, component lifecycle, Context API, and state management.", 
                Category.REACT, Difficulty.MEDIUM, 15);
        reactQuiz = quizRepository.save(reactQuiz);
        seedReactQuestions(reactQuiz);

        // 4. DSA QUIZ
        Quiz dsaQuiz = createQuiz("Algorithms & Time Complexity", 
                "Evaluate your skills on sorting algorithms, tree traversals, graphs, stacks/queues, and dynamic programming.", 
                Category.DSA, Difficulty.HARD, 30);
        dsaQuiz = quizRepository.save(dsaQuiz);
        seedDsaQuestions(dsaQuiz);

        // 5. DBMS & SQL QUIZ
        Quiz dbmsQuiz = createQuiz("Relational DBMS & Advanced SQL Queries", 
                "Focuses on normalization forms, indexing, ACID transactions, subqueries, complex GROUP BY, and SQL Joins.", 
                Category.DBMS, Difficulty.MEDIUM, 20);
        dbmsQuiz = quizRepository.save(dbmsQuiz);
        seedDbmsQuestions(dbmsQuiz);

        // 6. OS QUIZ
        Quiz osQuiz = createQuiz("Operating Systems & Thread Scheduling", 
                "Check your mastery on memory paging, deadlock conditions, context switches, semaphores, and process states.", 
                Category.OS, Difficulty.MEDIUM, 15);
        osQuiz = quizRepository.save(osQuiz);
        seedOsQuestions(osQuiz);

        // 7. CN QUIZ
        Quiz cnQuiz = createQuiz("Computer Networks & Protocol Suite", 
                "Covers OSI layers, TCP/UDP sockets, DNS resolution, IP subnets, and security handshakes (TLS/HTTPs).", 
                Category.CN, Difficulty.EASY, 15);
        cnQuiz = quizRepository.save(cnQuiz);
        seedCnQuestions(cnQuiz);

        // 8. APTITUDE QUIZ
        Quiz aptitudeQuiz = createQuiz("Quantitative Aptitude & Logical Deduction", 
                "A collection of quantitative reasoning, arithmetic percentages, probabilities, and logical sequence analysis.", 
                Category.APTITUDE, Difficulty.EASY, 20);
        aptitudeQuiz = quizRepository.save(aptitudeQuiz);
        seedAptitudeQuestions(aptitudeQuiz);

        System.out.println("Seeding completed successfully! Created 8 quizzes with 40+ high-quality questions.");
    }

    private Quiz createQuiz(String title, String description, Category category, Difficulty difficulty, int timeLimit) {
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setCategory(category);
        quiz.setDifficulty(difficulty);
        quiz.setTimeLimit(timeLimit);
        return quiz;
    }

    private void seedJavaQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "Which component of JVM is responsible for converting bytecode into machine instructions dynamically?",
                "Class Loader Subsystem", "Garbage Collector", "JIT Compiler", "Execution Engine Interpreter",
                "optionC", "JVM Architecture", Category.JAVA, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "What happens when two distinct objects return the same integer from hashCode() in a java.util.HashMap?",
                "They are overwritten", "A collision occurs, and they are chained using a Linked List or Tree", "An exception is thrown", "The HashMap expands automatically",
                "optionB", "Collections Framework", Category.JAVA, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "Which of the following is true about java.lang.String class in Java?",
                "Strings are mutable", "Strings are immutable and stored in the String Constant Pool", "Strings are subclass of StringBuilder", "String is an interface",
                "optionB", "Strings", Category.JAVA, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "Which mechanism allows a Java object to be converted into a binary stream for network transmission?",
                "Encapsulation", "Polymorphism", "Serialization", "Abstraction",
                "optionC", "Java IO", Category.JAVA, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What is the difference between a volatile variable and a synchronized block in multithreaded Java?",
                "Volatile ensures atomicity only", "Volatile ensures visibility of variable updates across threads, but not mutual exclusion", "Volatile locks the object instance", "There is no difference",
                "optionB", "Concurrency", Category.JAVA, Difficulty.HARD));

        questionRepository.saveAll(list);
    }

    private void seedSpringQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "Which Spring bean scope creates a single instance per Spring IoC Container?",
                "prototype", "request", "singleton", "session",
                "optionC", "Bean Scopes", Category.SPRING, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What annotation is used to tell Spring Boot to start scanning for components under the package?",
                "@Configuration", "@ComponentScan", "@SpringBootApplication", "@EnableAutoConfiguration",
                "optionC", "Spring Boot Core", Category.SPRING, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "In Spring AOP, what does a Joinpoint represent?",
                "The actual code executed when aspect is matched", "A point during execution of program, such as execution of a method", "The interface implemented by proxy", "An advice annotation",
                "optionB", "Aspect Oriented Programming", Category.SPRING, Difficulty.HARD));

        list.add(createQuestion(quiz, 
                "What is the role of @Repository annotation in Spring Data?",
                "It serves as a controller layer", "It handles security requests", "It marks the class as a DAO and translates database exceptions into Spring's DataAccessExceptions", "It manages bean creation",
                "optionC", "Spring Data", Category.SPRING, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "How does Spring Boot resolve circular dependencies between beans?",
                "It throws a BeanCurrentlyInCreationException on startup unless lazy initialization is enabled", "It ignores them", "It resolves them using reflection automatically", "It shuts down the server quietly",
                "optionA", "Dependency Injection", Category.SPRING, Difficulty.HARD));

        questionRepository.saveAll(list);
    }

    private void seedReactQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "What is the primary benefit of React's Virtual DOM?",
                "It directly updates the browser's HTML", "It minimizes actual DOM manipulation by calculating diffs in memory", "It runs JavaScript code faster", "It bypasses CSS styling",
                "optionB", "Virtual DOM", Category.REACT, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "Which Hook should you use to memoize a computationally expensive value in React?",
                "useState", "useCallback", "useMemo", "useRef",
                "optionC", "React Hooks", Category.REACT, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "According to Rules of Hooks, where can you call Hooks in React?",
                "Inside nested loops or conditional blocks", "Inside regular JavaScript helper functions", "At the top level of React function components or custom Hooks", "In class component constructors",
                "optionC", "Rules of Hooks", Category.REACT, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What is the difference between props and state in React?",
                "State is passed from parent to child; props are local", "Props are immutable parameters passed to components; state is mutable local data managed by the component itself", "Props are managed asynchronously only", "There is no difference",
                "optionB", "Component Lifecycle", Category.REACT, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "Why is it recommended to provide a unique 'key' prop to array items rendered in React?",
                "To style items uniquely in CSS", "To help React identify which items have changed, been added, or removed from the DOM", "To bind click handlers", "To trigger garbage collection",
                "optionB", "Reconciliation", Category.REACT, Difficulty.MEDIUM));

        questionRepository.saveAll(list);
    }

    private void seedDsaQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "What is the average time complexity of searching for an element in a Balanced Binary Search Tree (BST)?",
                "O(1)", "O(n)", "O(log n)", "O(n log n)",
                "optionC", "Binary Search Trees", Category.DSA, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "Which data structure operates on a Last-In-First-Out (LIFO) model?",
                "Queue", "Stack", "Linked List", "Heap",
                "optionB", "Linear Data Structures", Category.DSA, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What is the worst-case time complexity of QuickSort?",
                "O(n log n)", "O(n)", "O(n^2)", "O(log n)",
                "optionC", "Sorting Algorithms", Category.DSA, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "Which algorithm is commonly used to find the shortest path in a weighted graph with non-negative edge weights?",
                "Depth First Search", "Kruskal's Algorithm", "Dijkstra's Algorithm", "Prim's Algorithm",
                "optionC", "Graph Algorithms", Category.DSA, Difficulty.HARD));

        list.add(createQuestion(quiz, 
                "What is the core principle of Dynamic Programming?",
                "Solve problems randomly", "Solve subproblems once and cache their results (memoization/tabulation) to avoid redundant calculations", "Use recursively without base cases", "Traverse graphs using stacks",
                "optionB", "Algorithm Paradigms", Category.DSA, Difficulty.HARD));

        questionRepository.saveAll(list);
    }

    private void seedDbmsQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "Which join returns all rows from the left table, and the matched rows from the right table, filled with NULLs if no match exists?",
                "INNER JOIN", "FULL OUTER JOIN", "RIGHT JOIN", "LEFT JOIN",
                "optionD", "SQL Joins", Category.DBMS, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What ACID property ensures that all operations in a transaction are completed successfully or none of them are?",
                "Consistency", "Isolation", "Atomicity", "Durability",
                "optionC", "ACID Transactions", Category.DBMS, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "Which SQL clause is used to filter records that are grouped by the GROUP BY clause?",
                "WHERE", "HAVING", "ORDER BY", "FILTER",
                "optionB", "Advanced SQL", Category.DBMS, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "A relation is in Third Normal Form (3NF) if it is in 2NF and has no:",
                "Partial dependencies", "Multivalued dependencies", "Transitive dependencies", "Trivial functional dependencies",
                "optionC", "Normalization", Category.DBMS, Difficulty.HARD));

        list.add(createQuestion(quiz, 
                "What index structure is most commonly used by MySQL InnoDB engine for storage indexing?",
                "B+ Tree", "Hash Table", "Binary Search Tree", "Red-Black Tree",
                "optionA", "Database Indexing", Category.DBMS, Difficulty.HARD));

        questionRepository.saveAll(list);
    }

    private void seedOsQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "What is context switching in operating systems?",
                "Swapping hard drives", "Saving the state of a process/thread and loading the state of another to resume execution", "Changing user profiles", "Updating operating system versions",
                "optionB", "Process Management", Category.OS, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "Which condition is NOT required for a Deadlock to occur?",
                "Mutual Exclusion", "No Preemption", "Circular Wait", "Preemptive Scheduling",
                "optionD", "Deadlocks", Category.OS, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "What causes thrashing in virtual memory systems?",
                "Too many background file downloads", "The operating system is spending more time swapping pages in and out of disk than executing actual instructions", "A CPU hardware failure", "Overclocking the processor",
                "optionB", "Memory Management", Category.OS, Difficulty.HARD));

        list.add(createQuestion(quiz, 
                "What is a critical section in process synchronization?",
                "The boot loader code", "A segment of code accessing shared resources that must not be concurrently accessed by multiple threads", "The operating system recovery screen", "Memory allocation table",
                "optionB", "Synchronization", Category.OS, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "Which scheduling algorithm allocates the CPU to the process that has the smallest remaining execution time?",
                "First-Come, First-Served", "Shortest Remaining Time First (SRTF)", "Round Robin", "Priority Scheduling",
                "optionB", "CPU Scheduling", Category.OS, Difficulty.MEDIUM));

        questionRepository.saveAll(list);
    }

    private void seedCnQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "Which layer of the OSI model is responsible for routing data packets across different networks?",
                "Data Link Layer", "Physical Layer", "Network Layer", "Transport Layer",
                "optionC", "OSI Model Layers", Category.CN, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What is the correct order of packets exchanged during a TCP 3-way handshake connection establishment?",
                "SYN, ACK, SYN-ACK", "SYN, SYN-ACK, ACK", "ACK, SYN, SYN-ACK", "SYN, DATA, ACK",
                "optionB", "TCP Protocols", Category.CN, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What transport layer protocol and port number does the Domain Name System (DNS) commonly use for standard resolutions?",
                "TCP Port 80", "UDP Port 53", "TCP Port 53", "UDP Port 80",
                "optionB", "Network Services", Category.CN, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "What mechanism is used by TCP to control flow, preventing a fast sender from overwhelming a slow receiver?",
                "Congestion Avoidance", "Sliding Window Flow Control", "Checksum Error Checking", "Timeout Retransmissions",
                "optionB", "Flow Control", Category.CN, Difficulty.HARD));

        list.add(createQuestion(quiz, 
                "How does HTTPS secure HTTP communications?",
                "It uses an encrypted database", "It encrypts the communication tunnel using TLS/SSL", "It hides the URL string", "It bypasses TCP sockets",
                "optionB", "Network Security", Category.CN, Difficulty.EASY));

        questionRepository.saveAll(list);
    }

    private void seedAptitudeQuestions(Quiz quiz) {
        List<Question> list = new ArrayList<>();
        list.add(createQuestion(quiz, 
                "A car travels at 60 km/h for 2 hours and then at 80 km/h for 3 hours. What is its average speed for the entire journey?",
                "70 km/h", "72 km/h", "75 km/h", "68 km/h",
                "optionB", "Speed & Distance", Category.APTITUDE, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "If 15% of a number is 45, what is 40% of the same number?",
                "120", "150", "90", "180",
                "optionA", "Percentages", Category.APTITUDE, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "A bag contains 3 red balls and 5 green balls. If a ball is drawn at random, what is the probability of drawing a red ball?",
                "3/5", "5/8", "3/8", "1/2",
                "optionC", "Probability", Category.APTITUDE, Difficulty.MEDIUM));

        list.add(createQuestion(quiz, 
                "In a class, the ratio of boys to girls is 4:5. If the total number of students is 36, how many girls are in the class?",
                "16", "20", "24", "18",
                "optionB", "Ratios", Category.APTITUDE, Difficulty.EASY));

        list.add(createQuestion(quiz, 
                "What number comes next in the logical sequence: 2, 6, 12, 20, 30, ...?",
                "40", "42", "45", "38",
                "optionB", "Logical Sequences", Category.APTITUDE, Difficulty.MEDIUM));

        questionRepository.saveAll(list);
    }

    private Question createQuestion(Quiz quiz, String questionText, String optA, String optB, String optC, String optD, 
                                    String correctOption, String topic, Category category, Difficulty difficulty) {
        Question q = new Question();
        q.setQuiz(quiz);
        q.setQuestion(questionText);
        q.setOptionA(optA);
        q.setOptionB(optB);
        q.setOptionC(optC);
        q.setOptionD(optD);
        q.setCorrectAnswer(correctOption);
        q.setTopic(topic);
        q.setCategory(category);
        q.setDifficulty(difficulty);
        return q;
    }
}
