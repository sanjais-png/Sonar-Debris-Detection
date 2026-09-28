export type DebrisClassId = 'ship_wreck' | 'cylinder' | 'pipe' | 'ghost_net';

export interface DebrisClassConfig {
  id: DebrisClassId;
  label: string;
  name: string;
  color: string;
  description: string;
}

export const DEBRIS_CLASSES: DebrisClassConfig[] = [
  {
    id: 'ship_wreck',
    label: 'Ship wreck',
    name: 'Ship wreck',
    color: '#6B84A8',
    description: 'Sunken vessel or large acoustic structure fragment',
  },
  {
    id: 'cylinder',
    label: 'Cylinder',
    name: 'Cylinder',
    color: '#C9A96E',
    description: 'Submerged gas or storage cylinder',
  },
  {
    id: 'pipe',
    label: 'Pipe',
    name: 'Pipe',
    color: '#7AA1A6',
    description: 'Industrial or dredge piping segment',
  },
  {
    id: 'ghost_net',
    label: 'Ghost net',
    name: 'Ghost net',
    color: '#9B8AAE',
    description: 'Discarded fishing net or webbed line',
  },
];

export function getDebrisClassInfo(id: string): DebrisClassConfig {
  const found = DEBRIS_CLASSES.find((c) => c.id === id || c.label === id || c.name === id);
  if (found) return found;
  return DEBRIS_CLASSES[0];
}
