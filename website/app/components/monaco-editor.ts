import { action } from '@ember/object';
import Component from '@glimmer/component';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { registerDestructor } from '@ember/destroyable';
import type monaco from 'monaco-editor';

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

interface MonacoEditorSignature {
  Args: {
    readOnly?: boolean;
    language: string;
    value?: string;
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

  // constructor(owner, args) {
  //   super(owner, args);

  //   this.args.invoker?.subscribe(this);
  // }

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
      minimap: {
        enabled: false,
      },
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      value: this.args.value,
    });

    // if (Array.isArray(this.args.actions)) {
    //   this.args.actions.forEach((item) => {
    //     // assign because item can be a proxy object
    //     this.editor.addAction(Object.assign({}, item));
    //   });
    // }

    // Autoresize height of element
    // const minHeight = this.args.minHeight ?? 160;
    // const maxHeight = this.args.maxHeight ?? 420;
    // const onDidContentSizeChangeHandler = this.editor.onDidContentSizeChange(
    //   () => {
    //     const contentHeight = Math.min(
    //       Math.max(this.editor.getContentHeight(), minHeight),
    //       maxHeight
    //     );

    //     el.style.height = `${contentHeight + 1}px`;
    //     this.editor.layout();
    //   }
    // );
    // registerDestructor(this, onDidContentSizeChangeHandler.dispose);

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

    // // Validation
    // if (this.args.onDidValidation) {
    //   const onDidChangeMarkersHandler = editor.onDidChangeMarkers(() => {
    //     const model = this.editor.getModel();

    //     this.args.onDidValidation(
    //       editor
    //         .getModelMarkers({ resource: model.uri })
    //         .map((item) => item.message),
    //       this.editor
    //     );
    //   });
    //   registerDestructor(this, onDidChangeMarkersHandler.dispose);
    // }
  }

  @action
  updateValue() {
    if (this.args.value === undefined) {
      this.editor.setValue('');
    } else if (this.args.value !== this.editor.getValue()) {
      this.editor.setValue(this.args.value);
    }
  }

  // @action
  // invokeSendValue() {
  //   this.args.sendValue?.(this.editor.getValue(), this.editor);
  // }

  willDestroy() {
    // this.editor.getModel()?.dispose();
    // this.editor.dispose();

    super.willDestroy();
  }
}
