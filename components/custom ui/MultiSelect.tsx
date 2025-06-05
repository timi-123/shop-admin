// components/custom ui/MultiSelect.tsx - Cleaner Fixed version
"use client";

import { useState } from "react";
import { Badge } from "../ui/badge";
import { X, ChevronDown } from "lucide-react";

interface MultiSelectProps {
  placeholder: string;
  collections: CollectionType[];
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  placeholder,
  collections,
  value,
  onChange,
  onRemove,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  let selected: CollectionType[];

  if (value.length === 0) {
    selected = [];
  } else {
    selected = value.map((id) =>
      collections.find((collection) => collection._id === id)
    ).filter(Boolean) as CollectionType[];
  }

  const selectables = collections.filter((collection) => 
    !selected.some(s => s._id === collection._id) &&
    collection.title.toLowerCase().includes(inputValue.toLowerCase())
  ); 

  return (
    <div className="relative">
      {/* Main Input Container */}
      <div className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 min-h-9">
        <div className="flex flex-wrap gap-1 flex-1 items-center">
          {/* Selected Items */}
          {selected.map((collection) => (
            <Badge key={collection._id} variant="secondary" className="rounded px-2 py-0.5 text-xs h-5 flex items-center">
              {collection.title}
              <button 
                type="button" 
                className="ml-1 hover:text-red-500 outline-none" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(collection._id);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {/* Input Field */}
          <input
            placeholder={selected.length === 0 ? placeholder : "Add more..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[100px] py-0 border-0 text-sm"
          />
        </div>
        
        {/* Dropdown Arrow */}
        <div className="flex items-center">
          <ChevronDown 
            className={`h-4 w-4 opacity-50 transition-transform cursor-pointer ${open ? 'rotate-180' : ''}`}
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {selectables.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {inputValue ? 'No collections found' : 'No more collections available'}
            </div>
          ) : (
            selectables.map((collection) => (
              <div
                key={collection._id}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(collection._id);
                  setInputValue("");
                }}
              >
                {collection.title}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;