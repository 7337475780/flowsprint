import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useAddCommentMutation } from '../hooks/useTasks.js';
import type { Task, TaskComment } from '../api/taskApi.js';

interface CommentThreadProps {
  task: Task;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function CommentThread({ task }: CommentThreadProps) {
  const [commentText, setCommentText] = useState('');
  const addMutation = useAddCommentMutation(task._id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addMutation.mutate(commentText.trim(), {
      onSuccess: () => {
        setCommentText('');
      },
    });
  };

  const comments = task.comments ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span>Discussion Thread ({comments.length})</span>
      </div>

      {/* Write Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          disabled={addMutation.isPending}
          className="flex-1 px-3 py-2 text-xs rounded-lg border bg-background outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none custom-scrollbar"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || addMutation.isPending}
          className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Discussion List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {comments.length === 0 ? (
          <p className="text-2xs text-muted-foreground italic pl-1">
            No discussion comments yet. Spark collaboration inside!
          </p>
        ) : (
          comments
            .slice()
            .reverse()
            .map((c: TaskComment) => {
              const authorName = c.author?.name ?? 'Teammate';
              return (
                <div key={c._id} className="flex gap-2.5 items-start bg-secondary/15 border p-3 rounded-xl">
                  {/* Avatar */}
                  <div className="h-7 w-7 rounded-full bg-primary/10 border flex items-center justify-center font-bold text-xs text-foreground uppercase shrink-0">
                    {c.author?.avatar ? (
                      <img src={c.author.avatar} alt={authorName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      authorName.charAt(0)
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-2xs font-extrabold text-foreground leading-none">
                        {authorName}
                      </span>
                      <span className="font-mono text-3xs text-muted-foreground shrink-0 leading-none">
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-2xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                      {c.text}
                    </p>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
