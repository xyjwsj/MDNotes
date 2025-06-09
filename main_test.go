package main

import (
	"changeme/mgr"
	"changeme/model"
	"changeme/util"
	"testing"
)

func TestGit(t *testing.T) {
}

func TestCopy(t *testing.T) {
	fileKey := "ce9c888d-9e09-4077-a6f1-449c5b7d4610"
	src := util.CreatePlatformPath(model.CacheDir, "md", fileKey+".md")
	target := util.CreatePlatformPath(model.UserHomeDir, "Downloads", fileKey+".md")
	util.Copy(src, target)
}

func TestLicence(t *testing.T) {
	mgr.ValidateLicence()
	//use := mgr.TrailUse(false)
	//log.Println(use)
	//mgr.TrialLicense()
	//license, err := mgr.GenerateLicense(mgr.Production, "/Users/wushaojie/Documents/wsj/application/mdNote/license/private.pem", 30)
	//if err != nil {
	//	log.Println(err)
	//}
	//log.Println(license)
	//
	//encode := util.Base64Encode(license, true)
	//log.Println(encode)
	//
	//mgr.ValidateLicense(license)
}
