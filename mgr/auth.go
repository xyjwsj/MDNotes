package mgr

import (
	"changeme/model"
	"changeme/util"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"embed"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

//go:embed all:public.pem
var assets embed.FS

type LicenseType string

const (
	Trial      LicenseType = "trial"
	Production LicenseType = "production"
)

type LicenseInfo struct {
	DeviceID   string      `json:"device_id"`
	Type       LicenseType `json:"type"`
	ExpiryTime time.Time   `json:"expiry_time"`
	Signature  string      `json:"signature"` // 使用私钥签名后的值
}

var firstRunFile string
var licensePath []string

func init() {
	appConfigDir := util.CreatePlatformPath(model.AppConfigDir, "LiveMark")
	if !util.Exists(appConfigDir) {
		_ = os.MkdirAll(appConfigDir, os.ModePerm)
	}
	licensePath = []string{
		util.CreatePlatformPath(appConfigDir, ".license"),
	}
	firstRunFile = util.CreatePlatformPath(appConfigDir, ".first_run")
}

func getMac() string {
	// 获取本机的MAC地址
	interfaces, err := net.Interfaces()
	if err != nil {
		panic("Poor soul, here is what you got: " + err.Error())
	}
	for _, item := range interfaces {
		mac := item.HardwareAddr.String() //获取本机MAC地址
		if mac != "" {
			return mac
		}
	}
	return ""
}

func getSerialNumber() string {
	cmd := exec.Command("bash", "-c", "ioreg -rd1 -c IOPlatformExpertDevice")
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println(err)
	}

	str := string(out)
	split := strings.Split(str, "\n")
	serialNumber := ""
	for _, item := range split {
		if strings.Contains(item, "serial-number") {
			compileRegex := regexp.MustCompile("<(.*?)>")     // 正则表达式的分组，以括号()表示，每一对括号就是我们匹配到的一个文本，可以把他们提取出来。
			matchArr := compileRegex.FindStringSubmatch(item) // FindStringSubmatch 方法是提取出匹配的字符串，然后通过[]string返回。我们可以看到，第1个匹配到的是这个字符串本身，从第2个开始，才是我们想要的字符串。
			if len(matchArr) > 0 {
				serialNumber = matchArr[len(matchArr)-1]
				break
			}
		}
	}
	return serialNumber
}

func UniqueId() string {
	id := getMac() + getSerialNumber()
	return util.MD5(id)
}

func ValidateLicense(license string) error {
	_, err := validateLicense(license)
	return err
}

func validateLicense(licenseStr string) (LicenseInfo, error) {
	var license LicenseInfo
	err := json.Unmarshal([]byte(licenseStr), &license)
	if err != nil {
		return license, err
	}

	// 检查是否过期
	if time.Now().After(license.ExpiryTime) {
		return license, errors.New("Liceense Expired")
	}

	// 重新构造原始数据并计算签名
	rawData := fmt.Sprintf("%s:%s:%d", Production, UniqueId(), license.ExpiryTime.Unix())
	hashed := sha256.Sum256([]byte(rawData))

	// 加载公钥
	pubKeyBytes, _ := assets.ReadFile("public.pem")
	block, _ := pem.Decode(pubKeyBytes)
	pubInterface, _ := x509.ParsePKIXPublicKey(block.Bytes)
	pubKey := pubInterface.(*rsa.PublicKey)

	// 解码签名
	sigBytes, _ := base64.StdEncoding.DecodeString(license.Signature)

	// 验证签名
	err = rsa.VerifyPKCS1v15(pubKey, crypto.SHA256, hashed[:], sigBytes)
	return license, err
}

func CreateLicence(license string) bool {
	decode, _ := util.Base64Decode(license, true)
	if decode == "" {
		decode = license
	}
	_, err := validateLicense(decode)
	if err != nil {
		return false
	}
	for _, path := range licensePath {
		if util.Exists(path) {
			_ = os.Remove(path)
		}
		_ = os.WriteFile(path, []byte(license), 0600)
	}
	return true
}

func ValidateLicence() string {
	for _, path := range licensePath {
		if util.Exists(path) {
			licenseData, err := os.ReadFile(path)
			if err != nil {
				continue
			}
			decode, _ := util.Base64Decode(string(licenseData), true)
			license, err := validateLicense(decode)
			if err != nil {
				return ""
			}
			return license.ExpiryTime.Format("2006-01-02 15:04:05")
		}
	}
	return ""
}

func TrailUse(create bool) string {
	base := filepath.Dir(firstRunFile)
	if !util.Exists(base) {
		err := os.MkdirAll(base, 0755)
		if err != nil {
			log.Println(err)
		}
	}
	uniqueId := UniqueId()
	if util.Exists(firstRunFile) {
		fileCon, _ := os.ReadFile(firstRunFile)
		split := strings.Split(string(fileCon), ".")
		if len(split) != 2 {
			return ""
		}
		pubKeyBytes, _ := assets.ReadFile("public.pem")
		md5 := util.MD5(uniqueId + split[1] + string(pubKeyBytes))
		if split[0] != md5 {
			return ""
		}
		timestamp, _ := strconv.Atoi(split[1])
		if time.Now().Unix()-int64(timestamp) > 14*24*3600 {
			return ""
		}
		unix := time.Unix(int64(timestamp), 0)
		unix = unix.AddDate(0, 0, 14)
		return unix.Format("2006-01-02 15:04:05")
	}
	if !create {
		return ""
	}
	unix := time.Now().Unix()

	pubKeyBytes, _ := assets.ReadFile("public.pem")
	itoa := strconv.Itoa(int(unix))
	md5 := util.MD5(uniqueId + itoa + string(pubKeyBytes))
	err := os.WriteFile(firstRunFile, []byte(md5+"."+itoa), 0600)
	if err != nil {
		log.Println(err)
	}
	return time.UnixMilli(unix).Format("2006-01-02 15:04:05")
}

// 生成许可证

func GenerateLicense(lType LicenseType, privateKeyPath string, expiryDays int) (string, error) {
	expiry := time.Now().AddDate(0, 0, expiryDays)
	dataToSign := fmt.Sprintf("%s:%s:%d", lType, UniqueId(), expiry.Unix())

	// 加载私钥
	privateKeyBytes, _ := os.ReadFile(privateKeyPath)
	block, _ := pem.Decode(privateKeyBytes)
	privateKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return "", err
	}

	// 确保是 *rsa.PrivateKey 类型
	rsaPrivateKey, ok := privateKey.(*rsa.PrivateKey)
	if !ok {
		return "", fmt.Errorf("not an RSA private key")
	}

	// 计算签名
	hashed := sha256.Sum256([]byte(dataToSign))
	signature, err := rsa.SignPKCS1v15(rand.Reader, rsaPrivateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return "", err
	}

	// 构建 License JSON
	license := LicenseInfo{
		Type:       lType,
		DeviceID:   UniqueId(),
		ExpiryTime: expiry,
		Signature:  util.Base64Encode(string(signature), true),
	}

	jsonData, _ := json.Marshal(license)
	return string(jsonData), nil
}

func TrialLicense(deviceId string) {

	now := time.Now()
	now = now.AddDate(0, 0, -16)

	unix := now.Unix()

	pubKeyBytes, _ := assets.ReadFile("public.pem")
	itoa := strconv.Itoa(int(unix))
	md5 := util.MD5(deviceId + itoa + string(pubKeyBytes))
	err := os.WriteFile(firstRunFile, []byte(md5+"."+itoa), 0600)
	if err != nil {
		log.Println(err)
	}
}
