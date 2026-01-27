import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectAvailability({
  onAction,
}: {
  onAction: (value: string) => void;
}) {
  return (
    <Select onValueChange={(value) => onAction(value)}>
      <SelectTrigger className="w-fit">
        <SelectValue className=" border-none" placeholder="Disponibilité" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Disponibilité</SelectLabel>
          <SelectItem value="disponible">Disponible</SelectItem>
          <SelectItem value="en_mission">En Mission</SelectItem>
          <SelectItem value="indisponible">Indisponible</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

