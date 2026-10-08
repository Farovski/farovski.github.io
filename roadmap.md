# İngilizce Kelime Oyunu — Yol Haritası

## Amaç

Tarayıcıda çalışan, İngilizce kelimeleri Türkçe anlamlarıyla eşleştirerek öğretmeye yardımcı olan; modern, anlaşılır ve tekrar oynaması keyifli bir oyun hazırlamak. Her turda `kelimeler.txt` dosyasının tamamından rastgele 5 kelime gösterilecek; tur bitince sonuç penceresi olmadan yeni tur başlayacak.

## Kelime havuzu

Oyun, aynı klasördeki `kelimeler.txt` dosyasında bulunan 2.674 kaydı kullanır. Her turda buradan rastgele 5 kelime seçilir.

## Geliştirme durumu

- [x] HTML arayüzü ve duyarlı kart tasarımı
- [x] Her turda 5 kelime, sürükle-bırak eşleştirme, süre ve turlar boyunca devam eden skor
- [x] Koyu tema, 3B kartlar ve sürükleme yıldız izi
- [x] Doğru/yanlış kart efektleri ve tamamlanınca otomatik yeni tur
- [x] Her 100 puanlık kilometre taşında 1000 puana kadar farklı motivasyon mesajları
- [x] Ayrı cümle eşleştirme sayfası; `kelimeler.txt` dosyasındaki örnek cümlelerle 5'li turlar, süre ve turlar boyunca korunan skor
- [x] Ayrı karışık soru çözme sayfası; `english_tenses_quiz_game.txt` havuzundaki tüm soruları karıştırılmış sırayla, puan ve açıklama desteğiyle sunma
- [x] Kompakt oyun başlığı ve sadeleştirilmiş arayüz
- [x] Sayfanın altında profesyonel köy sahnesi; doğru cevaplarla büyüyen ve tarayıcıda saklanan ağaçlar
- [x] Ağaç sahnesi tamamlanınca onun yerini alan şehir kurma sahnesi; doğru cevaplarla ev ve apartman inşası
- [x] Şehir yollarında hareketli araçlar ve evlerden 2–3 şehir cevabında bir rastgele konuşma balonu
- [x] Bütün apartmanlar tamamlanınca açılan uzay kolonisi; cevaplarla üs modülleri ve uydular
- [x] Şehir arazisini boş başlatma; önce 20 müstakil ev, sonra 100 doğru cevapta apartmanlara dönüşüm
- [x] Kelime havuzunun tamamından rastgele turlar ve doğru cevapta örnek cümle gösterimi
- [x] `kelimeler.txt` dosyasından 2.674 kelime yükleme ve yerel sunucu başlatıcısı

İlk sürüm dosyaları: `kelimeeslestirme.html` (kelime oyunu arayüzü), `styleingilizce.css` (ortak tasarım), `kelimeeslestirme.js` (kelime oyunu mantığı), `cümlealistirma.html` ve `cümlealistirma.js` (cümle eşleştirme modu), `karisiksoru.html` ve `karisiksoru.js` (karışık soru çözme modu), `kelimeler.txt` (kelime ve örnek cümle havuzu), `english_tenses_quiz_game.txt` (soru havuzu). Oyunu sunucu üzerinden açarken ana sayfa `kelimeeslestirme.html` dosyasıdır.

## Yol haritası

### 1. Oynanabilir temel

- Uygulama açılırken aynı dizindeki `kelimeler.txt` dosyasını oku; kayıtlar `{ id, word, type, meaning, example, exampleTr }` biçimindedir.
- Her turda kelime havuzundan rastgele 5 kelime seç.
- Her yeni turda kelime listesinin tamamından rastgele 5 kelime seç; önceki turdaki kelimelerin yeniden gelmesine izin ver.
- Doğru eşleşmeden sonra kelimenin örnek cümlesini ve Türkçe çevirisini göster.
- İngilizce ve Türkçe kartları ayrı sütunlarda göster; her iki sütunun sırasını karıştır.
- Oyuncu İngilizce kartı sürükleyip Türkçe karşılığının üzerine bırakarak eşleştirsin.
- Eşleştirmeyi kartların `id` değerlerini karşılaştırarak yap.
- Doğru eşleşmede iki kartı yeşil göster, soluklaştır ve tekrar seçilemeyecek duruma getir.
- Yanlış eşleşmede iki kartı kırmızı gösterip 0,5 saniye salladıktan sonra normal durumlarına döndür; bu sırada yeni seçimleri engelle.
- Tüm kelimeler eşleşince başarı mesajı göster ve 0,7 saniye sonra yeni rastgele turu otomatik başlat; sonuç penceresi açma.

