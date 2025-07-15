import { Timeline } from '@/stores/timeline-store';

export interface TimelineExport {
  version: string;
  timelines: Timeline[];
  exportedAt: string;
}

export const exportTimelines = (timelines: Timeline[]): string => {
  const exportData: TimelineExport = {
    version: '1.0.0',
    timelines,
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
};

export const importTimelines = (jsonString: string): Timeline[] => {
  try {
    const data = JSON.parse(jsonString) as TimelineExport;
    
    // Validate the structure
    if (!data.timelines || !Array.isArray(data.timelines)) {
      throw new Error('Invalid timeline data structure');
    }
    
    // Validate each timeline
    data.timelines.forEach((timeline, index) => {
      if (!timeline.id || !timeline.name || !Array.isArray(timeline.keyframes)) {
        throw new Error(`Invalid timeline at index ${index}`);
      }
    });
    
    return data.timelines;
  } catch (error) {
    throw new Error(`Failed to import timelines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadTimelines = (timelines: Timeline[], filename?: string) => {
  const jsonString = exportTimelines(timelines);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `gsap-timelines-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const generateTimelineCode = (timeline: Timeline): string => {
  const lines: string[] = [];
  
  lines.push(`// GSAP Timeline: ${timeline.name}`);
  lines.push(`const tl = gsap.timeline({`);
  
  if (timeline.loop) {
    lines.push(`  repeat: -1,`);
    if (timeline.yoyo) {
      lines.push(`  yoyo: true,`);
    }
  }
  
  lines.push(`});`);
  lines.push('');
  
  // Sort keyframes by delay
  const sortedKeyframes = [...timeline.keyframes].sort((a, b) => a.delay - b.delay);
  
  sortedKeyframes.forEach((keyframe, index) => {
    const transformProps: string[] = [];
    
    keyframe.transforms.forEach((transform) => {
      switch (transform.type) {
        case 'move':
          if (transform.values.x !== 0) transformProps.push(`x: ${transform.values.x}`);
          if (transform.values.y !== 0) transformProps.push(`y: ${transform.values.y}`);
          break;
        case 'rotate':
          transformProps.push(`rotation: ${transform.values.rotation}`);
          break;
        case 'opacity':
          transformProps.push(`opacity: ${transform.values.opacity}`);
          break;
        case 'skew':
          if (transform.values.skewX !== 0) transformProps.push(`skewX: ${transform.values.skewX}`);
          if (transform.values.skewY !== 0) transformProps.push(`skewY: ${transform.values.skewY}`);
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
          
          transformProps.push(`filter: "${filterString}"`);
          break;
      }
    });
    
    const propsString = transformProps.length > 0 ? `{ ${transformProps.join(', ')}, duration: ${keyframe.duration / 1000}, ease: "${keyframe.easing}" }` : `{ duration: ${keyframe.duration / 1000}, ease: "${keyframe.easing}" }`;
    
    lines.push(`tl.to(".target", ${propsString}, ${keyframe.delay});`);
  });
  
  if (timeline.playbackType === 'scroll') {
    lines.push('');
    lines.push('// Add ScrollTrigger');
    lines.push('ScrollTrigger.create({');
    lines.push('  animation: tl,');
    lines.push('  trigger: ".trigger-element",');
    lines.push(`  start: "top center",`);
    lines.push(`  end: "${timeline.scrollLength || 300}% center",`);
    lines.push('  scrub: true');
    lines.push('});');
  }
  
  return lines.join('\n');
};
