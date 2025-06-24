package util

import (
	parser2 "github.com/xyjwsj/md-parser"
	"github.com/xyjwsj/mdConvert"
)

// MdToPdf 将 Markdown 内容转换为 PDF 并保存到指定路径
func MdToPdf(mdContent, outputPath string) error {
	lexer := parser2.NewLexer(mdContent)
	parser := parser2.NewParser(lexer)
	ast := parser.Parse()

	render := mdConvert.CreatePdfRender()
	mdConvert.NewRender(render).Render(ast)
	render.OutFile(outputPath)
	return nil
}
