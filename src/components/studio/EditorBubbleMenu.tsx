import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, List, Lock } from 'lucide-react';

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
      className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/95 px-2 py-1 text-white shadow-dialog backdrop-blur-md"
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
        className="flex items-center gap-2 rounded-lg bg-legal-gold/20 px-3 py-1 text-xs font-bold text-legal-gold transition hover:bg-legal-gold/30 active:scale-95 cursor-pointer"
        title="Fundamentación y Citas (Exclusivo de Lex Corporativo Desktop)"
      >
        <Lock size={12} className="text-legal-gold" />
        <span>Fundamentar</span>
        <span className="rounded bg-legal-gold/20 px-1 py-px text-[9px] font-bold uppercase text-legal-gold">
          Desktop
        </span>
      </button>

      <div className="mx-1 h-4 w-px bg-slate-800" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded-lg p-2 text-xs transition active:scale-95 cursor-pointer ${
          editor.isActive('bold') ? 'bg-slate-800 text-legal-gold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        aria-label="Negrita"
      >
        <Bold size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded-lg p-2 text-xs transition active:scale-95 cursor-pointer ${
          editor.isActive('italic') ? 'bg-slate-800 text-legal-gold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        aria-label="Cursiva"
      >
        <Italic size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded-lg p-2 text-xs transition active:scale-95 cursor-pointer ${
          editor.isActive('bulletList') ? 'bg-slate-800 text-legal-gold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        aria-label="Lista con viñetas"
      >
        <List size={14} />
      </button>
    </BubbleMenu>
  );
}
