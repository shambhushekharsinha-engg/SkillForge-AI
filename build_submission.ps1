$source = "submission\skills"
$destination = "submission.zip"

If (Test-Path $destination) {
    Remove-Item $destination
}

Compress-Archive -Path "$source" -DestinationPath $destination
Write-Host "Created $destination successfully with skills/ folder!"
