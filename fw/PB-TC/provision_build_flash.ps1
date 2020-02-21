﻿$newDevice = invoke-WebRequest 'https://mdash.net/api/v2/devices?access_token=fZnDVnMz86Y4BfdwBaT8wA' -Method 'POST' -ErrorAction Stop|
ConvertFrom-Json
$deviceToken = Select-Object -InputObject $newDevice -Property token
$deviceId = Select-Object -InputObject $newDevice -Property id
$id = $deviceId.id
$token = $deviceToken.token

$set    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray()
$publicKey = ""
for ($x = 0; $x -lt 15; $x++) {
    $publicKey += $set | Get-Random
}

echo 'Device ID:' $deviceId.id
echo 'Device Token:' $deviceToken.token
echo 'Public Key:' $publicKey

echo 'Device ID:' $deviceId.id >> ${device}_log.txt
echo 'Device Token:' $deviceToken.token >> ${device}_log.txt
echo 'Public Key:' $publicKey >> ${device}_log.txt

echo 'Setting ACL'
$obj = @{
    acl = @{
    shadow_read = ".*"
    shadow_write = ".*"
    rpc = ".*"
    }
} 

$Body = ConvertTo-Json -InputObject $obj

$url = "https://mdash.net/api/v2/devices/" + ${id} + "?access_token=fZnDVnMz86Y4BfdwBaT8wA"
echo 'URL: ' $url
echo 'Body: ' $Body

Invoke-WebRequest -URI $url -Body $Body -Method 'POST'

echo 'Building Firmware'
mos build --platform esp32

echo 'Please put device in boot mode'
PAUSE
echo 'Flashing device'
mos flash --port COM3

echo 'Provisioning device'
mos config-set --port COM3 device.id=${id}
mos config-set --port COM3 dash.enable=true
mos config-set --port COM3 dash.token=${token}
mos config-set --port COM3 device.public_key=${publicKey}
mos config-set --port COM3 conf_acl=wifi.*,device.*,potbot.*
mos call --port COM3 FS.Rename "'{`"src": "conf9.json", "dst": "conf5.json`"}'"


echo 'Device probably provisioned. Look for errors above.'
PAUSE

