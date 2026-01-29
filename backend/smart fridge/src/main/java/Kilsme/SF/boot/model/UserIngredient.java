package Kilsme.SF.boot.model;

import lombok.Data;

/**
 * 用户食材实体类
 * 用于存储用户拥有的食材信息
 */
@Data
public class UserIngredient {
    /**
     * 主键ID
     */
    private Long id;
    /**
     * 用户ID
     */
    private Long userId;
    /**
     * 食材ID
     */
    private Long ingredientId;
    /**
     * 食材数量
     */
    private java.math.BigDecimal amount;
    /**
     * 数量单位
     */
    private String unit;
    /**
     * 状态: 1=已有, 2=缺少
     */
    private Short status;
}
