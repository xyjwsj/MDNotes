package main

import (
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
