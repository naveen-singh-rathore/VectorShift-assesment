import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { useStore } from './store';

function App() {
  const theme = useStore((state) => state.theme);

  return (
    <div className={`app app--${theme}`}>
      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;
