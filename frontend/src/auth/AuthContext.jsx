import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [identity, setIdentity] = useState(null); // { aadhaarNumber, name, dob, gender, faceVerified }

  const login = useCallback((id) => {
    setIdentity(id);
  }, []);

  const logout = useCallback(() => {
    setIdentity(null);
  }, []);

  const markFaceVerified = useCallback(() => {
    setIdentity((prev) => prev ? { ...prev, faceVerified: true } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ identity, login, logout, markFaceVerified }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
