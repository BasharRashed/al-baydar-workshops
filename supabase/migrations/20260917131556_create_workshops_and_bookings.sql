CREATE TABLE public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  host TEXT NOT NULL,
  location TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  category TEXT NOT NULL,
  cover TEXT NOT NULL DEFAULT 'wheat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.workshops TO anon;
GRANT ALL ON public.workshops TO service_role;

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workshops are publicly readable" ON public.workshops FOR SELECT TO anon USING (true);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.bookings TO anon;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can book a spot" ON public.bookings FOR INSERT TO anon WITH CHECK (true);

INSERT INTO public.workshops (title, description, host, location, starts_at, capacity, category, cover) VALUES
('فن الخط العربي للمبتدئين', 'ورشة تأسيسية نتعرف فيها على أصول الخط العربي وأدواته، ونتدرّب على الحروف الأساسية بخط النسخ. لا حاجة لأي خبرة سابقة — كل الأدوات متوفرة.', 'أ. سارة الحمداني', 'البيدر — القاعة الرئيسية', '2026-09-26 17:00:00+03', 16, 'فنون', 'calligraphy'),
('حوار مفتوح: مستقبل العمل الحر', 'أمسية حوارية نناقش فيها تجارب العمل الحر في المنطقة، التحديات والفرص، وكيف نبني مجتمعاً داعماً للمستقلين. الحوار مفتوح للجميع.', 'م. عمر الشريف', 'البيدر — ركن الحوار', '2026-09-30 19:00:00+03', 30, 'حوارات', 'dialogue'),
('ورشة صناعة القهوة المختصة', 'رحلة من حبة البن إلى الفنجان: نتعلم أساسيات التقطير والتذوق ونجرّب ثلاث طرق تحضير مختلفة مع محمصة محلية.', 'أ. ليان عطاالله', 'البيدر — المطبخ المفتوح', '2026-10-03 16:00:00+03', 12, 'حِرف', 'coffee'),
('قراءة جماعية: نادي كتاب البيدر', 'لقاء شهري لنادي القراءة، نناقش هذه المرة رواية مختارة ونتبادل الانطباعات في أجواء هادئة. اقرأ ما استطعت وتعال كما أنت.', 'نادي كتاب البيدر', 'البيدر — المكتبة', '2026-10-08 18:30:00+03', 25, 'ثقافة', 'books'),
('مقدمة في التصوير بالهاتف', 'ورشة عملية نتعلم فيها قواعد التكوين والإضاءة باستخدام الهاتف فقط، ثم نخرج لجولة تصوير قصيرة في الحي ونراجع النتائج معاً.', 'أ. يوسف ناصر', 'البيدر — الساحة الخارجية', '2026-10-12 15:00:00+03', 20, 'فنون', 'camera');
