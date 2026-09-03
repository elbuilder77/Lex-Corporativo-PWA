import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, List, Sparkles } from 'lucide-react';

interface EditorBubbleMenuProps {
  editor: Editor | null;
  onFundamentar: (selectedText: string) => void;
}

export function EditorBubbleMenu({ editor, onFundamentar }: EditorBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state, from, to }) => {
        const { doc } = state;
        const isTextSelection = from !== to;
        const text = doc.textBetween(from, to, ' ').trim();
        return isTextSelection && text.length > 1;
      }}
      className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/95 px-1.5 py-1 text-white shadow-2xl backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to, ' ').trim();
          if (selectedText) {
            onFundamentar(selectedText);
          }
        }}
        className="flex items-center gap-1.5 rounded-lg bg-legal-gold/25 px-2.5 py-1 text-xs font-bold text-amber-300 transition hover:bg-legal-gold/35 active:scale-95"
        title="Buscar fundamento jurídico en el corpus legal para este fragmento"
      >
        <Sparkles size={13} className="text-amber-400" />
        <span>Fundamentar</span>
      </button>

      <div className="mx-1 h-4 w-px bg-slate-800" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded-lg p-1.5 text-xs transition active:scale-95 ${
          editor.isActive('bold') ? 'bg-slate-800 text-amber-300' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        aria-label="Negrita"
      >
        <Bold size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded-lg p-1.5 text-xs transition active:scale-95 ${
          editor.isActive('italic') ? 'bg-slate-800 text-amber-300' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        aria-label="Cursiva"
      >
        <Italic size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded-lg p-1.5 text-xs transition active:scale-95 ${
          editor.isActive('bulletList') ? 'bg-slate-800 text-amber-300' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        aria-label="Lista con viñetas"
      >
        <List size={14} />
      </button>
    </BubbleMenu>
  );
}
