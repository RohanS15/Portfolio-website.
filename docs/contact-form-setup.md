# Contact form setup with EmailJS

The contact form sends messages through the EmailJS browser SDK. EmailJS connects to the selected inbox provider (for example, Gmail) and sends a predefined template. This project does not need a custom domain, Resend account, Vercel Function, or server-side email API for the contact form.

## 1. Create the EmailJS service

1. Create an EmailJS account.
2. In **Email Services**, connect the inbox that should receive portfolio inquiries. For a low-volume personal portfolio, a personal inbox such as Gmail is supported. The email provider may enforce its own sending limits.
3. Send a test email from the EmailJS dashboard and confirm it arrives.

## 2. Create the contact template

Create an EmailJS template with these template variables:

- `{{name}}` — visitor's name
- `{{email}}` — visitor's email address
- `{{subject}}` — inquiry subject
- `{{message}}` — inquiry message

Set the template's **To Email** to the portfolio owner's inbox. Set **Reply-To** to `{{email}}` so replying in the email app addresses the visitor. Do not let form input choose the recipient.

EmailJS can require reCAPTCHA v2, but this project does not currently include the Google widget/token integration. Do not turn on a CAPTCHA requirement in the template until that widget is added, or submissions will fail. The existing hidden honeypot helps filter simple bots but is not a security boundary.

## 3. Configure the local site

1. Copy `.env.example` to `.env.local` in the project root.
2. In the EmailJS dashboard, copy the Service ID, Template ID, and Public Key into `.env.local`:

   ```dotenv
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

3. Run `npm run dev` and submit a test message. Confirm it arrives in the configured inbox and that Reply-To is the visitor's address.

The IDs and public key are intended for browser use, so the `VITE_` prefix is expected. Do not put an EmailJS **Private Key**, Gmail password, OAuth token, or any other secret in a `VITE_` variable or in this repository. `.env.local` is ignored by Git.

## 4. Configure Vercel

In the Vercel project, open **Settings → Environment Variables** and add the same three `VITE_EMAILJS_*` values for **Production**. They are public configuration identifiers, not secrets, but setting them in Vercel keeps the local and production build setup separate. Redeploy after adding or changing them because Vite embeds these values during the build.

The free EmailJS plan currently allows 200 requests per month. EmailJS documents IP-based rate limits. Use the abuse controls available in your account, and do not treat a public key or hidden honeypot as secret protection.

## Delivery behavior

The form shows success when EmailJS accepts the request. Confirm actual delivery by checking the destination inbox (and spam folder) after testing. The browser uses the EmailJS public key and predefined service/template IDs; no Resend API key or server-side email credential is used.

## Verification checklist

- Empty fields and malformed email are stopped by client validation, and focus moves to the first invalid field.
- Missing EmailJS IDs show a failure state rather than a false success.
- A valid test submission arrives in the configured inbox.
- Reply-To on the received message is the visitor's email.
- Provider failure displays a retryable error without showing provider internals.
- Honeypot and available EmailJS abuse controls are configured, and the form remains keyboard accessible.
