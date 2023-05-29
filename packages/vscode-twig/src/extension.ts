import { join } from 'path';
import { ExtensionContext } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node.js';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    join('twig-language-server', 'out', 'index.js')
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'twig' }],
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'twigLanguageServer',
    'Twig Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate() {
  if (!client) {
    return undefined;
  }

  return client.stop();
}
