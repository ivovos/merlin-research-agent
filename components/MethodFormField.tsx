import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  Check,
  X,
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
import type { FieldConfig } from '@/data/methods';
import { mockAudiences } from '@/data/mockData';

// Extended audience type
type AudienceWithDescription = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
};

export type MethodFormFieldVariant = 'full' | 'sheet' | 'compact';

interface MethodFormFieldProps {
  name: string;
  config: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  variant?: MethodFormFieldVariant;
}

// ---------------------------------------------------------------------------
// Variant-based sizing helpers
// ---------------------------------------------------------------------------

function spacing(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'space-y-2' : variant === 'sheet' ? 'space-y-2' : 'space-y-1.5';
}

function labelCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'text-base font-medium' : 'text-sm font-medium';
}

function descCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'text-sm text-muted-foreground' : 'text-xs text-muted-foreground';
}

function inputCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'text-base h-11' : variant === 'compact' ? 'text-sm' : '';
}

function textareaCls(variant: MethodFormFieldVariant) {
  return variant === 'full'
    ? 'min-h-[120px] resize-none text-base'
    : variant === 'compact'
    ? 'min-h-[80px] resize-none text-sm'
    : 'min-h-[100px] resize-none';
}

function selectTriggerCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'text-base h-11' : variant === 'compact' ? 'text-sm' : '';
}

function comboboxCls(variant: MethodFormFieldVariant) {
  return variant === 'full'
    ? 'w-full justify-between font-normal text-base h-11'
    : variant === 'compact'
    ? 'w-full justify-between font-normal text-sm h-9'
    : 'w-full justify-between font-normal';
}

function chevronCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'ml-2 h-3.5 w-3.5 shrink-0 opacity-50' : 'ml-2 h-4 w-4 shrink-0 opacity-50';
}

function checkCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'h-3.5 w-3.5 text-primary' : 'h-4 w-4 text-primary';
}

function multiSelectItemCls(variant: MethodFormFieldVariant, isSelected: boolean) {
  return cn(
    'flex w-full items-center justify-between rounded-sm px-2 text-sm outline-none hover:bg-accent',
    variant === 'full' ? 'py-2' : 'py-1.5',
    isSelected && 'bg-accent',
  );
}

// Radio / grid sizing
function radioGridCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'grid grid-cols-2 gap-3' : variant === 'compact' ? 'grid grid-cols-2 gap-1.5' : 'grid grid-cols-2 gap-2';
}

function radioListCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'space-y-1.5' : 'space-y-2';
}

function radioGridItemCls(variant: MethodFormFieldVariant, isSelected: boolean) {
  return cn(
    'flex items-center space-x-2',
    variant === 'full' ? 'border rounded-lg p-4 cursor-pointer hover:bg-muted/50' :
    variant === 'compact' ? 'border rounded-md p-2.5 cursor-pointer hover:bg-muted/50' :
    'border rounded-md p-3 cursor-pointer hover:bg-muted/50',
    isSelected && 'border-primary bg-primary/5',
  );
}

function radioItemCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'h-3.5 w-3.5' : undefined;
}

function radioLabelCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'cursor-pointer text-base' : 'cursor-pointer text-sm';
}

// Toggle
function toggleContainerCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'flex items-center justify-between rounded-xl border p-4' :
    variant === 'compact' ? 'flex items-center justify-between rounded-lg border p-3' :
    'flex items-center justify-between rounded-lg border p-4';
}

// Audience selector sizing
function audienceIconCls(variant: MethodFormFieldVariant) {
  return variant === 'compact'
    ? 'flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[9px] font-medium text-primary'
    : 'flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-[10px] font-medium text-primary';
}

function audienceSearchInputCls(variant: MethodFormFieldVariant) {
  return variant === 'compact'
    ? 'flex h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
    : 'flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground';
}

function audienceSearchContainerCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'flex items-center border-b px-2.5 py-2' : 'flex items-center border-b px-3 py-2';
}

