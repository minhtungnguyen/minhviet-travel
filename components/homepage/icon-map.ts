import {
  Briefcase,
  Building2,
  Landmark,
  Plane,
  Ship,
  Sparkles,
  Users,
  Users2,
  type LucideIcon,
} from 'lucide-react'
import type { AudienceSegment, ServiceTile } from '@/types/homepage'

export const SERVICE_ICONS: Record<ServiceTile['icon'], LucideIcon> = {
  group: Users,
  briefcase: Briefcase,
  sparkles: Sparkles,
  building: Building2,
  ship: Ship,
  plane: Plane,
}

export const SEGMENT_ICONS: Record<AudienceSegment['icon'], LucideIcon> = {
  building: Building2,
  landmark: Landmark,
  users: Users2,
  briefcase: Briefcase,
}
