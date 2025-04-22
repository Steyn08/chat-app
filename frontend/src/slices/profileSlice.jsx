import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  sub_roles: [],
  settings: {},
};
const profileslice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setUser(state, { payload }) {
      state.user = payload;
      state.sub_roles = payload.sub_roles;
    },
    setSettings(state, { payload }) {
      state.settings = payload;
    },
  },
});
export const { setGoogleKey, setSettings, setUser } = profileslice.actions;
export default profileslice.reducer;
