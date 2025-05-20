$envFile = ".env"
$environment = "production"

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.+)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        Write-Host "Adding $key to Vercel $environment environment..."

        $value | vercel env add $key $environment
    }
}
