package Kilsme.SF.boot.model;

import lombok.Data;

import java.time.LocalDateTime;


/**
 * 用户收藏食谱实体类
 * 用于存储用户收藏的食谱信息
 */
@Data
public class UserFavoriteRecipe {
    /**
     * 收藏记录ID
     */
    private Long id;
    /**
     * 用户ID
     */
    private Long userId;
    /**
     * 食谱ID
     */
    private Long recipeId;
    /**
     * 创建时间（收藏时间）
     */
    private LocalDateTime createdAt;
}
