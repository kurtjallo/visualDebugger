import { useState } from 'react'
import StudentRoster from './components/BrokenLogic'
import UserProfiles from './components/BrokenRuntime'

type Tab = 'syntax' | 'logic' | 'runtime'

const tabs: { id: Tab; label: string }[] = [
  { id: 'syntax', label: 'Greeting Card' },
  { id: 'logic', label: 'Student Roster' },
  { id: 'runtime', label: 'User Profiles' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('runtime')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Student Project Showcase</h1>
        <span className="header-badge">VisualDebugger</span>
      </header>
      <nav className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main>
        {activeTab === 'syntax' && (
          <div className="component-container">
            <h2>Greeting Card Generator</h2>
            <p className="description">Open <code>BrokenSyntax.tsx</code> in the editor to see the syntax error demo.</p>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', marginTop: '12px' }}>
              This file has a missing closing parenthesis — VS Code will flag it with a red squiggly line.
              VisualDebugger will explain what the error means.
            </p>
          </div>
        )}
        {activeTab === 'logic' && <StudentRoster />}
        {activeTab === 'runtime' && <UserProfiles />}
      </main>
    </div>
  )
}
