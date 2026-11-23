# D BALAJI REALTY GROUP — Website Setup (मराठी)

तुमच्या दिलेल्या लोगो आणि बॅनरवर आधारित Customer Website + Private Owner Dashboard तयार आहे.

## वेबसाइटमध्ये काय आहे?
- Customer website: उपलब्ध properties, category filter, search, photos, price, location आणि WhatsApp enquiry.
- Owner dashboard: `admin.html` येथे email/password login.
- Property add/edit/delete, price/description/location बदलणे, multiple photos upload आणि Available/Sold status.
- Admin dashboard मधील बदल त्याच customer website वर database मधून दिसतात. Sold listings public customer page वर दिसत नाहीत.
- फोन/WhatsApp नंबर सध्या बॅनरवरील `8830382820` वापरतो.

## Live करण्यासाठी आवश्यक सेटअप
ही ZIP म्हणजे वेबसाइटचे पूर्ण source files आहेत. इंटरनेटवर live URL आणि सुरक्षित admin login सुरू करण्यासाठी खालील एकदाच setup करावे लागेल.

### 1. Supabase database तयार करा
1. https://supabase.com वर account तयार करा आणि New Project करा.
2. Project तयार झाल्यावर Project Settings → API मध्ये जा.
3. Project URL आणि `anon` / publishable public key कॉपी करा.
4. या folder मधील `config.js` उघडा. `SUPABASE_URL` आणि `SUPABASE_ANON_KEY` मध्ये ते values टाका.
   - `service_role` key कधीही website मध्ये टाकू नका.
5. Supabase → SQL Editor → New query मध्ये `supabase-setup.sql` मधील पूर्ण SQL paste करून Run करा.

### 2. फक्त तुमचा Admin login तयार करा
1. Supabase → Authentication → Users → Add user निवडा.
2. तुमचा स्वतःचा email आणि मजबूत password वापरून user तयार करा.
3. त्या user चा UUID कॉपी करा.
4. SQL Editor मध्ये खालील query चालवा (UUID तुमच्या खऱ्या UUID ने बदला):
   `insert into public.site_admins (user_id) values ('YOUR-AUTH-USER-UUID');`
5. Authentication → Providers / Signups मध्ये public signups बंद ठेवा. Admin user तुम्हीच manually तयार करा.
6. `admin.html` हे Owner Dashboard आहे. Login झाल्यावरच dashboard दिसेल.

### 3. Website internet वर publish करा
सोप्या static hosting साठी https://vercel.com किंवा https://netlify.com वापरू शकता.
1. या ZIP मधील files extract करा.
2. पूर्ण `dbalaji-realty-website` folder GitHub repository मध्ये upload करा.
3. Vercel मध्ये Add New → Project करून ती repository import करा.
4. Framework preset `Other` / static ठेवा. Build command आणि output directory रिकामी ठेवा (किंवा Vercel च्या static deployment flow नुसार deploy करा).
5. Deploy झाल्यावर तुम्हाला temporary public URL मिळेल.
6. नंतर `dbalajirealtygroup.com` domain उपलब्ध असल्यास registrar कडून विकत घ्या आणि Vercel Project → Settings → Domains मध्ये जोडा. DNS records Vercel ने दिल्याप्रमाणे update करा.

## महत्त्वाच्या गोष्टी
- `dbalajirealtygroup.com` domain या ZIP मधून आपोआप register होत नाही. Domain खरेदी व DNS setup स्वतंत्र आहे; availability registrar कडे तपासावी लागेल.
- Hosting आणि database provider कडे account तयार करणे व setup पूर्ण करणे आवश्यक आहे. मी इथून तुमच्या वतीने account, password, domain purchase किंवा live deployment करू शकत नाही.
- ग्राहकांसाठी public page `index.html`; तुमच्यासाठी private dashboard `admin.html`.
- वेबसाइट live करण्यापूर्वी मोबाइलवर तपासा आणि तुमचा WhatsApp नंबर/कंपनीची माहिती योग्य आहे याची खात्री करा.
- सध्या customer website वर फक्त Available properties दिसतात. Admin मधून Sold केल्यावर ती customer list मधून आपोआप लपते; admin list मध्ये Sold status राहतो.
- फोटो upload झाल्यावर जुने फोटो storage मधून आपोआप delete होत नाहीत; unused images Supabase Storage मधून वेळोवेळी manually साफ करता येतात.

## पुढे जोडता येणाऱ्या सुविधा
- Marathi/English toggle
- प्रत्येक property साठी स्वतंत्र details page
- Google Maps location
- Property enquiry form आणि email alerts
- SEO आणि Google indexing
