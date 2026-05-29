import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CopyButtonProps {
  value: string;
  className?: string;
  iconOnly?: boolean;
}

export function CopyButton({ value, className, iconOnly = true }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      {!iconOnly && <span className="ml-2 text-xs font-medium">{copied ? 'Copied!' : 'Copy'}</span>}
    </button>
  );
}
