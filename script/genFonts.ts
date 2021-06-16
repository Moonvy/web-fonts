import fg from "fast-glob"

import { genFontPackge } from "./lib/genFontPackage"

let fonts = fg.sync(["raw/**/*.ttf", "raw/**/*.otf"], { absolute: true })
console.log("fonts", fonts)

// let fontInfos = fonts.map((font) => loadFont(font))
// console.log("fontInfos", fontInfos)

// Promise.all(
//     fonts.map(async (fontPath) => {
//         return genFontPackge(fontPath)
//     })
// )
;(async () => {
    for (const fontPath of fonts) {
        try {
            await genFontPackge(fontPath)
        } catch (e) {
            console.error(e)
        }
    }
})()
