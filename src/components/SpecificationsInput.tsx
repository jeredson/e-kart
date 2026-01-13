import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface SpecificationValue {
  value: string;
  color?: string;
  image?: string;
}

export interface SpecificationRow {
  key: string;
  values: SpecificationValue[];
}

interface SpecificationsInputProps {
  specifications: SpecificationRow[];
  onChange: (specifications: SpecificationRow[]) => void;
}

const colorPalette = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  '#808080', '#008000', '#000080', '#800000'
];

const SpecificationsInput = ({ specifications, onChange }: SpecificationsInputProps) => {
  const [showColorPicker, setShowColorPicker] = useState<{rowIndex: number, valueIndex: number} | null>(null);

  const addRow = () => {
    onChange([...specifications, { key: '', values: [{ value: '' }] }]);
  };

  const removeRow = (index: number) => {
    onChange(specifications.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= specifications.length) return;
    
    const updated = [...specifications];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const updateRowKey = (index: number, newKey: string) => {
    const updated = specifications.map((row, i) =>
      i === index ? { ...row, key: newKey } : row
    );
    onChange(updated);
  };

  const addValue = (rowIndex: number) => {
    const updated = specifications.map((row, i) =>
      i === rowIndex ? { ...row, values: [...row.values, { value: '' }] } : row
    );
    onChange(updated);
  };

  const removeValue = (rowIndex: number, valueIndex: number) => {
    const updated = specifications.map((row, i) =>
      i === rowIndex ? { ...row, values: row.values.filter((_, vi) => vi !== valueIndex) } : row
    );
    onChange(updated);
  };

  const updateValue = (rowIndex: number, valueIndex: number, field: keyof SpecificationValue, newValue: string) => {
    const updated = specifications.map((row, i) =>
      i === rowIndex ? {
        ...row,
        values: row.values.map((val, vi) =>
          vi === valueIndex ? { ...val, [field]: newValue } : val
        )
      } : row
    );
    onChange(updated);
  };

  const isColorSpec = (key: string) => {
    return key.toLowerCase().includes('color') || key.toLowerCase().includes('colour');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Specifications</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4 mr-1" />
          Add Specification
        </Button>
      </div>
      
      {specifications.length > 0 && (
        <div className="space-y-4">
          {specifications.map((row, rowIndex) => (
            <div key={rowIndex} className="border rounded-lg p-3 space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="e.g., Brand Color, RAM, Storage"
                  value={row.key}
                  onChange={(e) => updateRowKey(rowIndex, e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveRow(rowIndex, 'up')}
                    disabled={rowIndex === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveRow(rowIndex, 'down')}
                    disabled={rowIndex === specifications.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeRow(rowIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Values</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addValue(rowIndex)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Value
                  </Button>
                </div>
                
                {row.values.map((value, valueIndex) => (
                  <div key={valueIndex} className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="e.g., Prism Black, 8GB, 256GB"
                        value={value.value}
                        onChange={(e) => updateValue(rowIndex, valueIndex, 'value', e.target.value)}
                        className="flex-1"
                      />
                      
                      {isColorSpec(row.key) && (
                        <div className="relative">
                          <div
                            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                            style={{ backgroundColor: value.color || '#ffffff' }}
                            onClick={() => setShowColorPicker({rowIndex, valueIndex})}
                          />
                          {showColorPicker?.rowIndex === rowIndex && showColorPicker?.valueIndex === valueIndex && (
                            <div className="absolute top-10 right-0 z-50 bg-white border rounded-lg p-3 shadow-lg">
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                {colorPalette.map((color) => (
                                  <div
                                    key={color}
                                    className="w-6 h-6 rounded cursor-pointer border"
                                    style={{ backgroundColor: color }}
                                    onClick={() => {
                                      updateValue(rowIndex, valueIndex, 'color', color);
                                      setShowColorPicker(null);
                                    }}
                                  />
                                ))}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowColorPicker(null)}
                              >
                                Close
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeValue(rowIndex, valueIndex)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {isColorSpec(row.key) && (
                      <Input
                        placeholder="Image URL for this color variant"
                        value={value.image || ''}
                        onChange={(e) => updateValue(rowIndex, valueIndex, 'image', e.target.value)}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {specifications.length === 0 && (
        <p className="text-sm text-muted-foreground">No specifications added yet.</p>
      )}
    </div>
  );
};

export default SpecificationsInput;
