package util

import (
	"fmt"
	"github.com/phpdave11/gofpdf"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/renderer/html"
	"github.com/yuin/goldmark/text"
	"strings"
)

var mdParser = goldmark.New(
	goldmark.WithRendererOptions(
		html.WithUnsafe(), // 允许原始 HTML 渲染（可选）
	),
)

// 提取纯文本内容
func extractText(node ast.Node, source []byte) string {
	var buf strings.Builder
	ast.Walk(node, func(n ast.Node, entering bool) (ast.WalkStatus, error) {
		if entering {
			if t, ok := n.(*ast.Text); ok {
				buf.WriteString(string(t.Segment.Value(source)))
			}
		}
		return ast.WalkContinue, nil
	})
	return strings.TrimSpace(buf.String())
}

// 设置字体样式
func applyStyle(pdf *gofpdf.Fpdf, node ast.Node) {
	switch node.Kind() {
	case ast.KindHeading:
		level := node.(*ast.Heading).Level
		if level == 1 {
			pdf.SetFont("Arial", "B", 18)
		} else if level == 2 {
			pdf.SetFont("Arial", "B", 16)
		} else {
			pdf.SetFont("Arial", "B", 14)
		}
	case ast.KindEmphasis:
		em := node.(*ast.Emphasis)
		if em.Level == 1 {
			pdf.SetFont("Arial", "I", 12) // 斜体
		} else {
			pdf.SetFont("Arial", "B", 12) // 加粗
		}
	default:
		pdf.SetFont("Arial", "", 12)
	}
}

// MdToPdf 将 Markdown 内容转换为 PDF 并保存到指定路径
func MdToPdf(mdContent, outputPath string) error {
	// 初始化 PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	//pdf.AddFont("noto", "", "util/fonts/notosanssc-regular.ttf")
	//pdf.SetFont("noto", "", 12)
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	// 解析 Markdown
	reader := text.NewReader([]byte(mdContent))
	doc := mdParser.Parser().Parse(reader)

	// 遍历 AST 节点
	var walk func(ast.Node)
	walk = func(node ast.Node) {
		switch node.(type) {
		case *ast.Heading:
			applyStyle(pdf, node)
			text := extractText(node, []byte(mdContent))
			if text != "" {
				pdf.MultiCell(0, 6, text, "", "L", false)
			}
			pdf.Ln(4)

		case *ast.Paragraph:
			pdf.Ln(2)

		case *ast.List:
			pdf.Ln(2)

		case *ast.ListItem:
			text := extractText(node, []byte(mdContent))
			if text != "" {
				applyStyle(pdf, node)
				pdf.MultiCell(0, 6, "• "+text, "", "L", false)
			}
			pdf.Ln(2)

			//case *ast.Emphasis:
			//	em := node.(*ast.Emphasis)
			//	text := extractText(em, []byte(mdContent))
			//	if text != "" {
			//		applyStyle(pdf, em)
			//		if em.Level == 1 {
			//			pdf.MultiCell(0, 6, "*"+text+"*", "", "L", false)
			//		} else if em.Level >= 2 {
			//			pdf.MultiCell(0, 6, "**"+text+"**", "", "L", false)
			//		}
			//		pdf.Ln(1)
			//	}
			//
			//case *ast.Text:
			//	text := extractText(node, []byte(mdContent))
			//	if text != "" {
			//		applyStyle(pdf, node)
			//		pdf.MultiCell(0, 6, text, "", "L", false)
			//	}
		}

		if node.FirstChild() != nil {
			walk(node.FirstChild())
		}
		if node.NextSibling() != nil {
			walk(node.NextSibling())
		}
	}

	// 开始遍历
	walk(doc.FirstChild())

	// 输出 PDF
	err := pdf.OutputFileAndClose(outputPath)
	if err != nil {
		return fmt.Errorf("failed to write PDF: %v", err)
	}
	return nil
}
