import SocialPostsPanel from './SocialPostsPanel.jsx';
import ui from './ui.module.css';
import './ui.module.css';

export default function App() {
  return (
    <div className={ui.appShell}>
      <header className={ui.appHeader}>
        <h1>Social Post Factory</h1>
        <p>AiBhive — daily FB / Instagram / X content pipeline</p>
      </header>
      <SocialPostsPanel />
    </div>
  );
}