### 2. Modern ve keyifli arayüz

- Üst bölümde profesyonel kumanda simgeli “Kelime Eşleştirme” başlığı ile süre ve skor rozetlerini göster.
- Oyun alanında solda English, sağda Türkçe sütunu kullan.
- Koyu renk paleti, yuvarlatılmış köşeler ve okunaklı metin kullan.
- Kartlara derinlik gölgesi ve perspektif dönüşüyle 3B görünüm ver.
- Sürüklenen kartın altında yıldız izi göster; doğru hedef üzerindeyken hedef kartı vurgula.
- Seçili, doğru ve yanlış kart durumlarını koyu temaya uygun renklerle birbirinden ayır.
- Sayfanın altına emojisiz, profesyonel bir köy sahnesi koy; dikilen fidanı kısa bir büyüme animasyonuyla göster.
- Duyarlı düzenle masaüstü, tablet ve mobilde iki sütunu ekrana sığdır; küçük ekranlarda kartları ve aralıkları esnet.
- Yeterli kontrast, klavye ile kullanım ve `prefers-reduced-motion` tercihini gözet.

### 3. Oyun akışı ve tekrar oynama

- Oyun başlar başlamaz süreyi saniyede bir artır; oyun bitince zamanlayıcıyı durdur.
- Skoru sayfa açılışında sıfırla; her doğru eşleşmede 10 puan ekle ve her yanlış eşleşmede 20 puan düşür.
- Skor 100, 200, 300… 1000 eşiklerine çıktıkça o eşiğe özel samimi motivasyon mesajını kısa süre göster; aynı eşik mesajını tekrar gösterme.
- Skoru yeni turlarda ve "Yeni oyun" ile başlatılan turlarda da koru; her turda sadece süreyi ve eşleşme ilerlemesini sıfırla.
- Her turda kelime listesinin tamamından 5 rastgele kelime seçip kartları karıştır; tur bitince yeni turu otomatik başlat.
- Oyun durumunu açıkça göster: devam ediyor, tamamlandı veya oynanabilir kelime yok.
- Doğru eşleşmelerde köy sahnesine animasyonlu bir ağaç dik ve toplam ağaç ilerlemesini turlar arasında sakla.
- Ağaç sahnesindeki 30 nokta dolunca köy sahnesini gizleyip boş şehir arazisini göster; önce her doğru cevapta bir müstakil ev kur, evler dolunca her 5 doğru cevapta bir evi apartmana dönüştür.
- Şehir yollarında animasyonlu araçlar göster; her 2–3 şehir cevabında bir evden rastgele kısa bir konuşma balonu çıkar.
- Şehir ilerlemesini turlar ve sayfa yenilemeleri arasında sakla; 20 yapının tamamı apartman olduğunda bu aşamayı tamamlandı olarak göster.
- Şehirdeki 20 apartman tamamlanınca şehir bölümünü gizleyip uzay bölümünü göster; doğru cevaplarla yaşam modülü, güneş paneli, iletişim anteni, sera ve keşif aracı inşa et.
- Uzay kolonisi ilerlemesini sakla; her 5 doğru cevapta koloni seviyesini ve 20 üs modülünden sonra yörüngedeki uydu sayısını artır.

### 4. Sağlamlaştırma ve teslim

- Örnek kelimelerle sürükle-bırak doğru/yanlış eşleşme, turlar boyunca devam eden +10/−20 skor, süre ve otomatik yeni tur akışlarını doğrula.
- `kelimeler.txt` içindeki bütün kayıtların yüklenmesini ve sonraki turun yeni kelimeler getirmesini doğrula.
- Mobil görünümü, klavye kullanımını, modal erişilebilirliğini ve animasyonların hareket azaltma tercihini kontrol et.

## Teknoloji ve sorumluluklar

### HTML5 — arayüz iskeleti

