import { create } from 'zustand';
import { PersonnelResponse, CreatePersonnelRequest, UpdatePersonnelRequest, AnotacionPersonal, CreateAnotacionRequest } from '../types/personal';
import { personalService } from '../services/personalService';

interface PersonalState {
  personnel: PersonnelResponse[];
  anotaciones: AnotacionPersonal[];
  isLoading: boolean;
  loadingAnotaciones: boolean;
  fetchPersonnel: () => Promise<void>;
  addPersonnel: (person: PersonnelResponse) => void;
  updatePersonnel: (person: PersonnelResponse) => void;
  removePersonnel: (id: string) => void;
  createPersonnel: (data: CreatePersonnelRequest) => Promise<PersonnelResponse>;
  updatePerson: (id: string, data: UpdatePersonnelRequest) => Promise<PersonnelResponse>;
  changePersonnelRole: (id: string, role: string) => Promise<void>;
  deactivatePersonnel: (id: string) => Promise<void>;
  toggleModoEspia: (id: string, activo: boolean) => Promise<PersonnelResponse>;
  registrarAnotacion: (data: CreateAnotacionRequest) => Promise<AnotacionPersonal>;
  fetchAnotacionesByUsuario: (usuarioId: string) => Promise<void>;
  fetchAllAnotaciones: () => Promise<void>;
}

export const usePersonalStore = create<PersonalState>((set, get) => ({
  personnel: [],
  anotaciones: [],
  isLoading: false,
  loadingAnotaciones: false,

  fetchPersonnel: async () => {
    set({ isLoading: true });
    try {
      const data = await personalService.getAllPersonnel();
      set({ personnel: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching personnel:', error);
      set({ isLoading: false });
    }
  },

  addPersonnel: (person: PersonnelResponse) => {
    set((state) => ({ personnel: [...state.personnel, person] }));
  },

  updatePersonnel: (person: PersonnelResponse) => {
    set((state) => ({
      personnel: state.personnel.map((p) => (p.id === person.id ? person : p)),
    }));
  },

  removePersonnel: (id: string) => {
    set((state) => ({
      personnel: state.personnel.filter((p) => p.id !== id),
    }));
  },

  createPersonnel: async (data: CreatePersonnelRequest) => {
    const newPerson = await personalService.createPersonnel(data);
    get().addPersonnel(newPerson);
    return newPerson;
  },

  updatePerson: async (id: string, data: UpdatePersonnelRequest) => {
    const updated = await personalService.updatePersonnel(id, data);
    get().updatePersonnel(updated);
    return updated;
  },

  changePersonnelRole: async (id: string, role: string) => {
    await personalService.changeRole(id, { role: role as any });
    const updated = await personalService.getPersonnelById(id);
    get().updatePersonnel(updated);
  },

  deactivatePersonnel: async (id: string) => {
    await personalService.deactivatePersonnel(id);
    get().removePersonnel(id);
  },

  toggleModoEspia: async (id: string, activo: boolean) => {
    const updated = await personalService.toggleModoEspia(id, activo);
    get().updatePersonnel(updated);
    return updated;
  },

  registrarAnotacion: async (data: CreateAnotacionRequest) => {
    return await personalService.registrarAnotacion(data);
  },

  fetchAnotacionesByUsuario: async (usuarioId: string) => {
    set({ loadingAnotaciones: true });
    try {
      const data = await personalService.getAnotacionesByUsuario(usuarioId);
      set({ anotaciones: data, loadingAnotaciones: false });
    } catch (error) {
      console.error('Error fetching anotaciones:', error);
      set({ loadingAnotaciones: false });
    }
  },

  fetchAllAnotaciones: async () => {
    set({ loadingAnotaciones: true });
    try {
      const data = await personalService.getAllAnotaciones();
      set({ anotaciones: data, loadingAnotaciones: false });
    } catch (error) {
      console.error('Error fetching all anotaciones:', error);
      set({ loadingAnotaciones: false });
    }
  },
}));
