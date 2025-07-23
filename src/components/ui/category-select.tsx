"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
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
import { Button } from "@/components/ui/button";

export type CategoryOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

export type CategorySelectProps<T extends string = string> = {
  categories: {
    name: string;
    options: CategoryOption<T>[];
  }[];
  value: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

export function CategorySelect<T extends string = string>({
  categories,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
  triggerClassName,
}: CategorySelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(
    []
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  // Find the selected option label
  const selectedOption = React.useMemo(() => {
    for (const category of categories) {
      const option = category.options.find((option) => option.value === value);
      if (option) return option.label;
    }
    return null;
  }, [categories, value]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Filter options based on search query
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return categories;

    return categories
      .map((category) => ({
        ...category,
        options: category.options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.options.length > 0);
  }, [categories, searchQuery]);

  // Auto-expand categories when searching
  React.useEffect(() => {
    if (searchQuery) {
      setExpandedCategories(
        filteredCategories.map((category) => category.name)
      );
    }
  }, [searchQuery, filteredCategories]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", triggerClassName)}
          size="sm"
        >
          {selectedOption || placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[200px] p-0", className)}>
        <Command>
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder="Search..."
              className="h-9 border-0 outline-none focus-visible:ring-0"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          <CommandList>
            {filteredCategories.map((category) => (
              <React.Fragment key={category.name}>
                <CommandGroup>
                  <div
                    className="flex items-center px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => toggleCategory(category.name)}
                  >
                    {expandedCategories.includes(category.name) ? (
                      <ChevronDown className="mr-1.5 h-3 w-3" />
                    ) : (
                      <ChevronRight className="mr-1.5 h-3 w-3" />
                    )}
                    {category.name}
                  </div>
                </CommandGroup>
                {expandedCategories.includes(category.name) && (
                  <CommandGroup>
                    {category.options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          onValueChange(option.value);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                        onClick={() => {
                          onValueChange(option.value);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center flex-1">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 flex-shrink-0",
                              value === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="mr-2 truncate">{option.label}</span>
                        </div>
                        {option.icon && (
                          <div className="flex-shrink-0 ml-2">
                            {option.icon}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
