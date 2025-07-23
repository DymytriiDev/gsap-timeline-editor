"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTimelineStore, type TargetShape } from "@/stores/timeline-store";
import { Button } from "@/components/ui/button";
import { Repeat, RefreshCw } from "lucide-react";
import {
  // Basic shape icon
  Square,
  // Group 1
  Heart,
  Zap,
  Smile,
  Cloud,
  Bell,
  Music,
  Camera,
  Coffee,
  ArrowLeft,
  ArrowRight,
  Waves,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  Share2,
  Twitter,
  User,
  Youtube,
} from "lucide-react";
import { CategorySelect } from "@/components/ui/category-select";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function PreviewArea() {
  const {
    getActiveTimeline,
    targetShape,
    setTargetShape,
    isPlaying,
    setCurrentTime,
    updateTimeline,
  } = useTimelineStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const activeTimeline = getActiveTimeline();

  const renderShape = () => {
    const baseClasses = "transition-all duration-200";
    const iconClasses = "w-20 h-20 text-white";

    switch (targetShape) {
      // Basic shapes
      case "square":
        return <div className={`w-20 h-20 bg-white ${baseClasses}`} />;
      case "circle":
        return (
          <div className={`w-20 h-20 bg-white rounded-full ${baseClasses}`} />
        );
      case "triangle":
        return (
          <div
            className={`w-0 h-0 ${baseClasses}`}
            style={{
              borderLeft: "40px solid transparent",
              borderRight: "40px solid transparent",
              borderBottom: "69px solid white",
            }}
          />
        );
      case "star":
        return (
          <div className={`w-20 h-20 ${baseClasses}`}>
            <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        );

      // Popular Icons
      case "user" as TargetShape:
        return <User className={iconClasses} />;
      case "menu" as TargetShape:
        return <Menu className={iconClasses} />;
      case "music" as TargetShape:
        return <Music className={iconClasses} />;
      case "waves" as TargetShape:
        return <Waves className={iconClasses} />;
      case "arrow-right" as TargetShape:
        return <ArrowRight className={iconClasses} />;
      case "arrow-left" as TargetShape:
        return <ArrowLeft className={iconClasses} />;
      case "heart" as TargetShape:
        return <Heart className={iconClasses} />;
      case "zap" as TargetShape:
        return <Zap className={iconClasses} />;
      case "smile" as TargetShape:
        return <Smile className={iconClasses} />;
      case "bell" as TargetShape:
        return <Bell className={iconClasses} />;
      
      // Social Icons
      case "github" as TargetShape:
        return <Github className={iconClasses} />;
      case "twitter" as TargetShape:
        return <Twitter className={iconClasses} />;
      case "instagram" as TargetShape:
        return <Instagram className={iconClasses} />;
      case "facebook" as TargetShape:
        return <Facebook className={iconClasses} />;
      case "linkedin" as TargetShape:
        return <Linkedin className={iconClasses} />;
      case "youtube" as TargetShape:
        return <Youtube className={iconClasses} />;
      case "mail" as TargetShape:
        return <Mail className={iconClasses} />;
      case "share" as TargetShape:
        return <Share2 className={iconClasses} />;
      
      // Legacy icons (kept for backward compatibility)
      case "cloud":
        return <Cloud className={iconClasses} />;
      case "camera":
        return <Camera className={iconClasses} />;
      case "coffee":
        return <Coffee className={iconClasses} />;

      // Default (square)
      default:
        return <div className={`w-16 h-16 bg-white ${baseClasses}`} />;
    }
  };

  const createGSAPTimeline = () => {
    if (!activeTimeline || !targetRef.current) return null;

    const tl = gsap.timeline({
      paused: true,
      repeat: activeTimeline.loop ? -1 : 0,
      yoyo: activeTimeline.yoyo,
      onUpdate: () => {
        if (tl) {
          setCurrentTime(tl.time());
        }
      },
    });

    // Reset target to initial state
    gsap.set(targetRef.current, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      skewX: 0,
      skewY: 0,
      scaleX: 1,
      scaleY: 1,
      filter: "none",
    });

    // Add keyframes to timeline
    activeTimeline.keyframes
      .sort((a, b) => a.delay - b.delay)
      .forEach((keyframe) => {
        const transformProps: Record<string, number | string> = {};

        keyframe.transforms.forEach((transform) => {
          switch (transform.type) {
            case "move":
              transformProps.x = transform.values.x;
              transformProps.y = transform.values.y;
              break;
            case "rotate":
              transformProps.rotation = transform.values.rotation;
              break;
            case "opacity":
              transformProps.opacity = transform.values.opacity;
              break;
            case "skew":
              transformProps.skewX = transform.values.skewX;
              transformProps.skewY = transform.values.skewY;
              break;
            case "scale":
              transformProps.scaleX = transform.values.scaleX;
              transformProps.scaleY = transform.values.scaleY;
              break;
            case "filter":
              const filterType = transform.values.filter;
              const filterValue = transform.values.value;
              let filterString = "";

              switch (filterType) {
                case "blur":
                  filterString = `blur(${filterValue}px)`;
                  break;
                case "brightness":
                  filterString = `brightness(${filterValue}%)`;
                  break;
                case "contrast":
                  filterString = `contrast(${filterValue}%)`;
                  break;
                case "grayscale":
                  filterString = `grayscale(${filterValue}%)`;
                  break;
                case "hue-rotate":
                  filterString = `hue-rotate(${filterValue}deg)`;
                  break;
                case "invert":
                  filterString = `invert(${filterValue}%)`;
                  break;
                case "opacity":
                  filterString = `opacity(${filterValue}%)`;
                  break;
                case "saturate":
                  filterString = `saturate(${filterValue}%)`;
                  break;
                case "sepia":
                  filterString = `sepia(${filterValue}%)`;
                  break;
              }

              transformProps.filter = filterString;
              break;
          }
        });

        tl.to(
          targetRef.current,
          {
            ...transformProps,
            duration: keyframe.duration / 1000,
            ease: keyframe.easing,
          },
          keyframe.delay
        );
      });

    return tl;
  };

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = createGSAPTimeline();

    // If isPlaying is true, play the timeline immediately after creation
    if (timelineRef.current && isPlaying) {
      timelineRef.current.play();
    }
  }, [activeTimeline, targetShape]);

  useEffect(() => {
    if (timelineRef.current) {
      if (isPlaying) {
        timelineRef.current.play();
      } else {
        timelineRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  // Define target shape categories for the CategorySelect component
  const targetShapeCategories: {
    name: string;
    options: { value: TargetShape; label: string; icon?: React.ReactNode }[];
  }[] = [
    {
      name: "Shapes",
      options: [
        {
          value: "square" as TargetShape,
          label: "Square",
          icon: <Square className="h-4 w-4" />,
        },
        {
          value: "circle" as TargetShape,
          label: "Circle",
          icon: <div className="h-4 w-4 rounded-full bg-current" />,
        },
        {
          value: "triangle" as TargetShape,
          label: "Triangle",
          icon: (
            <div className="h-0 w-0 border-x-4 border-x-transparent border-b-[8px]" />
          ),
        },
        {
          value: "star" as TargetShape,
          label: "Star",
          icon: <div className="text-xs">★</div>,
        },
      ],
    },
    {
      name: "Popular Icons",
      options: [
        {
          value: "user" as TargetShape,
          label: "User",
          icon: <User className="h-4 w-4" />,
        },
        {
          value: "menu" as TargetShape,
          label: "Menu",
          icon: <Menu className="h-4 w-4" />,
        },
        {
          value: "music" as TargetShape,
          label: "Music",
          icon: <Music className="h-4 w-4" />,
        },
        {
          value: "waves" as TargetShape,
          label: "Audio Waves",
          icon: <Waves className="h-4 w-4" />,
        },
        {
          value: "arrow-right" as TargetShape,
          label: "Arrow Right",
          icon: <ArrowRight className="h-4 w-4" />,
        },
        {
          value: "arrow-left" as TargetShape,
          label: "Arrow Left",
          icon: <ArrowLeft className="h-4 w-4" />,
        },
        {
          value: "heart" as TargetShape,
          label: "Heart",
          icon: <Heart className="h-4 w-4" />,
        },
        {
          value: "zap" as TargetShape,
          label: "Zap",
          icon: <Zap className="h-4 w-4" />,
        },
        {
          value: "smile" as TargetShape,
          label: "Smile",
          icon: <Smile className="h-4 w-4" />,
        },
        {
          value: "bell" as TargetShape,
          label: "Bell",
          icon: <Bell className="h-4 w-4" />,
        },
      ],
    },
    {
      name: "Social Icons",
      options: [
        {
          value: "github" as TargetShape,
          label: "GitHub",
          icon: <Github className="h-4 w-4" />,
        },
        {
          value: "twitter" as TargetShape,
          label: "Twitter",
          icon: <Twitter className="h-4 w-4" />,
        },
        {
          value: "instagram" as TargetShape,
          label: "Instagram",
          icon: <Instagram className="h-4 w-4" />,
        },
        {
          value: "facebook" as TargetShape,
          label: "Facebook",
          icon: <Facebook className="h-4 w-4" />,
        },
        {
          value: "linkedin" as TargetShape,
          label: "LinkedIn",
          icon: <Linkedin className="h-4 w-4" />,
        },
        {
          value: "youtube" as TargetShape,
          label: "YouTube",
          icon: <Youtube className="h-4 w-4" />,
        },
        {
          value: "mail" as TargetShape,
          label: "Mail",
          icon: <Mail className="h-4 w-4" />,
        },
        {
          value: "share" as TargetShape,
          label: "Share",
          icon: <Share2 className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <div className="w-96 border-l border-border bg-card p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <CategorySelect
              categories={targetShapeCategories}
              value={targetShape}
              onValueChange={(value: TargetShape) => setTargetShape(value)}
              triggerClassName="w-32"
            />
          </div>
        </div>

        <div
          ref={containerRef}
          className="bg-black rounded-lg p-8 min-h-64 flex items-center justify-center relative overflow-hidden"
        >
          <div ref={targetRef}>{renderShape()}</div>
        </div>

        {activeTimeline && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant="ghost"
              className={activeTimeline.loop ? "text-primary" : "text-muted-foreground"}
              title={activeTimeline.loop ? "Disable loop" : "Enable loop"}
              onClick={() => updateTimeline(activeTimeline.id, { loop: !activeTimeline.loop })}
            >
              <Repeat className="h-4 w-4" />
            </Button>
            {activeTimeline.loop && (
              <Button
                size="sm"
                variant="ghost"
                className={activeTimeline.yoyo ? "text-primary" : "text-muted-foreground"}
                title={activeTimeline.yoyo ? "Disable yo-yo" : "Enable yo-yo"}
                onClick={() => updateTimeline(activeTimeline.id, { yoyo: !activeTimeline.yoyo })}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {activeTimeline && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Timeline: {activeTimeline.name}</div>
            <div>Keyframes: {activeTimeline.keyframes.length}</div>
            <div>Type: {activeTimeline.playbackType}</div>
            {activeTimeline.loop && (
              <div>Loop: {activeTimeline.yoyo ? "Yo-yo" : "Normal"}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
