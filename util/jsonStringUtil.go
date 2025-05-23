package util

import (
	"bytes"
	"encoding/json"
	"log"
)

// Map2Struct map 转 struct
//
// obj 为转换后的struct对象
func Map2Struct(data map[string]interface{}, obj interface{}) error {
	bytes, err := json.Marshal(data)
	if err != nil {
		log.Println("Map2Struct Error", err.Error())
	}
	return json.Unmarshal(bytes, &obj)
}

func Struct2Json(data interface{}) string {
	marshal, _ := json.Marshal(data)
	return string(marshal)
}

func Struct2EscapeJson(data interface{}, escape bool) string {
	bf := bytes.NewBuffer([]byte{})
	jsonEncoder := json.NewEncoder(bf)
	jsonEncoder.SetEscapeHTML(escape)
	_ = jsonEncoder.Encode(data)
	return bf.String()
}

func Json2Struct(jsonStr string, obj interface{}) error {
	err := json.Unmarshal([]byte(jsonStr), obj)
	return err
}
