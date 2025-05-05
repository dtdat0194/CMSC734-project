import React, { createContext, useContext, useState, ReactNode } from 'react';

type CryptoContextType = {
  selectedCrypto: string | null;
  setSelectedCrypto: (crypto: string | null) => void;
};

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);

  return (
    <CryptoContext.Provider value={{ selectedCrypto, setSelectedCrypto }}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}; 