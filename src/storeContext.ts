import { createContext } from 'react'
import type { Ctx } from './store'

export const StoreCtx = createContext<Ctx | null>(null)
