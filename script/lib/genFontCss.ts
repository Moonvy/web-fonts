import { IFontPackge } from "./genFontPackage"
import fsex from "fs-extra"

export function genFontCss(fontPackage: IFontPackge, outFile: string) {
    let css = `/* [${fontPackage.fontFamily.zh ?? fontPackage.fontFamily.en}] */
@font-face {
 font-family: '${fontPackage.fontFamily.en}';
 font-weight: ${fontPackage.fontWeight};
 font-display: swap;
 src: url(${fontPackage.woff2}) format('woff2'),
      url(${fontPackage.woff}) format('woff');
}`
    fsex.writeFileSync(outFile, css)
}
