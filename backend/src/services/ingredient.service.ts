// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

export class IngredientService {
  async getCommonIngredients(): Promise<{ [key: string]: string[] }> {
    // 返回预定义的常用食材列表
    return {
      蔬菜: ['番茄', '黄瓜', '土豆', '白菜', '胡萝卜', '洋葱', '青椒'],
      肉类: ['猪肉', '鸡肉', '牛肉', '羊肉', '鸭肉'],
      海鲜: ['虾', '鱼', '蟹', '鱿鱼', '贝类'],
      主食: ['米饭', '面条', '馒头', '面包', '饺子皮'],
      调味料: ['盐', '油', '酱油', '醋', '糖', '料酒', '生姜', '大蒜'],
    };
  }
}
