package handler

import "github.com/88250/lute"

type LuteHandler struct {
	engine *lute.Lute
}

func CreateLuteInstance() *LuteHandler {
	handler := LuteHandler{engine: lute.New()}
	return &handler
}

func (lute *LuteHandler) Render(md string) string {
	return lute.engine.MarkdownStr("", md)
}
