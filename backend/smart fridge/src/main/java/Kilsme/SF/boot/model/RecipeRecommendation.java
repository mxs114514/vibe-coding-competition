package Kilsme.SF.boot.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RecipeRecommendation {
    /**
     * 推荐记录ID
     */
    private Long id;
    /**
     * 用户ID
     */
    private Long userId;
    /**
     * 推荐食谱ID
     */
    private Long recommendedRecipeId;
    /**
     * 用餐时间
     * 1=早餐,2=午餐,3=晚餐,4=夜宵
     */
    private Short mealTime;
    /**
     * 预算限制
     */
    private java.math.BigDecimal budgetLimit;
    /**
     * 对用户是否健康
     */
    private Boolean isHealthyForUser;
    /**
     * 推荐理由
     */
    private String reason;
    /**
     * 生成时间
     */
    private LocalDateTime generatedAt;
}
