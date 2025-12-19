import { createContext, useContext, useState, type ReactNode } from "react";
import type { PurchaseRequisition, Persona } from "../types";
import { PERSONAS } from "../data/mockData";
import { getAllPRs } from "../services/prService";

interface PRStoreContext {
  prs: PurchaseRequisition[];
  currentPersona: Persona;
  setPersona: (persona: Persona) => void;
  addPR: (pr: PurchaseRequisition) => void;
  refreshPRs: () => void;
}

const PRContext = createContext<PRStoreContext | undefined>(undefined);

export function PRProvider({ children }: { children: ReactNode }) {
  const [prs, setPRs] = useState<PurchaseRequisition[]>([]);
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]);

  const setPersona = (persona: Persona) => {
    setCurrentPersona(persona);
  };

  const addPR = (pr: PurchaseRequisition) => {
    setPRs((prev) => [pr, ...prev]);
  };

  const refreshPRs = () => {
    setPRs(getAllPRs());
  };

  return (
    <PRContext.Provider
      value={{
        prs,
        currentPersona,
        setPersona,
        addPR,
        refreshPRs,
      }}
    >
      {children}
    </PRContext.Provider>
  );
}

export function usePRStore() {
  const context = useContext(PRContext);
  if (context === undefined) {
    throw new Error("usePRStore must be used within a PRProvider");
  }
  return context;
}
