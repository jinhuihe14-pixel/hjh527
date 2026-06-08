import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'nebula-arena-admin-secret-key-2024'

export interface AdminInfo {
  id: string
  username: string
  role: 'super_admin' | 'admin' | 'operator'
  nickname: string
  permissions: string[]
}

export interface AdminRequest extends Request {
  admin?: AdminInfo
}

export function generateAdminToken(admin: AdminInfo): string {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function authMiddleware(req: AdminRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.admin = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      nickname: decoded.nickname || decoded.username,
      permissions: decoded.permissions || [],
    }
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: '认证令牌无效或已过期' })
  }
}

export function requirePermission(permission: string) {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: '未认证' })
    }

    if (req.admin.role === 'super_admin') {
      return next()
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({ success: false, message: '权限不足' })
    }

    next()
  }
}
