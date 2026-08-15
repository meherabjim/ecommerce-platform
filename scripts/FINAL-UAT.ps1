param([string]$ApiBase='http://localhost:5000/api',[string]$WebBase='http://localhost:3000')
$failed=0
function Check($name,$url){
 try{$r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10;Write-Host "[OK] $name -> $($r.StatusCode)"}
 catch{Write-Host "[FAIL] $name -> $($_.Exception.Message)";$script:failed++}
}
Check 'API health' "$ApiBase/ops/health"
Check 'Swagger' "$ApiBase/docs"
Check 'Storefront' "$WebBase/"
Check 'Shop' "$WebBase/shop"
Check 'Login' "$WebBase/login"
Check 'Register' "$WebBase/register"
Check 'Sitemap' "$WebBase/sitemap.xml"
Check 'Robots' "$WebBase/robots.txt"
if($failed -gt 0){Write-Host "$failed public UAT checks failed.";exit 1}
Write-Host 'Public UAT checks passed.'
Write-Host 'Manual authenticated checks still required: customer checkout/order/review/return, Super Admin staff creation, shipping AUTO recommendation, promotions, reports, notifications, CMS/settings.'
