"use client";

import * as React from "react";
import {
  Settings,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProgressStore } from "@/store/progress-store";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  className?: string;
}

/**
 * SettingsDialog — a gear-icon button that opens a dialog with progress
 * management actions: export to JSON, import from JSON, and reset all
 * progress. Uses the progress store's actions.
 */
export function SettingsDialog({ className }: SettingsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const state = useProgressStore.persist.getOptions().storage?.getItem(
      "ros2-mastery-progress"
    );
    const data = state || JSON.stringify({
      state: {
        completedModules: {},
        bookmarks: {},
        lastVisitedModule: null,
        preferredLanguage: "cpp",
      },
      version: 1,
    });
    const blob = new Blob([data as string], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ros2-mastery-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Progress exported",
      description: "Your progress has been saved as a JSON file.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        // Validate it's valid JSON
        JSON.parse(json);
        // Write to localStorage
        useProgressStore.persist.getOptions().storage?.setItem(
          "ros2-mastery-progress",
          json
        );
        // Rehydrate the store
        useProgressStore.persist.rehydrate();
        toast({
          title: "Progress imported",
          description: "Your progress has been restored successfully.",
        });
        setOpen(false);
      } catch {
        toast({
          title: "Import failed",
          description: "The file is not a valid progress JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    resetProgress();
    toast({
      title: "Progress reset",
      description: "All completion and bookmark data has been cleared.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Settings"
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-cyan-400",
            className
          )}
        >
          <Settings className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-cyan-400" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your learning progress. Data is stored locally in your
            browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Export */}
          <SettingsAction
            icon={Download}
            title="Export Progress"
            description="Download your progress as a JSON backup file."
            actionLabel="Export"
            onAction={handleExport}
            accent="text-cyan-400"
          />

          {/* Import */}
          <SettingsAction
            icon={Upload}
            title="Import Progress"
            description="Restore progress from a previously exported JSON file."
            actionLabel="Import"
            onAction={() => fileInputRef.current?.click()}
            accent="text-emerald-400"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />

          {/* Reset — with confirmation */}
          <AlertDialog>
            <div className="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Reset All Progress
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Permanently delete all completion and bookmark data. This
                  cannot be undone.
                </p>
              </div>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </AlertDialogTrigger>
            </div>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your lesson completion
                  records, bookmarks, and learning history. This action cannot
                  be undone. Consider exporting your progress first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-rose-500 text-white hover:bg-rose-600"
                >
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              <Check className="h-4 w-4" />
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsAction({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  accent: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-4">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/50",
          accent
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onAction}
        className="shrink-0"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
