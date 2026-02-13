import { BarChart3, Grid3X3, ClipboardList, Users, MessageSquare } from 'lucide-react';
import type { ElementType } from 'react';

export const METHOD_ICONS: Record<string, ElementType> = {
  'explore-audience': BarChart3,
  'chart-bar': BarChart3,
  'poll': ClipboardList,
  'clipboard-list': ClipboardList,
  'focus-group': Users,
  'users': Users,
  'users-search': Users,
  'grid-3x3': Grid3X3,
  'message-testing': MessageSquare,
  'message-square': MessageSquare,
};

export function getMethodIcon(methodId: string): ElementType {
  return METHOD_ICONS[methodId] ?? MessageSquare;
}
