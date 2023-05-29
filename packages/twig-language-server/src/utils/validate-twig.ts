import { Connection, TextDocumentChangeEvent } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { BindingArgs } from '../binding';

export async function validateTwig(this: BindingArgs) {
  console.log('validateTwig');
}
