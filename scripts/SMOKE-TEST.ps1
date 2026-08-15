param([string]$ApiBase='http://localhost:5000/api',[string]$WebBase='http://localhost:3000')
$failed=0
function T($n,$u){try{$r=Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 10;Write-Host "[OK] $n -> $($r.StatusCode)"}catch{Write-Host "[FAIL] $n";$script:failed++}}
T 'API health' "$ApiBase/ops/health";T 'Swagger' "$ApiBase/docs";T 'Storefront' "$WebBase/";T 'Shop' "$WebBase/shop";T 'Login' "$WebBase/login";T 'Sitemap' "$WebBase/sitemap.xml";T 'Robots' "$WebBase/robots.txt"
if($failed -gt 0){exit 1};Write-Host 'All smoke checks passed.'
