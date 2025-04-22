import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoggedIn: false,
  token: null,
  access_control: {},
};

const AuthSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAuth(state, { payload }) {
      state.isLoggedIn = payload.login;
      state.token = payload.token;
    },
    setUser(state, { payload }) {
      state.user = payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setAuth, setUser, logout } = AuthSlice.actions;

export default AuthSlice.reducer;
