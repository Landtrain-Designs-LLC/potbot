﻿$newDevice = invoke-WebRequest "https://mdash.net/api/v2/devices?access_token=fZnDVnMz86Y4BfdwBaT8wA" -Method 'POST' -ErrorAction Stop|
ConvertFrom-Json
$deviceToken = Select-Object -InputObject $newDevice -Property token
$deviceId = Select-Object -InputObject $newDevice -Property id
$id = $deviceId.id
$token = $deviceToken.token
$port = '/dev/tty.usbserial-0001'

$set    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray()
$publicKey = ""
for ($x = 0; $x -lt 15; $x++) {
    $publicKey += $set | Get-Random
}

$conf = @{
src = "conf9.json"
dst = "conf5.json"
}

$confJson = ConvertTo-Json -InputObject $conf

echo 'Device ID:' $deviceId.id
echo 'Device Token:' $deviceToken.token
echo 'Public Key:' $publicKey

echo 'Device ID:' $deviceId.id >> ${device}_log.txt
echo 'Device Token:' $deviceToken.token >> ${device}_log.txt
echo 'Public Key:' $publicKey >> ${device}_log.txt

echo 'Please put device in boot mode'
PAUSE
echo 'Flashing device'
mos flash --port $port
echo 'Device Flashed'

echo 'Provisioning device'
mos config-set --port $port device.id=${id}
mos config-set --port $port dash.enable=true
mos config-set --port $port dash.token=${token}
mos config-set --port $port device.public_key=${publicKey}
mos config-set --port $port conf_acl=wifi.*,device.*,potbot.*
mos call --port $port FS.Rename ${confJson}


echo 'Device probably provisioned. Look for errors above.'
PAUSE

