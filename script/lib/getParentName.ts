export function getParentName(path: string) {
    let names = path.split("/")
    return names[names.length - 2]
}
