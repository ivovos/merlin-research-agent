import React, { useState } from 'react';
import { ArrowLeft, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import type { Account, AudienceDetails } from '@/types';

interface AudienceDetailProps {
  audience: AudienceDetails;
  account: Account;
  onBack: () => void;
  onAskQuestion: (question: string, audience: AudienceDetails) => void;
}

export const AudienceDetail: React.FC<AudienceDetailProps> = ({
  audience,
  account,
  onBack,
  onAskQuestion,
}) => {
  const [question, setQuestion] = useState('');
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question, audience);
      setQuestion('');
    }
  };

  const project = account.projects?.find(p => p.id === audience.projectId);

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 hover:bg-muted rounded-md px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to audiences
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-semibold text-foreground">{audience.name}</h1>
            {account.type === 'agency' && project && (
              <Badge variant="secondary" className="text-xs">
                {project.name}
              </Badge>
            )}
          </div>
          {audience.description && (
            <p className="text-sm text-muted-foreground">{audience.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div>
              <span className="text-muted-foreground">Agents:</span>{' '}
              <span className="font-medium text-foreground">
                {audience.agents.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Segments:</span>{' '}
              <span className="font-medium text-foreground">{audience.segments.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>{' '}
              <span className="font-medium text-foreground">
                {new Date(audience.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Ask this audience */}
        <div className="mb-6">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Ask this audience a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="pr-12"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!question.trim()}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 py-1.5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Segments Table */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Segments
          </h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Count
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Percentage
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Distribution
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {audience.segments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell className="font-medium text-foreground">
                      {segment.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {segment.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{segment.percentage}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${segment.percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Data Sources (Collapsible) */}
        <Collapsible open={isDataSourcesOpen} onOpenChange={setIsDataSourcesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left mb-2">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Data Sources
            </h2>
            {isDataSourcesOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border border-border rounded-lg p-4 mb-6">
              <div className="space-y-2">
                {audience.source.split(',').map((source, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">{source.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
