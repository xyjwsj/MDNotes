package util

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptrace"
	"strconv"
	"strings"
	"time"
)

var client *http.Client

const (
	MaxIdleConnections int = 8
	RequestTimeout     int = 10
)

func init() {
	log.Println("Request Start ....")
	client = &http.Client{
		Transport: &http.Transport{
			MaxIdleConnsPerHost: MaxIdleConnections,
		},
		Timeout: time.Duration(RequestTimeout) * time.Second,
	}
}

type HttpMethod string

type ContentType string

const (
	POST     HttpMethod  = "POST"
	GET      HttpMethod  = "GET"
	JSON     ContentType = "application/json"
	FormData ContentType = "multipart/form-data"
)

func HttpJson(url string, data map[string]interface{}) (string, error) {
	return httpRequest(url, POST, JSON, nil, data)
}

func HttpFromData(url string, data map[string]interface{}) (string, error) {
	return httpRequest(url, POST, FormData, nil, data)
}

func httpRequest(url string, method HttpMethod, contentType ContentType, header map[string]string, params map[string]interface{}) (string, error) {
	var req *http.Request
	if contentType == JSON {
		json := Struct2EscapeJson(params, false)
		req, _ = http.NewRequest(string(method), url, strings.NewReader(json))
		req.Header.Set("Content-Type", string(contentType))
	}
	if contentType == FormData {
		payload := &bytes.Buffer{}
		writer := multipart.NewWriter(payload)
		for key, val := range params {
			if str, ok := val.(string); ok {
				_ = writer.WriteField(key, str)
			}
			if intVal, ok := val.(int64); ok {
				_ = writer.WriteField(key, strconv.FormatInt(intVal, 10))
			}
		}
		err := writer.Close()
		if err != nil {
			return "", err
		}
		req, _ = http.NewRequest(string(method), url, payload)
		req.Header.Set("Content-Type", writer.FormDataContentType())
	}

	if header != nil {
		for key, val := range header {
			req.Header.Set(key, val)
		}
	}

	uniqId := UUID()

	trace := &httptrace.ClientTrace{
		GetConn: func(hostPort string) {
			fmt.Println("GetConn id:", uniqId, time.Now().UnixNano(), hostPort)
		},
		GotConn: func(connInfo httptrace.GotConnInfo) {
			fmt.Println("GotConn id:", uniqId, time.Now().UnixNano(), connInfo.Conn.LocalAddr())
		},

		ConnectStart: func(network, addr string) {
			fmt.Println("ConnectStart id:", uniqId, time.Now().UnixNano(), network, addr)
		},
		ConnectDone: func(network, addr string, err error) {
			fmt.Println("ConnectDone id:", uniqId, time.Now().UnixNano(), network, addr, err)
		},
	}

	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))

	response, err := client.Do(req)

	if err != nil {
		return "", err
	}
	body, _ := ioutil.ReadAll(response.Body)
	defer response.Body.Close()

	statusCode := response.StatusCode
	if statusCode != 200 {
		return "", errors.New("Network Error")
	}
	return string(body), nil
}

func createParams(data map[string]string) string {
	var param = ""
	for key, val := range data {
		param += key + "=" + val + "&"
	}
	return param[:len(param)-1]
}
