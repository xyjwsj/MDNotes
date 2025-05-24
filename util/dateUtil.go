package util

import (
	"errors"
	"log"
	"time"
)

type Datetime time.Time

func (d *Datetime) MarshalJSON() ([]byte, error) {
	// Step 1. Format the time as a Go string.
	t := time.Time(*d)
	formatted := t.Format("2006-01-02 15:04:05")

	// Step 2. Convert our formatted time to a JSON string.
	jsonStr := "\"" + formatted + "\""
	return []byte(jsonStr), nil
}

func (d *Datetime) UnmarshalJSON(b []byte) error {
	if len(b) < 2 || b[0] != '"' || b[len(b)-1] != '"' {
		return errors.New("not a json string")
	}

	// 1. Strip the double quotes from the JSON string.
	b = b[1 : len(b)-1]

	// 2. Parse the time using Go's time.Parse function.
	log.Println("======" + string(b))
	t, err := time.Parse("2006-01-02 15:04:05", string(b))
	if err != nil {
		return err
	}

	// 3. Assign the parsed time to the Datetime pointer receiver.
	datetime := Datetime(t)
	*d = datetime
	return nil
}
