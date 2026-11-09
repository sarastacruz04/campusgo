import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { refreshConnectivity } from './thunks';

// Estado general de la app que no es de un dominio de negocio: por ahora, la
// conexión a internet. Las preferencias de accesibilidad (tema, tamaño de texto,
// movimiento, vibración) siguen en theme/ThemeProvider porque los componentes de
// components/ui las leen y no deben conocer Redux (D-34).

export type SettingsState = {
  /** false cuando NetInfo informa que no hay internet. Empieza en true (optimista). */
  isOnline: boolean;
};

export const initialSettingsState: SettingsState = { isOnline: true };

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettingsState,
  reducers: {
    connectivityChanged(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshConnectivity.fulfilled, (state, action) => {
      state.isOnline = action.payload;
    });
  },
});

export const { connectivityChanged } = settingsSlice.actions;
export default settingsSlice.reducer;
