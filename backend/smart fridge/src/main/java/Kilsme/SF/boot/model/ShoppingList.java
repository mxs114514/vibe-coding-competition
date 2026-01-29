package Kilsme.SF.boot.model;

import lombok.Data;

import java.time.LocalDateTime;


@Data
public class ShoppingList {
    /**
     * 购物清单ID
     */
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 购物清单名称，默认为"我的购物清单"
     */
    private String name = "我的购物清单";
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
