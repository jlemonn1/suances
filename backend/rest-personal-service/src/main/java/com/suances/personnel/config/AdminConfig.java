package com.suances.personnel.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.admin")
public class AdminConfig {

    private String username = "admin";
    private String password = "admin123";
    private boolean createOnStartup = true;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isCreateOnStartup() {
        return createOnStartup;
    }

    public void setCreateOnStartup(boolean createOnStartup) {
        this.createOnStartup = createOnStartup;
    }
}
