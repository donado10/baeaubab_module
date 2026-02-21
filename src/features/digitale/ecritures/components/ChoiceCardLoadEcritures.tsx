import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEcritureEnteteLigneStore } from "../store/store";

export function RadioGroupChoiceCard({ onSelectSource }: { onSelectSource: (value: 'sage' | 'digital') => void }) {
    const store = useEcritureEnteteLigneStore()
    return (
        <RadioGroup defaultValue="plus" className="max-w-sm" onValueChange={(value) => { onSelectSource(value as 'sage' | 'digital'); store.setSourceEc(value as 'sage' | 'digital') }}>
            <FieldLabel htmlFor="sage-ec">
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>Sage</FieldTitle>
                        <FieldDescription>
                            Charger les écritures à partir de Sage
                        </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="sage" id="sage-ec" />
                </Field>
            </FieldLabel>
            <FieldLabel htmlFor="digital-ec">
                <Field orientation="horizontal">
                    <FieldContent>
                        <FieldTitle>Digital</FieldTitle>
                        <FieldDescription>Charger les écritures à partir de Digital.</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="digital" id="digital-ec" />
                </Field>
            </FieldLabel>
        </RadioGroup>
    )
}
