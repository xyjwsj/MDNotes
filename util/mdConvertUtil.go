package util

import (
	parser "github.com/xyjwsj/md-parser"
	"github.com/xyjwsj/mdConvert"
)

// MdToPdf 将 Markdown 内容转换为 PDF 并保存到指定路径
func MdToPdf(mdContent, outputPath, imgDir string) error {
	lexer := parser.NewLexer(mdContent)
	parserHandler := parser.NewParser(lexer)
	ast := parserHandler.Parse()
	render := mdConvert.CreatePdfRender()

	render.SetImageDir(imgDir)
	render.SetContentPath("/api/resource/")
	mdConvert.NewRender(render).Render(ast)
	render.OutFile(outputPath)
	return nil
}

func MdToWord(mdContent, outputPath, imgDir string) error {
	lexer := parser.NewLexer(mdContent)
	parserHandler := parser.NewParser(lexer)
	ast := parserHandler.Parse()
	render := mdConvert.CreateWordRender()

	render.SetImageDir(imgDir)
	render.SetContentPath("/api/resource/")
	mdConvert.NewRender(render).Render(ast)
	render.OutFile(outputPath)
	return nil
}
