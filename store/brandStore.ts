import { create } from 'zustand';
import { Brand } from '@/components/brand/BrandSwitcher';

type BrandState = {
  currentBrand: Brand | null;
  setCurrentBrand: (brand: Brand) => void;
};

export const useBrandStore = create<BrandState>((set) => ({
  currentBrand: null,
  setCurrentBrand: (brand) => set({ currentBrand: brand }),
}));