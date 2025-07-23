'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTimelineStore, type TargetShape } from '@/stores/timeline-store';
import {
  // Basic shape icon
  Square,
  // Group 1
  Heart, Zap, Smile, Cloud, Bell, Music, Camera, Coffee,
  // Group 2
  Activity, Airplay, AlarmClock, AlertCircle, AlertTriangle, Anchor,
  // Group 3
  Aperture, Archive, Award, Battery, Bluetooth, Bookmark,
  // Group 4
  Calendar, Compass, Cpu, Crown, Database, Disc,
  // Group 5
  Droplet, Eye, Feather, Flag, Flame, Flower,
  // Group 6
  Gift, Globe, Headphones, Home, Image, Key,
  // Group 7
  Layers, Leaf, Lightbulb, Map, Moon, Palette,
  // Group 8
  Paperclip, Pizza, Rocket, Shield, Sun, Target
} from 'lucide-react';
import { CategorySelect } from '@/components/ui/category-select';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function PreviewArea() {
  const {
    getActiveTimeline,
    targetShape,
    setTargetShape,
    isPlaying,
    setCurrentTime
  } = useTimelineStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const activeTimeline = getActiveTimeline();

  const renderShape = () => {
    const baseClasses = "transition-all duration-200";
    const iconClasses = "w-16 h-16 text-white";
    
    switch (targetShape) {
      // Basic shapes
      case 'circle':
        return <div className={`w-16 h-16 bg-white rounded-full ${baseClasses}`} />;
      case 'triangle':
        return (
          <div className={`w-0 h-0 ${baseClasses}`} style={{
            borderLeft: '32px solid transparent',
            borderRight: '32px solid transparent',
            borderBottom: '55px solid white'
          }} />
        );
      case 'star':
        return (
          <div className={`w-16 h-16 ${baseClasses}`}>
            <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        );
      
      // Lucide icons
      case 'heart':
        return <Heart className={iconClasses} />;
      case 'zap':
        return <Zap className={iconClasses} />;
      case 'smile':
        return <Smile className={iconClasses} />;
      case 'cloud':
        return <Cloud className={iconClasses} />;
      case 'bell':
        return <Bell className={iconClasses} />;
      case 'music':
        return <Music className={iconClasses} />;
      case 'camera':
        return <Camera className={iconClasses} />;
      case 'coffee':
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
      }
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
      filter: 'none'
    });

    // Add keyframes to timeline
    activeTimeline.keyframes
      .sort((a, b) => a.delay - b.delay)
      .forEach((keyframe) => {
        const transformProps: Record<string, number | string> = {};
        
        keyframe.transforms.forEach((transform) => {
          switch (transform.type) {
            case 'move':
              transformProps.x = transform.values.x;
              transformProps.y = transform.values.y;
              break;
            case 'rotate':
              transformProps.rotation = transform.values.rotation;
              break;
            case 'opacity':
              transformProps.opacity = transform.values.opacity;
              break;
            case 'skew':
              transformProps.skewX = transform.values.skewX;
              transformProps.skewY = transform.values.skewY;
              break;
            case 'scale':
              transformProps.scaleX = transform.values.scaleX;
              transformProps.scaleY = transform.values.scaleY;
              break;
            case 'filter':
              const filterType = transform.values.filter;
              const filterValue = transform.values.value;
              let filterString = '';
              
              switch (filterType) {
                case 'blur':
                  filterString = `blur(${filterValue}px)`;
                  break;
                case 'brightness':
                  filterString = `brightness(${filterValue}%)`;
                  break;
                case 'contrast':
                  filterString = `contrast(${filterValue}%)`;
                  break;
                case 'grayscale':
                  filterString = `grayscale(${filterValue}%)`;
                  break;
                case 'hue-rotate':
                  filterString = `hue-rotate(${filterValue}deg)`;
                  break;
                case 'invert':
                  filterString = `invert(${filterValue}%)`;
                  break;
                case 'opacity':
                  filterString = `opacity(${filterValue}%)`;
                  break;
                case 'saturate':
                  filterString = `saturate(${filterValue}%)`;
                  break;
                case 'sepia':
                  filterString = `sepia(${filterValue}%)`;
                  break;
              }
              
              transformProps.filter = filterString;
              break;
          }
        });

        tl.to(targetRef.current, {
          ...transformProps,
          duration: keyframe.duration / 1000,
          ease: keyframe.easing
        }, keyframe.delay);
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
        { value: "square" as TargetShape, label: "Square", icon: <Square className="h-4 w-4" /> },
        { value: "circle" as TargetShape, label: "Circle", icon: <div className="h-4 w-4 rounded-full bg-current" /> },
        { value: "triangle" as TargetShape, label: "Triangle", icon: <div className="h-0 w-0 border-x-4 border-x-transparent border-b-[8px]" /> },
        { value: "star" as TargetShape, label: "Star", icon: <div className="text-xs">★</div> },
      ],
    },
    {
      name: "Icons - Group 1",
      options: [
        { value: "heart" as TargetShape, label: "Heart", icon: <Heart className="h-4 w-4" /> },
        { value: "zap" as TargetShape, label: "Zap", icon: <Zap className="h-4 w-4" /> },
        { value: "smile" as TargetShape, label: "Smile", icon: <Smile className="h-4 w-4" /> },
        { value: "cloud" as TargetShape, label: "Cloud", icon: <Cloud className="h-4 w-4" /> },
        { value: "bell" as TargetShape, label: "Bell", icon: <Bell className="h-4 w-4" /> },
        { value: "music" as TargetShape, label: "Music", icon: <Music className="h-4 w-4" /> },
        { value: "camera" as TargetShape, label: "Camera", icon: <Camera className="h-4 w-4" /> },
        { value: "coffee" as TargetShape, label: "Coffee", icon: <Coffee className="h-4 w-4" /> },
      ],
    },
    {
      name: "Icons - Group 2",
      options: [
        { value: "activity" as TargetShape, label: "Activity", icon: <Activity className="h-4 w-4" /> },
        { value: "airplay" as TargetShape, label: "Airplay", icon: <Airplay className="h-4 w-4" /> },
        { value: "alarm-clock" as TargetShape, label: "Alarm Clock", icon: <AlarmClock className="h-4 w-4" /> },
        { value: "alert-circle" as TargetShape, label: "Alert Circle", icon: <AlertCircle className="h-4 w-4" /> },
        { value: "alert-triangle" as TargetShape, label: "Alert Triangle", icon: <AlertTriangle className="h-4 w-4" /> },
        { value: "anchor" as TargetShape, label: "Anchor", icon: <Anchor className="h-4 w-4" /> },
      ],
    },
    {
      name: "Icons - Group 3",
      options: [
        { value: "aperture" as TargetShape, label: "Aperture", icon: <Aperture className="h-4 w-4" /> },
        { value: "archive" as TargetShape, label: "Archive", icon: <Archive className="h-4 w-4" /> },
        { value: "award" as TargetShape, label: "Award", icon: <Award className="h-4 w-4" /> },
        { value: "battery" as TargetShape, label: "Battery", icon: <Battery className="h-4 w-4" /> },
        { value: "bluetooth" as TargetShape, label: "Bluetooth", icon: <Bluetooth className="h-4 w-4" /> },
        { value: "bookmark" as TargetShape, label: "Bookmark", icon: <Bookmark className="h-4 w-4" /> },
      ],
    },
    {
      name: "Icons - Group 4",
      options: [
        { value: "calendar" as TargetShape, label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
        { value: "compass" as TargetShape, label: "Compass", icon: <Compass className="h-4 w-4" /> },
        { value: "cpu" as TargetShape, label: "CPU", icon: <Cpu className="h-4 w-4" /> },
        { value: "crown" as TargetShape, label: "Crown", icon: <Crown className="h-4 w-4" /> },
        { value: "database" as TargetShape, label: "Database", icon: <Database className="h-4 w-4" /> },
        { value: "disc" as TargetShape, label: "Disc", icon: <Disc className="h-4 w-4" /> },
      ],
    },
    {
      name: "Icons - Group 5",
      options: [
        { value: "droplet" as TargetShape, label: "Droplet", icon: <Droplet className="h-4 w-4" /> },
        { value: "eye" as TargetShape, label: "Eye", icon: <Eye className="h-4 w-4" /> },
        { value: "feather" as TargetShape, label: "Feather", icon: <Feather className="h-4 w-4" /> },
        { value: "flag" as TargetShape, label: "Flag", icon: <Flag className="h-4 w-4" /> },
        { value: "flame" as TargetShape, label: "Flame", icon: <Flame className="h-4 w-4" /> },
        { value: "flower" as TargetShape, label: "Flower", icon: <Flower className="h-4 w-4" /> },
      ],
    },
    {
      name: "Icons - Group 6",
      options: [
        { value: "gift" as TargetShape, label: "Gift", icon: <Gift className="h-4 w-4" /> },
        { value: "globe" as TargetShape, label: "Globe", icon: <Globe className="h-4 w-4" /> },
        { value: "headphones" as TargetShape, label: "Headphones", icon: <Headphones className="h-4 w-4" /> },
        { value: "home" as TargetShape, label: "Home", icon: <Home className="h-4 w-4" /> },
        { value: "image" as TargetShape, label: "Image", icon: <Image className="h-4 w-4" /> },
        { value: "key" as TargetShape, label: "Key", icon: <Key className="h-4 w-4" /> },
      ],
    },
    {
      name: "Icons - Group 7",
      options: [
        { value: "layers" as TargetShape, label: "Layers", icon: <Layers className="h-4 w-4" /> },
        { value: "leaf" as TargetShape, label: "Leaf", icon: <Leaf className="h-4 w-4" /> },
        { value: "lightbulb" as TargetShape, label: "Lightbulb", icon: <Lightbulb className="h-4 w-4" /> },
        { value: "map" as TargetShape, label: "Map", icon: <Map className="h-4 w-4" /> },
        { value: "moon" as TargetShape, label: "Moon", icon: <Moon className="h-4 w-4" /> },
        { value: "palette" as TargetShape, label: "Palette", icon: <Palette className="h-4 w-4" /> },
      ],
    },
    {
      name: "Icons - Group 8",
      options: [
        { value: "paperclip" as TargetShape, label: "Paperclip", icon: <Paperclip className="h-4 w-4" /> },
        { value: "pizza" as TargetShape, label: "Pizza", icon: <Pizza className="h-4 w-4" /> },
        { value: "rocket" as TargetShape, label: "Rocket", icon: <Rocket className="h-4 w-4" /> },
        { value: "shield" as TargetShape, label: "Shield", icon: <Shield className="h-4 w-4" /> },
        { value: "sun" as TargetShape, label: "Sun", icon: <Sun className="h-4 w-4" /> },
        { value: "target" as TargetShape, label: "Target", icon: <Target className="h-4 w-4" /> },
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
          <div ref={targetRef} className="flex items-center justify-center">
            {renderShape()}
          </div>
        </div>

        {activeTimeline && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Timeline: {activeTimeline.name}</div>
            <div>Keyframes: {activeTimeline.keyframes.length}</div>
            <div>Type: {activeTimeline.playbackType}</div>
            {activeTimeline.loop && <div>Loop: {activeTimeline.yoyo ? 'Yo-yo' : 'Normal'}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
