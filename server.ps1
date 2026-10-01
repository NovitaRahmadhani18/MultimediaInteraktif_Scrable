param (
    [int]$Port = 5500
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"

try {
    $listener.Prefixes.Add($prefix)
    $listener.Start()
} catch {
    # If 5500 is busy, try port 8080
    try {
        $listener = New-Object System.Net.HttpListener
        $Port = 8080
        $prefix = "http://localhost:$Port/"
        $listener.Prefixes.Add($prefix)
        $listener.Start()
    } catch {
        # Fallback to port 3000
        $listener = New-Object System.Net.HttpListener
        $Port = 3000
        $prefix = "http://localhost:$Port/"
        $listener.Prefixes.Add($prefix)
        $listener.Start()
    }
}

Write-Host "=========================================="
Write-Host "🚀 Local Live Server Aktif di: $prefix"
Write-Host "   Buka link di browser: $prefix"
Write-Host "=========================================="

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".mp3"  = "audio/mpeg"
    ".mp4"  = "video/mp4"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.RawUrl
        if ($rawUrl -match "\?") {
            $rawUrl = $rawUrl.Substring(0, $rawUrl.IndexOf("?"))
        }
        $rawUrl = [System.Uri]::UnescapeDataString($rawUrl)
        if ($rawUrl -eq "/" -or $rawUrl -eq "") {
            $rawUrl = "/index.html"
        }

        $localPath = Join-Path $baseDir $rawUrl.TrimStart("/").Replace("/", "\")

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $contentType = $mimeTypes[$ext]
            }

            $response.ContentType = $contentType
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Continue loop on error
    }
}
