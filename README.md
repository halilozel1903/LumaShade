# LumaShade

Safari için sakin, okunabilir bir koyu mod eklentisi. Açık renkli sayfaları koyulaştırır; yazı ve bağlantıları arka planla yeterli kontrasta taşır. Fotoğraf, video, canvas ve gömülü içerikleri yeniden renklendirmez. Zaten koyu görünen sayfalarda otomatik olarak devre dışı kalır.

![LumaShade örnek görünüm](Screenshots/after.png)

| Önce | Sonra |
| --- | --- |
| ![Açık örnek sayfa](Screenshots/before.png) | ![LumaShade uygulanmış örnek sayfa](Screenshots/after.png) |

Ekran görüntüleri, depodaki [örnek sayfanın](Tests/sample.html) aynı tarayıcı penceresinde önce ve sonra render edilmesiyle alındı.

## Özellikler

- Site genelinde açma ve kapatma; alan adı bazında istisna.
- Açık zeminleri ve üzerindeki metni birlikte dönüştürme. Normal boyutlu metin için hedef kontrast **en az 4,5:1**.
- Var olan koyu temayı algılayıp sayfaya müdahale etmeme.
- Sonradan yüklenen sayfa öğelerine de uygulama.
- Görsel ve videoların renklerini koruma.
- Hesap, sunucu, reklam ve izleme kodu yok. Tercihler yalnızca tarayıcının yerel depolamasında tutulur.

## Safari'de kurulum

1. [LumaShade.xcodeproj](LumaShade/LumaShade.xcodeproj) dosyasını Xcode ile açın.
2. `LumaShade` ve `LumaShade Extension` hedeflerinin **Signing & Capabilities** bölümünde kendi Apple geliştirme takımınızı seçin.
3. Şema olarak `LumaShade`, hedef olarak `My Mac` seçip **Run**'a basın.
4. Açılan uygulamada **Safari Eklenti Ayarlarını Aç** düğmesini kullanın. Safari'nin **Ayarlar → Eklentiler** bölümünde LumaShade'i etkinleştirin ve web siteleri için izin verin.
5. Değişiklik görmek istediğiniz açık sekmeleri yenileyin. Araç çubuğundaki LumaShade simgesinden genel ve site bazlı anahtarları yönetin.

Safari'nin kendi iç sayfalarında ve eklenti çalıştırmaya izin vermeyen sayfalarda görünüm değişmez. Çok özel çizim yapan sitelerde alan adı anahtarından eklentiyi kapatabilirsiniz.

## Geliştirme

Eklenti kaynakları [`Extension/`](Extension/) içindedir. Xcode projesi bu dosyaları doğrudan kullanır; ikinci bir kopya tutulmaz.

```sh
node --test Tests/colors.test.js
xcodebuild -project LumaShade/LumaShade.xcodeproj -scheme LumaShade -configuration Debug -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
```

Ekran görüntüleri bir örnek sayfa üzerinde alınmıştır; gerçek sitelerin tasarımı farklılık gösterebilir. Kaynak kodu [MIT lisansı](LICENSE) ile sunulur.
