import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./Auth/AuthSlice";
import userReducer from "./User/UserSlice";

const allowedReducerKeys = ["auth"];

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
});

const persistConfig = {
  key: "root",
  version: 1, // Tăng version khi thay đổi cấu trúc rootReducer để kích hoạt migrate
  storage,
  whitelist: allowedReducerKeys,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Tắt kiểm tra serializable cho redux-persist
    }),
});

export const persistor = persistStore(store);
