package Kilsme.SF.boot.model;

import lombok.Data;

import java.time.LocalDateTime;


/**
 * 用户尝试过的食谱记录实体类
 * 记录用户对食谱的评分和评论
 */
@Data
public class RecipeTried {
    /**
     * 主键ID
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
     * 评分 (0-5分)
     */
    private Short rating;
    
    /**
     * 评论内容
     */
    private String comment;
    
    /**
     * 尝试时间
     */
    private LocalDateTime triedAt;
}
