import {
  Connection,
  InitializeParams,
  ServerCapabilities,
  TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

export const capabilities: ServerCapabilities = {};

export type BindingArgs = {
  openDocuments: TextDocuments<TextDocument>;
  connection: Connection;
};

export function bindLanguageServer({ connection }: BindingArgs): void {
  connection.onInitialize((config: InitializeParams) => {
    return { capabilities };
  });
}
