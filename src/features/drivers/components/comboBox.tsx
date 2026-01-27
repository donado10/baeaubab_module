import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IComboBoxProps {
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  options: { value: any; label: any }[];
}

export function MultipleSelector(combo: IComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string[]>([...combo.value]);
  const [items, setItems] = React.useState<{ value: any; label: any }[]>([
    ...combo.options,
  ]);

  const handleSetValue = (val: string) => {
    if (value.includes(val)) {
      value.splice(value.indexOf(val), 1);
      setValue(value.filter((item) => item !== val));
      combo.onChange(value.filter((item) => item !== val));
    } else {
      setValue((prevValue) => [...prevValue, val]);
      combo.onChange([...value, val]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full bg-touba-fifth" asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full overflow-x-scroll last:justify-between"
        >
          <div className="flex justify-start gap-2">
            {value?.length
              ? value.map((val, i) => (
                  <div
                    key={i}
                    className="rounded-xl border-none bg-touba-secondary px-2 py-1 text-xs font-semibold text-touba-fifth"
                  >
                    {items.find((item) => item.value === val)?.label}
                  </div>
                ))
              : "Selectionner élement..."}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full last:p-0">
        <Command className="w-full">
          <CommandInput placeholder="Recherche élément..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucun item trouvé.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    handleSetValue(item.value);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value.includes(item.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
