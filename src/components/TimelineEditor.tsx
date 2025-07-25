"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Plus,
  ZoomIn,
  ZoomOut,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTimelineStore,
  type Keyframe,
  type Transform,
  type TransformType,
} from "@/stores/timeline-store";

const GSAP_EASINGS = [
  "none",
  "power1.in",
  "power1.out",
  "power1.inOut",
  "power2.in",
  "power2.out",
  "power2.inOut",
  "power3.in",
  "power3.out",
  "power3.inOut",
  "power4.in",
  "power4.out",
  "power4.inOut",
  "back.in",
  "back.out",
  "back.inOut",
  "elastic.in",
  "elastic.out",
  "elastic.inOut",
  "bounce.in",
  "bounce.out",
  "bounce.inOut",
  "circ.in",
  "circ.out",
  "circ.inOut",
  "expo.in",
  "expo.out",
  "expo.inOut",
  "sine.in",
  "sine.out",
  "sine.inOut",
];

const CSS_FILTERS = [
  "blur",
  "brightness",
  "contrast",
  "grayscale",
  "hue-rotate",
  "invert",
  "opacity",
  "saturate",
  "sepia",
];

export function TimelineEditor() {
  const {
    getActiveTimeline,
    addKeyframe,
    updateKeyframe,
    deleteKeyframe,
    isPlaying,
    setPlaying,
    currentTime,
    setCurrentTime,
    zoom,
    setZoom,
  } = useTimelineStore();

  const [isAddKeyframeOpen, setIsAddKeyframeOpen] = useState(false);
  const [editingKeyframe, setEditingKeyframe] = useState<Keyframe | null>(null);
  const [keyframeForm, setKeyframeForm] = useState({
    delay: 0,
    duration: 1000,
    easing: "power2.inOut",
    transforms: [] as Transform[],
  });

  // Drag and resize state
  const [dragOperation, setDragOperation] = useState<{
    type: "move" | "resize";
    keyframeId: string;
    startX: number;
    startDelay: number;
    startDuration: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [didDrag, setDidDrag] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const activeTimeline = getActiveTimeline();

  // Handle mouse events for drag and resize
  const handleMouseDown = (
    e: React.MouseEvent,
    keyframe: Keyframe,
    type: "move" | "resize"
  ) => {
    e.stopPropagation();
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;

    setDragOperation({
      type,
      keyframeId: keyframe.id,
      startX,
      startDelay: keyframe.delay,
      startDuration: keyframe.duration,
    });
    setIsDragging(true);
  };

  // Helper function to snap value to grid with minimum step size
  const snapToGrid = (
    value: number,
    stepSize: number,
    isTime: boolean = false
  ) => {
    // Convert to ms for time values to ensure precision
    const valueInMs = isTime ? value * 1000 : value;
    const stepSizeInMs = isTime ? stepSize : stepSize;

    // Snap to nearest step with minimum of stepSize
    const snapped = Math.round(valueInMs / stepSizeInMs) * stepSizeInMs;

    // Convert back to seconds for time values
    return isTime ? snapped / 1000 : snapped;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (
      !isDragging ||
      !dragOperation ||
      !timelineRef.current ||
      !activeTimeline
    )
      return;

    const rect = timelineRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const deltaX = currentX - dragOperation.startX;

    // Convert pixel delta to time delta based on zoom level and total duration
    const pixelsPerSecond = rect.width / totalDuration;
    const timeDelta = deltaX / pixelsPerSecond;

    const keyframe = activeTimeline.keyframes.find(
      (k) => k.id === dragOperation.keyframeId
    );
    if (!keyframe) return;

    setDidDrag(true);

    // Minimum step size in milliseconds
    const minStepMs = 50;

    if (dragOperation.type === "move") {
      // Update delay (position) with snapping
      const rawNewDelay = Math.max(0, dragOperation.startDelay + timeDelta);
      // Snap to grid with minimum step of 50ms (0.05s)
      const newDelay = snapToGrid(rawNewDelay, minStepMs / 1000, true);
      updateKeyframe(activeTimeline.id, keyframe.id, { delay: newDelay });
    } else if (dragOperation.type === "resize") {
      // Update duration with snapping
      const rawNewDuration = Math.max(
        minStepMs,
        dragOperation.startDuration + timeDelta * 1000
      );
      // Snap to grid with minimum step of 50ms
      const newDuration = snapToGrid(rawNewDuration, minStepMs, false);
      updateKeyframe(activeTimeline.id, keyframe.id, { duration: newDuration });
    }
  };

  const handleMouseUp = () => {
    setDragOperation(null);
    setIsDragging(false);
    // Reset didDrag after a short delay to allow the click event to be suppressed
    setTimeout(() => setDidDrag(false), 0);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOperation]);

  const getLastKeyframeEnd = () => {
    if (!activeTimeline || activeTimeline.keyframes.length === 0) return 0;
    const lastKeyframe = activeTimeline.keyframes.reduce((latest, current) =>
      current.delay + current.duration / 1000 >
      latest.delay + latest.duration / 1000
        ? current
        : latest
    );
    return lastKeyframe.delay + lastKeyframe.duration / 1000;
  };

  const handleAddTransform = (type: TransformType) => {
    const newTransform: Transform = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      values: getDefaultTransformValues(type),
    };

    setKeyframeForm((prev) => ({
      ...prev,
      transforms: [...prev.transforms, newTransform],
    }));
  };

  const getDefaultTransformValues = (
    type: TransformType
  ): Record<string, number | string> => {
    switch (type) {
      case "move":
        return { x: 0, y: 0 };
      case "rotate":
        return { rotation: 0 };
      case "opacity":
        return { opacity: 1 };
      case "skew":
        return { skewX: 0, skewY: 0 };
      case "scale":
        return { scaleX: 1, scaleY: 1 };
      case "filter":
        return { filter: "blur", value: 0 };
      default:
        return {};
    }
  };

  const updateTransform = (
    transformId: string,
    values: Record<string, number | string>
  ) => {
    setKeyframeForm((prev) => ({
      ...prev,
      transforms: prev.transforms.map((t) =>
        t.id === transformId ? { ...t, values } : t
      ),
    }));
  };

  const removeTransform = (transformId: string) => {
    setKeyframeForm((prev) => ({
      ...prev,
      transforms: prev.transforms.filter((t) => t.id !== transformId),
    }));
  };

  const handleSaveKeyframe = () => {
    if (!activeTimeline) return;

    const keyframeData = {
      delay: keyframeForm.delay,
      duration: keyframeForm.duration,
      easing: keyframeForm.easing,
      transforms: keyframeForm.transforms,
    };

    if (editingKeyframe) {
      updateKeyframe(activeTimeline.id, editingKeyframe.id, keyframeData);
      setEditingKeyframe(null);
    } else {
      addKeyframe(activeTimeline.id, keyframeData);
    }

    resetForm();
    setIsAddKeyframeOpen(false);
  };

  const resetForm = () => {
    setKeyframeForm({
      delay: getLastKeyframeEnd(),
      duration: 1000,
      easing: "power2.inOut",
      transforms: [],
    });
  };

  const handleEditKeyframe = (keyframe: Keyframe) => {
    setEditingKeyframe(keyframe);
    setKeyframeForm({
      delay: keyframe.delay,
      duration: keyframe.duration,
      easing: keyframe.easing,
      transforms: keyframe.transforms,
    });
    setIsAddKeyframeOpen(true);
  };

  const renderTransformFields = (transform: Transform) => {
    switch (transform.type) {
      case "move":
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>X</Label>
              <Input
                type="number"
                value={transform.values.x as number}
                onChange={(e) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    x: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Y</Label>
              <Input
                type="number"
                value={transform.values.y as number}
                onChange={(e) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    y: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        );
      case "scale":
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Scale X</Label>
              <Input
                type="number"
                step="0.1"
                value={transform.values.scaleX as number}
                onChange={(e) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    scaleX: parseFloat(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div>
              <Label>Scale Y</Label>
              <Input
                type="number"
                step="0.1"
                value={transform.values.scaleY as number}
                onChange={(e) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    scaleY: parseFloat(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>
        );
      case "rotate":
        return (
          <div>
            <Label>Rotation (degrees)</Label>
            <Input
              type="number"
              value={transform.values.rotation as number}
              onChange={(e) =>
                updateTransform(transform.id, {
                  rotation: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        );
      case "opacity":
        return (
          <div>
            <Label>Opacity (0-1)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={transform.values.opacity as number}
              onChange={(e) =>
                updateTransform(transform.id, {
                  opacity: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        );
      case "skew":
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Skew X</Label>
              <Input
                type="number"
                value={transform.values.skewX as number}
                onChange={(e) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    skewX: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Skew Y</Label>
              <Input
                type="number"
                value={transform.values.skewY as number}
                onChange={(e) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    skewY: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        );
      case "filter":
        return (
          <div className="space-y-2">
            <div>
              <Label>Filter Type</Label>
              <Select
                value={transform.values.filter as string}
                onValueChange={(value) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    filter: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CSS_FILTERS.map((filter) => (
                    <SelectItem key={filter} value={filter}>
                      {filter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={transform.values.value as number}
                onChange={(e) =>
                  updateTransform(transform.id, {
                    ...transform.values,
                    value: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!activeTimeline) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a timeline to start editing
      </div>
    );
  }

  const totalDuration = Math.max(5, getLastKeyframeEnd() + 1);

  return (
    <div className="flex-1 flex flex-col">
      {/* Controls */}
      <div className="border-b border-border p-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isPlaying ? "outline" : "default"}
              onClick={() => setPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPlaying(false);
                setCurrentTime(0);
              }}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>

          <Popover open={isAddKeyframeOpen} onOpenChange={setIsAddKeyframeOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  if (!isAddKeyframeOpen) {
                    resetForm();
                    setEditingKeyframe(null);
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                Add Keyframe
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
              <div className="space-y-4">
                <h3 className="font-semibold">
                  {editingKeyframe ? "Edit Keyframe" : "Add Keyframe"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Delay (s)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={keyframeForm.delay}
                      onChange={(e) =>
                        setKeyframeForm((prev) => ({
                          ...prev,
                          delay: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Duration (ms)</Label>
                    <Input
                      type="number"
                      value={keyframeForm.duration}
                      onChange={(e) =>
                        setKeyframeForm((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 1000,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Easing</Label>
                  <Select
                    value={keyframeForm.easing}
                    onValueChange={(value) =>
                      setKeyframeForm((prev) => ({ ...prev, easing: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GSAP_EASINGS.map((easing) => (
                        <SelectItem key={easing} value={easing}>
                          {easing}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Transforms</Label>
                    <Select
                      onValueChange={(value: TransformType) =>
                        handleAddTransform(value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Add Transform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="move">Move</SelectItem>
                        <SelectItem value="scale">Scale</SelectItem>
                        <SelectItem value="rotate">Rotate</SelectItem>
                        <SelectItem value="opacity">Opacity</SelectItem>
                        <SelectItem value="skew">Skew</SelectItem>
                        <SelectItem value="filter">Filter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {keyframeForm.transforms.map((transform) => (
                      <Card key={transform.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {transform.type}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTransform(transform.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {renderTransformFields(transform)}
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveKeyframe} className="flex-1">
                    {editingKeyframe ? "Update" : "Add"} Keyframe
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddKeyframeOpen(false);
                      setEditingKeyframe(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 p-4">
        <div className="relative bg-muted/20 rounded-lg p-4 min-h-32">
          <div
            ref={timelineRef}
            className="relative h-16 bg-card rounded border"
            style={{ width: `${totalDuration * 100 * zoom}px` }}
          >
            {/* Time markers */}
            <div className="absolute inset-0">
              {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/50"
                  style={{ left: `${(i / totalDuration) * 100}%` }}
                >
                  <span className="absolute -top-6 text-xs text-muted-foreground">
                    {i}s
                  </span>
                </div>
              ))}
            </div>

            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />

            {/* Keyframes */}
            {activeTimeline.keyframes.map((keyframe) => (
              <div
                key={keyframe.id}
                className={`absolute top-2 bottom-2 border-2 border-primary bg-primary/20 rounded hover:bg-primary/30 group ${
                  isDragging && dragOperation?.keyframeId === keyframe.id
                    ? "opacity-70"
                    : ""
                }`}
                style={{
                  left: `${(keyframe.delay / totalDuration) * 100}%`,
                  width: `${(keyframe.duration / 1000 / totalDuration) * 100}%`,
                  cursor: isDragging
                    ? dragOperation?.type === "move"
                      ? "grabbing"
                      : "ew-resize"
                    : "pointer",
                }}
              >
                <div
                  className="h-full bg-primary/20 border border-primary rounded-lg cursor-grab active:cursor-grabbing relative group"
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const rightEdgeThreshold = 10; // pixels from right edge to trigger resize

                    if (e.clientX > rect.right - rightEdgeThreshold) {
                      handleMouseDown(e, keyframe, "resize");
                    } else {
                      handleMouseDown(e, keyframe, "move");
                    }
                  }}
                  onClick={() => {
                    if (didDrag) return;
                    handleEditKeyframe(keyframe);
                  }}
                >
                  <div className="absolute inset-0 flex flex-col p-1 overflow-hidden">
                    <div className="flex justify-start items-center">
                      <span
                        className="text-xxs font-medium text-primary"
                        suppressHydrationWarning
                      >
                        {keyframe.duration}ms / {keyframe.easing}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span
                        className="text-xxs text-primary font-medium bg-primary/10 px-1 rounded"
                        suppressHydrationWarning
                      >
                        {keyframe.transforms.length} transforms
                      </span>
                    </div>
                  </div>

                  {/* Resize handles */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => handleMouseDown(e, keyframe, "resize")}
                  />
                  <div
                    className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => handleMouseDown(e, keyframe, "resize")}
                  />
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTimeline) {
                          deleteKeyframe(activeTimeline.id, keyframe.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
