export default function parseFileName(file: string) {
  if (!file.includes('.')) {
    return { name: file, extension: null };
  }
  const fileNameParts = file.split('.');
  const name = fileNameParts.slice(0, -1).join('.');
  const extension = fileNameParts.slice(-1)[0].toLowerCase();
  return {
    name: name.length ? name : null,
    extension: extension.length ? extension : null,
  };
}
