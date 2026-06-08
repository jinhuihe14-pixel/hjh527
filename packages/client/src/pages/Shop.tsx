import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { 
  ShoppingBag, Coins, Gem, Package, Sparkles,
  Zap, Heart, Shield, Rocket, Star
} from 'lucide-react'
import { ItemRarity, ItemType } from '@nebula/shared'

interface ShopItem {
  id: string
  name: string
  description: string
  type: ItemType
  price: number
  currency: 'coins' | 'diamonds'
  rarity: ItemRarity
  isActive: boolean
  icon: string
  color: string
}

const shopItems: ShopItem[] = [
  {
    id: 'item_health_potion',
    name: '生命药剂',
    description: '使用后立即恢复50点生命值，战斗中可使用',
    type: ItemType.CONSUMABLE,
    price: 100,
    currency: 'coins',
    rarity: ItemRarity.COMMON,
    isActive: true,
    icon: '❤️',
    color: '#ef4444',
  },
  {
    id: 'item_energy_potion',
    name: '能量药剂',
    description: '使用后立即恢复50点能量，战斗中可使用',
    type: ItemType.CONSUMABLE,
    price: 80,
    currency: 'coins',
    rarity: ItemRarity.COMMON,
    isActive: true,
    icon: '⚡',
    color: '#eab308',
  },
  {
    id: 'item_speed_boost',
    name: '加速卷轴',
    description: '战斗中移动速度提升20%，持续10秒',
    type: ItemType.CONSUMABLE,
    price: 200,
    currency: 'coins',
    rarity: ItemRarity.RARE,
    isActive: true,
    icon: '💨',
    color: '#06b6d4',
  },
  {
    id: 'item_damage_boost',
    name: '伤害增益',
    description: '攻击伤害提升25%，持续15秒',
    type: ItemType.CONSUMABLE,
    price: 250,
    currency: 'coins',
    rarity: ItemRarity.RARE,
    isActive: true,
    icon: '💥',
    color: '#f97316',
  },
  {
    id: 'item_shield',
    name: '护盾道具',
    description: '获得一个吸收100点伤害的护盾，持续20秒',
    type: ItemType.CONSUMABLE,
    price: 300,
    currency: 'coins',
    rarity: ItemRarity.RARE,
    isActive: true,
    icon: '🛡️',
    color: '#3b82f6',
  },
  {
    id: 'skin_neon_blue',
    name: '霓虹蓝战机',
    description: '炫酷的霓虹蓝色战机皮肤，带专属拖尾效果',
    type: ItemType.SKIN,
    price: 500,
    currency: 'coins',
    rarity: ItemRarity.RARE,
    isActive: true,
    icon: '🔵',
    color: '#00f0ff',
  },
  {
    id: 'skin_cosmic_purple',
    name: '宇宙紫战机',
    description: '神秘的宇宙紫色战机皮肤，炫酷粒子效果',
    type: ItemType.SKIN,
    price: 800,
    currency: 'coins',
    rarity: ItemRarity.EPIC,
    isActive: true,
    icon: '🟣',
    color: '#8b5cf6',
  },
  {
    id: 'skin_legendary_gold',
    name: '传奇黄金战机',
    description: '稀有的传奇黄金战机皮肤，王者象征',
    type: ItemType.SKIN,
    price: 2000,
    currency: 'coins',
    rarity: ItemRarity.LEGENDARY,
    isActive: true,
    icon: '🏆',
    color: '#ffd700',
  },
  {
    id: 'skin_flame_red',
    name: '烈焰红战机',
    description: '热情似火的烈焰红战机皮肤',
    type: ItemType.SKIN,
    price: 600,
    currency: 'coins',
    rarity: ItemRarity.EPIC,
    isActive: true,
    icon: '🔥',
    color: '#ef4444',
  },
  {
    id: 'emote_thumbs_up',
    name: '点赞表情',
    description: '战斗中可发送点赞表情',
    type: ItemType.EMOTE,
    price: 150,
    currency: 'coins',
    rarity: ItemRarity.COMMON,
    isActive: true,
    icon: '👍',
    color: '#22c55e',
  },
  {
    id: 'trail_rainbow',
    name: '彩虹拖尾',
    description: '炫酷的彩虹色飞行拖尾特效',
    type: ItemType.TRAIL,
    price: 500,
    currency: 'coins',
    rarity: ItemRarity.EPIC,
    isActive: true,
    icon: '🌈',
    color: '#ec4899',
  },
  {
    id: 'trail_neon',
    name: '霓虹拖尾',
    description: '经典的霓虹光效拖尾',
    type: ItemType.TRAIL,
    price: 300,
    currency: 'coins',
    rarity: ItemRarity.RARE,
    isActive: true,
    icon: '✨',
    color: '#00f0ff',
  },
]

