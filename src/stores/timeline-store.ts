import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransformType = 'move' | 'rotate' | 'opacity' | 'skew' | 'filter' | 'scale';

export interface Transform {
  id: string;
  type: TransformType;
  values: Record<string, number | string>;
}

export interface Keyframe {
  id: string;
  delay: number;
  duration: number;
  easing: string;
  transforms: Transform[];
}

export interface Timeline {
  id: string;
  name: string;
  playbackType: 'normal' | 'scroll';
  scrollLength?: number;
  loop: boolean;
  yoyo: boolean;
  keyframes: Keyframe[];
}

export type TargetShape = 
  // Basic shapes
  'square' | 'circle' | 'triangle' | 'star' |
  // Lucide icons - Group 1
  'heart' | 'zap' | 'smile' | 'cloud' | 'bell' | 'music' | 'camera' | 'coffee' |
  // Lucide icons - Group 2
  'activity' | 'airplay' | 'alarm-clock' | 'alert-circle' | 'alert-triangle' | 'anchor' |
  // Lucide icons - Group 3
  'aperture' | 'archive' | 'award' | 'battery' | 'bluetooth' | 'bookmark' |
  // Lucide icons - Group 4
  'calendar' | 'compass' | 'cpu' | 'crown' | 'database' | 'disc' |
  // Lucide icons - Group 5
  'droplet' | 'eye' | 'feather' | 'flag' | 'flame' | 'flower' |
  // Lucide icons - Group 6
  'gift' | 'globe' | 'headphones' | 'home' | 'image' | 'key' |
  // Lucide icons - Group 7
  'layers' | 'leaf' | 'lightbulb' | 'map' | 'moon' | 'palette' |
  // Lucide icons - Group 8
  'paperclip' | 'pizza' | 'rocket' | 'shield' | 'sun' | 'target';

interface TimelineState {
  timelines: Timeline[];
  activeTimelineId: string | null;
  targetShape: TargetShape;
  isPlaying: boolean;
  currentTime: number;
  zoom: number;
  
  // Actions
  addTimeline: (timeline: Omit<Timeline, 'id'>) => void;
  updateTimeline: (id: string, updates: Partial<Timeline>) => void;
  deleteTimeline: (id: string) => void;
  setActiveTimeline: (id: string) => void;
  
  addKeyframe: (timelineId: string, keyframe: Omit<Keyframe, 'id'>) => void;
  updateKeyframe: (timelineId: string, keyframeId: string, updates: Partial<Keyframe>) => void;
  deleteKeyframe: (timelineId: string, keyframeId: string) => void;
  
  setTargetShape: (shape: TargetShape) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  
  getActiveTimeline: () => Timeline | null;
  generateUniqueTimelineName: (baseName: string) => string;
}

const createDemoTimeline = (): Timeline => ({
  id: 'demo',
  name: 'Demo Timeline',
  playbackType: 'normal',
  loop: true,
  yoyo: false,
  keyframes: [
    {
      id: 'demo-keyframe-1',
      delay: 0,
      duration: 1000,
      easing: 'power2.inOut',
      transforms: [
        {
          id: 'demo-transform-1',
          type: 'opacity',
          values: { opacity: 0.3 }
        }
      ]
    },
    {
      id: 'demo-keyframe-2',
      delay: 1,
      duration: 1000,
      easing: 'power2.inOut',
      transforms: [
        {
          id: 'demo-transform-2',
          type: 'opacity',
          values: { opacity: 1 }
        }
      ]
    }
  ]
});

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      timelines: [createDemoTimeline()],
      activeTimelineId: 'demo',
      targetShape: 'square',
      isPlaying: false,
      currentTime: 0,
      zoom: 1,
      
      addTimeline: (timeline) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newTimeline = { ...timeline, id };
        set((state) => ({
          timelines: [...state.timelines, newTimeline],
          activeTimelineId: id
        }));
      },
      
      updateTimeline: (id, updates) => {
        set((state) => ({
          timelines: state.timelines.map(timeline =>
            timeline.id === id ? { ...timeline, ...updates } : timeline
          )
        }));
      },
      
      deleteTimeline: (id) => {
        set((state) => {
          const newTimelines = state.timelines.filter(t => t.id !== id);
          const newActiveId = state.activeTimelineId === id 
            ? (newTimelines.length > 0 ? newTimelines[0].id : null)
            : state.activeTimelineId;
          
          return {
            timelines: newTimelines,
            activeTimelineId: newActiveId
          };
        });
      },
      
      setActiveTimeline: (id) => {
        set({ activeTimelineId: id });
      },
      
      addKeyframe: (timelineId, keyframe) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newKeyframe = { ...keyframe, id };
        
        set((state) => ({
          timelines: state.timelines.map(timeline =>
            timeline.id === timelineId
              ? { ...timeline, keyframes: [...timeline.keyframes, newKeyframe] }
              : timeline
          )
        }));
      },
      
      updateKeyframe: (timelineId, keyframeId, updates) => {
        set((state) => ({
          timelines: state.timelines.map(timeline =>
            timeline.id === timelineId
              ? {
                  ...timeline,
                  keyframes: timeline.keyframes.map(keyframe =>
                    keyframe.id === keyframeId ? { ...keyframe, ...updates } : keyframe
                  )
                }
              : timeline
          )
        }));
      },
      
      deleteKeyframe: (timelineId, keyframeId) => {
        set((state) => ({
          timelines: state.timelines.map(timeline =>
            timeline.id === timelineId
              ? {
                  ...timeline,
                  keyframes: timeline.keyframes.filter(k => k.id !== keyframeId)
                }
              : timeline
          )
        }));
      },
      
      setTargetShape: (shape) => set({ targetShape: shape }),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setZoom: (zoom) => set({ zoom }),
      
      getActiveTimeline: () => {
        const state = get();
        return state.timelines.find(t => t.id === state.activeTimelineId) || null;
      },
      
      generateUniqueTimelineName: (baseName) => {
        const state = get();
        const existingNames = state.timelines.map(t => t.name);
        
        if (!existingNames.includes(baseName)) {
          return baseName;
        }
        
        let counter = 2;
        while (existingNames.includes(`${baseName} ${counter}`)) {
          counter++;
        }
        
        return `${baseName} ${counter}`;
      }
    }),
    {
      name: 'timeline-storage'
    }
  )
);
