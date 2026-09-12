import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

const savedHomesSlice = createSlice({
  name: 'savedHomes',
  initialState: [] as number[],
  reducers: {
    toggleSavedHome: (state, action: PayloadAction<number>) => {
      const index = state.indexOf(action.payload);
      if (index >= 0) state.splice(index, 1);
      else state.push(action.payload);
    },
  },
});

export const { toggleSavedHome } = savedHomesSlice.actions;
export const store = configureStore({ reducer: { savedHomes: savedHomesSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
