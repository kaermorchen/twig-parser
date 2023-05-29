import {
  ProposedFeatures,
  TextDocuments,
  createConnection,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { bindLanguageServer } from './binding';

const connection = createConnection(ProposedFeatures.all);
const openDocuments = new TextDocuments(TextDocument);

bindLanguageServer({ connection, openDocuments });

openDocuments.listen(connection);
connection.listen();
