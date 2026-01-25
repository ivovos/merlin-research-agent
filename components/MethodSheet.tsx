import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  Check,
  X,
  BarChart3,
  Grid3X3,
  ClipboardList,
  Users,
  MessageSquare,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { methods, getMethodById, getVariantConfig, type FieldConfig } from '@/data/methods';
import { mockAudiences } from '@/data/mockData';

// Extended audience type that includes optional description
type AudienceWithDescription = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
};

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  'chart-bar': BarChart3,
  'grid-3x3': Grid3X3,
  'clipboard-list': ClipboardList,
  'users': Users,
  'users-search': Users,
  'message-square': MessageSquare,
};

interface MethodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethodId?: string;
  initialVariantId?: string;
  selectedAudience?: AudienceWithDescription;
  onSubmit?: (methodId: string, variantId: string | null, data: Record<string, unknown>) => void;
}

export const MethodSheet: React.FC<MethodSheetProps> = ({
  isOpen,
  onClose,
  initialMethodId,
  initialVariantId,
  selectedAudience,
  onSubmit,
}) => {
  // Get initial variant for a method
  const getDefaultVariant = (methodId: string): string | null => {
    const method = getMethodById(methodId);
    if (method?.entryStep?.options?.[0]) {
      return method.entryStep.options[0].leadsTo;
    }
    return null;
  };

  // Current method and variant state
  const [currentMethodId, setCurrentMethodId] = useState<string>(initialMethodId || 'message-testing');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariantId || getDefaultVariant(initialMethodId || 'message-testing')
  );
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // UI state
  const [methodSwitcherOpen, setMethodSwitcherOpen] = useState(false);

  // Get current method config
  const currentMethod = useMemo(() => getMethodById(currentMethodId), [currentMethodId]);

  // Get current variant config
  const currentVariant = useMemo(() => {
    if (!currentMethod || !selectedVariantId) return null;
    return getVariantConfig(currentMethod, selectedVariantId);
  }, [currentMethod, selectedVariantId]);

  // Reset form when method/variant changes
  useEffect(() => {
    setFormData({});
  }, [currentMethodId, selectedVariantId]);

  // Initialize with selected audience if provided
  useEffect(() => {
    if (selectedAudience) {
      setFormData(prev => ({ ...prev, audience: selectedAudience.id }));
    }
  }, [selectedAudience]);

  // Update method and auto-select first variant when initialMethodId changes
  useEffect(() => {
    if (initialMethodId) {
      setCurrentMethodId(initialMethodId);
      // Auto-select first variant for the new method
      const defaultVariant = getDefaultVariant(initialMethodId);
      setSelectedVariantId(initialVariantId || defaultVariant);
    }
  }, [initialMethodId, initialVariantId]);

  // Get fields to render
  const fieldsToRender = useMemo(() => {
    if (currentVariant?.fields) {
      return currentVariant.fields;
    }
    if (currentMethod?.fields) {
      return currentMethod.fields;
    }
    return null;
  }, [currentMethod, currentVariant]);

  // Handle form field changes
  const updateField = useCallback((fieldName: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(currentMethodId, selectedVariantId, formData);
    }
    onClose();
  }, [currentMethodId, selectedVariantId, formData, onSubmit, onClose]);

  // Get method icon
  const MethodIcon = currentMethod ? iconMap[currentMethod.icon] || MessageSquare : MessageSquare;

  // Check if form is valid (basic validation)
  const isValid = useMemo(() => {
    if (!fieldsToRender) return true;

    for (const [fieldName, config] of Object.entries(fieldsToRender)) {
      if (config.required) {
        const value = formData[fieldName];
        if (value === undefined || value === null || value === '') {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
      }
    }
    return true;
  }, [fieldsToRender, formData]);

  // Check if method has variants to show selector
  const hasVariants = currentMethod?.entryStep?.options && currentMethod.entryStep.options.length > 1;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[60%] sm:max-w-none flex flex-col overflow-hidden p-0">
        {/* Header with method switcher */}
        <SheetHeader className="flex flex-row items-center gap-3 p-6 pb-4 border-b flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
            <MethodIcon className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <Popover open={methodSwitcherOpen} onOpenChange={setMethodSwitcherOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <SheetTitle className="text-xl">{currentMethod?.name || 'Select Method'}</SheetTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-1" align="start">
                {methods.map((method) => {
                  const Icon = iconMap[method.icon] || MessageSquare;
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setCurrentMethodId(method.id);
                        setSelectedVariantId(getDefaultVariant(method.id));
                        setMethodSwitcherOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm outline-none hover:bg-accent",
                        currentMethodId === method.id && "bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-muted-foreground">{method.description}</div>
                      </div>
                      {currentMethodId === method.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
            <SheetDescription className="mt-1">
              {currentVariant?.subtitle || currentMethod?.purpose || currentMethod?.description}
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Variant selector - compact segmented control */}
          {hasVariants && currentMethod?.entryStep && (
            <div className="mb-6">
              <div className="inline-flex rounded-lg bg-muted p-1">
                {currentMethod.entryStep.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedVariantId(option.leadsTo)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-all",
                      selectedVariantId === option.leadsTo
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option.title}
                  </button>
                ))}
              </div>
              {/* Show description of selected variant */}
              {selectedVariantId && (
                <p className="text-sm text-muted-foreground mt-3">
                  {currentMethod.entryStep.options.find(o => o.leadsTo === selectedVariantId)?.description}
                </p>
              )}
            </div>
          )}

          {/* Form fields */}
          {fieldsToRender && (
            <div className="space-y-6">
              {Object.entries(fieldsToRender).map(([fieldName, config]) => (
                <FormField
                  key={fieldName}
                  name={fieldName}
                  config={config}
                  value={formData[fieldName]}
                  onChange={(value) => updateField(fieldName, value)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {currentVariant?.actions?.primary?.label || currentMethod?.actions?.primary?.label || 'Submit'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};


// Dynamic form field renderer
interface FormFieldProps {
  name: string;
  config: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

const FormField: React.FC<FormFieldProps> = ({ name, config, value, onChange }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter audiences based on search
  const filteredAudiences = useMemo(() => {
    const audiences = mockAudiences as AudienceWithDescription[];
    if (!searchQuery.trim()) return audiences;
    const query = searchQuery.toLowerCase();
    return audiences.filter(
      a => a.name.toLowerCase().includes(query) ||
           a.description?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedAudience = useMemo(() => {
    if (config.type === 'audience-selector' && value) {
      return (mockAudiences as AudienceWithDescription[]).find(a => a.id === value);
    }
    return null;
  }, [config.type, value]);

  // Render based on field type
  switch (config.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Input
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Textarea
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'select':
      if (config.options === 'dynamic') {
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{config.label}</Label>
            <Select value={(value as string) || ''} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder={config.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1 (Dynamic)</SelectItem>
                <SelectItem value="option2">Option 2 (Dynamic)</SelectItem>
              </SelectContent>
            </Select>
            {config.note && (
              <p className="text-xs text-muted-foreground italic">{config.note}</p>
            )}
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Select value={(value as string) || config.default?.toString() || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={config.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {(config.options as { value: string; label: string }[])?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'multi-select':
      const selectedValues = (value as string[]) || [];
      const options = config.options === 'dynamic'
        ? [{ value: 'opt1', label: 'Dynamic Option 1' }, { value: 'opt2', label: 'Dynamic Option 2' }]
        : (config.options as { value: string; label: string }[]) || [];

      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
              >
                {selectedValues.length > 0 ? (
                  <span>{selectedValues.length} selected</span>
                ) : (
                  <span className="text-muted-foreground">{config.placeholder || 'Select...'}</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
              {options.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (isSelected) {
                        onChange(selectedValues.filter(v => v !== opt.value));
                      } else {
                        onChange([...selectedValues, opt.value]);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'radio':
    case 'radio-group':
      const radioOptions = (config.options as { value: string; label: string }[]) || [];
      const isGrid = config.layout === 'grid-2x2';

      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          <RadioGroup
            value={(value as string) || config.default?.toString() || ''}
            onValueChange={onChange}
            className={isGrid ? 'grid grid-cols-2 gap-2' : 'space-y-2'}
          >
            {radioOptions.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  "flex items-center space-x-2",
                  isGrid && "border rounded-md p-3 cursor-pointer hover:bg-muted/50",
                  isGrid && value === opt.value && "border-primary bg-primary/5"
                )}
                onClick={isGrid ? () => onChange(opt.value) : undefined}
              >
                <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
                <Label htmlFor={`${name}-${opt.value}`} className="cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case 'toggle':
      return (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{config.label}</Label>
            {config.description && (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            )}
          </div>
          <Switch
            checked={(value as boolean) || false}
            onCheckedChange={onChange}
          />
        </div>
      );

    case 'audience-selector':
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
              >
                {selectedAudience ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-[10px] font-medium text-primary">
                      {selectedAudience.icon}
                    </div>
                    <span>{selectedAudience.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select an audience</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  placeholder="Search audiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <ScrollArea className="h-[200px]">
                <div className="p-1">
                  {filteredAudiences.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No audiences found.
                    </div>
                  ) : (
                    filteredAudiences.map((audience) => (
                      <button
                        key={audience.id}
                        onClick={() => {
                          onChange(audience.id);
                          setPopoverOpen(false);
                          setSearchQuery('');
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent",
                          value === audience.id && "bg-accent"
                        )}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-[10px] font-medium text-primary">
                          {audience.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{audience.name}</div>
                          {audience.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                              {audience.description}
                            </div>
                          )}
                        </div>
                        {value === audience.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => setPopoverOpen(false)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create new audience
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );

    case 'image-upload':
      const files = (value as File[]) || [];
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = config.accept?.map(a => `.${a}`).join(',') || 'image/*';
              input.multiple = (config.maxFiles || 1) > 1;
              input.onchange = (e) => {
                const selectedFiles = Array.from((e.target as HTMLInputElement).files || []);
                onChange([...files, ...selectedFiles].slice(0, config.maxFiles || 5));
              };
              input.click();
            }}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop images here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports {config.accept?.join(', ') || 'images'} up to {config.maxSize || '5MB'}
            </p>
          </div>
          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {files.map((_file, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(files.filter((_, i) => i !== idx));
                    }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'question-list':
    case 'message-list':
      const items = (value as Record<string, unknown>[]) || [];
      const itemSchema = config.itemSchema || {};
      const maxItems = config.maxItems || 10;
      const minItems = config.minItems || 1;

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">{config.label}</Label>
              {config.description && (
                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {config.type === 'question-list' ? `Question ${idx + 1}` : `Message ${idx + 1}`}
                  </span>
                  {items.length > minItems && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChange(items.filter((_, i) => i !== idx))}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {Object.entries(itemSchema).map(([fieldKey, fieldConfig]) => {
                  // Only render main text fields for simplicity
                  if (fieldConfig.type === 'textarea' || fieldConfig.type === 'text') {
                    return (
                      <div key={fieldKey} className="space-y-2">
                        <Textarea
                          placeholder={fieldConfig.placeholder}
                          value={(item[fieldKey] as string) || ''}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx] = { ...newItems[idx], [fieldKey]: e.target.value };
                            onChange(newItems);
                          }}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>

          {items.length < maxItems && (
            <Button
              variant="outline"
              onClick={() => onChange([...items, {}])}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {config.addButton?.label || `Add ${config.type === 'question-list' ? 'question' : 'message'}`}
              {config.addButton?.showCount && (
                <span className="text-muted-foreground ml-2">
                  ({items.length} of {maxItems})
                </span>
              )}
            </Button>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{config.label}</Label>
          <p className="text-xs text-muted-foreground">
            Unsupported field type: {config.type}
          </p>
        </div>
      );
  }
};

export default MethodSheet;
