package Kilsme.SF.boot.model;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class User {
    private Long id;
    private String username;
    private String phone;
    private String password;
    private Integer heightCm;//身高
    private java.math.BigDecimal weightKg;//体重
    // 1=男，2=女，3=其他
    private Short gender;
    private LocalDateTime createdAt;
}
