package com.suances.personnel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PersonnelApplication {

    public static void main(String[] args) {
        SpringApplication.run(PersonnelApplication.class, args);
    }
}
