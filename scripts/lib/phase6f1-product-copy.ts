export type LaunchCopyLocale = "ru" | "et" | "en";

type LocalizedCopy = Record<LaunchCopyLocale, string>;

export const categoryNames: Record<string, LocalizedCopy> = {
  "warm-jackets": {
    en: "Puffer jackets",
    et: "Soojad joped",
    ru: "Утеплённые куртки",
  },
  vests: { en: "Gilets", et: "Vestid", ru: "Жилеты" },
  "light-jackets": {
    en: "Jackets & cardigans",
    et: "Joped ja kardiganid",
    ru: "Куртки и кардиганы",
  },
  hoodies: {
    en: "Sweatshirts & hoodies",
    et: "Dressipluusid ja pusad",
    ru: "Свитшоты и худи",
  },
  "t-shirts": {
    en: "T-shirts & polos",
    et: "T-särgid ja polod",
    ru: "Футболки и поло",
  },
  bottoms: { en: "Swim shorts", et: "Ujumispüksid", ru: "Плавательные шорты" },
};

export const productDescriptions: Record<number, LocalizedCopy> = {
  1: {
    en: "The Moncler Maya is a short, glossy puffer with a hood, horizontal quilting and the signature sleeve pocket. Its clean front zip and compact silhouette make it a strong cold-season statement piece.",
    et: "Moncler Maya on lühike läikiv puhvis jope kapuutsi, horisontaalse tepingu ja iseloomuliku varrukataskuga. Puhas esilukk ja kompaktne siluett teevad sellest tugeva külma hooaja aktsendi.",
    ru: "Moncler Maya — короткая глянцевая дутая куртка с капюшоном, горизонтальной стёжкой и характерным карманом на рукаве. Чистая линия молнии и компактный силуэт делают её выразительной моделью для холодного сезона.",
  },
  2: {
    en: "The Parajumpers Tyrik pairs a substantial hooded puffer shape with a contrasting sleeve panel and the brand’s yellow neck detail. Zip pockets and a two-way front zip give the design a functional, urban finish.",
    et: "Parajumpers Tyrik ühendab mahuka kapuutsiga puhvis lõike kontrastse varrukapaneeli ja kollase kaeladetailiga. Lukuga taskud ja kahesuunaline esilukk annavad mudelile funktsionaalse linnaliku ilme.",
    ru: "Parajumpers Tyrik сочетает объёмный силуэт с капюшоном, контрастную панель на рукаве и жёлтую деталь у воротника. Карманы на молнии и двусторонняя застёжка подчёркивают функциональный городской характер модели.",
  },
  3: {
    en: "The Moncler Vezere has a softly structured puffer silhouette with a high collar, hood and snap-front placket over the zip. Large horizontal sections and discreet sleeve branding keep the look clean and balanced.",
    et: "Moncler Vezere on pehme struktuuriga puhvis jope, millel on kõrge krae, kapuuts ja luku peal trukkidega esiliist. Laiad horisontaalsed sektsioonid ja tagasihoidlik varrukadetail hoiavad üldilme puhta.",
    ru: "Moncler Vezere — структурная дутая куртка с высоким воротником, капюшоном и планкой на кнопках поверх молнии. Крупная горизонтальная стёжка и лаконичная деталь на рукаве сохраняют чистый сбалансированный вид.",
  },
  4: {
    en: "The Moncler Bormes is a glossy quilted gilet with a raised collar, front zip and vertical zipped pockets. Its sleeveless shape is designed for easy layering while keeping the recognisable puffer profile.",
    et: "Moncler Bormes on läikiv tepitud vest kõrge krae, esiluku ja vertikaalsete lukutaskutega. Varrukateta lõige sobib kihiliseks kandmiseks ning säilitab iseloomuliku puhvis silueti.",
    ru: "Moncler Bormes — глянцевый стёганый жилет с высоким воротником, центральной молнией и вертикальными карманами. Силуэт без рукавов удобно сочетать со слоями, сохраняя узнаваемый объём.",
  },
  5: {
    en: "The Parajumpers Jeordie is a long-line quilted gilet with a high collar and the brand’s yellow neck detail. A two-way zip and two zipped pockets complete its streamlined shape.",
    et: "Parajumpers Jeordie on pikema lõikega tepitud vest kõrge krae ja kollase kaeladetailiga. Kahesuunaline lukk ning kaks lukutaskut viimistlevad sirgjoonelise silueti.",
    ru: "Parajumpers Jeordie — удлинённый стёганый жилет с высоким воротником и жёлтой деталью у горловины. Двусторонняя молния и два кармана завершают собранный силуэт.",
  },
  6: {
    en: "The Moncler Tibb is a glossy puffer gilet with broad horizontal quilting, a stand collar and zipped side pockets. The chest badge and simple snap-front construction keep the focus on its classic sleeveless shape.",
    et: "Moncler Tibb on läikiv puhvis vest laia horisontaalse tepingu, püstkrae ja lukuga küljetaskutega. Rinnamärk ja lihtne trukkidega esiosa rõhutavad klassikalist varrukateta lõiget.",
    ru: "Moncler Tibb — глянцевый дутый жилет с широкой горизонтальной стёжкой, воротником-стойкой и боковыми карманами на молнии. Нагрудный знак и лаконичная застёжка подчёркивают классический силуэт.",
  },
  7: {
    en: "The Moncler Galion is a lightly quilted hooded jacket with a straight zip front and long vertical pockets. Compact baffles and sleeve pocket details create a technical, understated look.",
    et: "Moncler Galion on kergelt tepitud kapuutsiga jope, millel on sirge esilukk ja pikad vertikaalsed taskud. Kompaktne tepingujaotus ning varrukatasku annavad mudelile tehnilise ja vaoshoitud ilme.",
    ru: "Moncler Galion — лёгкая стёганая куртка с капюшоном, прямой молнией и длинными вертикальными карманами. Компактная стёжка и детали на рукаве создают сдержанный технический образ.",
  },
  8: {
    en: "The Moncler Etiache is a clean hooded shell jacket with an adjustable neckline, concealed-looking side pockets and a straight hem. Its minimal surface and sleeve pocket make it easy to style through transitional weather.",
    et: "Moncler Etiache on puhta joonega kapuutsiga pealisjope reguleeritava kaeluse, diskreetsete küljetaskute ja sirge alläärega. Minimalistlik pind ja varrukatasku sobivad hästi üleminekuhooaja kihistamiseks.",
    ru: "Moncler Etiache — лаконичная куртка с капюшоном, регулируемой горловиной, аккуратными боковыми карманами и прямым низом. Минималистичная поверхность и карман на рукаве подходят для многослойных образов в межсезонье.",
  },
  9: {
    en: "This Moncler cardigan combines a horizontally quilted front with knit sleeves, collar and back. The full zip and zipped pockets give the hybrid silhouette a polished everyday finish.",
    et: "See Moncleri kardigan ühendab horisontaalselt tepitud esiosa kootud varrukate, krae ja seljaosaga. Täispikk lukk ja lukuga taskud annavad hübriidsiluetile viimistletud igapäevase ilme.",
    ru: "Этот кардиган Moncler сочетает стёганую переднюю часть с трикотажными рукавами, воротником и спинкой. Полная молния и карманы на молнии придают гибридному силуэту аккуратный повседневный вид.",
  },
  10: {
    en: "The Moncler Gui is a slim glossy gilet with narrow horizontal quilting, a stand collar and two zipped pockets. Its light visual profile makes it a versatile layer over knitwear or a sweatshirt.",
    et: "Moncler Gui on saleda läikiva joonega vest, millel on kitsas horisontaalne teping, püstkrae ja kaks lukutaskut. Kerge visuaalne profiil sobib hästi kudumite või dressipluusi peale.",
    ru: "Moncler Gui — лаконичный глянцевый жилет с узкой горизонтальной стёжкой, воротником-стойкой и двумя карманами на молнии. Лёгкий силуэт удобно носить поверх трикотажа или свитшота.",
  },
  11: {
    en: "This Moncler cardigan brings together a quilted front, rib-knit sleeves and a hooded neckline. The full zip, compact pockets and sleeve detailing create a practical hybrid layer.",
    et: "See Moncleri kardigan ühendab tepitud esiosa, soonikkoes varrukad ja kapuutsiga kaeluse. Täispikk lukk, kompaktsed taskud ja varrukadetail loovad praktilise hübriidkihi.",
    ru: "Этот кардиган Moncler объединяет стёганую переднюю часть, трикотажные рукава и капюшон. Полная молния, компактные карманы и детали на рукаве формируют практичный гибридный слой.",
  },
  12: {
    en: "The Parajumpers Pharrell is a hooded quilted bomber with a clean front zip, high neckline and ribbed cuffs. The yellow neck detail and sleeve patch add the brand’s recognisable accents.",
    et: "Parajumpers Pharrell on kapuutsiga tepitud bomber, millel on puhas esilukk, kõrge kaelus ja soonikkoes mansetid. Kollane kaeladetail ning varrukamärk lisavad äratuntavad aktsendid.",
    ru: "Parajumpers Pharrell — стёганый бомбер с капюшоном, высокой горловиной, прямой молнией и трикотажными манжетами. Жёлтая деталь у воротника и знак на рукаве добавляют узнаваемые акценты.",
  },
  13: {
    en: "The Moncler Après Ski jacket pairs a glossy quilted front and hood with smooth contrasting sleeves. Two vertical chest pockets and a bold sleeve emblem give the athletic hybrid shape its character.",
    et: "Moncler Après Ski jope ühendab läikiva tepitud esiosa ja kapuutsi siledate kontrastsete varrukatega. Kaks vertikaalset rinnataskut ning silmapaistev varrukaembleem annavad sportlikule hübriidile iseloomu.",
    ru: "Куртка Moncler Après Ski сочетает глянцевую стёганую переднюю часть и капюшон с гладкими контрастными рукавами. Два вертикальных нагрудных кармана и крупная эмблема на рукаве задают спортивный характер.",
  },
  14: {
    en: "The Moncler Retro Knit cardigan has a clean knit body, a full two-way zip and a hood with a smooth contrasting edge. Long zipped pockets and ribbed finishing keep the silhouette precise and understated.",
    et: "Moncler Retro Knit kardiganil on puhas kootud keha, kahesuunaline täispikk lukk ja sileda kontrastäärisega kapuuts. Pikad lukutaskud ning soonikkoes viimistlus hoiavad silueti täpse ja vaoshoituna.",
    ru: "Кардиган Moncler Retro Knit выполнен в чистом трикотажном силуэте с двусторонней молнией и капюшоном с гладкой контрастной окантовкой. Длинные карманы и резинка по краям сохраняют аккуратный сдержанный вид.",
  },
  15: {
    en: "The Parajumpers Jayden is a hybrid zip cardigan with a quilted front and textured sleeves. A stand collar, angled chest pocket and yellow neck detail sharpen its technical profile.",
    et: "Parajumpers Jayden on hübriidne lukuga kardigan tepitud esiosa ja tekstuursete varrukatega. Püstkrae, diagonaalne rinnatasku ning kollane kaeladetail rõhutavad tehnilist ilmet.",
    ru: "Parajumpers Jayden — гибридный кардиган на молнии со стёганой передней частью и фактурными рукавами. Воротник-стойка, диагональный нагрудный карман и жёлтая деталь у горловины подчёркивают технический характер.",
  },
  16: {
    en: "This Moncler hooded cardigan combines a quilted body with substantial knit sleeves and ribbed finishing. Utility-style sleeve pockets and the high hooded neckline give the hybrid design a distinctive outdoor edge.",
    et: "See Moncleri kapuutsiga kardigan ühendab tepitud keha tugevama koega varrukate ja soonikkoes viimistlusega. Mahukad varrukataskud ning kõrge kapuutsiga kaelus annavad hübriidile eristuva välirõiva ilme.",
    ru: "Этот кардиган Moncler с капюшоном сочетает стёганый корпус, плотные трикотажные рукава и отделку резинкой. Объёмные карманы на рукавах и высокая горловина придают гибридной модели выразительный outdoor-характер.",
  },
  17: {
    en: "The Moncler Basic T-Shirt is a clean crew-neck tee with short sleeves and a small chest badge. Its minimal front makes it an easy everyday base in the available neutral colours.",
    et: "Moncler Basic T-Shirt on puhta joonega ümara kaeluse ja lühikeste varrukatega T-särk, mille rinnal on väike märk. Minimalistlik esiosa teeb sellest lihtsa igapäevase baaseseme.",
    ru: "Moncler Basic T-Shirt — лаконичная футболка с круглым воротом, короткими рукавами и небольшим знаком на груди. Минималистичная передняя часть делает её удобной базой на каждый день.",
  },
  18: {
    en: "The Moncler Leather Badge T-Shirt is a crew-neck tee defined by a tonal dark chest badge. The restrained branding and straight silhouette create a quieter alternative to a classic logo T-shirt.",
    et: "Moncler Leather Badge T-Shirt on ümara kaelusega T-särk, mida eristab toon-toonis tume rinnamärk. Tagasihoidlik brändidetail ja sirge siluett loovad klassikalisele logopluusile rahulikuma alternatiivi.",
    ru: "Moncler Leather Badge T-Shirt — футболка с круглым воротом и тёмным тональным знаком на груди. Сдержанный брендинг и прямой силуэт создают спокойную альтернативу классической логотипной футболке.",
  },
  19: {
    en: "The Moncler Blurred Logo T-Shirt centres an oversized blurred emblem across the chest. A simple crew neck and short-sleeve shape let the graphic remain the main feature.",
    et: "Moncler Blurred Logo T-Shirti keskmes on suur hägustatud embleem rinnal. Lihtne ümar kaelus ja lühikesed varrukad jätavad graafika põhifookusesse.",
    ru: "Moncler Blurred Logo T-Shirt выделяется крупной размытой эмблемой на груди. Простой круглый ворот и короткие рукава оставляют графику главным акцентом.",
  },
  20: {
    en: "The Moncler Stripe Trim Zip Hoodie is a full-zip hooded sweatshirt with front pouch pockets and striped rib trim at the cuffs. A sleeve badge and clean body keep the sporty details balanced.",
    et: "Moncler Stripe Trim Zip Hoodie on täispika lukuga kapuutsiga dressipluus, millel on esitaskud ja triibuline soonik mansettidel. Varrukamärk ja puhas keha tasakaalustavad sportlikud detailid.",
    ru: "Moncler Stripe Trim Zip Hoodie — худи на полной молнии с передними карманами и полосатой отделкой манжет. Знак на рукаве и лаконичный корпус уравновешивают спортивные детали.",
  },
  21: {
    en: "The Moncler Hera sweatshirt is a clean crew-neck layer with long sleeves, ribbed edges and a small chest badge. Its minimal shape works as a straightforward everyday piece across the available colours.",
    et: "Moncler Hera on puhta joonega ümara kaeluse, pikkade varrukate, soonikäärte ja väikese rinnamärgiga dressipluus. Minimalistlik lõige sobib lihtsaks igapäevaseks kihiks kõigis pakutud värvides.",
    ru: "Свитшот Moncler Hera выполнен в лаконичном силуэте с круглым воротом, длинными рукавами, отделкой резинкой и небольшим знаком на груди. Минималистичная форма подходит для повседневных сочетаний во всех доступных цветах.",
  },
  22: {
    en: "The Moncler Polo Shirt has a classic short-sleeve polo shape with a button placket, structured collar and chest badge. Contrast trim at the sleeve edge adds a discreet signature detail.",
    et: "Moncler Polo Shirt on klassikalise lühikeste varrukatega polo lõike, nööbiliistu, vormitud krae ja rinnamärgiga. Kontrastne varrukaäär lisab tagasihoidliku tunnusdetaili.",
    ru: "Moncler Polo Shirt — классическое поло с короткими рукавами, планкой на пуговицах, оформленным воротником и знаком на груди. Контрастная отделка края рукава добавляет сдержанную фирменную деталь.",
  },
  23: {
    en: "The Moncler Logo Patch Swimming Shorts have a mid-length shape, elasticated drawstring waist and side pockets. A small logo patch near the hem provides the single graphic accent across the colour range.",
    et: "Moncler Logo Patch ujumispüksid on keskmise pikkuse, elastse nööriga vöökoha ja küljetaskutega. Väike logomärk sääre allosas on kogu värvivaliku ainus graafiline aktsent.",
    ru: "Плавательные шорты Moncler Logo Patch имеют среднюю длину, эластичный пояс со шнурком и боковые карманы. Небольшой знак у нижнего края остаётся единственным графическим акцентом во всей цветовой линейке.",
  },
};
