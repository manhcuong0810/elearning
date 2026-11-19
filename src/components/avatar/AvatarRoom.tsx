'use client';

import React, { useState } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { defaultAudioManager } from '@/lib/audio-manager';
import { ShopItem, ShopItemCategory } from '@/types/inventory';
import rawShopItems from '@/data/seed/shop-items.json';

const SHOP_ITEMS: ShopItem[] = rawShopItems as ShopItem[];

const CATEGORY_LABELS: Record<ShopItemCategory | 'all', string> = {
  all: 'Tất Cả Quà',
  hat: 'Mũ Hiệp Sĩ',
  cape: 'Áo Choàng',
  wand: 'Đũa Phép',
  pet_food: 'Quà Cú Mèo',
};

function renderItemIconSvg(iconType: string) {
  switch (iconType) {
    case 'crown':
      return (
        <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
          <path
            d="M8 48L14 20L26 32L32 14L38 32L50 20L56 48H8Z"
            fill="#FFDE59"
            stroke="#D97706"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="18" r="4" fill="#FF66C4" />
          <circle cx="32" cy="12" r="5" fill="#5CE1E6" />
          <circle cx="50" cy="18" r="4" fill="#FF66C4" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
          <path
            d="M20 12H44L54 52C42 56 22 56 10 52L20 12Z"
            fill="#CB6CE6"
            stroke="#6B21A8"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="28" r="4" fill="#FFDE59" />
          <circle cx="24" cy="40" r="3" fill="#FFDE59" />
          <circle cx="40" cy="38" r="3.5" fill="#5CE1E6" />
        </svg>
      );
    case 'wand':
      return (
        <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
          <line
            x1="14"
            y1="50"
            x2="42"
            y2="22"
            stroke="#FF914D"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <polygon
            points="44,10 47,18 56,19 49,25 51,33 44,28 37,33 39,25 32,19 41,18"
            fill="#FFDE59"
            stroke="#D97706"
            strokeWidth="2"
          />
        </svg>
      );
    case 'apple':
      return (
        <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
          <circle
            cx="32"
            cy="36"
            r="18"
            fill="#FFDE59"
            stroke="#D97706"
            strokeWidth="3"
          />
          <path
            d="M32 18C32 12 38 10 42 12C40 16 36 18 32 18Z"
            fill="#7ED957"
            stroke="#15803D"
            strokeWidth="2"
          />
          <circle cx="26" cy="30" r="3" fill="#FEF08A" />
        </svg>
      );
    case 'hat':
      return (
        <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
          <ellipse cx="32" cy="48" rx="24" ry="6" fill="#6B21A8" />
          <path
            d="M16 48L32 12L48 48H16Z"
            fill="#CB6CE6"
            stroke="#6B21A8"
            strokeWidth="3"
          />
          <circle cx="32" cy="32" r="4" fill="#FFDE59" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
          <path
            d="M32 16C42 16 48 26 44 40C40 50 32 54 32 54C32 54 24 50 20 40C16 26 22 16 32 16Z"
            fill="#FF66C4"
            stroke="#BE185D"
            strokeWidth="3"
          />
          <path d="M26 14L32 20L38 14" stroke="#7ED957" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
  }
}

export const AvatarRoom: React.FC = () => {
  const totalCoins = useProgressStore((state) => state.totalCoins);
  const totalExp = useProgressStore((state) => state.totalExp);
  const inventory = useProgressStore((state) => state.inventory);
  const equippedItems = useProgressStore((state) => state.equippedItems);
  const purchaseItem = useProgressStore((state) => state.purchaseItem);
  const equipItem = useProgressStore((state) => state.equipItem);
  const unequipItem = useProgressStore((state) => state.unequipItem);

  const [selectedCategory, setSelectedCategory] = useState<ShopItemCategory | 'all'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    'Chào mừng Hiệp Sĩ Nhí về Nhà của Bé! Hãy dùng Xu vàng đổi quà cho mình và Cú Mèo nhé!'
  );
  const [feedbackTone, setFeedbackTone] = useState<'joy' | 'encourage'>('joy');

  const handleBuyItem = (item: ShopItem) => {
    const success = purchaseItem(item.id, item.cost);
    if (success) {
      defaultAudioManager.playSfx('cheer');
      setFeedbackTone('joy');
      setFeedbackMessage(
        `Tuyệt vời! Bé đã sở hữu "${item.name}"! Hãy bấm Trang bị để diện ngay nhé!`
      );
    } else {
      defaultAudioManager.playSfx('pop');
      setFeedbackTone('encourage');
      setFeedbackMessage(
        'Bé hãy đi thêm ải trên bản đồ để tích thêm Xu vàng nhé!'
      );
    }
  };

  const handleToggleEquip = (item: ShopItem) => {
    const isEquipped = equippedItems.includes(item.id);
    if (isEquipped) {
      unequipItem(item.id);
      defaultAudioManager.playSfx('click');
      setFeedbackTone('joy');
      setFeedbackMessage(`Bé đã cất "${item.name}" vào tủ đồ gọn gàng!`);
    } else {
      equipItem(item.id);
      defaultAudioManager.playSfx('correct');
      setFeedbackTone('joy');
      setFeedbackMessage(
        item.category === 'pet_food'
          ? `Măm măm! Cú Mèo thích "${item.name}" lắm đó, cảm ơn bé nha!`
          : `Oa! Bé diện "${item.name}" trông thật oai phong và đáng yêu!`
      );
    }
  };

  const filteredItems =
    selectedCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === selectedCategory);

  const hasKnightHat = equippedItems.includes('hat_knight');
  const hasWizardHat = equippedItems.includes('hat_wizard');
  const hasStarCape = equippedItems.includes('cape_star');
  const hasRainbowWand = equippedItems.includes('wand_rainbow');
  const hasGoldApple = equippedItems.includes('food_apple_gold');
  const hasMagicBerry = equippedItems.includes('food_berry_magic');

  return (
    <section
      className="w-full max-w-5xl mx-auto p-4 md:p-6 rounded-3xl bg-gradient-to-b from-amber-50 via-sky-50 to-purple-50 border-4 border-kid-yellow shadow-xl"
      aria-label="Nhà của Bé và Cú Mèo"
    >
      {/* Header Bar with Coins & EXP */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-amber-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-purple-900">
            🏰 Nhà Của Bé &amp; Cú Mèo
          </h1>
          <p className="text-sm md:text-base font-medium text-purple-700">
            Góc nhỏ ấm áp của Hiệp Sĩ Toán Học Lớp 1
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 border-2 border-amber-400 shadow-sm"
            title="Số Xu Vàng của bé"
          >
            <span className="text-2xl" role="img" aria-label="Xu vàng">
              🪙
            </span>
            <div>
              <span className="text-xs font-bold uppercase text-amber-800 block">
                Xu Vàng
              </span>
              <span
                data-testid="avatar-room-coins"
                className="text-xl font-black text-amber-900"
              >
                {totalCoins}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-100 border-2 border-sky-400 shadow-sm"
            title="Điểm Kinh Nghiệm của bé"
          >
            <span className="text-2xl" role="img" aria-label="Điểm kinh nghiệm">
              ⚡
            </span>
            <div>
              <span className="text-xs font-bold uppercase text-sky-800 block">
                Điểm EXP
              </span>
              <span
                data-testid="avatar-room-exp"
                className="text-xl font-black text-sky-900"
              >
                {totalExp}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mascot Encouraging Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`mb-6 p-4 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
          feedbackTone === 'joy'
            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
            : 'bg-amber-100 border-amber-500 text-amber-950'
        }`}
      >
        <span className="text-3xl shrink-0" role="img" aria-label="Cú Mèo nhắn nhủ">
          🦉
        </span>
        <p className="text-base md:text-lg font-bold">{feedbackMessage}</p>
      </div>

      {/* Interactive Stage: Knight Avatar & Cú Mèo Mascot SVG Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Child Knight Avatar Card */}
        <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-white border-4 border-sky-300 shadow-md overflow-hidden">
          <span className="px-3 py-1 mb-2 rounded-full bg-sky-100 text-sky-900 font-extrabold text-sm">
            🛡️ Hiệp Sĩ Toán Học Nhí
          </span>

          <svg
            viewBox="0 0 220 220"
            className="w-48 h-48 md:w-56 md:h-56"
            role="img"
            aria-label="Hình đại diện Hiệp Sĩ Nhí"
          >
            {/* Star Cape behind Avatar when equipped */}
            {hasStarCape && (
              <g data-testid="equipped-visual-cape_star">
                <path
                  d="M65 110 L40 195 C85 210 135 210 180 195 L155 110 Z"
                  fill="#9333EA"
                  stroke="#581C87"
                  strokeWidth="4"
                />
                <circle cx="65" cy="165" r="5" fill="#FFDE59" />
                <circle cx="155" cy="160" r="6" fill="#FFDE59" />
                <circle cx="110" cy="185" r="5" fill="#5CE1E6" />
              </g>
            )}

            {/* Body / Tunic */}
            <rect
              x="72"
              y="115"
              width="76"
              height="70"
              rx="22"
              fill="#38BDF8"
              stroke="#0284C7"
              strokeWidth="4"
            />
            {/* Shield Emblem on Chest */}
            <path
              d="M100 132 H120 V150 C120 158 110 164 110 164 C110 164 100 158 100 150 Z"
              fill="#FFDE59"
              stroke="#D97706"
              strokeWidth="2.5"
            />

            {/* Head */}
            <circle
              cx="110"
              cy="82"
              r="36"
              fill="#FDE68A"
              stroke="#D97706"
              strokeWidth="3.5"
            />
            {/* Rosy Cheeks */}
            <circle cx="88" cy="90" r="6" fill="#FDA4AF" />
            <circle cx="132" cy="90" r="6" fill="#FDA4AF" />
            {/* Happy Eyes */}
            <circle cx="96" cy="78" r="4.5" fill="#1E293B" />
            <circle cx="124" cy="78" r="4.5" fill="#1E293B" />
            {/* Big Smile */}
            <path
              d="M98 94 Q110 106 122 94"
              fill="none"
              stroke="#1E293B"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Golden Knight Hat when equipped */}
            {hasKnightHat && (
              <g data-testid="equipped-visual-hat_knight">
                <path
                  d="M70 58 L80 26 L100 42 L110 18 L120 42 L140 26 L150 58 Z"
                  fill="#FFDE59"
                  stroke="#B45309"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <circle cx="110" cy="16" r="5" fill="#EF4444" />
                <circle cx="80" cy="24" r="4" fill="#3B82F6" />
                <circle cx="140" cy="24" r="4" fill="#3B82F6" />
              </g>
            )}

            {/* Wizard Hat when equipped */}
            {hasWizardHat && (
              <g data-testid="equipped-visual-hat_wizard">
                <ellipse cx="110" cy="54" rx="46" ry="10" fill="#6B21A8" />
                <path
                  d="M80 54 L110 8 L140 54 Z"
                  fill="#A855F7"
                  stroke="#581C87"
                  strokeWidth="3.5"
                />
                <circle cx="110" cy="36" r="5" fill="#FFDE59" />
              </g>
            )}

            {/* Rainbow Wand when equipped */}
            {hasRainbowWand && (
              <g data-testid="equipped-visual-wand_rainbow">
                <line
                  x1="152"
                  y1="150"
                  x2="188"
                  y2="92"
                  stroke="#F97316"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle
                  cx="190"
                  cy="88"
                  r="14"
                  fill="#FFDE59"
                  stroke="#CA8A04"
                  strokeWidth="3"
                />
                <circle cx="190" cy="88" r="6" fill="#EC4899" />
              </g>
            )}
          </svg>

          <p className="mt-2 text-sm font-bold text-sky-900 text-center">
            {equippedItems.length > 0
              ? `Đang diện ${equippedItems.length} món đồ siêu ngầu!`
              : 'Bé hãy mua và bấm Trang bị để diện đồ mới nhé!'}
          </p>
        </div>

        {/* Cú Mèo Mascot Card */}
        <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-white border-4 border-amber-300 shadow-md overflow-hidden">
          <span className="px-3 py-1 mb-2 rounded-full bg-amber-100 text-amber-900 font-extrabold text-sm">
            🦉 Bạn Đồng Hành Cú Mèo
          </span>

          <svg
            viewBox="0 0 220 220"
            className="w-48 h-48 md:w-56 md:h-56"
            role="img"
            aria-label="Linh vật Cú Mèo Thông Thái"
          >
            {/* Owl Body */}
            <ellipse
              cx="110"
              cy="125"
              rx="52"
              ry="58"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="4"
            />
            {/* Owl Belly */}
            <ellipse cx="110" cy="138" rx="34" ry="38" fill="#FEF3C7" />
            {/* Owl Ear Tufts */}
            <polygon points="68,82 56,54 88,72" fill="#D97706" />
            <polygon points="152,82 164,54 132,72" fill="#D97706" />
            {/* Big Wise Eyes */}
            <circle
              cx="92"
              cy="98"
              r="18"
              fill="#FFFFFF"
              stroke="#78350F"
              strokeWidth="3.5"
            />
            <circle
              cx="128"
              cy="98"
              r="18"
              fill="#FFFFFF"
              stroke="#78350F"
              strokeWidth="3.5"
            />
            <circle cx="92" cy="98" r="8" fill="#1E293B" />
            <circle cx="128" cy="98" r="8" fill="#1E293B" />
            <circle cx="89" cy="94" r="3" fill="#FFFFFF" />
            <circle cx="125" cy="94" r="3" fill="#FFFFFF" />
            {/* Cute Beak */}
            <polygon
              points="104,108 116,108 110,120"
              fill="#FB923C"
              stroke="#9A3412"
              strokeWidth="2"
            />

            {/* Equipped Golden Apple for Cú Mèo */}
            {hasGoldApple && (
              <g data-testid="equipped-visual-food_apple_gold">
                <circle
                  cx="168"
                  cy="162"
                  r="18"
                  fill="#FFDE59"
                  stroke="#B45309"
                  strokeWidth="3"
                />
                <path
                  d="M168 144 C170 136 178 136 180 140"
                  stroke="#16A34A"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* Equipped Magic Berry for Cú Mèo */}
            {hasMagicBerry && (
              <g data-testid="equipped-visual-food_berry_magic">
                <circle
                  cx="52"
                  cy="164"
                  r="15"
                  fill="#EC4899"
                  stroke="#9D174D"
                  strokeWidth="3"
                />
                <circle cx="48" cy="160" r="2.5" fill="#FEF08A" />
                <circle cx="56" cy="166" r="2.5" fill="#FEF08A" />
              </g>
            )}
          </svg>

          <p className="mt-2 text-sm font-bold text-amber-900 text-center">
            {hasGoldApple || hasMagicBerry
              ? 'Cú Mèo đang thưởng thức món quà ngon tuyệt của bé!'
              : 'Tặng Táo Vàng hoặc Dâu Tây cho Cú Mèo thêm vui nhé!'}
          </p>
        </div>
      </div>

      {/* Category Filter Tabs (all >= 48x48px) */}
      <div
        className="flex flex-wrap items-center gap-2 mb-6"
        role="tablist"
        aria-label="Danh mục cửa hàng quà tặng"
      >
        {(Object.keys(CATEGORY_LABELS) as Array<ShopItemCategory | 'all'>).map(
          (catKey) => {
            const isActive = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  defaultAudioManager.playSfx('click');
                  setSelectedCategory(catKey);
                }}
                className={`btn-3d min-w-[48px] min-h-[48px] px-4 py-2.5 rounded-2xl font-black text-sm md:text-base transition-all ${
                  isActive
                    ? 'btn-3d-purple scale-105'
                    : 'btn-3d-white'
                }`}
              >
                {CATEGORY_LABELS[catKey]}
              </button>
            );
          }
        )}
      </div>

      {/* Shop Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isOwned = inventory.includes(item.id);
          const isEquipped = equippedItems.includes(item.id);

          return (
            <div
              key={item.id}
              data-testid={`shop-card-${item.id}`}
              className={`flex flex-col justify-between p-5 rounded-3xl border-4 bg-white shadow-md transition-transform hover:-translate-y-1 ${
                isEquipped
                  ? 'border-emerald-400 ring-4 ring-emerald-200/60'
                  : isOwned
                  ? 'border-sky-300'
                  : 'border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300 shadow-sm animate-bounce-gentle">
                    {renderItemIconSvg(item.iconType)}
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-200 border-2 border-amber-400 text-amber-950 font-black text-sm shadow-sm">
                    🪙 {item.cost} Xu
                  </span>
                </div>

                <h2 className="text-xl font-black text-purple-950 mb-1">
                  {item.name}
                </h2>
                <p className="text-sm text-slate-600 font-bold mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-2">
                {!isOwned ? (
                  <button
                    type="button"
                    data-testid={`buy-item-${item.id}`}
                    onClick={() => handleBuyItem(item)}
                    className="btn-3d btn-3d-yellow w-full min-w-[48px] min-h-[48px] px-4 py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>🛒 Đổi Quà ({item.cost} Xu)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid={`equip-item-${item.id}`}
                    onClick={() => handleToggleEquip(item)}
                    className={`btn-3d w-full min-w-[48px] min-h-[48px] px-4 py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-md ${
                      isEquipped
                        ? 'btn-3d-green'
                        : 'btn-3d-blue'
                    }`}
                  >
                    <span>
                      {isEquipped ? '✨ Đang Trang Bị (Bấm để cất)' : '🎒 Trang Bị Ngay'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AvatarRoom;
