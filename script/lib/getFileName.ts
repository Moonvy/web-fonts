export function getFileName(path: string) {
    let names = path.split("/")
    return names[names.length - 1]
}
