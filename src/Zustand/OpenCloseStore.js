import { create } from "zustand";

const openCloseStore = create((set) => ({
  dealerModal: false,
  supplierModal: false,
  categoryModal: false,

  modalOpen: false,
  modalType: "",
  modalCallback: null,

  // openModal now accepts callback
  openModal: (type, callback = null) =>
    set({ modalOpen: true, modalType: type, modalCallback: callback }),

  closeModal: () =>
    set({ modalOpen: false, modalType: "", modalCallback: null }),

  setDealerModal: (val) => set({ dealerModal: val }),
  setSupplierModal: (val) => set({ supplierModal: val }),
  setCategoryModal: (val) => set({ categoryModal: val }),
}));

export default openCloseStore;
