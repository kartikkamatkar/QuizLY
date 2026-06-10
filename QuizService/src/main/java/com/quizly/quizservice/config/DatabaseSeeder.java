package com.quizly.quizservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("DatabaseSeeder is active. All quizzes must be created via the Admin panel.");
    }
}