function audienceScrollHeight(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'h-[180px]' : 'h-[200px]';
}

function audienceSearchIconCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'mr-2 h-3.5 w-3.5 shrink-0 opacity-50' : 'mr-2 h-4 w-4 shrink-0 opacity-50';
}

function audienceNoResultCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'py-4 text-center text-xs text-muted-foreground' : 'py-6 text-center text-sm text-muted-foreground';
}

// Image upload
function imageUploadContainerCls(variant: MethodFormFieldVariant) {
  return variant === 'full'
    ? 'border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer'
    : 'border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer';
}

function imageUploadIconCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'h-10 w-10 mx-auto text-muted-foreground mb-3' : 'h-8 w-8 mx-auto text-muted-foreground mb-2';
}

function imageThumbGridCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'grid grid-cols-4 gap-3 mt-3' : 'grid grid-cols-4 gap-2 mt-2';
}

function imageThumbCls(variant: MethodFormFieldVariant) {
  return variant === 'full'
    ? 'aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden'
    : 'aspect-square rounded-md bg-muted flex items-center justify-center overflow-hidden';
}

function imageThumbIconCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'h-8 w-8 text-muted-foreground' : 'h-6 w-6 text-muted-foreground';
}

function imageDeleteBtnCls(variant: MethodFormFieldVariant) {
  return variant === 'full'
    ? 'absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
    : 'absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity';
}

// question-list / message-list
function listContainerCls(variant: MethodFormFieldVariant) {
  return variant === 'full' ? 'space-y-4' : variant === 'compact' ? 'space-y-3' : 'space-y-4';
}

function listCardCls(variant: MethodFormFieldVariant) {
  return variant === 'full'
    ? 'border rounded-xl p-5 space-y-4'
    : variant === 'compact'
    ? 'border rounded-lg p-3 space-y-2.5'
    : 'border rounded-lg p-4 space-y-4';
}

function listDeleteBtnCls(variant: MethodFormFieldVariant) {
  return variant === 'compact'
    ? 'h-6 w-6 p-0 text-muted-foreground hover:text-destructive'
    : 'h-8 w-8 p-0 text-muted-foreground hover:text-destructive';
}

function listDeleteIconCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4';
}

function listItemLabelCls(variant: MethodFormFieldVariant) {
  return variant === 'compact' ? 'text-xs font-medium text-muted-foreground' : 'text-sm font-medium text-muted-foreground';
}

function listTextareaCls(variant: MethodFormFieldVariant) {
  return variant === 'full'
    ? 'min-h-[100px] resize-none text-base'
    : variant === 'compact'
    ? 'min-h-[60px] resize-none text-sm'
    : 'min-h-[80px] resize-none';
}

