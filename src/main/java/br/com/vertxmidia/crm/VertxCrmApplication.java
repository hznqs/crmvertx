package br.com.vertxmidia.crm;

import br.com.vertxmidia.crm.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class VertxCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(VertxCrmApplication.class, args);
    }
}
