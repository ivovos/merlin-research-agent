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
  ArrowLeft,
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

// Extended audience type
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

interface MethodFullPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethodId?: string;
  initialVariantId?: string;
  initialFormData?: Record<string, unknown>;
  selectedAudience?: AudienceWithDescription;
  onSubmit?: (methodId: string, variantId: string | null, data: Record<string, unknown>, title: string) => void;
}

export const MethodFullPage: React.FC<MethodFullPageProps> = ({
  isOpen,
  onClose,
  initialMethodId,
  initialVariantId,
  initialFormData,
  selectedAudience,
  onSubmit,
}) => {
  const getDefaultVariant = (methodId: string): string | null => {
    const method = getMethodById(methodId);
    if (method?.entryStep?.options?.[0]) {
      return method.entryStep.options[0].leadsTo;
    }
    return null;
  };

  const [currentMethodId, setCurrentMethodId] = useState<string>(initialMethodId || 'message-testing');
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariantId || getDefaultVariant(initialMethodId || 'message-testing')
  );
  const [formData, setFormData] = useState<Record<string, unknown>>(initialFormData || {});
  const [studyTitle, setStudyTitle] = useState<string>('');

  const [methodSwitcherOpen, setMethodSwitcherOpen] = useState(false);

  const currentMethod = useMemo(() => getMethodById(currentMethodId), [currentMethodId]);

  const currentVariant = useMemo(() => {
    if (!currentMethod || !selectedVariantId) return null;
    return getVariantConfig(currentMethod, selectedVariantId);
  }, [currentMethod, selectedVariantId]);

  useEffect(() => {
    if (initialFormData && initialMethodId === currentMethodId &&
        (initialVariantId === selectedVariantId || (!initialVariantId && !selectedVariantId))) {
      setFormData(initialFormData);
    } else if (!initialFormData) {
      setFormData({});
    }
  }, [currentMethodId, selectedVariantId, initialFormData, initialMethodId, initialVariantId]);

  useEffect(() => {
    if (selectedAudience) {
      setFormData(prev => ({ ...prev, audience: selectedAudience.id }));
    }
  }, [selectedAudience]);

  useEffect(() => {
    if (initialMethodId) {
      setCurrentMethodId(initialMethodId);
      const defaultVariant = getDefaultVariant(initialMethodId);
      setSelectedVariantId(initialVariantId || defaultVariant);
    }
    if (initialFormData) {
      setFormData(initialFormData);
    }
  }, [initialMethodId, initialVariantId, initialFormData]);

  const fieldsToRender = useMemo(() => {
    if (currentVariant?.fields) {
      return currentVariant.fields;
    }
    if (currentMethod?.fields) {
      return currentMethod.fields;
    }
    return null;
  }, [currentMethod, currentVariant]);

  const updateField = useCallback((fieldName: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(currentMethodId, selectedVariantId, formData, studyTitle);
    }
    onClose();
  }, [currentMethodId, selectedVariantId, formData, studyTitle, onSubmit, onClose]);

  const MethodIcon = currentMethod ? iconMap[currentMethod.icon] || MessageSquare : MessageSquare;

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

  const hasVariants = currentMethod?.entryStep?.options && currentMethod.entryStep.options.length > 1;

  if (!isOpen) return null;

  return (
    <div className="flex-1 flex flex-col bg-background animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-5 border-b flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted">
              <MethodIcon className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <Popover open={methodSwitcherOpen} onOpenChange={setMethodSwitcherOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <h1 className="text-2xl font-semibold">{currentMethod?.name || 'Select Method'}</h1>
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-1" align="start">
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
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-accent",
                          currentMethodId === method.id && "bg-accent"
                        )}
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-xs text-muted-foreground">{method.description}</div>
                        </div>
                        {currentMethodId === method.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground mt-0.5">
                {currentVariant?.subtitle || currentMethod?.purpose || currentMethod?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">
            {/* Study title */}
            <div className="mb-8 space-y-2">
              <Label htmlFor="study-title" className="text-base font-medium">
                Study Title
              </Label>
              <Input
                id="study-title"
                value={studyTitle}
                onChange={(e) => setStudyTitle(e.target.value)}
                placeholder="Give your study a name..."
                className="text-base h-11"
              />
            </div>

            {/* Variant selector */}
            {hasVariants && currentMethod?.entryStep && (
              <div className="mb-8">
                <Label className="text-base font-medium mb-3 block">Study Type</Label>
                <div className="grid grid-cols-1 gap-3">
                  {currentMethod.entryStep.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedVariantId(option.leadsTo)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border text-left transition-all",
                        selectedVariantId === option.leadsTo
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        selectedVariantId === option.leadsTo
                          ? "border-primary"
                          : "border-muted-foreground/30"
                      )}>
                        {selectedVariantId === option.leadsTo && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{option.title}</div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form fields */}
            {fieldsToRender && (
              <div className="space-y-6">
                {Object.entries(fieldsToRender).map(([fieldName, config]) => (
                  <FullPageFormField
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
        </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-5 border-t flex-shrink-0 bg-background">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          size="lg"
        >
          {currentVariant?.actions?.primary?.label || currentMethod?.actions?.primary?.label || `Run ${currentMethod?.name || 'Study'}`}
        </Button>
      </div>
    </div>
  );
};


// Full-page form field renderer
interface FullPageFormFieldProps {
  name: string;
  config: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

const FullPageFormField: React.FC<FullPageFormFieldProps> = ({ name, config, value, onChange }) => {
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
        <div className="space-y-2">
          <Label className="text-base font-medium">{config.label}</Label>
          <Input
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="text-base h-11"
          />
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label className="text-base font-medium">{config.label}</Label>
          <Textarea
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[120px] resize-none text-base"
          />
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'select':
      if (config.options === 'dynamic') {
        return (
          <div className="space-y-2">
            <Label className="text-base font-medium">{config.label}</Label>
            <Select value={(value as string) || ''} onValueChange={onChange}>
              <SelectTrigger className="text-base h-11">
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
        <div className="space-y-2">
          <Label className="text-base font-medium">{config.label}</Label>
          <Select value={(value as string) || config.default?.toString() || ''} onValueChange={onChange}>
            <SelectTrigger className="text-base h-11">
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
        <div className="space-y-2">
          <Label className="text-base font-medium">{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal text-base h-11"
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
                      "flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent",
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
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
      );

    case 'radio':
    case 'radio-group':
      const radioOptions = (config.options as { value: string; label: string }[]) || [];
      const isGrid = config.layout === 'grid-2x2';

      return (
        <div className="space-y-2">
          <Label className="text-base font-medium">{config.label}</Label>
          <RadioGroup
            value={(value as string) || config.default?.toString() || ''}
            onValueChange={onChange}
            className={isGrid ? 'grid grid-cols-2 gap-3' : 'space-y-2'}
          >
            {radioOptions.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  "flex items-center space-x-2",
                  isGrid && "border rounded-lg p-4 cursor-pointer hover:bg-muted/50",
                  isGrid && value === opt.value && "border-primary bg-primary/5"
                )}
                onClick={isGrid ? () => onChange(opt.value) : undefined}
              >
                <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
                <Label htmlFor={`${name}-${opt.value}`} className="cursor-pointer text-base">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case 'toggle':
      return (
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">{config.label}</Label>
            {config.description && (
              <p className="text-sm text-muted-foreground">{config.description}</p>
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
          <Label className="text-base font-medium">{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal text-base h-11"
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
                          "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent",
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
          <Label className="text-base font-medium">{config.label}</Label>
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Drag & drop images here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports {config.accept?.join(', ') || 'images'} up to {config.maxSize || '5MB'}
            </p>
          </div>
          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {files.map((_file, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(files.filter((_, i) => i !== idx));
                    }}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
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
          <div>
            <Label className="text-base font-medium">{config.label}</Label>
            {config.description && (
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            )}
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="border rounded-xl p-5 space-y-4">
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
                        className="min-h-[100px] resize-none text-base"
                      />
                    );
                  }
                  if (fieldConfig.type === 'option-list') {
                    const optionsList = (item[fieldKey] as string[]) || [];
                    return (
                      <div key={fieldKey} className="space-y-2">
                        <Label className="text-sm text-muted-foreground">{fieldConfig.label}</Label>
                        <div className="space-y-2">
                          {optionsList.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...optionsList];
                                  newOptions[optIdx] = e.target.value;
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], [fieldKey]: newOptions };
                                  onChange(newItems);
                                }}
                                className="text-sm"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                              {optionsList.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = optionsList.filter((_, i) => i !== optIdx);
                                    const newItems = [...items];
                                    newItems[idx] = { ...newItems[idx], [fieldKey]: newOptions };
                                    onChange(newItems);
                                  }}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {optionsList.length < (fieldConfig.maxItems || 10) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...optionsList, ''];
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], [fieldKey]: newOptions };
                                onChange(newItems);
                              }}
                              className="text-sm text-muted-foreground"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add option
                            </Button>
                          )}
                        </div>
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
            </Button>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label className="text-base font-medium">{config.label}</Label>
          <p className="text-sm text-muted-foreground">
            Field type: {config.type}
          </p>
        </div>
      );
  }
};

export default MethodFullPage;
