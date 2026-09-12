@echo off
REM Deploy portfolio sync only (does not touch social/voice functions).
cd /d "%~dp0\..\.."
echo.
echo Step 1: Create secret in Firebase Console (one time):
echo   https://console.firebase.google.com/project/property-managment-a5ed3/functions/secrets
echo   Name: PORTFOLIO_SYNC_API_KEY  Value: pick any long random string
echo.
echo Step 2: Deploy function + Firestore rules...
call npm install --prefix functions-portfolio
firebase deploy --only functions:portfolio:pmPortfolioSync,firestore:rules --project property-managment-a5ed3
echo.
echo Step 3: Paste the same secret into the app:
echo   https://www.manydoorsai.com/settings  -^> PMS nightly sync -^> API key
pause
