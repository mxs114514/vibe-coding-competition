package Kilsme.SF.boot;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("Kilsme.SF.boot.dao")
public class SFApplication {
    public static void main(String[] args) {
        SpringApplication.run(SFApplication.class, args);
    }
}
