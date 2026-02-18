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

// Extended audience type
type AudienceWithDescription = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
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

  const MethodIcon = currentMethod ? METHOD_ICONS[currentMethod.icon] || MessageSquare : MessageSquare;

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

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9"
          >
            <X className="h-5 w-5" />
          </Button>
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
                  <MethodFormField
                    key={fieldName}
                    name={fieldName}
                    config={config}
                    value={formData[fieldName]}
                    onChange={(value) => updateField(fieldName, value)}
                    variant="full"
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


export default MethodFullPage;
