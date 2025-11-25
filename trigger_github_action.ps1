$githubToken = "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" 
$apiUrl = "https://api.github.com/repos/MonserrattAnaya/assigment_ai_course/dispatches"
$headers = @{
    "Accept"        = "application/vnd.github+json"
    "Authorization" = "Bearer $githubToken"
    "X-GitHub-Api-Version" = "2022-11-28"
}
$body = @{
    event_type = "run_e2e"
    client_payload = @{
        ref = "main"
    }
}
try {
    Write-Host "Triggering GitHub Actions workflow on MonserrattAnaya/assigment_ai_course..."
    Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body (ConvertTo-Json $body) -ContentType 'application/json'
    Write-Host "Successfully triggered workflow dispatch. Check GitHub Actions for status."
}
catch {
    Write-Error "Failed to trigger workflow dispatch."
    Write-Error $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Error "API Response Details:"
        $_.Exception.Response.GetResponseStream() | Out-String | Write-Error
    }
}