import { useEffect, useMemo, useState } from 'react';
import { InspectorPanel } from './components/InspectorPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { createMockTransport } from './mocks/transport';

const MIN_SPEED = 0.25;
const MAX_SPEED = 2;

function App() {
  const transport = useMemo(() => createMockTransport(), []);
  const events = useMemo(() => transport.getEvents(), [transport]);

  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [transportState, setTransportState] = useState(transport.initialState);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPlaying || !events.length) {
      return;
    }

    const interval = window.setInterval(() => {
      const next = transport.stepForward();
      if (!next) {
        setIsPlaying(false);
        return;
      }

      setCursor(next.index);
      setCurrentTimeMs(next.emittedAtMs);
      setTransportState(transport.getState());
    }, Math.max(100, 450 / speed));

    return () => window.clearInterval(interval);
  }, [events.length, isPlaying, speed, transport]);

  const selectedEvent = cursor >= 0 ? transport.getEventAt(cursor) : undefined;

  const handleTogglePlay = (): void => {
    if (isPlaying) {
      transport.pause();
      setIsPlaying(false);
      return;
    }

    transport.play();
    setIsPlaying(true);
  };

  const handleStepForward = (): void => {
    const next = transport.stepForward();
    if (!next) {
      return;
    }

    setCursor(next.index);
    setCurrentTimeMs(next.emittedAtMs);
    setTransportState(transport.getState());
  };

  const handleStepBackward = (): void => {
    transport.stepBackward();
    const state = transport.getState();
    setCursor(state.cursor);
    const currentEvent = transport.getEventAt(state.cursor);
    setCurrentTimeMs(currentEvent?.atMs ?? 0);
    setTransportState(state);
  };

  const handleSpeedChange = (next: number): void => {
    const bounded = Math.min(MAX_SPEED, Math.max(MIN_SPEED, next));
    transport.setSpeed(bounded);
    setSpeed(bounded);
  };

  const handleJumpToEvent = (index: number): void => {
    const event = transport.seekToIndex(index);
    const state = transport.getState();
    setCursor(state.cursor);
    setCurrentTimeMs(event?.emittedAtMs ?? 0);
    setTransportState(state);
    setIsPlaying(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-debug-muted">Realtime Debugger</p>
          <h1 className="text-2xl font-semibold text-debug-text">Mock Transport Workbench</h1>
        </div>
        <div className="rounded-lg border border-debug-border bg-debug-panel px-3 py-2 text-xs text-debug-muted">
          Timeline playback instrumentation
        </div>
      </header>

      <section className="grid flex-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <TimelinePanel
          events={events}
          cursor={cursor}
          currentTimeMs={currentTimeMs}
          speed={speed}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
          onJumpToEvent={handleJumpToEvent}
          onSelectEvent={handleJumpToEvent}
          isLoading={isLoading}
        />
        <InspectorPanel state={transportState} selectedEvent={selectedEvent} isLoading={isLoading} />
      </section>
    </main>
  );
}

export default App;
