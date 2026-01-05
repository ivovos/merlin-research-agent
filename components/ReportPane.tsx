import React from 'react';
import { Conversation } from '../types';
import { QuestionCard } from './QuestionCard';
import { Share2, Users, X } from 'lucide-react';
import { Button } from './ui/Button';

interface ReportPaneProps {
   conversation: Conversation;
   onClose?: () => void;
   onEditQuestion?: (questionId: string, newText: string, segments: string[]) => void;
}

export const ReportPane: React.FC<ReportPaneProps> = ({ conversation, onClose, onEditQuestion }) => {
   const { report, status } = conversation;

   if (status === 'complete' && report) {
      return (
         <div className="w-full h-full bg-[var(--background)] flex flex-col relative">
            {/* Top Right Actions */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
               <Button variant="secondary" size="sm" className="gap-2 bg-white border border-[var(--border)] shadow-sm">
                  <Share2 className="w-4 h-4" />
                  Share
               </Button>
               <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
               </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
               <div className="p-8 pb-32 max-w-3xl mx-auto">
                  {/* Report Header */}
                  <div className="mt-8 mb-8">
                     <div className="flex items-center gap-3 mb-4 text-[var(--text-muted)]">
                        <span className="text-xs font-semibold uppercase tracking-wide">Research Insights</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                        <span className="text-xs">{new Date().toLocaleDateString()}</span>
                     </div>

                     <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
                        {report.title}
                     </h1>

                     <div className="flex items-center gap-2 mb-8">
                        <div className="flex items-center gap-2 bg-[var(--background-card)] border border-[var(--border)] px-3 py-1.5 rounded-full">
                           <div className="w-5 h-5 bg-black text-white flex items-center justify-center rounded-full text-xs font-serif font-bold">
                              {report.audience.icon}
                           </div>
                           <span className="text-sm font-medium">{report.audience.name}</span>
                        </div>
                        <span className="text-sm text-[var(--text-muted)]">•</span>
                        <span className="text-sm text-[var(--text-muted)]">{report.respondents} respondents</span>
                     </div>

                     {/* Summary (formerly Abstract) */}
                     <div className="bg-transparent">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Summary</h3>
                        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                           {report.abstract}
                        </p>
                     </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-[var(--border)] mb-8" />

                  {/* Question Cards */}
                  {/* Qualitative vs Quantitative Content */}
                  {report.type === 'qualitative' && report.themes ? (
                     <div className="space-y-8">
                        {report.themes.map((theme, i) => (
                           <div key={theme.id} className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-6 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                             theme.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                          }`}>
                                          {theme.sentiment} sentiment
                                       </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{theme.topic}</h3>
                                 </div>
                              </div>

                              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                                 {theme.summary}
                              </p>

                              <div className="space-y-3 pl-4 border-l-2 border-[var(--accent)]/30">
                                 {theme.quotes.map((quote, qIndex) => (
                                    <div key={qIndex} className="text-sm">
                                       <p className="text-[var(--text-primary)] italic mb-1">"{quote.text}"</p>
                                       <p className="text-[var(--text-muted)] text-xs">— {quote.attribution}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {report.questions.map((q, i) => (
                           <QuestionCard key={q.id} data={q} index={i} onEditQuestion={onEditQuestion} />
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      );
   }

   return null;
};