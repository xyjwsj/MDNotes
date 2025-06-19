package util

func HtmlToPdf(htmlContent, outputPath string) error {
	//// 启动浏览器（如果未安装，会自动下载）
	//l := launcher.New()
	//u := l.MustLaunch()
	//browser := rod.New().ControlURL(u).MustConnect()
	//defer browser.MustClose()
	//
	//// 打开页面
	//page := browser.MustPage("")
	//
	//err2 := page.SetDocumentContent(htmlContent)
	//if err2 != nil {
	//	return err2
	//}
	//
	//page.MustWaitLoad()
	//
	//// 截图保存为文件
	////page.MustScreenshot("screenshot.png")
	//
	//marginTop := 0.5
	//paperWidth := 8.5
	//paperHeight := 11.0
	//
	//// 生成 PDF 数据
	//pdfData, err := page.PDF(&proto.PagePrintToPDF{
	//	PrintBackground: true,
	//	Landscape:       false,
	//	MarginTop:       &marginTop,
	//	PaperWidth:      &paperWidth,
	//	PaperHeight:     &paperHeight,
	//})
	//if err != nil {
	//	return err
	//}
	//
	//all, err2 := io.ReadAll(pdfData)
	//if err2 != nil {
	//	return err2
	//}
	//
	//// 写入文件
	//os.WriteFile(outputPath, all, 0644)
	return nil
}
