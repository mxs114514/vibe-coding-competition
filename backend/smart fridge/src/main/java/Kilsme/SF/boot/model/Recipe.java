package Kilsme.SF.boot.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Recipe {
    private Long id;                           // 食谱唯一标识符
    private String name;                       // 食谱名称
    // 1=中餐,2=西餐,3=日韩,4=东南亚
    private Short cuisine;                     // 菜系分类
    private Short tasteBase;                   // 基本口味 (1=酸,2=甜,3=苦,4=辣,5=咸,6=复合)
    private Short spiceLevel;                  // 辣度等级 (0=不辣,1=微辣,2=中辣,3=重辣,4=爆辣)

    private Integer cookingTimeMinutes;        // 烹饪时间(分钟)
    private Short difficulty;                  // 制作难度 (1=简单,2=中等,3=复杂)
    private String ingredientsJson;            // 食材列表(json格式) - 包含食材名称、数量、单位等信息
    private String stepsText;                  // 制作步骤文本 - 详细的烹饪步骤说明
    private String nutritionAnalysis;          // 营养成分分析 - JSON字符串格式，包含卡路里、蛋白质、维生素等营养信息
    private java.math.BigDecimal estimatedCostCny; // 预估成本(人民币)
    private String coverImageUrl;              // 封面图片URL
    // 1=AI,2=用户
    private Short sourceType = 1;              // 来源类型 (1=AI生成,2=用户上传)
    private Long authorUserId;                 // 作者用户ID - 如果是用户上传的食谱，则记录上传者ID
    private Boolean aiGenerated = true;        // 是否为AI生成 - 标识食谱是否由AI算法生成
    private LocalDateTime createdAt;           // 创建时间 - 记录食谱创建的时间戳
}
