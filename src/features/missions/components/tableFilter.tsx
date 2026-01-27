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

export function SelectStatus({
  onAction,
}: {
  onAction: (value: string) => void;
}) {
  return (
    <Select onValueChange={(value) => onAction(value)}>
      <SelectTrigger className="w-fit">
        <SelectValue className=" border-none" placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Disponibilité</SelectLabel>
          <SelectItem value="echouees">Echouée</SelectItem>
          <SelectItem value="terminees">Terminée</SelectItem>
          <SelectItem value="en_cours">En cours</SelectItem>
          <SelectItem value="créer">Créer</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
export function SelectContractType() {
  return (
    <Select>
      <SelectTrigger className="w-fit">
        <SelectValue className=" border-none" placeholder="Type de contrat" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Contrat</SelectLabel>
          <SelectItem value="conforme">Stage</SelectItem>
          <SelectItem value="non_conforme">CDD</SelectItem>
          <SelectItem value="indisponible">CDI</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
