import { Header } from '@/components/Header';
import { TimelinesSidebar } from '@/components/TimelinesSidebar';
import { TimelineEditor } from '@/components/TimelineEditor';
import { PreviewArea } from '@/components/PreviewArea';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <TimelinesSidebar />
        <TimelineEditor />
        <PreviewArea />
      </div>
    </div>
  );
}
