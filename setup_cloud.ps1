$data = @{
    wishes = @(
        @{
            name = "М.Хос-Эрдэнэ & Б.Одонтунгалаг"
            message = "Шинэ гэр бүлд насан туршийн аз жаргал хүсэн ерөөе! ♡"
            created_at = "2026-09-01 10:00"
        }
    )
} | ConvertTo-Json -Depth 4

$utf8bytes = [System.Text.Encoding]::UTF8.GetBytes($data)

try {
    $headers = @{
        "X-Master-Key" = "`$2a`$10`$8M3m.tH0fB5zNnZkS9pM.uQk1e1r1q1"
        "X-Bin-Private" = "false"
        "X-Bin-Name" = "khoserdene_wishes"
    }
    $res = Invoke-RestMethod -Uri "https://api.jsonbin.io/v3/b" -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body $utf8bytes
    Write-Host "Success JSONBin!"
    $res | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_"
}
