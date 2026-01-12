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
    <div className="flex-1 overflow-auto bg-white">
      <div className="p-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 hover:bg-gray-50 rounded-md px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to audiences
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-semibold text-gray-900">{audience.name}</h1>
            {account.type === 'agency' && project && (
              <Badge variant="secondary" className="text-xs">
                {project.name}
              </Badge>
            )}
          </div>
          {audience.description && (
            <p className="text-sm text-gray-600">{audience.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">Agents:</span>{' '}
              <span className="font-medium text-gray-900">
                {audience.agents.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Segments:</span>{' '}
              <span className="font-medium text-gray-900">{audience.segments.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Updated:</span>{' '}
              <span className="font-medium text-gray-900">
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
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white rounded-md px-3 py-1.5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Segments Table */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Segments
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Count
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Percentage
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Distribution
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {audience.segments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell className="font-medium text-gray-900">
                      {segment.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {segment.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-600">{segment.percentage}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gray-900 h-full rounded-full"
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
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Data Sources
            </h2>
            {isDataSourcesOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                {audience.source.split(',').map((source, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-900" />
                    <span className="text-sm text-gray-700">{source.trim()}</span>
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
