import path from "path"
import hasha from "hasha"
import filenamify from "filenamify"
import fsex from "fs-extra"
import { genFontCss } from "./genFontCss"
import { loadFont, IFontInfo } from "@moonvy/font-slice/src/loadFont/loadFont"
import { sliceFont } from "@moonvy/font-slice/src/sliceFont/sliceFont"

// @ts-ignore
import fontverter from "fontverter"
import { genPreviewFont } from "./genPreviewFont"

export interface IFontPackge extends IFontInfo {
    displayName: string
    characterLength: number
    woff: string
    woff2: string
    previewWoff: string
    previewWoff2: string
    rawFileSize: number
    rawFileName: string
    rawFileHash: {
        md5: string
        sha1: string
    }
}

export async function genFontPackge(
    filePath: string,
    options?: {
        force: boolean
    }
) {
    let names = filePath.split("/")

    let langName = names[names.length - 3]
    let dirName = names[names.length - 2]
    let fileName = names[names.length - 1]
    let fileExt = filePath.split(".").pop()

    let descName = `${dirName}/${fileName}`
    let fontBuffer = await fsex.readFile(filePath)

    console.log("[genFontPackge]", `${descName}`)
    console.time(`⏱ ${descName} done.`)

    // get hash -----------------
    console.time(`⏱ ${descName} hash.`)
    let fileMd5 = await hasha.async(fontBuffer, { algorithm: "md5" })
    let fileSha1 = await hasha.async(fontBuffer, { algorithm: "sha1" })
    console.timeEnd(`⏱ ${descName} hash.`)

    // gen info -----------------
    let fontInfo: IFontPackge = <any>await loadFont(filePath)
    let packageInfo = {
        ...fontInfo,
    }
    packageInfo.characterLength = fontInfo.characterSet.length
    packageInfo.displayName = dirName
    packageInfo.rawFileName = fileName
    packageInfo.rawFileSize = fsex.statSync(filePath).size
    packageInfo.rawFileHash = {
        md5: fileMd5,
        sha1: fileSha1,
    }
    delete (<any>packageInfo).characterSet

    // CHECK skip
    let fontFamilyName = filenamify(packageInfo.fontFamily.en).replace(/[ ]/g, "-")
    let newDir = `fonts/${langName}/${dirName}/${fontFamilyName}`

    if (fsex.existsSync(`${newDir}/package.json`)) {
        let oldPackage = fsex.readJSONSync(`${newDir}/package.json`)
        // console.log({oldPackage,packageInfo})
        if (oldPackage.rawFileHash.sha1 == packageInfo.rawFileHash.sha1) {
            await fsex.writeFile(`${newDir}/package.json`, JSON.stringify(oldPackage, null, 2))

            console.timeEnd(`⏱ ${descName} done.`)
            console.info(`🍕 [SKIP] by hash: ${descName}\n`)
            return
        }
    }

    // gen preview file
    let previewFontWoff = `preview/${fontFamilyName}.preview.woff`
    let previewFontWoff2 = `preview/${fontFamilyName}.preview.woff2`
    await fsex.ensureDir(`${newDir}/preview`)
    await genPreviewFont(filePath, `${newDir}/${previewFontWoff}`, fontInfo)
    await genPreviewFont(filePath, `${newDir}/${previewFontWoff2}`, fontInfo)
    packageInfo.previewWoff = previewFontWoff
    packageInfo.previewWoff2 = previewFontWoff2

    // move raw file -----------------
    await fsex.ensureDir(newDir)
    console.time(`⏱ ${descName} move file.`)
    await fsex.copyFile(filePath, `${newDir}/${fileName}`)
    await fsex.writeFile(`${newDir}/package.json`, JSON.stringify(packageInfo, null, 2))
    console.timeEnd(`⏱ ${descName} move file.`)

    // convert -----------------
    console.time(`⏱ ${descName} convert file.`)
    const myWoffFontBuffer = await fontverter.convert(fontBuffer, "woff")
    const myWoff2FontBuffer = await fontverter.convert(fontBuffer, "woff2")
    packageInfo.woff = `${fontFamilyName}.woff`
    packageInfo.woff2 = `${fontFamilyName}.woff2`
    await fsex.writeFile(packageInfo.woff, myWoffFontBuffer)
    await fsex.writeFile(packageInfo.woff2, myWoff2FontBuffer)
    console.timeEnd(`⏱ ${descName} convert file.`)

    // copyFile -----------------
    await fsex.copyFile(filePath, `${newDir}/${fileName}`)

    // write packageInfo -----------------
    await fsex.writeFile(`${newDir}/package.json`, JSON.stringify(packageInfo, null, 2))
    await fsex.writeFile(`${newDir}/fontInfo.json`, JSON.stringify(fontInfo))

    // gen css
    genFontCss(packageInfo, `${newDir}/index.css`)

    // slices -----------------
    console.time(`⏱ ${descName} slices.`)

    await sliceFont(filePath, `${newDir}/slices/m2`, {
        sliceMethod: "moonvy2",
        tool: "py",
    })

    await sliceFont(filePath, `${newDir}/slices/m`, {
        sliceMethod: "moonvy",
        tool: "py",
    })

    await sliceFont(filePath, `${newDir}/slices/g`, {
        sliceMethod: "google",
        tool: "py",
    })

    console.timeEnd(`⏱ ${descName} slices.`)
    console.timeEnd(`⏱ ${descName} done.`)
}
