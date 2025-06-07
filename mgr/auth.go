package mgr

import (
	"changeme/model"
	"changeme/util"
	"fmt"
	"log"
	"net"
	"os/exec"
	"regexp"
	"strings"
	"time"
)

var licensePath = []string{
	"/tmp/.MDNote_license",
	model.CacheDir + "/.MDNote_license",
}

var license = ""

func init() {
	for _, path := range licensePath {
		if util.Exists(path) {

		}
	}
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

func ValidateLicence() {
	id := getMac() + getSerialNumber()
	format := time.Now().Format("2006-01-02 15:04:05")
	sprintf := fmt.Sprintf("%s.%s", id, format)
	log.Println(sprintf)
}