- Oyun başlığı, süre/skor rozetleri ve English ile Türkçe kart sütunlarını oluştur.
- Kartlar ve durum mesajları için anlamlı, erişilebilir HTML elemanları kullan.

### CSS3 — görsel tasarım ve animasyonlar

- Flexbox ve Grid ile kartları ve sütunları duyarlı biçimde yerleştir.
- Varsayılan, hover, seçili, doğru ve yanlış kart görünümlerini stillendir.
- Geçişleri, yanlış eşleşme için 0,5 saniyelik `shake` animasyonunu ve mobil düzeni tanımla.
- Hareket azaltma tercihi etkinse animasyonları azalt veya devre dışı bırak.

### Vanilla JavaScript — oyun mantığı ve etkileşim

- Kelime dizisini ve oyun durumunu yönet; her turda kartları karıştır.
- Sürükle-bırak etkileşimini yönet ve kartların `id` değerleriyle eşleşmeyi kontrol et.
- Süreyi ve turlar boyunca devam eden skoru (doğru cevap +10, yanlış cevap −20), oyun bitişini ve otomatik yeni turu yönet.

## Kelime dosyası biçimi

`kelimeler.txt` her satırda aşağıdaki gibi bir kayıt içerir. Oyun `word` alanını English kartında, `meaning` alanını Türkçe kartında gösterir; doğru eşleşmede `type`, `example` ve `exampleTr` alanlarını sunar.

```text
{ id: 1, word: "to abolish", type: "fiil", meaning: "yürürlükten kaldırmak, feshetmek", example: "The government decided to abolish the old tax law.", exampleTr: "Hükümet eski vergi kanununu yürürlükten kaldırmaya karar verdi." },
```

## Tamamlanma ölçütleri

- Oyun `kelimeler.txt` içindeki kelimelerle açılıp tamamlanabilmeli.
- İngilizce ve Türkçe kartlar iki sütunda sunulmalı; Türkçe kartların sırası karışık olmalı.
- Her turda `kelimeler.txt` dosyasının tamamından 5 rastgele kelime gösterilmeli; önceki turdaki kelimelerin yeniden gelmesi mümkün olmalı.
- Doğru eşleşen kelimenin türü ve örnek cümlesi Türkçe karşılığıyla gösterilmeli.
- Her doğru cevap köyde yeni bir ağaç oluşturmalı; sayfa yenilendikten ve yeni tura başlandıktan sonra ağaçlar korunmalı.
- 30 ağaçtan sonra boş şehir sahnesi açılmalı; 20 doğru cevapta arsalar müstakil evlerle dolmalı, sonraki 100 doğru cevapta her 5 soruda bir ev apartmana dönüşerek tamamı apartman olmalı.
- Şehir aşamasında araçlar yolda hareket etmeli ve her 2–3 doğru şehir cevabında rastgele bir evden konuşma balonu görünmeli.
- 20 apartmandan (120 şehir cevabından) sonra şehir gizlenip uzay kolonisi açılmalı; doğru cevaplarla uzay modülleri ve her 5 ek cevaptan sonra uydu sayısı artmalı, ilerleme yenileme sonrasında korunmalı.
- İngilizce kart sürüklenerek Türkçe karta bırakılmalı; doğru eşleşme skora 10 puan eklemeli, yanlış eşleşme 20 puan düşürmeli.
- Skor otomatik başlayan yeni turlarda ve kullanıcı tarafından başlatılan turlarda sıfırlanmadan devam etmeli.
- 100 puanlık her yeni eşikte, 1000 puana kadar doğru mesaja sahip bir motivasyon bildirimi görünmeli.
- Kartlar koyu temada 3B görünmeli; sürükleme sırasında yıldız izi çıkmalı.
- Süre oyun boyunca saniyede bir güncellenmeli ve oyun bitince durmalı.
- Doğru/yanlış kart efektleri ve yanlış seçimden sonra 0,5 saniyelik yeniden seçim kilidi çalışmalı.
- Tur tamamlandığında sonuç penceresi çıkmamalı; yeni tur otomatik başlamalı ve yine tüm kelime listesinden rastgele seçim yapmalı.
- Arayüz küçük ekranlarda taşmadan ve temel klavye erişimiyle kullanılabilmeli; hareket azaltma tercihi desteklenmeli.
