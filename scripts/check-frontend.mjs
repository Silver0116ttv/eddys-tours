import assert from 'node:assert/strict'

// Read-only route checks. Run against a local development or production server.
const origin = process.env.FRONTEND_TEST_URL || 'http://localhost:3000'
const paths = ['/', '/tours', '/tours/atv-sierra-madre', '/tours/san-sebastian-culture', '/destinations', '/categories', '/about', '/help', '/contact', '/privacy', '/booking-policy', '/favorites', '/trip', '/checkout', '/my-bookings', '/admin/login', '/admin/reset-password', ...['overview', 'tours', 'bookings', 'calendar', 'payments', 'payouts', 'contacts', 'operators', 'reviews', 'settings'].map(section => `/admin/demo/${section}`)]

for (const path of paths) {
  const response = await fetch(new URL(path, origin))
  const html = await response.text()
  assert.equal(response.status, 200, `${path} should render`)
  assert.ok(html.includes('<main'), `${path} needs a main landmark`)
  assert.ok(!html.includes('data-next-error-message='), `${path} must not render an error`)
  console.log(`PASS ${path}`)
}

for (const section of ['overview', 'tours', 'bookings', 'payments', 'contacts', 'settings']) {
  const response = await fetch(new URL(`/admin/${section}`, origin), { redirect: 'follow' })
  const html = await response.text()
  assert.ok(response.url.endsWith('/admin/login') || html.includes('NEXT_REDIRECT') && html.includes('/admin/login'), `Unauthenticated ${section} must require login`)
  assert.ok(!html.includes('admin-sidebar'), `Unauthenticated ${section} must not expose the workspace`)
  console.log(`PASS protected /admin/${section}`)
}
for (const category of ['Adventure', 'Water', 'Boats', 'Nature', 'Family', 'Couples', 'Wildlife', 'Culture']) {
  const response = await fetch(new URL(`/tours?category=${category}`, origin))
  const html = await response.text()
  assert.equal((html.match(/<article\b/g) ?? []).length, 1, `${category} must have exactly one sample tour`)
  console.log(`PASS one sample in ${category}`)
}
for (const path of ['/api/admin/bookings', '/api/admin/tours', '/api/admin/reviews', '/api/admin/dashboard']) {
  const response = await fetch(new URL(path, origin))
  assert.ok([401, 403, 503].includes(response.status), `${path} must deny an anonymous request`)
  console.log(`PASS protected ${path}`)
}
console.log(`${paths.length} rendered routes, 8 category samples and 10 anonymous-access checks passed.`)
