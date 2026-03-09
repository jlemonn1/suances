package com.suances.sala;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SalaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalaApplication.class, args);
    }
}
