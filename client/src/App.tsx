import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>1.FC Köln Bundesliga Talent Program</h1>
        <p>Management System — UI baseline</p>
      </div>
    </ErrorBoundary>
  );
}

export default App;
