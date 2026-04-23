# Run this script ONCE after installing Railway CLI to set all environment variables
# Install Railway CLI first: npm install -g @railway/cli
# Then login: railway login
# Then link project: railway link
# Then run: .\setup-railway-vars.ps1

$vars = @{
    "SPRING_PROFILES_ACTIVE" = "prod"
    "JWT_SECRET"             = "internx2026@secretkey#chanderparkash!"
    "MAIL_USERNAME"          = "internx1507@gmail.com"
    "MAIL_PASSWORD"          = "mcgqemmslzcsbzmx"
    "CLOUDINARY_CLOUD_NAME"  = "REPLACE_WITH_YOUR_CLOUD_NAME"
    "CLOUDINARY_API_KEY"     = "REPLACE_WITH_YOUR_API_KEY"
    "CLOUDINARY_API_SECRET"  = "REPLACE_WITH_YOUR_API_SECRET"
}

foreach ($key in $vars.Keys) {
    $value = $vars[$key]
    Write-Host "Setting $key..."
    railway variables set "$key=$value"
}

Write-Host ""
Write-Host "Done! Replace CLOUDINARY values with your actual credentials."
Write-Host "Get them from: https://cloudinary.com/console"