function listItemLabel(type: string, idx: number, variant: MethodFormFieldVariant) {
  if (type === 'question-list') {
    return variant === 'compact' ? `Q${idx + 1}` : `Question ${idx + 1}`;
  }
  return `Message ${idx + 1}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MethodFormField: React.FC<MethodFormFieldProps> = ({
  name,
  config,
  value,
  onChange,
  variant = 'sheet',
}) => {
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
    // -------------------------------------------------------------------
    // TEXT
    // -------------------------------------------------------------------
    case 'text':
      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          <Input
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls(variant)}
          />
          {config.description && (
            <p className={descCls(variant)}>{config.description}</p>
          )}
        </div>
      );

    // -------------------------------------------------------------------
    // TEXTAREA
    // -------------------------------------------------------------------
    case 'textarea':
      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          <Textarea
            placeholder={config.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className={textareaCls(variant)}
          />
          {config.description && (
            <p className={descCls(variant)}>{config.description}</p>
          )}
        </div>
      );

    // -------------------------------------------------------------------
    // SELECT
    // -------------------------------------------------------------------
    case 'select':
      if (config.options === 'dynamic') {
        return (
          <div className={spacing(variant)}>
            <Label className={labelCls(variant)}>{config.label}</Label>
            <Select value={(value as string) || ''} onValueChange={onChange}>
              <SelectTrigger className={selectTriggerCls(variant)}>
                <SelectValue placeholder={config.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
            {config.note && (
              <p className={cn(descCls(variant), 'italic')}>{config.note}</p>
            )}
          </div>
        );
      }
      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          <Select value={(value as string) || config.default?.toString() || ''} onValueChange={onChange}>
            <SelectTrigger className={selectTriggerCls(variant)}>
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

    // -------------------------------------------------------------------
    // MULTI-SELECT
    // -------------------------------------------------------------------
    case 'multi-select': {
      const selectedValues = (value as string[]) || [];
      const options = config.options === 'dynamic'
        ? [{ value: 'opt1', label: 'Option 1' }, { value: 'opt2', label: 'Option 2' }]
        : (config.options as { value: string; label: string }[]) || [];

      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={comboboxCls(variant)}
              >
                {selectedValues.length > 0 ? (
                  <span>{selectedValues.length} selected</span>
                ) : (
                  <span className="text-muted-foreground">{config.placeholder || 'Select...'}</span>
                )}
                <ChevronDown className={chevronCls(variant)} />
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
                    className={multiSelectItemCls(variant, isSelected)}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className={checkCls(variant)} />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
          {config.description && (
            <p className={descCls(variant)}>{config.description}</p>
          )}
        </div>
      );
    }

    // -------------------------------------------------------------------
    // RADIO / RADIO-GROUP
    // -------------------------------------------------------------------
    case 'radio':
    case 'radio-group': {
      const radioOptions = (config.options as { value: string; label: string }[]) || [];
      const isGrid = config.layout === 'grid-2x2';

      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          <RadioGroup
            value={(value as string) || config.default?.toString() || ''}
            onValueChange={onChange}
            className={isGrid ? radioGridCls(variant) : radioListCls(variant)}
          >
            {radioOptions.map((opt) => (
              <div
                key={opt.value}
                className={isGrid
                  ? radioGridItemCls(variant, value === opt.value)
                  : 'flex items-center space-x-2'
                }
                onClick={isGrid ? () => onChange(opt.value) : undefined}
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`${name}-${opt.value}`}
                  className={radioItemCls(variant)}
                />
                <Label htmlFor={`${name}-${opt.value}`} className={radioLabelCls(variant)}>
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    // -------------------------------------------------------------------
    // TOGGLE
    // -------------------------------------------------------------------
    case 'toggle':
      return (
        <div className={toggleContainerCls(variant)}>
          <div className="space-y-0.5">
            <Label className={labelCls(variant)}>{config.label}</Label>
            {config.description && (
              <p className={descCls(variant)}>{config.description}</p>
            )}
          </div>
          <Switch
            checked={(value as boolean) || false}
            onCheckedChange={onChange}
          />
        </div>
      );

    // -------------------------------------------------------------------
    // AUDIENCE SELECTOR
    // -------------------------------------------------------------------
    case 'audience-selector':
      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={comboboxCls(variant)}
              >
                {selectedAudience ? (
                  <div className="flex items-center gap-2">
                    <div className={audienceIconCls(variant)}>
                      {selectedAudience.icon}
                    </div>
                    <span className={variant === 'compact' ? 'truncate' : undefined}>{selectedAudience.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select an audience</span>
                )}
                <ChevronDown className={chevronCls(variant)} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <div className={audienceSearchContainerCls(variant)}>
                <Search className={audienceSearchIconCls(variant)} />
                <input
                  placeholder="Search audiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={audienceSearchInputCls(variant)}
                />
              </div>
              <ScrollArea className={audienceScrollHeight(variant)}>
                <div className="p-1">
                  {filteredAudiences.length === 0 ? (
                    <div className={audienceNoResultCls(variant)}>
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
                          'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent',
                          variant === 'full' && 'py-2',
                          value === audience.id && 'bg-accent',
                        )}
                      >
                        <div className={audienceIconCls(variant)}>
                          {audience.icon}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className={cn('font-medium', variant === 'compact' && 'truncate')}>{audience.name}</div>
                          {variant !== 'compact' && audience.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                              {audience.description}
                            </div>
                          )}
                        </div>
                        {value === audience.id && (
                          <Check className={checkCls(variant)} />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
              {variant !== 'compact' && (
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
              )}
            </PopoverContent>
          </Popover>
        </div>
      );

    // -------------------------------------------------------------------
    // IMAGE UPLOAD
    // -------------------------------------------------------------------
    case 'image-upload': {
      const files = (value as File[]) || [];
      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          {config.description && (
            <p className={descCls(variant)}>{config.description}</p>
          )}
          <div
            className={imageUploadContainerCls(variant)}
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
            <Upload className={imageUploadIconCls(variant)} />
            <p className="text-sm text-muted-foreground">
              Drag & drop images here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports {config.accept?.join(', ') || 'images'} up to {config.maxSize || '5MB'}
            </p>
          </div>
          {files.length > 0 && (
            <div className={imageThumbGridCls(variant)}>
              {files.map((_file, idx) => (
                <div key={idx} className="relative group">
                  <div className={imageThumbCls(variant)}>
                    <ImageIcon className={imageThumbIconCls(variant)} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(files.filter((_, i) => i !== idx));
                    }}
                    className={imageDeleteBtnCls(variant)}
                  >
                    <X className={variant === 'full' ? 'h-4 w-4' : 'h-3 w-3'} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // -------------------------------------------------------------------
    // QUESTION-LIST / MESSAGE-LIST
    // -------------------------------------------------------------------
    case 'question-list':
    case 'message-list': {
      const items = (value as Record<string, unknown>[]) || [];
      const itemSchema = config.itemSchema || {};
      const maxItems = config.maxItems || 10;
      const minItems = config.minItems || 1;

      return (
        <div className={listContainerCls(variant)}>
          <div>
            <Label className={labelCls(variant)}>{config.label}</Label>
            {config.description && (
              <p className={cn(descCls(variant), 'mt-0.5')}>{config.description}</p>
            )}
          </div>

          <div className={listContainerCls(variant)}>
            {items.map((item, idx) => (
              <div key={idx} className={listCardCls(variant)}>
                <div className="flex items-center justify-between">
                  <span className={listItemLabelCls(variant)}>
                    {listItemLabel(config.type, idx, variant)}
                  </span>
                  {items.length > minItems && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChange(items.filter((_, i) => i !== idx))}
                      className={listDeleteBtnCls(variant)}
                    >
                      <Trash2 className={listDeleteIconCls(variant)} />
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
                        className={listTextareaCls(variant)}
                      />
                    );
                  }
                  // option-list (not rendered in compact variant)
                  if (fieldConfig.type === 'option-list' && variant !== 'compact') {
                    const optionsList = (item[fieldKey] as string[]) || [];
                    return (
                      <div key={fieldKey} className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{fieldConfig.label}</Label>
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
                                className={variant === 'sheet' ? 'h-8 text-sm' : 'text-sm'}
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
                              className={variant === 'sheet' ? 'h-7 text-xs text-muted-foreground' : 'text-sm text-muted-foreground'}
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
              size={variant === 'compact' ? 'sm' : undefined}
              onClick={() => onChange([...items, {}])}
              className={cn('w-full', variant === 'compact' && 'text-sm')}
            >
              <Plus className={variant === 'compact' ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'} />
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
    }

    // -------------------------------------------------------------------
    // DEFAULT
    // -------------------------------------------------------------------
    default:
      return (
        <div className={spacing(variant)}>
          <Label className={labelCls(variant)}>{config.label}</Label>
          <p className={descCls(variant)}>
            Field type: {config.type}
          </p>
        </div>
      );
  }
};

export default MethodFormField;
