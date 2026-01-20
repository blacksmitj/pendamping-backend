import { useMemo, useRef, useState } from "react";
import { ChevronDownIcon, Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const display = selectedDate
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(selectedDate)
    : placeholder;

  const handleSelect = (date?: Date) => {
    if (!date) {
      onChange("");
    } else {
      onChange(date.toISOString().split("T")[0]);
    }
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        className={cn(
          "flex h-10 w-full items-center justify-between text-left font-normal",
          !selectedDate && "text-muted-foreground"
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {display}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
      {open ? (
        <div className="absolute z-50 mt-2 w-auto rounded-md border border-border bg-background p-2 shadow-lg">
          <DayPicker
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={handleSelect}
            fromYear={2000}
            toYear={new Date().getFullYear() + 5}
            weekStartsOn={1}
            className="p-2"
          />
        </div>
      ) : null}
    </div>
  );
}
