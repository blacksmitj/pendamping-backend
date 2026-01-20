import * as React from "react";
import { cn } from "@/lib/utils";

type SelectRootProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

type SelectValueProps = {
  placeholder?: string;
};

type ParsedConfig = {
  items: SelectItemProps[];
  triggerClassName?: string;
  placeholder?: string;
};

function collectConfig(nodes: React.ReactNode): ParsedConfig {
  const config: ParsedConfig = { items: [] };

  React.Children.forEach(nodes, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === SelectItem) {
      const props = child.props as any;
      config.items.push({
        value: props.value,
        children: props.children,
      });
    }

    if (child.type === SelectTrigger) {
      const props = child.props as any;
      if (props.className) {
        config.triggerClassName = props.className;
      }
    }

    if (child.type === SelectValue) {
      const props = child.props as any;
      if (props.placeholder) {
        config.placeholder = props.placeholder;
      }
    }

    const props = child.props as any;
    if (props?.children) {
      const nested = collectConfig(props.children);
      config.items.push(...nested.items);
      config.triggerClassName =
        config.triggerClassName ?? nested.triggerClassName;
      config.placeholder = config.placeholder ?? nested.placeholder;
    }
  });

  return config;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
  disabled,
}: SelectRootProps) {
  const config = collectConfig(children);

  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        config.triggerClassName,
        className
      )}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => onValueChange?.(event.target.value)}
      disabled={disabled}
    >
      {config.placeholder ? (
        <option value="" disabled hidden>
          {config.placeholder}
        </option>
      ) : null}
      {config.items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.children}
        </option>
      ))}
    </select>
  );
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  // The trigger is parsed by Select for styling; nothing is rendered here.
  return <>{children}</>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  // Content is parsed by Select; does not render separately.
  return <>{children}</>;
}

export function SelectItem({ children }: SelectItemProps) {
  // Items are parsed by Select; not rendered directly.
  return <>{children}</>;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  // Placeholder is parsed by Select; not rendered directly.
  return <>{placeholder}</>;
}
