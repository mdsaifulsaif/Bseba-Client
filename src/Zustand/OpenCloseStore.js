import { create } from "zustand";

const openCloseStore = create((set) => ({
  dealerModal: false,
  supplierModal: false,
  categoryModal: false,

  modalOpen: false,
  modalType: "",

  openModal: (type) => set({ modalOpen: true, modalType: type }),
  closeModal: () => set({ modalOpen: false, modalType: "" }),

  // ================

  setDealerModal: (val) => {
    set({ dealerModal: val });
  },
  setSupplierModal: (val) => {
    set({ supplierModal: val });
  },
  setCategoryModal: (val) => {
    set({ categoryModal: val });
  },
}));

export default openCloseStore;
