import { useState } from 'react'
import Editor from '@monaco-editor/react';

function EditorPage() {
  const [code, setCode] = useState('');
  return (
      <div style={{ height: '100vh' }}>
      <Editor
        height="100vh"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => {
          setCode(value ?? '');
        }}
      />
    </div>
  )
}

export default EditorPage
