import { subsetFontPy } from "@moonvy/font-slice/src/subsetFont/subsetFontPy"
import { subsetFont } from "@moonvy/font-slice/src/subsetFont/subsetFont"
import { IFontInfo } from "../../../FontSlice/src/loadFont/loadFont"

const PreviewString =
    "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVW\
XYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~标题正文链接小大永人民中国苹果沸腾的西瓜雨后的路人中文字体预览月维\
日本語フォントプレビュー\
Предварительный просмотр русских шрифтов\
española\
한국어글꼴미리보기달\
遂古之初谁传道之\
上下未形何由考之\
冥昭瞢闇谁能极之\
冯翼惟象何以识之\
无论在何种惯性参照系中观察，光在真空中的传播速度相对于该观测者都是一个常数，不随光源和观测者所在参考系的相对运动而改变\
，。·！「」【】；‘：“，。《》、？（）——-~·"

export async function genPreviewFont(fontPath: string, outPath: string, fontInfo: IFontInfo) {
    let ob = [fontInfo.fontFamily, fontInfo.fullName, fontInfo.preferredFamily, fontInfo.preferredSubfamily]
    subsetFontPy(fontPath, outPath, PreviewString + JSON.stringify(ob) + outPath)
}
