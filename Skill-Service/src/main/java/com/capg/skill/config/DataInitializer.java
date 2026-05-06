package com.capg.skill.config;

import com.capg.skill.entity.Skill;
import com.capg.skill.repository.SkillRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(SkillRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                Skill java = new Skill();
                java.setName("Java");
                java.setCategory("Programming");

                Skill angular = new Skill();
                angular.setName("Angular");
                angular.setCategory("Frontend");

                Skill python = new Skill();
                python.setName("Python");
                python.setCategory("Programming");

                repository.saveAll(List.of(java, angular, python));
                System.out.println("Default skills initialized.");
            }
        };
    }
}
