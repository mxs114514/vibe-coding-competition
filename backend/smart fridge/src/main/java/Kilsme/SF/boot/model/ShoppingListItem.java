package Kilsme.SF.boot.model;

import lombok.Data;


/**
 * 购物清单项实体类
 * 用于表示购物清单中的单个商品项
 */
@Data
public class ShoppingListItem {
    /**
     * 商品项唯一标识符
     */
    private Long id;
    
    /**
     * 所属购物清单的ID
     */
    private Long shoppingListId;
    
    /**
     * 食材/商品名称
     */
    private String ingredientName;
    
    /**
     * 数量
     */
    private String amount;
    
    /**
     * 单位（如：个、千克、升等）
     */
    private String unit;
    
    /**
     * 分类（如：蔬菜、肉类、日用品等）
     */
    private String category;
    /**
     * 备注信息
     */
    private String note;
}
