"use client";

import {
  createContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";

interface XrayContextValue {
  xrayActive: boolean;
  toggleXray: () => void;
}

export const XrayContext = createContext<XrayContextValue>({
  xrayActive: false,
  toggleXray: () => {},
});

// Globale weergavemodus: NORMAL toont beschrijvingen, X-RAY toont de
// technische onderlaag (boomstructuren, deployment-details). Zelfde patroon
// als LanguageContext; bewust niet gepersisteerd — X-ray is een kijkmodus,
// geen voorkeur.
export function XrayProvider({ children }: { children: ReactNode }) {
  const [xrayActive, setXrayActive] = useState(false);

  const toggleXray = useCallback(() => {
    setXrayActive((previous) => !previous);
  }, []);

  return (
    <XrayContext.Provider value={{ xrayActive, toggleXray }}>
      {children}
    </XrayContext.Provider>
  );
}
