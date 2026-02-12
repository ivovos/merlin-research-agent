import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  MessageSquare,
} from 'lucide-react';
import { METHOD_ICONS } from '@/lib/methodIcons';
import { MethodFormField } from '@/components/MethodFormField';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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


interface MethodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethodId?: string;
  initialVariantId?: string;
  initialFormData?: Record<string, unknown>;
  /** Initial title for the study */
  initialTitle?: string;
  selectedAudience?: AudienceWithDescription;
  /** When true, indicates editing an existing study - changes button to "Re-run" */
  isEditing?: boolean;
  onSubmit?: (methodId: string, variantId: string | null, data: Record<string, unknown>, title: string) => void;
}

export const MethodSheet: React.FC<MethodSheetProps> = ({
  isOpen,
  onClose,
  initialMethodId,
  initialVariantId,
  initialFormData,
  initialTitle,
  selectedAudience,
  isEditing = false,
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
    // Don't reset if we have initialFormData for this method/variant
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

  // Update method, variant, and form data when props change (e.g., when opening to edit)
  useEffect(() => {
    if (initialMethodId) {
      setCurrentMethodId(initialMethodId);
      // Auto-select first variant for the new method
      const defaultVariant = getDefaultVariant(initialMethodId);
      setSelectedVariantId(initialVariantId || defaultVariant);
    }
    // Initialize form data from props
    if (initialFormData) {
      setFormData(initialFormData);
    }
    // Initialize title from props
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl w-[90vw] max-h-[85vh] flex flex-col overflow-hidden p-0"
        overlayClassName="bg-surface-overlay"
      >
        {/* Header with method switcher */}
        <DialogHeader className="flex flex-row items-center gap-3 p-6 pb-4 border-b flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
            <MethodIcon className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <Popover open={methodSwitcherOpen} onOpenChange={setMethodSwitcherOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <DialogTitle className="text-xl">{currentMethod?.name || 'Select Method'}</DialogTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-1" align="start">
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
            <DialogDescription className="mt-1">
              {currentVariant?.subtitle || currentMethod?.purpose || currentMethod?.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Study title field - shown when editing */}
          {isEditing && (
            <div className="mb-6 space-y-2">
              <Label htmlFor="study-title" className="text-sm font-medium">
                Study Title
              </Label>
              <Input
                id="study-title"
                value={studyTitle}
                onChange={(e) => setStudyTitle(e.target.value)}
                placeholder="e.g., Mubi Retention Drivers"
                className="text-base"
              />
            </div>
          )}

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
                <MethodFormField
                  key={fieldName}
                  name={fieldName}
                  config={config}
                  value={formData[fieldName]}
                  onChange={(value) => updateField(fieldName, value)}
                  variant="sheet"
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
            {isEditing
              ? `Re-run ${currentMethod?.name || 'Study'}`
              : currentVariant?.actions?.primary?.label || currentMethod?.actions?.primary?.label || `Run ${currentMethod?.name || 'Study'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default MethodSheet;
