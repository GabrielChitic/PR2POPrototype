import { Select } from "./ui/Select";
import type { Persona } from "../types";
import { PERSONAS } from "../data/mockData";

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export function PersonaSelector({
  selectedPersona,
  onPersonaChange,
}: PersonaSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const persona = PERSONAS.find((p) => p.id === e.target.value);
    if (persona) {
      onPersonaChange(persona);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="persona-select" className="text-sm font-medium">
        Acting as:
      </label>
      <Select
        id="persona-select"
        value={selectedPersona.id}
        onChange={handleChange}
        className="w-auto min-w-[250px]"
      >
        {PERSONAS.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.name} - {persona.role} ({persona.entity})
          </option>
        ))}
      </Select>
      <div className="text-xs text-muted-foreground">
        {selectedPersona.location}, {selectedPersona.region}
      </div>
    </div>
  );
}
