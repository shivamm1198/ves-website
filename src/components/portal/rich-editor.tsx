"use client";

import * as React from "react";
import { EditorContent, useEditor, useEditorState, type Content, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type EditorValue = { json: unknown; text: string };

const extensions = (placeholder: string) => [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
  }),
  Placeholder.configure({ placeholder }),
];

function countWords(editor: Editor) {
  const { doc } = editor.state;
  return doc.textBetween(0, doc.content.size, " ", " ").split(/\s+/).filter(Boolean).length;
}

/** Medium-style writing surface: distraction-free body with a small formatting bar. */
export function RichEditor({
  initial,
  onChange,
  editable = true,
  placeholder = "Start writing…",
}: {
  initial: unknown;
  onChange?: (value: EditorValue) => void;
  editable?: boolean;
  placeholder?: string;
}) {
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const [words, setWords] = React.useState(0);
  const editor = useEditor({
    extensions: extensions(placeholder),
    content: (initial as Content) ?? "",
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "ves-prose min-h-[45vh] outline-none",
        "aria-label": "Your answer",
      },
    },
    onCreate: ({ editor }) => setWords(countWords(editor)),
    onUpdate: ({ editor }) => {
      setWords(countWords(editor));
      onChangeRef.current?.({ json: editor.getJSON(), text: editor.getText() });
    },
  });

  React.useEffect(() => {
    if (editor && editor.isEditable !== editable) editor.setEditable(editable, false);
  }, [editor, editable]);

  return (
    <div className="relative">
      {editable && editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
      {editable && (
        <p className="mt-4 text-right text-xs text-muted-foreground tabular-nums">
          {words} {words === 1 ? "word" : "words"}
        </p>
      )}
    </div>
  );
}

/** Read-only rendering of saved work (same schema, so nothing unexpected can render). */
export function RichViewer({ content }: { content: unknown }) {
  const editor = useEditor({
    extensions: extensions(""),
    content: (content as Content) ?? "",
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: "ves-prose outline-none" } },
  });
  return <EditorContent editor={editor} />;
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const buttons: {
    label: string;
    Icon: typeof Bold;
    active?: boolean;
    disabled?: boolean;
    run: () => void;
  }[] = [
    {
      label: "Bold",
      Icon: Bold,
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      Icon: Italic,
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      Icon: Underline,
      active: state.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Heading",
      Icon: Heading2,
      active: state.h2,
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subheading",
      Icon: Heading3,
      active: state.h3,
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bulleted list",
      Icon: List,
      active: state.bullet,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      Icon: ListOrdered,
      active: state.ordered,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      Icon: Quote,
      active: state.quote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    { label: "Link", Icon: Link2, active: state.link, run: setLink },
    {
      label: "Undo",
      Icon: Undo2,
      disabled: !state.canUndo,
      run: () => editor.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      Icon: Redo2,
      disabled: !state.canRedo,
      run: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-16 z-10 mb-6 flex flex-wrap items-center gap-0.5 rounded-lg border bg-white/95 p-1 shadow-sm backdrop-blur lg:top-4"
    >
      {buttons.map(({ label, Icon, active, disabled, run }, i) => (
        <React.Fragment key={label}>
          {(i === 3 || i === 5 || i === 9) && (
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
          )}
          <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={run}
            className={cn(
              "grid size-8 place-items-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-ink disabled:opacity-30",
              active && "bg-ink text-white hover:bg-ink hover:text-white",
            )}
          >
            <Icon className="size-4" />
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
