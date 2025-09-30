import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Begin met schrijven...',
  height = 400
}: RichTextEditorProps) {
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey={apiKey || undefined}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: [
            'undo redo | blocks | bold italic underline strikethrough | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | removeformat | help',
            'link image media table | code preview fullscreen | ' +
            'forecolor backcolor | emoticons charmap | searchreplace'
          ],
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
            }
            h1 { font-size: 2em; font-weight: 600; margin: 1em 0 0.5em 0; }
            h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em 0; }
            h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.5em 0; }
            p { margin: 0 0 1em 0; }
            ul, ol { padding-left: 1.5em; margin: 0 0 1em 0; }
            blockquote { 
              border-left: 4px solid #e11d48; 
              padding-left: 1em; 
              margin: 1em 0; 
              font-style: italic; 
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 1em 0; 
            }
            table td, table th { 
              border: 1px solid #ddd; 
              padding: 8px; 
            }
            table th { 
              background-color: #f8f9fa; 
              font-weight: 600; 
            }
          `,
          placeholder,
          branding: false,
          resize: true,
          elementpath: false,
          statusbar: true,
          paste_as_text: false,
          paste_remove_styles: false,
          image_advtab: true,
          image_caption: true,
          image_title: true,
          automatic_uploads: false,
          file_picker_types: 'image',
          setup: (editor) => {
            // Custom image picker die integreert met onze ImageUpload component
            editor.ui.registry.addButton('customImage', {
              icon: 'image',
              tooltip: 'Afbeelding uploaden',
              onAction: () => {
                // Dit zou een modal kunnen openen met onze ImageUpload component
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    // Hier zou je de Firebase Storage upload logica kunnen integreren
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const src = e.target?.result as string;
                      editor.insertContent(`<img src="${src}" alt="${file.name}" style="max-width: 100%; height: auto;" />`);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }
            });
          }
        }}
      />
    </div>
  );
}