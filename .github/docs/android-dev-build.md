# Android Dev Build Commands

Use this guide when testing native features on a real Android phone, especially the local LLM through `llama.rn`.

Expo Go cannot run the local LLM because `llama.rn` is a custom native module. Use the installed development build instead.

## One-time Phone Setup

1. Enable Developer options on the phone.
2. Enable USB debugging.
3. Connect the phone by USB.
4. Accept the "Allow USB debugging?" prompt on the phone.
5. Set USB mode to File transfer / Android Auto if ADB does not see the device.

Check the phone connection:

```bash
adb devices
```

On this Windows machine, if `adb` is not on PATH:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

The device should show as:

```txt
device
```

If it shows `unauthorized`, unlock the phone and accept the USB debugging prompt.

## First Native Build

Install dependencies and native artifacts:

```bash
pnpm install
pnpm rebuild llama.rn
```

Create or refresh the native Android project:

```bash
npx expo prebuild
```

Build and install the development app on the connected phone:

```bash
pnpm run android
```

Equivalent command:

```bash
npx expo run:android
```

## Start Metro For The Dev App

After the development app is installed, start Metro in dev-client mode:

```bash
pnpm exec expo start --dev-client
```

If port `8081` is busy:

```bash
pnpm exec expo start --dev-client --port 8082
```

For USB connection, forward Metro to the phone:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
```

For wireless testing, keep the laptop and phone on the same Wi-Fi network, then open the installed development app. If LAN does not connect, use:

```bash
pnpm exec expo start --dev-client --tunnel
```

## Launch Installed App From Terminal

The current Android package is:

```txt
com.tricycle_user.myapp
```

Launch it from the terminal:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.tricycle_user.myapp -c android.intent.category.LAUNCHER 1
```

## Local LLM Notes

- Use the development app, not Expo Go.
- Download the model from the chatbot screen.
- Keep the app open while downloading.
- The local LLM runs through `llama.rn` and the downloaded `.gguf` file.
- If the native model cannot start, the chatbot should fall back to approved offline app content.

## Common Fixes

If Gradle cannot find the Android SDK, add this file:

```txt
android/local.properties
```

With this content, adjusted for your machine:

```properties
sdk.dir=C:/Users/Dariel/AppData/Local/Android/Sdk
```

If `llama.rn` native artifacts are missing:

```bash
pnpm rebuild llama.rn
```

If Metro is stuck on an old process:

```powershell
Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
```

Then stop the owning process if needed:

```powershell
Stop-Process -Id <OwningProcessId> -Force
```

If the Android build hits the optional Hexagon/OpenCL native target on Windows, keep the project patch in:

```txt
patches/llama.rn@0.12.0-rc.9.patch
```
