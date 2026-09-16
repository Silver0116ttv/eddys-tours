import { AdminLogin } from '@/components/admin/login'
import { isSupabaseConfigured } from '@/lib/supabase/config'
export const metadata = {
  title: 'Acceso del equipo | Eddy’s Tours',
  robots: { index: false, follow: false },
}
export default function Page() {
  return <AdminLogin configured={isSupabaseConfigured()} />
}
