// Salva um arquivo de texto para o usuário.
// Navegador: download comum. App nativo: o WebView do iOS ignora downloads, então o arquivo
// é gravado no cache do app e abre a folha de compartilhamento (Salvar em Arquivos, AirDrop…).

import { isNative } from "@/app/native";

/** `false` quando o usuário fecha a folha de compartilhamento sem escolher nada. */
export async function saveTextFile(fileName: string, content: string, mimeType: string): Promise<boolean> {
  if (!isNative) {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  const [{ Directory, Encoding, Filesystem }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: content,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  try {
    await Share.share({ title: fileName, files: [uri] });
    return true;
  } catch (error) {
    // Fechar a folha sem compartilhar não é erro.
    if (error instanceof Error && /cancel/i.test(error.message)) return false;
    throw error;
  }
}
