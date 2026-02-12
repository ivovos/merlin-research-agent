import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuestion: string;
    initialSegments?: string[];
    onSave: (question: string, segments: string[]) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
    isOpen,
    onClose,
    initialQuestion,
    initialSegments = [],
    onSave,
}) => {
    const [question, setQuestion] = useState(initialQuestion);
    const [segments, setSegments] = useState<string[]>(initialSegments);
    const [newSegment, setNewSegment] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuestion(initialQuestion);
            setSegments(initialSegments || []);
            setNewSegment('');
        }
    }, [isOpen, initialQuestion, initialSegments]);

    if (!isOpen) return null;

    const handleAddSegment = () => {
        if (newSegment.trim() && !segments.includes(newSegment.trim())) {
            setSegments([...segments, newSegment.trim()]);
            setNewSegment('');
        }
    };

    const handleRemoveSegment = (segToRemove: string) => {
        setSegments(segments.filter(s => s !== segToRemove));
    };

    const handleSave = () => {
        onSave(question, segments);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-sm animate-fade-in">
            <div className="bg-background w-full max-w-lg rounded-xl shadow-2xl border border-border p-6 relative animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-foreground mb-1">Edit Research Question</h2>
                <p className="text-sm text-muted-foreground mb-6">Refine the question or adjust audience comparisons.</p>

                <div className="space-y-6">
                    {/* Question Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Question</label>
                        <textarea
                            className="w-full h-24 p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="e.g. What differs in podcast preferences?"
                        />
                    </div>

                    {/* Segments Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            Audience Comparisons <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                        </label>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {segments.map(seg => (
                                <div key={seg} className="flex items-center gap-1 bg-accent/10 text-accent-foreground px-2 py-1 rounded text-sm border border-accent/20">
                                    <span>{seg}</span>
                                    <button onClick={() => handleRemoveSegment(seg)} className="hover:text-red-500 ml-1">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 p-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                                placeholder="Add segment (e.g. Gen Z vs Boomers)"
                                value={newSegment}
                                onChange={(e) => setNewSegment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSegment()}
                            />
                            <Button variant="secondary" size="sm" onClick={handleAddSegment} disabled={!newSegment.trim()}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 transition-all">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!question.trim()}>
                        Update & Re-run
                    </Button>
                </div>
            </div>
        </div>
    );
};
