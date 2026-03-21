import { useMemo } from 'react';
import { InspectorPanel } from './components/InspectorPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { createMockTransport } from './mocks/transport';

function App() {
  const transport = useMemo(() => createMockTransport(), []);
  const events = transport.getEvents();
  const cursor = 1;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-debug-muted">Realtime Debugger</p>
          <h1 className="text-2xl font-semibold text-debug-text">Mock Transport Workbench</h1>
        </div>
        <div className="rounded-lg border border-debug-border bg-debug-panel px-3 py-2 text-xs text-debug-muted">
          Bootstrap slice: timeline + inspector shell
        </div>
      </header>

      <section className="grid flex-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <TimelinePanel events={events} cursor={cursor} />
        <InspectorPanel state={transport.initialState} selectedEvent={transport.getEventAt(cursor)} />
      </section>
    </main>
  );
}

export default App;
