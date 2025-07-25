"use client";

import { useRef } from "react";
import Link from "next/link";
import { Star, Download, Upload, Code, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimelineStore } from "@/stores/timeline-store";
import {
  downloadTimelines,
  importTimelines,
  generateTimelineCode,
} from "@/lib/timeline-utils";
import { toast } from "react-toastify";

export function Header() {
  const { timelines, getActiveTimeline, addTimeline } = useTimelineStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTimeline = getActiveTimeline();

  const handleExport = () => {
    try {
      downloadTimelines(timelines);
      toast.success("Timelines exported successfully!");
    } catch (error) {
      toast.error("Failed to export timelines");
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTimelines = importTimelines(content);

        importedTimelines.forEach((timeline) => {
          // Generate new ID to avoid conflicts
          const { id, ...timelineWithoutId } = timeline;
          addTimeline(timelineWithoutId);
        });

        toast.success(`Imported ${importedTimelines.length} timeline(s)`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to import timelines"
        );
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  const handleExportCode = () => {
    if (!activeTimeline) {
      toast.error("Please select a timeline to export code");
      return;
    }

    const code = generateTimelineCode(activeTimeline);
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success("GSAP code copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy code to clipboard");
      });
  };

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            <i>GSAP Timeline Editor</i>
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, preview and share GSAP animations with ease
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleImport}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportCode}
            disabled={!activeTimeline}
          >
            <Code className="h-4 w-4" />
            Export Code
          </Button>

          <Link
            href="https://github.com/DymytriiDev/gsap-timeline-editor"
            target="_blank"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <Star className="h-4 w-4" />
              Star on GitHub
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2">
            <CircleDollarSign className="h-4 w-4" />
            Buy me a coffee
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </header>
  );
}
