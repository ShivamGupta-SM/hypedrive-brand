import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useRef } from 'react';
import { create } from 'zustand';

//Create an interface for the properties in the store
type ModalStoreType = {
  isOpen: boolean;
  reference: React.RefObject<BottomSheetModalMethods | null>;
  toggleModal: () => void;
};

export const useModalStore = create<ModalStoreType>((set, get) => ({
  isOpen: false, // Stores whether the bottom sheet is open
  reference: useRef(null), // Reference to the BottomSheet component instance

  toggleModal: () => {
    // Toggles the `isOpen` state and interacts with the BottomSheet component
    set(state => ({ isOpen: !state.isOpen }));
    if (!get().isOpen) {
      get().reference.current?.close();
    } else {
      get().reference.current?.present();
    }
  },
}));
