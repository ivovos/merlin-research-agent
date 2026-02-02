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

interface MethodSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethodId?: string;
  initialVariantId?: string;
  initialFormData?: Record<string, unknown>;
  initialTitle?: string;
  selectedAudience?: AudienceWithDescription;
  onSubmit?: (methodId: string, variantId: string | null, data: Record<string, unknown>, title: string) => void;
}

export const MethodSidePanel: React.FC<MethodSidePanelProps> = ({
  isOpen,
  onClose,
  initialMethodId,
  initialVariantId,
  initialFormData,
  initialTitle,
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
  const [formData, setFormData] = useState<Record<string, unknown>>(initialFormData || {});
  const [studyTitle, setStudyTitle] = useState<string>(initialTitle || '');

  // UI state
  const [methodSwitcherOpen, setMethodSwitcherOpen] = useState(false);

  // Get current method config
  const currentMethod = useMemo(() => getMethodById(currentMethodId), [currentMethodId]);

  // Get current variant config
  const currentVariant = useMemo(() => {
    if (!currentMethod || !selectedVariantId) return null;
    return getVariantConfig(currentMethod, selectedVariantId);
  }, [currentMethod, selectedVariantId]);

  // Reset form when method/variant changes (but keep initialFormData if same method/variant)
  useEffect(() => {
    if (initialFormData && initialMethodId === currentMethodId &&
        (initialVariantId === selectedVariantId || (!initialVariantId && !selectedVariantId))) {
      setFormData(initialFormData);
    } else if (!initialFormData) {
      setFormData({});
    }
  }, [currentMethodId, selectedVariantId, initialFormData, initialMethodId, initialVariantId]);

  // Initialize with selected audience if provided
  useEffect(() => {
    if (selectedAudience) {
      setFormData(prev => ({ ...prev, audience: selectedAudience.id }));
    }
  }, [selectedAudience]);

  // Update method, variant, and form data when props change
  useEffect(() => {
    if (initialMethodId) {
      setCurrentMethodId(initialMethodId);
      const defaultVariant = getDefaultVariant(initialMethodId);
      setSelectedVariantId(initialVariantId || defaultVariant);
    }
    if (initialFormData) {
      setFormData(initialFormData);
    }
    if (initialTitle) {
      setStudyTitle(initialTitle);
    }
  }, [initialMethodId, initialVariantId, initialFormData, initialTitle]);

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
      onSubmit(currentMethodId, selectedVariantId, formData, studyTitle);
    }
    onClose();
  }, [currentMethodId, selectedVariantId, formData, studyTitle, onSubmit, onClose]);

  // Get method icon
  const MethodIcon = currentMethod ? iconMap[currentMethod.icon] || MessageSquare : MessageSquare;

  // Check if form is valid
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

  // Check if method has variants
  const hasVariants = currentMethod?.entryStep?.options && currentMethod.entryStep.options.length > 1;

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-muted/50 border-l border-border",
        "w-[480px] flex-shrink-0",
        "animate-in slide-in-from-right duration-300"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b flex-shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted">
          <MethodIcon className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <Popover open={methodSwitcherOpen} onOpenChange={setMethodSwitcherOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <h2 className="text-base font-semibold truncate">{currentMethod?.name || 'Select Method'}</h2>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-1" align="start">
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
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none hover:bg-accent",
                      currentMethodId === method.id && "bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">{method.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{method.description}</div>
                    </div>
                    {currentMethodId === method.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {currentVariant?.subtitle || currentMethod?.purpose || currentMethod?.description}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Study title */}
        <div className="mb-5 space-y-1.5">
          <Label htmlFor="study-title" className="text-sm font-medium">
            Study Title
          </Label>
          <Input
            id="study-title"
            value={studyTitle}
            onChange={(e) => setStudyTitle(e.target.value)}
            placeholder="e.g., Mubi Retention Drivers"
            className="text-sm"
          />
        </div>

        {/* Variant selector */}
        {hasVariants && currentMethod?.entryStep && (
          <div className="mb-5">
            <div className="inline-flex rounded-lg bg-muted p-0.5">
              {currentMethod.entryStep.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedVariantId(option.leadsTo)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    selectedVariantId === option.leadsTo
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.title}
                </button>
              ))}
            </div>
            {selectedVariantId && (
              <p className="text-xs text-muted-foreground mt-2">
                {currentMethod.entryStep.options.find(o => o.leadsTo === selectedVariantId)?.description}
              </p>
            )}
          </div>
        )}

        {/* Form fields */}
        {fieldsToRender && (
          <div className="space-y-5">
            {Object.entries(fieldsToRender).map(([fieldName, config]) => (
              <SidePanelFormField
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
      <div className="flex items-center justify-between p-4 border-t flex-shrink-0 bg-background">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          Re-run {currentMethod?.name || 'Study'}
        </Button>
      </div>
    </div>
  );
};


// Compact form field renderer for side panel
interface SidePanelFormFieldProps {
  name: string;
  config: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

const SidePanelFormField: React.FC<SidePanelFormFieldProps> = ({ name, config, value, onChange }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  switch (config.type) {
    case 'text':
      return (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Input
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Textarea
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'select':
      if (config.options === 'dynamic') {
        return (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{config.label}</Label>
            <Select value={(value as string) || ''} onValueChange={onChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={config.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      }
      return (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Select value={(value as string) || config.default?.toString() || ''} onValueChange={onChange}>
            <SelectTrigger className="text-sm">
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
        ? [{ value: 'opt1', label: 'Option 1' }, { value: 'opt2', label: 'Option 2' }]
        : (config.options as { value: string; label: string }[]) || [];

      return (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal text-sm h-9"
              >
                {selectedValues.length > 0 ? (
                  <span>{selectedValues.length} selected</span>
                ) : (
                  <span className="text-muted-foreground">{config.placeholder || 'Select...'}</span>
                )}
                <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
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
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>
      );

    case 'radio':
    case 'radio-group':
      const radioOptions = (config.options as { value: string; label: string }[]) || [];
      const isGrid = config.layout === 'grid-2x2';

      return (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{config.label}</Label>
          <RadioGroup
            value={(value as string) || config.default?.toString() || ''}
            onValueChange={onChange}
            className={isGrid ? 'grid grid-cols-2 gap-1.5' : 'space-y-1.5'}
          >
            {radioOptions.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  "flex items-center space-x-2",
                  isGrid && "border rounded-md p-2.5 cursor-pointer hover:bg-muted/50",
                  isGrid && value === opt.value && "border-primary bg-primary/5"
                )}
                onClick={isGrid ? () => onChange(opt.value) : undefined}
              >
                <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} className="h-3.5 w-3.5" />
                <Label htmlFor={`${name}-${opt.value}`} className="cursor-pointer text-sm">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case 'toggle':
      return (
        <div className="flex items-center justify-between rounded-lg border p-3">
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
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal text-sm h-9"
              >
                {selectedAudience ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[9px] font-medium text-primary">
                      {selectedAudience.icon}
                    </div>
                    <span className="truncate">{selectedAudience.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select an audience</span>
                )}
                <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <div className="flex items-center border-b px-2.5 py-2">
                <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                <input
                  placeholder="Search audiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <ScrollArea className="h-[180px]">
                <div className="p-1">
                  {filteredAudiences.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
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
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[9px] font-medium text-primary">
                          {audience.icon}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium truncate">{audience.name}</div>
                        </div>
                        {value === audience.id && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      );

    case 'message-list':
    case 'question-list':
      const items = (value as Record<string, unknown>[]) || [];
      const maxItems = config.maxItems || 10;
      const minItems = config.minItems || 1;

      return (
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">{config.label}</Label>
            {config.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
            )}
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {config.type === 'question-list' ? `Q${idx + 1}` : `Message ${idx + 1}`}
                  </span>
                  {items.length > minItems && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChange(items.filter((_, i) => i !== idx))}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {config.itemSchema && Object.entries(config.itemSchema).map(([fieldKey, fieldConfig]) => {
                  if (fieldConfig.type === 'textarea' || fieldConfig.type === 'text') {
                    return (
                      <Textarea
                        key={fieldKey}
                        placeholder={fieldConfig.placeholder}
                        value={(item[fieldKey] as string) || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx] = { ...newItems[idx], [fieldKey]: e.target.value };
                          onChange(newItems);
                        }}
                        className="min-h-[60px] resize-none text-sm"
                      />
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
              size="sm"
              onClick={() => onChange([...items, {}])}
              className="w-full text-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add {config.type === 'question-list' ? 'question' : 'message'}
            </Button>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{config.label}</Label>
          <p className="text-xs text-muted-foreground">
            Field type: {config.type}
          </p>
        </div>
      );
  }
};

export default MethodSidePanel;
