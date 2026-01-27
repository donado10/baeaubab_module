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
          <SelectItem value="non_conforme">Non conforme</SelectItem>
          <SelectItem value="indisponible">Indisponible</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
export function SelectContractType({
  onAction,
}: {
  onAction: (value: string) => void;
}) {
  return (
    <Select onValueChange={(value) => onAction(value)}>
      <SelectTrigger className="w-fit">
        <SelectValue className=" border-none" placeholder="Type de contrat" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Contrat</SelectLabel>
          <SelectItem value="Stage">Stage</SelectItem>
          <SelectItem value="CDD">CDD</SelectItem>
          <SelectItem value="CDI">CDI</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
