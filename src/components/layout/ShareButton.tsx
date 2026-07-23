"use client";

import { useState, useCallback } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  moduleId: string;
  variant?: "icon" | "full";
  className?: string;
}

/**
 * ShareButton — copies the current lesson URL to clipboard with the module
 * ID as a query param. Shows a toast notification on success.
 */
export function ShareButton({
  moduleId,
  variant = "icon",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/?m=${moduleId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied to clipboard",
        description: "Share this lesson with your team.",
      });
    } catch {
      toast({
        title: "Could not copy link",
        description: "Please copy the URL from your browser's address bar.",
        variant: "destructive",
      });
    }
  }, [moduleId, toast]);

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className={cn(
          "gap-2 transition-all active:scale-95",
          copied && "border-emerald-500/40 text-emerald-400",
          className
        )}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleShare}
          aria-label="Share lesson"
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all active:scale-95",
            copied
              ? "text-emerald-400 hover:bg-emerald-500/10"
              : "hover:bg-muted hover:text-cyan-400",
            className
          )}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {copied ? "Link copied!" : "Copy lesson link"}
      </TooltipContent>
    </Tooltip>
  );
}
