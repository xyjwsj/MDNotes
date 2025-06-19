package util

import (
	"github.com/phpdave11/gofpdf"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/renderer/html"
	"github.com/yuin/goldmark/text"
	"strings"
)

var mdParser = goldmark.New(
	goldmark.WithExtensions(
	// 可添加扩展，如 table、footnote 等
	),
	goldmark.WithRendererOptions(
		html.WithUnsafe(), // 允许渲染原始 HTML
	),
)

func MdToPdf(mdContent, outputPath string) error {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.SetFont("Arial", "", 12)
	pdf.AddPage()

	// 设置字体映射函数（可自定义）
	setCustomStyle := func(pdf *gofpdf.Fpdf, node ast.Node) {
		switch node.Kind() {
		case ast.KindHeading:
			heading := node.(*ast.Heading)
			if heading.Level == 1 {
				pdf.SetFont("Arial", "B", 18)
				pdf.Ln(6)
			} else if heading.Level == 2 {
				pdf.SetFont("Arial", "B", 16)
				pdf.Ln(5)
			} else {
				pdf.SetFont("Arial", "B", 14)
				pdf.Ln(4)
			}
		case ast.KindEmphasis:
			pdf.SetFont("Arial", "I", 12)
		default:
			pdf.SetFont("Arial", "", 12)
		}
	}

	// 解析 Markdown
	reader := text.NewReader([]byte(mdContent))
	doc := mdParser.Parser().Parse(reader)

	var walk func(node ast.Node)
	walk = func(node ast.Node) {
		switch n := node.(type) {
		case *ast.Text:
			text := string(n.Segment.Value([]byte(mdContent)))
			text = strings.ReplaceAll(text, "\n", " ")
			if text != "" {
				setCustomStyle(pdf, node.Parent())
				pdf.MultiCell(0, 6, text, "", "L", false)
				pdf.Ln(1)
			}
		case *ast.Paragraph:
			pdf.Ln(4)
		case *ast.Heading:
			setCustomStyle(pdf, node)
			pdf.Ln(2)
		case *ast.List:
			pdf.Ln(2)
		case *ast.ListItem:
			// 获取 Item 内部文本
			var itemText strings.Builder
			for c := node.FirstChild(); c != nil; c = c.NextSibling() {
				if t, ok := c.(*ast.Text); ok {
					itemText.WriteString(string(t.Segment.Value([]byte(mdContent))))
				}
			}
			if itemText.Len() > 0 {
				setCustomStyle(pdf, node.Parent())
				pdf.MultiCell(0, 6, "• "+itemText.String(), "", "L", false)
				pdf.Ln(2)
			}
		case *ast.Emphasis:
			// 处理斜体
			var emText strings.Builder
			for c := node.FirstChild(); c != nil; c = c.NextSibling() {
				if t, ok := c.(*ast.Text); ok {
					emText.WriteString(string(t.Segment.Value([]byte(mdContent))))
				}
			}
			if emText.Len() > 0 {
				setCustomStyle(pdf, node)
				pdf.MultiCell(0, 6, "*"+emText.String()+"*", "", "L", false)
				pdf.Ln(1)
			}
		}

		if node.FirstChild() != nil {
			walk(node.FirstChild())
		}
		if node.NextSibling() != nil {
			walk(node.NextSibling())
		}
	}

	if doc.FirstChild() != nil {
		walk(doc.FirstChild())
	}

	return pdf.OutputFileAndClose(outputPath)
}
