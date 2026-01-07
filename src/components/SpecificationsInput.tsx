import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface SpecificationRow {
  key: string;
  value: string;
}

interface SpecificationsInputProps {
  specifications: SpecificationRow[];
  onChange: (specifications: SpecificationRow[]) => void;
}

const SpecificationsInput = ({ specifications, onChange }: SpecificationsInputProps) => {
  const addRow = () => {
    onChange([...specifications, { key: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    onChange(specifications.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = specifications.map((row, i) =>
      i === index ? { ...row, [field]: newValue } : row
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Specifications</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </Button>
      </div>
      
      {specifications.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-sm font-medium text-muted-foreground">
            <span>Title</span>
            <span>Value</span>
            <span></span>
          </div>
          {specifications.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_40px] gap-2">
              <Input
                placeholder="e.g., Storage"
                value={row.key}
                onChange={(e) => updateRow(index, 'key', e.target.value)}
              />
              <Input
                placeholder="e.g., 256GB"
                value={row.value}
                onChange={(e) => updateRow(index, 'value', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeRow(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
