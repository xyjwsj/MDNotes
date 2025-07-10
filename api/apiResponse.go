package api

type ResponseApi struct {
	Code        int    `json:"code"`
	Data        any    `json:"data"`
	Description string `json:"description"`
}

func (response ResponseApi) Success() bool {
	return response.Code == 0
}
