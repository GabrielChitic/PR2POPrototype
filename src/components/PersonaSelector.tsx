import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Persona } from "@/types";
import { PERSONAS } from "@/data/mockData";

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export function PersonaSelector({
  selectedPersona,
  onPersonaChange,
}: PersonaSelectorProps) {
  const handleChange = (value: string) => {
    const persona = PERSONAS.find((p) => p.id === value);
    if (persona) {
      onPersonaChange(persona);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="persona-select" className="text-sm font-medium">
        Acting as:
      </label>
      <Select value={selectedPersona.id} onValueChange={handleChange}>
        <SelectTrigger className="w-auto min-w-[250px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERSONAS.map((persona) => (
            <SelectItem key={persona.id} value={persona.id}>
              {persona.name} - {persona.role} ({persona.entity})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="text-xs text-muted-foreground">
        {selectedPersona.location}, {selectedPersona.region}
      </div>
    </div>
  );
}
