import { Router, Request, Response } from 'express';
import { DataStore } from '../../data/DataStore';
import { ShopItem, InventoryItem, ItemType } from '@nebula/shared';

const router = Router();

interface AuthRequest extends Request {
  dataStore?: DataStore;
  userId?: string;
}

router.get('/items', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const { type, rarity } = req.query;

  let items = dataStore.getShopItems();

  if (type) {
    items = items.filter((item) => item.type === type);
  }
  if (rarity) {
    items = items.filter((item) => item.rarity === rarity);
  }

  res.json({
    items,
    total: items.length,
  });
});

router.get('/item/:itemId', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const item = dataStore.getShopItem(req.params.itemId);

  if (!item) {
    return res.status(404).json({ error: '商品不存在' });
  }

  res.json(item);
});

router.post('/buy', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { itemId, count = 1 } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: '缺少商品ID' });
  }

  const item = dataStore.getShopItem(itemId);
  if (!item) {
    return res.status(404).json({ error: '商品不存在' });
  }

  const user = dataStore.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const totalPrice = item.price * count;

  if (item.currency === 'coins' && user.coins < totalPrice) {
    return res.status(400).json({ error: '金币不足' });
  }
  if (item.currency === 'diamonds' && user.diamonds < totalPrice) {
    return res.status(400).json({ error: '钻石不足' });
  }

  if (item.currency === 'coins') {
    dataStore.addCoins(userId, -totalPrice);
  } else {
    dataStore.addDiamonds(userId, -totalPrice);
  }

  dataStore.addItemToInventory(userId, itemId, count);

  const updatedUser = dataStore.getUserById(userId)!;

  res.json({
    success: true,
    item: {
      id: item.id,
      name: item.name,
      count,
    },
    balance: {
      coins: updatedUser.coins,
      diamonds: updatedUser.diamonds,
    },
  });
});

router.get('/backpack', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;

  const inventory = dataStore.getInventory(userId);
  const items: (InventoryItem & { item: ShopItem | undefined })[] = [];

  for (const [itemId, invItem] of inventory.entries()) {
    items.push({
      ...invItem,
      item: dataStore.getShopItem(itemId),
    });
  }

  res.json({
    items,
    total: items.length,
  });
});

router.post('/use-item', (req: AuthRequest, res: Response) => {
  const dataStore = req.dataStore!;
  const userId = req.userId!;
  const { itemId, count = 1 } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: '缺少道具ID' });
  }

  const inventory = dataStore.getInventory(userId);
  const invItem = inventory.get(itemId);

  if (!invItem || invItem.count < count) {
    return res.status(400).json({ error: '道具数量不足' });
  }

  const item = dataStore.getShopItem(itemId);
  if (!item) {
    return res.status(404).json({ error: '道具不存在' });
  }

  if (item.type !== ItemType.CONSUMABLE) {
    return res.status(400).json({ error: '该道具不可使用' });
  }

  const success = dataStore.removeItemFromInventory(userId, itemId, count);
  if (!success) {
    return res.status(500).json({ error: '使用道具失败' });
  }

  if (item.attributes?.healAmount) {
    // 战斗中使用的话由游戏服务器处理，这里只是模拟
  }

  res.json({
    success: true,
    used: count,
    remaining: (invItem.count - count),
    effect: item.attributes,
  });
});

export { router as shopRouter };
