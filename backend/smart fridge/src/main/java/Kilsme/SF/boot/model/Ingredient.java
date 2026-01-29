package Kilsme.SF.boot.model;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 食材实体类
 * 用于表示智能冰箱中的食材信息
 */
@Data
public class Ingredient {
    /**
     * 食材唯一标识ID
     */
    private Long id;
    /**
     * 食材名称
     */
    private String name;
    /**
     * 食材分类
     * 1=蔬菜,2=肉类,3=海鲜,4=主食,5=调味料
     */
    private Short category;
    /**
     * 计量单位，默认为"份"
     */
    private String unit = "份";
    /**
     * 每100克热量(卡路里)
     */
    private java.math.BigDecimal caloriesPer100g;
    /**
     * 每100克蛋白质含量(克)
     */
    private java.math.BigDecimal proteinPer100g;
    /**
     * 每100克碳水化合物含量(克)
     */
    private java.math.BigDecimal carbsPer100g;
    /**
     * 每100克脂肪含量(克)
     */
    private java.math.BigDecimal fatPer100g;
    /**
     * 过敏原信息
     */
    private String allergens;
    /**
     * 食材图片URL
     */
    private String imageUrl;
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}
