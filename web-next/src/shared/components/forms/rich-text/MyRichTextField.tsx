"use client";

import { useEffect, useId } from "react";
import { Box, Button, FormHelperText, FormLabel, Stack } from "@mui/material";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useTranslation } from "react-i18next";

export interface RichTextInsertion { value: string; label: string; kind?: "text" | "link"; text?: string; }
export interface MyRichTextFieldProps {
  name: string; label: string; value: string; onChange: (value: string) => void;
  onBlur?: () => void; inputRef?: (instance: { focus: () => void } | null) => void;
  error?: string; readOnly?: boolean; direction?: "rtl" | "ltr";
  insertions?: readonly RichTextInsertion[];
}

export default function MyRichTextField({ name, label, value, onChange, onBlur, inputRef, error,
  readOnly = false, direction = "ltr", insertions = [] }: MyRichTextFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false, HTMLAttributes: { target: null, rel: null, class: null },
        isAllowedUri: (url) => insertions.some(item => item.kind === "link" && item.value === url) || /^https:\/\//i.test(url) },
    })],
    content: value, editable: !readOnly,
    editorProps: { attributes: { id, name, role: "textbox", "aria-label": label,
      "aria-multiline": "true", "aria-describedby": `${id}-help`, dir: direction } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    onBlur: () => onBlur?.(),
  });
  useEffect(() => { if (editor && editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  useEffect(() => { editor?.setEditable(!readOnly); }, [editor, readOnly]);
  useEffect(() => { inputRef?.(editor ? { focus: () => { editor.commands.focus(); } } : null); return () => inputRef?.(null); }, [editor, inputRef]);
  const active = useEditorState({ editor, selector: ({ editor: current }) => ({
    bold: current?.isActive("bold") ?? false, italic: current?.isActive("italic") ?? false,
    underline: current?.isActive("underline") ?? false, bulletList: current?.isActive("bulletList") ?? false,
    orderedList: current?.isActive("orderedList") ?? false,
  }) });

  const actions = [
    { key: "bold", pressed: active?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { key: "italic", pressed: active?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { key: "underline", pressed: active?.underline, run: () => editor?.chain().focus().toggleUnderline().run() },
    { key: "bulletList", pressed: active?.bulletList, run: () => editor?.chain().focus().toggleBulletList().run() },
    { key: "orderedList", pressed: active?.orderedList, run: () => editor?.chain().focus().toggleOrderedList().run() },
    { key: "undo", run: () => editor?.chain().focus().undo().run() },
    { key: "redo", run: () => editor?.chain().focus().redo().run() },
  ];
  return <Stack spacing={1}>
    <FormLabel htmlFor={id} error={Boolean(error)}>{label}</FormLabel>
    {!readOnly && <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap" }} role="toolbar" aria-label={t("richText.formatting")}>
      {actions.map(action => <Button key={action.key} type="button" size="small" disabled={!editor} aria-pressed={action.pressed}
        variant={action.pressed ? "contained" : "text"} onClick={action.run}>{t(`richText.${action.key}`)}</Button>)}
      {insertions.map(item => <Button key={item.value} type="button" size="small" variant="outlined" disabled={!editor}
        onClick={() => editor?.chain().focus().insertContent(item.kind === "link"
          ? { type: "text", text: item.text ?? item.label, marks: [{ type: "link", attrs: { href: item.value } }] }
          : { type: "text", text: item.value }).run()}>{item.label}</Button>)}
    </Stack>}
    <Box sx={{ border: 1, borderColor: error ? "error.main" : "divider", borderRadius: 1, p: 2, minHeight: 240,
      "& .tiptap": { minHeight: 200, outline: "none", overflowWrap: "anywhere" }, "& .tiptap a": { color: "primary.main" } }}>
      <EditorContent editor={editor} />
    </Box>
    <FormHelperText id={`${id}-help`} error={Boolean(error)}>{error ?? t("richText.hint")}</FormHelperText>
  </Stack>;
}
