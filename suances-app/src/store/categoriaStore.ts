import { create } from 'zustand';
import { CategoriaResponse, CategoriaRequest, CategoriaTipo } from '../types/ingrediente';
import { cartaService } from '../services/cartaService';

interface CategoriaState {
  categorias: CategoriaResponse[];
  isLoading: boolean;
  fetchCategorias: (activo?: boolean, tipo?: CategoriaTipo) => Promise<void>;
  addCategoria: (categoria: CategoriaResponse) => void;
  updateCategoria: (categoria: CategoriaResponse) => void;
  removeCategoria: (id: string) => void;
}

export const useCategoriaStore = create<CategoriaState>((set) => ({
  categorias: [],
  isLoading: false,

  fetchCategorias: async (activo: boolean = true, tipo?: CategoriaTipo) => {
    set({ isLoading: true });
    try {
      const data = await cartaService.getCategorias(activo, tipo);
      set({ categorias: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching categorias:', error);
      set({ isLoading: false });
    }
  },

  addCategoria: (categoria: CategoriaResponse) => {
    set((state) => ({ categorias: [...state.categorias, categoria] }));
  },

  updateCategoria: (categoria: CategoriaResponse) => {
    set((state) => ({
      categorias: state.categorias.map((c) =>
        c.id === categoria.id ? categoria : c
      ),
    }));
  },

  removeCategoria: (id: string) => {
    set((state) => ({
      categorias: state.categorias.filter((c) => c.id !== id),
    }));
  },
}));
