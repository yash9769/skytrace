# Birthday card: client editor setup (about 10 minutes, once)

The card is a static page on GitHub Pages. To let the client edit text and photos and have changes show up on every
device, the content lives in a free Firebase database. Nothing here costs money on Firebase's free (Spark) plan.

## How it works
- Everyone's phone reads the content from Firestore and re-checks every 10 seconds, so an edit appears on open
  devices within about 10 seconds (new visitors see it immediately).
- The editor is hidden: on the **PIN screen, tap the "Happy Birthday" title 7 times quickly**, then type the **edit PIN**.
- The edit PIN is the password of one Firebase account. Firebase checks it on its servers (not in the page), so it
  cannot be read from the page source, and wrong guesses are rate-limited by Firebase.
- Until Firebase is set up and the three values below are filled in, the page works exactly as before from its built-in
  content, and the editor says it is not set up.

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com and click **Add project** (any name). Skip Google Analytics.
2. **Build > Firestore Database > Create database**. Choose a region near the audience, start in **production mode**.
3. **Build > Authentication > Get started > Email/Password > Enable > Save**.
4. **Authentication > Users > Add user**: enter an email you control (for example `editor@yourdomain.com`; it does
   not need to be a real inbox) and a **password of at least 6 digits. This password is the edit PIN.**
5. **Project settings (gear icon) > General > Your apps > Web (</>)**: register an app (no hosting). Copy `apiKey` and
   `projectId` from the config it shows. The web API key is not a secret.

## 2. Paste the security rules (this is what keeps strangers out)
**Firestore Database > Rules**, replace everything with the following (change the email), then **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner() {
      return request.auth != null && request.auth.token.email == 'editor@yourdomain.com';
    }
    match /site/{doc} {
      allow get: if true;
      allow list: if false;
      allow write: if isOwner();
    }
    match /photos/{doc} {
      allow get: if true;
      allow list: if false;
      allow write: if isOwner();
    }
    match /{other=**} {
      allow read, write: if false;
    }
  }
}
```
Anyone can *read* the card content (that is how visitors see it), but only the signed-in editor account can *write*.

## 3. Connect the page
Send the three values to the developer (or edit them yourself near the top of the editor block in `public/card.html`,
search for `const CLOUD`):

```js
apiKey: "<your web API key>",
projectId: "<your project id>",
ownerEmail: "editor@yourdomain.com",
```
Merge it and GitHub Pages republishes in a minute or two.

## Using the editor
- Open the PIN screen, tap the title 7 times, enter the edit PIN.
- Tabs: **Mansi's version**, **Family version**, **PINs**.
- You can change the age, every text, every photo (choose from the phone, rotate, set which part stays in view),
  add/remove/reorder chapters, cards and swipe-strip photos, change the two opening PINs, and change the edit PIN.
- Tap **Save**. Photos are shrunk automatically before upload.

## Good to know
- Once the client saves, the saved content wins over the built-in content in the code. Future code-side text or photo
  changes will not show until they are also made in the editor.
- Photos are stored inside Firestore (about 100-250 KB each), which fits the free plan for a card like this.
- The opening PINs (123 / 456) are a door, not a vault: they are readable by anyone who views the page source or the
  database. Treat the card as private-by-link, not secret.
- If the edit PIN is forgotten, reset that user's password in Firebase **Authentication > Users**.
