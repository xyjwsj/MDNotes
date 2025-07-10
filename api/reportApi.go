package api

import (
	"changeme/util"
	"log"
)

func ReportOpenApp(platform, version, uniqueId string) error {
	data := map[string]any{
		"platform": platform,
		"version":  version,
		"uniqueId": uniqueId,
		"type":     "application",
	}
	url := ServerApi + "/report"
	json, err := util.HttpJson(url, data)
	if err != nil {
		return err
	}

	var apiResponse ResponseApi
	util.Json2Struct(json, &apiResponse)
	if apiResponse.Success() {
		return nil
	}
	log.Println("report exception:" + apiResponse.Description)
	return nil
}
