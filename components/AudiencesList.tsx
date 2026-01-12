import React, { useMemo, useState } from 'react';
import { Users, Search } from 'lucide-react';
import { MonoIcon } from './MonoIcon';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { Account, Audience, Project } from '../data/mockData';
import { getAllAudiences, getAudiencesByProject } from '../data/mockData';

interface AudiencesListProps {
  account: Account;
  selectedProject: string | null; // 'all' or project ID
  onSelectAudience: (audience: Audience) => void;
}

export const AudiencesList: React.FC<AudiencesListProps> = ({
  account,
  selectedProject,
  onSelectAudience,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Get audiences based on selected project
  const audiences = useMemo(() => {
    if (!selectedProject || selectedProject === 'all') {
      return getAllAudiences(account);
    }
    return getAudiencesByProject(account, selectedProject);
  }, [account, selectedProject]);

  // Filter audiences by search query
  const filteredAudiences = useMemo(() => {
    if (!searchQuery.trim()) return audiences;
    const query = searchQuery.toLowerCase();
    return audiences.filter(
      (aud) =>
        aud.name.toLowerCase().includes(query) ||
        aud.description?.toLowerCase().includes(query)
    );
  }, [audiences, searchQuery]);

  // Group audiences by project (for agency "all audiences" view)
  const groupedAudiences = useMemo(() => {
    if (account.type === 'brand' || (selectedProject !== null && selectedProject !== 'all')) {
      return null;
    }
    const groups: { project: Project; audiences: Audience[] }[] = [];
    account.projects?.forEach((project) => {
      const projectAudiences = filteredAudiences.filter(
        (aud) => aud.projectId === project.id
      );
      if (projectAudiences.length > 0) {
        groups.push({ project, audiences: projectAudiences });
      }
    });
    return groups;
  }, [account, selectedProject, filteredAudiences]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Recent audiences (top 3 most recently updated)
  const recentAudiences = useMemo(() => {
    return [...audiences]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [audiences]);

  const renderAudienceRow = (audience: Audience, _showProject: boolean = false) => (
    <TableRow
      key={audience.id}
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onSelectAudience(audience)}
    >
      <TableCell className="font-medium">
        <span className="line-clamp-2">{audience.name}</span>
      </TableCell>
      <TableCell className="text-gray-600">
        {audience.agents.toLocaleString()}
      </TableCell>
      <TableCell className="text-gray-600">{audience.segments.length}</TableCell>
      <TableCell className="text-gray-500 text-xs">{formatDate(audience.updatedAt)}</TableCell>
      <TableCell className="text-gray-500 text-xs">{audience.source}</TableCell>
    </TableRow>
  );

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-900" />
            <h1 className="text-lg font-semibold text-gray-900">
              {!selectedProject || selectedProject === 'all'
                ? 'All Audiences'
                : `${account.projects?.find(p => p.id === selectedProject)?.name || ''} Audiences`}
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            {filteredAudiences.length} {filteredAudiences.length === 1 ? 'audience' : 'audiences'}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search audiences or describe a new one..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-28"
          />
          {searchQuery.trim() && filteredAudiences.length === 0 && (
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
              Create audience
            </button>
          )}
        </div>

        {/* Recent Audiences Cards */}
        {!searchQuery && (
          <div className="mb-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Recent
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {recentAudiences.map((audience) => {
                const project = account.projects?.find(p => p.id === audience.projectId);
                return (
                  <div
                    key={audience.id}
                    className="border border-gray-200 rounded-sm p-3 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
                    onClick={() => onSelectAudience(audience)}
                  >
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-900 line-clamp-2">{audience.name}</span>
                      {project && (
                        <div className="flex items-center gap-1 mt-1">
                          {account.id !== 'canva' && (
                            <MonoIcon text={project.icon} src={project.logo} size="sm" />
                          )}
                          <span className="text-xs text-gray-500">{project.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{audience.agents.toLocaleString()} agents</span>
                      <span>•</span>
                      <span>{audience.segments.length} segments</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audiences Table */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            {searchQuery ? 'Search Results' : 'All'}
          </h2>

          {groupedAudiences ? (
            // Grouped view for agency "all audiences"
            <>
              {groupedAudiences.map(({ project, audiences: projectAudiences }) => (
                <div key={project.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {account.id !== 'canva' && (
                      <MonoIcon text={project.icon} src={project.logo} size="sm" />
                    )}
                    <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {projectAudiences.length}
                    </Badge>
                  </div>
                  <div className="border border-gray-200 rounded-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Name
                          </TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Agents
                          </TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Segments
                          </TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Updated
                          </TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Source
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100">
                        {projectAudiences.map((audience) => renderAudienceRow(audience))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Flat view for single project or brand account
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Agents
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Segments
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Updated
                    </TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Source
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {filteredAudiences.map((audience) => renderAudienceRow(audience))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredAudiences.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No audiences found</p>
              {searchQuery && (
                <>
                  <p className="text-xs mt-1 mb-3">Try a different search term</p>
                  <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                    Create audience
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
