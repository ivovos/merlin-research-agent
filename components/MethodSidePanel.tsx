import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { METHOD_ICONS } from '@/lib/methodIcons';
import { MethodFormField } from '@/components/MethodFormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { methods, getMethodById, getVariantConfig } from '@/data/methods';

// Extended audience type that includes optional description
type AudienceWithDescription = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
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
  const MethodIcon = currentMethod ? METHOD_ICONS[currentMethod.icon] || MessageSquare : MessageSquare;

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
                const Icon = METHOD_ICONS[method.icon] || MessageSquare;
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
          <div className="space-y-6">
            {Object.entries(fieldsToRender).map(([fieldName, config]) => (
              <MethodFormField
                key={fieldName}
                name={fieldName}
                config={config}
                value={formData[fieldName]}
                onChange={(value) => updateField(fieldName, value)}
                variant="compact"
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


export default MethodSidePanel;
