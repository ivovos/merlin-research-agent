import React, { useState, useMemo } from 'react';
import { MessageSquare, Search, Plus, ChevronDown, Check, X } from 'lucide-react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { AudienceDetails } from '@/types';

interface MessageTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onContinue?: (data: MessageTestFormData) => void;
  audiences?: AudienceDetails[];
  onCreateAudience?: () => void;
}

export interface MessageTestFormData {
  testName: string;
  testAim: string;
  audienceId: string | null;
  testCriteria: string | null;
}

const TEST_CRITERIA_OPTIONS = [
  'Emotional resonance',
  'Call-to-action clarity',
  'Brand voice consistency',
  'Value proposition clarity',
  'Urgency and motivation',
  'Trust and credibility',
];

export const MessageTestingModal: React.FC<MessageTestingModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onContinue,
  audiences = [],
  onCreateAudience,
}) => {
  const [testName, setTestName] = useState('');
  const [testAim, setTestAim] = useState('');
  const [selectedAudienceId, setSelectedAudienceId] = useState<string | null>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);
  const [audienceSearchQuery, setAudienceSearchQuery] = useState('');
  const [audiencePopoverOpen, setAudiencePopoverOpen] = useState(false);
  const [criteriaPopoverOpen, setCriteriaPopoverOpen] = useState(false);

  const selectedAudience = useMemo(() => {
    return audiences.find(a => a.id === selectedAudienceId);
  }, [audiences, selectedAudienceId]);

  const filteredAudiences = useMemo(() => {
    if (!audienceSearchQuery.trim()) return audiences;
    const query = audienceSearchQuery.toLowerCase();
    return audiences.filter(
      a => a.name.toLowerCase().includes(query) ||
           a.description?.toLowerCase().includes(query)
    );
  }, [audiences, audienceSearchQuery]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue({
        testName,
        testAim,
        audienceId: selectedAudienceId,
        testCriteria: selectedCriteria,
      });
    }
    onClose();
  };

  const isValid = testName.trim().length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent className="w-[60%] sm:max-w-none flex flex-col overflow-hidden">
        <SheetHeader className="flex flex-row items-start gap-4 flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <SheetTitle className="text-xl">Message Testing</SheetTitle>
            <SheetDescription>
              Compare messages side-by-side
            </SheetDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
          {/* Test Name */}
          <div className="space-y-2">
            <Input
              placeholder="Give the test a clear, short label for tracking. E.g. 'Plastic Ban'"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>

          {/* Test Aim */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">What is the aim of this test?</Label>
            <Textarea
              placeholder="What do you want to achieve by testing? Be specific about the business outcome you are trying to realise."
              value={testAim}
              onChange={(e) => setTestAim(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Select Audience */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Audience</Label>
            <Popover open={audiencePopoverOpen} onOpenChange={setAudiencePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={audiencePopoverOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedAudience ? (
                    <span>{selectedAudience.name}</span>
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
                    value={audienceSearchQuery}
                    onChange={(e) => setAudienceSearchQuery(e.target.value)}
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
                            setSelectedAudienceId(audience.id);
                            setAudiencePopoverOpen(false);
                            setAudienceSearchQuery('');
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            selectedAudienceId === audience.id && "bg-accent"
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
                          {selectedAudienceId === audience.id && (
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
                    onClick={() => {
                      setAudiencePopoverOpen(false);
                      onCreateAudience?.();
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new audience
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Test Criteria */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Test criteria</Label>
            <Popover open={criteriaPopoverOpen} onOpenChange={setCriteriaPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={criteriaPopoverOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedCriteria ? (
                    <span>{selectedCriteria}</span>
                  ) : (
                    <span className="text-muted-foreground">What aspects of your message do you want to test?</span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                {TEST_CRITERIA_OPTIONS.map((criteria) => (
                  <button
                    key={criteria}
                    onClick={() => {
                      setSelectedCriteria(criteria);
                      setCriteriaPopoverOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      selectedCriteria === criteria && "bg-accent"
                    )}
                  >
                    <span>{criteria}</span>
                    {selectedCriteria === criteria && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4">
          <Button
            onClick={handleContinue}
            disabled={!isValid}
          >
            Continue
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
