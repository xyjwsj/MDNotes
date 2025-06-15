package util

func EncryptContent(data []byte, seek string) ([]byte, error) {
	var chunk []byte
	var originChunk []byte

	curIndex := 0
	secureKey := []byte(seek)
	maxLen := len(secureKey)
	buf := make([]byte, 1024)

	// 模拟读取字节数组并分块处理
	for i := 0; i < len(data); i += len(buf) {
		end := i + len(buf)
		if end > len(data) {
			end = len(data)
		}

		chunkData := data[i:end]
		originChunk = append(originChunk, chunkData...)

		for idx := range chunkData {
			chunkData[idx] ^= secureKey[curIndex]
			curIndex++
			curIndex = curIndex % maxLen
		}

		chunk = append(chunk, chunkData...)
	}

	return chunk, nil
}

// DecryptContent 解密函数（新增）
func DecryptContent(encryptedData []byte, seek string) []byte {
	curIndex := 0
	secureKey := []byte(seek)
	maxLen := len(secureKey)
	result := make([]byte, len(encryptedData))
	copy(result, encryptedData)

	for idx := range result {
		result[idx] ^= secureKey[curIndex]
		curIndex++
		curIndex = curIndex % maxLen
	}

	return result
}
