import {
  Connection,
  InitializeParams,
  ServerCapabilities,
  TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateTwig } from './utils/validate-twig';

export const capabilities: ServerCapabilities = {};

export type BindingArgs = {
  openDocuments: TextDocuments<TextDocument>;
  connection: Connection;
};

export function bindLanguageServer(arg: BindingArgs): void {
  const { connection, openDocuments } = arg;

  connection.onInitialize((config: InitializeParams) => {
    return { capabilities };
  });

  openDocuments.onDidChangeContent(validateTwig, arg);
}
