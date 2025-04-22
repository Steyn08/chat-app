import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import profileSlice from "./slices/profileSlice.jsx";
import authSlice from "./slices/authSlice.jsx";

const persistConfig = {
  key: "root-chat-app",
  storage,
};
const rootReducer = combineReducers({
  profile: profileSlice,
  auth: authSlice,
});
const rootReducerPresested = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: rootReducerPresested,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // devTools: import.meta.env.DEV,
});
export const persistor = persistStore(store);
