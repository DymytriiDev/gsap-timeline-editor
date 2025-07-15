'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTimelineStore, type TargetShape } from '@/stores/timeline-store';

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
    
    switch (targetShape) {
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

  return (
    <div className="w-96 border-l border-border bg-card p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          
          <div className="space-y-4">
            <div>
              <Label>Target Object</Label>
              <Select value={targetShape} onValueChange={(value: TargetShape) => setTargetShape(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
