/**
 * Inventory & Shop Domain Types for Grade 1 Math Gamified E-Learning
 */

export type ShopItemCategory = 'hat' | 'cape' | 'wand' | 'pet_food';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopItemCategory;
  cost: number;
  description: string;
  iconType: string;
}
