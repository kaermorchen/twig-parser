import { action } from '@ember/object';
import Component from '@glimmer/component';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { registerDestructor } from '@ember/destroyable';
import type monaco from 'monaco-editor';

// @ts-expect-error This is needed because the SimpleWorker.js in monaco-editor has the following code:
// loaderConfiguration = self.requirejs.s.contexts._.config;
window.requirejs.s = {
  contexts: {
    _: {
      config: '',
    },
  },
};

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
type IStandaloneEditorConstructionOptions =
  monaco.editor.IStandaloneEditorConstructionOptions;

interface MonacoEditorSignature {
  Args: IStandaloneEditorConstructionOptions & {
    onDidChangeModelContent: (
      value: string,
      editor: IStandaloneCodeEditor
    ) => void;
  };
  Blocks: {
    default: [];
  };
  Element: HTMLElement;
}

export default class MonacoEditorComponent extends Component<MonacoEditorSignature> {
  declare editor: IStandaloneCodeEditor;

  @action
  initEditor(el: HTMLElement) {
    this.editor = editor.create(el, {
      readOnly: this.args.readOnly,
      language: this.args.language,
      // wordWrap: 'on',
      // wrappingIndent: 'same',
      lineNumbers: 'off',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      value: this.args.value,
    });

    // onDidChangeModelContent
    if (this.args.onDidChangeModelContent) {
      const onDidChangeModelContent = this.editor.onDidChangeModelContent(
        () => {
          this.args.onDidChangeModelContent(
            this.editor.getValue(),
            this.editor
          );
        }
      );
      registerDestructor(this, onDidChangeModelContent.dispose);
    }
  }

  @action
  updateValue() {
    if (this.args.value === undefined) {
      this.editor.setValue('');
    } else if (this.args.value !== this.editor.getValue()) {
      this.editor.setValue(this.args.value);
    }
  }

  willDestroy() {
    this.editor.getModel()?.dispose();
    this.editor.dispose();

    super.willDestroy();
  }
}
