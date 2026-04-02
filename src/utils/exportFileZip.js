
// 引入实现下载压缩包的两个库
import JSZip from 'jszip';
import FileSaver from 'file-saver';
// 引入请求模块
import axios from 'axios'
// 实现下载压缩包按钮的方法 fileArr 需要下载的文件数组 exportName 导出的压缩包名 fileUrl 文件路径 fileName 文件名
export function downloadZip(fileArr,exportName,fileUrl,fileName) {
    const zip = new JSZip();
    const promises = [];  // 用于存储多个promise
    const arr = fileArr.filter(item => item[fileUrl]!==''); // 将需要下载的文件路径存到数组中
    arr.forEach( item => {
        const promise = new Promise((resolve, reject) => {
            // 实现下载单个文件
            axios ({
                url: item[fileUrl],
                method: 'GET',
                responseType: 'blob'
            }).then((res) => {          // request请求的状态
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
        }).then((res) => {
            // 单个文件下载成功，拿到内容命名后转为二进制存储
            const name = item[fileName];
            // 在此处可以设置压缩包文件夹  zip.file(文件夹名/文件名, 文件内容 ,{配置项});
            zip.file(name, res.data ,{binary: true});
        })
        // 将单个promise存到数组中，后续使用promise.all判断整体状态
        promises.push(promise);
    })
    Promise.all(promises).then(() => {
        // 将压缩包里的文件压缩，返回一个promise实例，成功结果res返回的就是压缩包
        zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",  // STORE：默认不压缩 DEFLATE：需要压缩
            compressionOptions: {
                level: 9               // 压缩等级1~9    1压缩速度最快，9最优压缩方式
            }
        }).then((res) => {
            FileSaver.saveAs(res, exportName) // 利用file-saver保存文件
        })
    })
}
