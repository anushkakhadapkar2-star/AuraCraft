const fs = require('fs');
const files = [
  'src/middleware.ts.bak',
  'src/app/wishlist/page.tsx',
  'src/app/shop/page.tsx',
  'src/app/checkout/success/page.tsx',
  'src/app/checkout/page.tsx',
  'src/app/api/checkout/route.ts',
  'src/app/admin/page.tsx',
  'src/app/actions/wishlist.ts',
  'src/app/account/page.tsx',
  'src/app/account/orders/[id]/page.tsx',
  'src/app/account/orders/page.tsx',
  'src/app/account/layout.tsx'
];
files.forEach(f => {
  if(fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, content.replace(/import \{ auth \} from "@\/auth";/g, 'import { auth } from "@/lib/auth/session";'));
    console.log('Updated ' + f);
  }
});
// Remove auth.ts
if (fs.existsSync('src/auth.ts')) {
  fs.unlinkSync('src/auth.ts');
  console.log('Deleted src/auth.ts');
}
// Remove nextauth API route directory recursively
if (fs.existsSync('src/app/api/auth/[...nextauth]')) {
  fs.rmSync('src/app/api/auth/[...nextauth]', { recursive: true, force: true });
  console.log('Deleted src/app/api/auth/[...nextauth]');
}
