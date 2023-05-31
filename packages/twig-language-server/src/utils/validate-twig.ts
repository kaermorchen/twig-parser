import { Connection, TextDocumentChangeEvent } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { BindingArgs } from '../binding';

export async function validateTwig(document: TextDocument): Promise<void> {
  console.log('validateTwig', document);
}