const rarityConfig = {
  [ItemRarity.COMMON]: { name: '普通', color: '#9ca3af', bg: 'bg-gray-500/20' },
  [ItemRarity.RARE]: { name: '稀有', color: '#3b82f6', bg: 'bg-blue-500/20' },
  [ItemRarity.EPIC]: { name: '史诗', color: '#8b5cf6', bg: 'bg-purple-500/20' },
  [ItemRarity.LEGENDARY]: { name: '传奇', color: '#f59e0b', bg: 'bg-yellow-500/20' },
}

function Shop() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<'all' | ItemType>('all')
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const tabs = [
    { key: 'all', label: '全部', icon: ShoppingBag },
    { key: ItemType.CONSUMABLE, label: '道具', icon: Package },
    { key: ItemType.SKIN, label: '皮肤', icon: Sparkles },
    { key: ItemType.TRAIL, label: '拖尾', icon: Zap },
  ]

  const filteredItems = activeTab === 'all'
    ? shopItems.filter(item => item.isActive)
    : shopItems.filter(item => item.type === activeTab && item.isActive)

  const handleBuy = async (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId)
    if (!item) return

    if (item.currency === 'coins' && (user?.coins || 0) < item.price) {
      alert('金币不足')
      return
    }

    setPurchasing(itemId)
    
    setTimeout(() => {
      setPurchasing(null)
      alert(`购买成功：${item.name}`)
    }, 500)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-orbitron text-2xl font-bold text-nebula-text flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-nebula-primary" />
          商城
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 glass-card px-4 py-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-rajdhani font-semibold text-yellow-400">
              {user?.coins?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2">
            <Gem className="w-5 h-5 text-cyan-400" />
            <span className="font-rajdhani font-semibold text-cyan-400">
              {user?.diamonds?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-rajdhani font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-nebula-primary/20 text-nebula-primary border border-nebula-primary/50'
                  : 'text-nebula-text-secondary hover:text-nebula-text hover:bg-nebula-bg-lighter/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item, index) => {
          const rarity = rarityConfig[item.rarity]
          
          return (
            <div
              key={item.id}
              className="glass-card glass-card-hover p-4 animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative mb-4">
                <div 
                  className="w-full h-32 rounded-lg flex items-center justify-center text-5xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                    boxShadow: `inset 0 0 30px ${item.color}10`
                  }}
                >
                  {item.icon}
                </div>
                <span 
                  className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded font-rajdhani font-semibold ${rarity.bg}`}
                  style={{ color: rarity.color }}
                >
                  {rarity.name}
                </span>
              </div>
              
              <h3 
                className="font-rajdhani font-bold text-lg mb-1"
                style={{ color: item.color }}
              >
                {item.name}
              </h3>
              <p className="text-sm text-nebula-text-secondary font-rajdhani mb-4 line-clamp-2 h-10">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {item.currency === 'coins' ? (
                    <Coins className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Gem className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className={`font-orbitron font-bold ${
                    item.currency === 'coins' ? 'text-yellow-400' : 'text-cyan-400'
                  }`}>
                    {item.price}
                  </span>
                </div>
                
                <button
                  onClick={() => handleBuy(item.id)}
                  disabled={purchasing === item.id}
                  className={`px-4 py-1.5 rounded-lg text-sm font-rajdhani font-semibold transition-all ${
                    purchasing === item.id
                      ? 'bg-nebula-bg-lighter text-nebula-text-secondary'
                      : 'bg-nebula-primary/20 text-nebula-primary hover:bg-nebula-primary/30'
                  }`}
                  style={{ 
                    boxShadow: purchasing === item.id ? 'none' : `0 0 10px ${item.color}30` 
                  }}
                >
                  {purchasing === item.id ? '...' : '购买'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-nebula-text-secondary font-rajdhani">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>暂无商品</p>
        </div>
      )}
    </div>
  )
}

export default Shop
