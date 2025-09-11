
import { BlogPost, Gift } from '../types';

// Gift Definitions
const gift_duurzaam_1: Gift = {
  productName: "Herbruikbare Koffiebeker (HuskeeCup)",
  description: "Stijlvolle, duurzame beker gemaakt van koffieschillen. Perfect voor onderweg en helpt de afvalberg te verminderen.",
  priceRange: "€15 - €25",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://amzn.to/3HYSdBJ' }],
  imageUrl: "https://m.media-amazon.com/images/I/91LjQfE5cdL._AC_SL1000_.jpg"
};

const gift_duurzaam_2: Gift = {
  productName: "The Good Roll - Vrolijk toiletpapier",
  description: "100% gerecycled en superzacht toiletpapier. Met de winst bouwen ze toiletten in ontwikkelingslanden. Een cadeau met impact!",
  priceRange: "€20 - €30",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=the+good+roll&tag=gifteez77-21' }],
  imageUrl: "https://picsum.photos/seed/eco-toilet-paper/300/300"
};

// Extra duurzame cadeaus (nieuw uitgebreide gids)
const gift_duurzaam_3: Gift = {
  productName: 'Zero Waste Starterkit',
  description: 'Set met bijenwasdoeken, bamboe bestek, herbruikbare zakjes en rvs rietjes om bewuster te beginnen.',
  priceRange: '€25 - €45',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=zero+waste+starterkit&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/zero-waste-kit/300/300'
};

const gift_duurzaam_4: Gift = {
  productName: 'Slimme Stekker (Energie Monitoring)',
  description: 'Meet en vermindert sluipverbruik. Direct inzicht in energie & kosten – duurzaam én leerzaam.',
  priceRange: '€15 - €35',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=slimme+stekker+energy+monitoring&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/smart-plug-energy/300/300'
};

const gift_duurzaam_5: Gift = {
  productName: 'Refurbished Smartphone (Mid-Range)',
  description: 'Circulair cadeau met verlengde levensduur. Vaak met garantie & lagere footprint dan nieuw.',
  priceRange: '€180 - €350',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=refurbished+smartphone&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/refurbished-phone/300/300'
};

const gift_duurzaam_6: Gift = {
  productName: 'Bijenhotel voor in de Tuin/Balkon',
  description: 'Stimuleert biodiversiteit en helpt solitaire bijen nestelen – educatief & eco-friendly.',
  priceRange: '€15 - €30',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=bijenhotel&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/bee-hotel/300/300'
};

const gift_duurzaam_7: Gift = {
  productName: 'RVS Herbruikbare Waterfles',
  description: 'Duurzame thermofles houdt dranken warm of koud en vervangt tientallen plastic flesjes.',
  priceRange: '€20 - €40',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=rvs+waterfles+isolatie&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/reusable-bottle/300/300'
};

const gift_duurzaam_8: Gift = {
  productName: 'Fairtrade Chocolade Proeverij',
  description: 'Pure & fairtrade chocolade set met verschillende oorsprongen – smaak + verhaal in één.',
  priceRange: '€15 - €35',
  retailers: [ { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=fairtrade+chocolade+cadeau&tag=gifteez77-21' } ],
  imageUrl: 'https://picsum.photos/seed/fair-chocolate/300/300'
};

const gift_man_1: Gift = {
    productName: "LEGO Technic Racewagen",
    description: "Een uitdagende en gedetailleerde bouwset voor de man die van techniek en auto's houdt. Urenlang bouwplezier gegarandeerd.",
    priceRange: "€40 - €180",
    retailers: [
        { name: "Coolblue", affiliateLink: "https://www.coolblue.nl/zoeken?query=LEGO+Technic+auto" },
        { name: "Amazon.nl", affiliateLink: "https://www.amazon.nl/s?k=LEGO+Technic+auto" },
    ],
  imageUrl: "https://picsum.photos/seed/lego-technic-car/300/300"
};

const gift_man_2: Gift = {
    productName: "Luxe Scheerset",
    description: "Een complete set met een klassiek scheermes, kwast en verzorgende producten voor een authentieke scheerervaring.",
    priceRange: "€50 - €100",
    retailers: [
        { name: "Coolblue", affiliateLink: "https://www.coolblue.nl/zoeken?query=luxe+scheerset+man" },
    ],
  imageUrl: "https://picsum.photos/seed/shaving-kit-classy/300/300"
};

const gift_kerst_1: Gift = {
    productName: "Rituals Verwenpakket",
    description: "Een luxe giftset met heerlijk geurende producten voor een ontspannen moment. Een klassieker die altijd goed is.",
    priceRange: "€25 - €75",
    retailers: [{ name: "Coolblue", affiliateLink: "https://www.coolblue.nl/zoeken?query=Rituals+giftset" }],
  imageUrl: "https://picsum.photos/seed/cosmetics-gift-set/300/300"
};

const gift_kerst_2: Gift = {
    productName: "Sonos Roam SL Speaker",
    description: "Een compacte, draagbare en krachtige speaker voor thuis en onderweg. Waterdicht en met een indrukwekkend geluid.",
    priceRange: "€150 - €200",
    retailers: [{ name: "Coolblue", affiliateLink: "https://www.coolblue.nl/product/885783/sonos-roam-sl-wit.html" }],
  imageUrl: "https://picsum.photos/seed/portable-speaker/300/300"
};

const gift_earbuds_1: Gift = {
    productName: "Anker Soundcore Life P3",
    description: "Indrukwekkende noise cancelling, draadloos opladen en een aanpasbaar geluid via de app. Enorme waarde voor je geld.",
    priceRange: "€70 - €90",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=Anker+Soundcore+Life+P3&tag=gifteez77-21' }],
  imageUrl: "https://m.media-amazon.com/images/I/512Jwa3KmkL._AC_SX522_.jpg"
};

const gift_earbuds_2: Gift = {
    productName: "JBL Tune 230NC TWS",
    description: "De kenmerkende diepe bas van JBL, actieve noise cancelling en een comfortabele pasvorm voor dagelijks gebruik.",
    priceRange: "€60 - €80",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=JBL+Tune+230NC&tag=gifteez77-21' }],
  imageUrl: "https://m.media-amazon.com/images/I/51KEIAsdyfL._AC_SX679_.jpg"
};

const gift_earbuds_3: Gift = {
  productName: "Sony WF-C510",
  description: "Verbeterde opvolger met focus op helder geluid, draagcomfort en efficiënte batterij; compact & licht met DSEE voor audio-upscaling.",
  priceRange: "€50 - €80",
  retailers: [{ name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/dp/B0DBLN4C47?tag=gifteez77-21' }],
  imageUrl: "https://m.media-amazon.com/images/I/419pART3qYL._AC_SX522_.jpg"
};

// Tech Lover Gifts (nieuw artikel)
const gift_tech_1: Gift = {
  productName: "Anker 3-in-1 Draadloze Oplader",
  description: "Laad telefoon, earbuds en smartwatch tegelijk op – strak bureau, minder kabels.",
  priceRange: "€35 - €55",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=anker+3+in+1+wireless+charger&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-wireless-charger/300/300'
};

const gift_tech_2: Gift = {
  productName: "Mechanisch Toetsenbord (Hot‑Swap)",
  description: "Responsief typen, personaliseerbare switches & RGB – perfect voor creators en gamers.",
  priceRange: "€70 - €140",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=hot+swappable+mechanisch+toetsenbord&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-mech-keyboard/300/300'
};

const gift_tech_3: Gift = {
  productName: "Noise Cancelling Koptelefoon Mid-Range",
  description: "Comfort + ruisonderdrukking voor thuiswerken, reizen en focus.",
  priceRange: "€120 - €220",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=noise+cancelling+koptelefoon&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-anc-headphones/300/300'
};

const gift_tech_4: Gift = {
  productName: "Smart Home Starterkit (Bridge + Sensors)",
  description: "Begin met automatiseren: slimme verlichting, beweging & temperatuur voor comfort en energie‑besparing.",
  priceRange: "€60 - €120",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=smart+home+starterkit&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-smart-home/300/300'
};

const gift_tech_5: Gift = {
  productName: "Portable SSD (1TB USB‑C)",
  description: "Supersnelle opslag voor foto’s, video’s & projecten – zakformaat, shock resistant.",
  priceRange: "€70 - €130",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=portable+ssd+1tb+usb+c&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-portable-ssd/300/300'
};

const gift_tech_6: Gift = {
  productName: "E-reader met Warm Licht",
  description: "Lees overal zonder afleiding; aanpasbare kleurtemperatuur voor ogen in de avond.",
  priceRange: "€100 - €180",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=ereader+warm+licht&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-ereader/300/300'
};

const gift_tech_7: Gift = {
  productName: "VR Headset Instapklasse",
  description: "Immersieve games & experiences zonder dure PC – ideaal voor nieuwsgierige pioniers.",
  priceRange: "€250 - €450",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=vr+headset&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-vr/300/300'
};

const gift_tech_8: Gift = {
  productName: "Duurzame Solar Powerbank",
  description: "Laadt apparaten op via zon én USB – handig voor kamperen en noodgevallen.",
  priceRange: "€30 - €60",
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/s?k=solar+powerbank&tag=gifteez77-21' }
  ],
  imageUrl: 'https://picsum.photos/seed/tech-solar-power/300/300'
};

// AI & Smart Home Gifts (echte Amazon producten)
const gift_ai_1: Gift = {
  productName: 'Amazon Echo Dot (5th Gen) met Alexa',
  description: 'Slimme speaker met verbeterde audio, Alexa integratie en smart home controle. Perfect voor beginners in smart home.',
  priceRange: '€39 - €59',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/amazon-echo-dot-5e-generatie-2022-release-smartspeaker-met-wifi-bluetooth-en-alexa-charcoal/dp/B09B8X9RGM?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=Z37RORNER3K7&dib=eyJ2IjoiMSJ9.LIkf9gNy9tn8huz6BujLpCIoxxvY6xzecUkUVRhem1WdkX4obUMF77EIyQUDDJXZXin5V9OvrWrdlENdjS5VdbO68yAakMHEF9HnelyKEStvpH4t6WlGertHUi3YFMLdA0Xou5ZdrbR1XweYJAa95w.ZLJRTOQg_R5ezJp9O9M5Kqx9g466RJygqohPjGjk2xA&dib_tag=se&keywords=Amazon%2BEcho%2BDot%2B%285th%2BGen%29%2Bmet%2BAlexa&qid=1757334499&sprefix=amazon%2Becho%2Bdot%2B5th%2Bgen%2Bmet%2Balexa%2Caps%2C128&sr=8-1&th=1&linkCode=ll1&tag=gifteez77-21&linkId=b6cbdbaf4dbb6ba83ff00542f64d3e2e&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/611XT0uQXjL._AC_SL1000_.jpg'
};

const gift_ai_2: Gift = {
  productName: 'Ring Spotlight Cam Pro',
  description: 'HD beveiligingscamera met nachtzicht, bewegingsdetectie en Alexa integratie. Bewaak je huis eenvoudig.',
  priceRange: '€89 - €129',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/ring-spotlight-cam-pro-wired/dp/B0B6GLJ61Y?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2SEM8ZQEFF2Y2&dib=eyJ2IjoiMSJ9.zuO43cKh64kFnr6rRUbmvqSqlElhOgCEnlpgazOeCEkhMKeFXixF1FTvGCOFo3VDRT3KRgVa1O7jCTQ-CB6RE2rF2gFf8gstZRdD7OR_kxx4XMC546H3IeEDkQbETwkaai1vUzQllpZYmQEZ-9i-jEj8Ya0FsEsTdw7JGc6o9dFut-Cj8v-aSa23bTTxtd-TJ4vjhvOCK2dzwg2U3n4lWxFxBH0NYYsewGTsDptGS9FWkNBX98n-PeVw5nyU59pS-wQyhcCxjiIALYh3zlFvMMcLoawpnHmfdr0xofJ0Qw8.Z_IoCzqqGIW8HEWtEVhyEhU9-z3nVwLHTmfm4Ry1ojM&dib_tag=se&keywords=Ring%2BIndoor%2BCam%2BPro&qid=1757334776&sprefix=ring%2Bindoor%2Bcam%2Bpro%2Caps%2C107&sr=8-1&th=1&linkCode=ll1&tag=gifteez77-21&linkId=9bdfca42c8624d04912181c3bcf6a7c5&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/71i3f4Q8TBL._AC_SX679_.jpg'
};

const gift_ai_3: Gift = {
  productName: 'Philips Hue Starter Kit (White & Color)',
  description: 'Slimme LED verlichting met 16 miljoen kleuren. Stel sfeer, timers en integratie met smart home systemen in.',
  priceRange: '€79 - €149',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Philips-Hue-Starterspakket-Gekleurd-Ambiance/dp/B09QPH6K7N?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=R4NP7X0Y6AIE&dib=eyJ2IjoiMSJ9.5PibKMIjpGBb8vhZVCkhOBeaH2RH4PkmibU5nuyl7trcNmuj3ZQireHOSNANVmJWdFOliXbtxKWNmm4geSlbsLwrFhgDSDl3kHS3_joCYthacrVvjBNQCNBJqER_Oxmt_b1VXtSwpgtyDcz7FXTNAm43K_G2--bto3DDKto9QXS9nWY2_0ttEqhbj64K95KuNYJXRs9ffvYyhy5WkwCc80-sj-_uA3aPFXuaiVxp39qmKRo9_uCihI4soQUfYwWzjGBXnPIbbDEYaMROCPx2jCptnBoUoVL6ccakDvHapwk.bHEw4mG8jhCql-10NYG9WfO83N66vG_GD4n-_dhbSuc&dib_tag=se&keywords=Philips+Hue+Starter+Kit+%28White+%26+Color%29&qid=1757335016&sprefix=philips+hue+starter+kit+white+%26+color+%2Caps%2C61&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll1&tag=gifteez77-21&linkId=d7d7710c74c60fb3cb0b5d61c0f476ed&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/519Yfe+zKnL._AC_SL1000_.jpg'
};

const gift_ai_4: Gift = {
  productName: 'Google Nest Mini (2nd Gen)',
  description: 'Compacte smart speaker met Google Assistant. Uitstekende audio, smart home integratie en voice control.',
  priceRange: '€29 - €49',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Google-generatie-draadloze-Bluetooth-luidspreker-antraciet/dp/B0CGYFYY34?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1A9TJ5K0FAWN4&dib=eyJ2IjoiMSJ9.uFdKmLKG4TNwYxp985l-JX9pQxazTp-kjkv2H5Xd0XJFFqUxbhega1EL2SlT6gaRHzPAQ1t-dZYkj6gUPDJxz6e3v8LYh_b7cASbrABZSsRRq9uOtjcEXr9bwMwRU9RY5HV3m2cP6yJsRbAWyvPGAbA3gRdwv5HCvtW4x1SMYOByU3-GbE7bsfsp8MXiWwgnqlGQ_K9aMsNxXSKhGTnJbawaBYGienDYgCgQo7RL7Xs.D20YNAjGtm0F3ix_H3TV2INdFQmgsXmIvzVpJFwCLDA&dib_tag=se&keywords=Google%2BNest%2BMini%2B%282nd%2BGen%29&qid=1757334685&sprefix=google%2Bnest%2Bmini%2B2nd%2Bgen%2B%2Caps%2C95&sr=8-1&th=1&linkCode=ll1&tag=gifteez77-21&linkId=840400fc337587b91d273852628946e4&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/71mQEBoemPL._AC_SL1500_.jpg'
};

const gift_ai_5: Gift = {
  productName: 'TP-Link Tapo Smart Plug',
  description: 'Slimme stekker voor afstandsbediening via app. Energie monitoring, timers en voice control ondersteuning.',
  priceRange: '€12 - €25',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Tapo-P115-energiebewaking-stopcontact-spraakbediening/dp/B09ZBGWYH9?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3EWCV93ZR68KP&dib=eyJ2IjoiMSJ9.BebjIvYDZmKDPx62puUcZz21W7nBbN1ROkj55BSJLJB51c9GyCQ2mlC-SVlz5xuFMU6oC8vSquh7pFieUah-rWW8wRkp5bfXKcCdVSlSQEzt7YNmjRDwJriudDFkoQnqF4xCFYzo9aJ7CzYfMUZ9uDjVaKAuJaqaG8gK58iQGFrRcmkGI7E_MPJJ_yzeR8fiKADylpkHlSYFY5_zrULML5ZIERg4Eow_fSxg1pE9rJVLir4pdzIgzH-zUD3wdium3tGd0J53_DjhJfXFCRUxAET0Vcsz9WIFZRkF0DuAo84.gCr5D0Xt3hAcgKFytHeoF7uS7bUd9WXtGPXYHZsIZkw&dib_tag=se&keywords=TP-Link%2BTapo%2BSmart%2BPlug&qid=1757335140&sprefix=tp-link%2Btapo%2Bsmart%2Bplug%2Caps%2C157&sr=8-1&th=1&linkCode=ll1&tag=gifteez77-21&linkId=012dde295a77f25443cc9f0e4711f494&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/71aNn34-N4L._AC_SL1500_.jpg'
};

const gift_ai_6: Gift = {
  productName: 'eufy Smart Doorbell Video',
  description: 'Video deurbel met 2K camera, nachtzicht, bewegingsdetectie en lokale opslag. Geen maandelijkse kosten.',
  priceRange: '€99 - €149',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/eufy-Security-ge%C3%AFntegreerde-tweerichtingsaudio-zelfinstallatie/dp/B09377VH3T?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3M9IQAPF2N1I2&dib=eyJ2IjoiMSJ9.uPOWnAEUwnrVI1WAQbjZdkRXwEVgGm0CAK76TGc5jQx02nuWVBox_ZhBQQelnDIsHAUPSkufkSjrpUcYtBrlsFfIY9ahjAS1l9upTbuSzie_gzegd94WCfqaO3iCYE14O-GbP_5nKGZeoMoyjZxSBQnTNB7rsQhAvNJHVXy5cU1MxtevKolZ1nlt3rFFXPvOY1jTyQlMlzfgBmRfNQ_tB64436APTlTBBwRQy3voyx56abDMn5iCzXxoGgiljN9kxpdKOj_E1OOH14c4Jhh85lawAVPcrc4wos2eX7dtgGg.kAauXfU2TTCUGnnOfEO51iBCXUFfI4FpLByrDlaa9bM&dib_tag=se&keywords=eufy+Smart+Doorbell+Video&qid=1757334857&sprefix=eufy+smart+doorbell+video%2Caps%2C121&sr=8-1&linkCode=ll1&tag=gifteez77-21&linkId=f9a392e9e94b294a807867d85c0c8068&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61M6mX+pipL._AC_SL1500_.jpg'
};

const gift_ai_7: Gift = {
  productName: 'Logitech Circle View Webcam',
  description: 'Slimme webcam met 360° zicht, bewegingsdetectie en smart home integratie. Perfect voor security en streaming.',
  priceRange: '€79 - €119',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Logitech-View-beveiligingscamera-groothoeklens-nachtzicht-versleuteld/dp/B07W6FQ65D?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=21QJB8S2M25F7&dib=eyJ2IjoiMSJ9.0D1q-F3JHV9Kla1fhFfVEj8sabqB6okDt9IMIXlx9fOq1a-jPdPy55GhZVV8m8kO4-yzNZhbd5rPM99nZ0AlcME7jrDCi8euvxAvuFO_B9Qe8KKpR77EHHArR16xrk5I9OnvIEprMl26WkbQZufEE35xUhhLDcmVp4-o3WVx1u71H4qxhsNNfHwxp5yCxAxUqGFgdv4G-rNyBkKVPK2bRJ_7EgxdMF859jfsWsp8-MFT_KzJ2MOiOfuoeUvFBbfbmHp4PDZno6Ud5WPP1vdyyInWi6a-j99GBdg_-PmLc3c.TiivZ09Bloyy68O6T0-KopHhLtUfg5joTJdnvRQvhy8&dib_tag=se&keywords=Logitech+Circle+View+Webcam&qid=1757334937&sprefix=logitech+circle+view+webcam%2Caps%2C210&sr=8-1&linkCode=ll1&tag=gifteez77-21&linkId=b1022459a58d05166ce67e7106dea801&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/51mU6elBigL._AC_SL1000_.jpg'
};

const gift_ai_8: Gift = {
  productName: 'Samsung SmartThings Station',
  description: 'Universele smart home hub voor Matter apparaten. Centraliseert controle van al je smart devices.',
  priceRange: '€59 - €89',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Aeotec-Smart-Home-Hub-SmartThings/dp/B08NDH9NXN?__mk_nl_NL=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=11TMRZYS9SGP4&dib=eyJ2IjoiMSJ9.Z2zEfjtWpAMSjG2xia-2aNbFNcwynIp3fhq0VLYujrXGjHj071QN20LucGBJIEps.kPPUVr-RhTbr_ol1y2Oc_0QyMMxDbDjcd5b2XPrUxwQ&dib_tag=se&keywords=Samsung+SmartThings+Station&qid=1757335213&sprefix=samsung+smartthings+station%2Caps%2C85&sr=8-1&linkCode=ll1&tag=gifteez77-21&linkId=a120e006a9c3e7431f0b4f69efc46d64&language=nl_NL&ref_=as_li_ss_tl' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61guzpgr5ZL._AC_SL1500_.jpg'
};

// Kerstcadeau Gifts 2025
const gift_kerst_2025_1: Gift = {
  productName: 'PlayStation 5 Slim',
  description: 'De nieuwste PS5 Slim versie met verbeterde koeling en dezelfde geweldige prestaties. Perfect voor gamers die willen genieten van de nieuwste games in 4K.',
  priceRange: '€499 - €549',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/PlayStation-PlayStation%C2%AE5-Slim-Console/dp/B0CL5KNB9M?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg'
};

const gift_kerst_2025_2: Gift = {
  productName: 'Dyson V15s Detect Submarine',
  description: 'De nieuwste Dyson stofzuiger met verbeterde laser detectie technologie en langere batterijduur. Ruimt zelfs de kleinste stofdeeltjes op.',
  priceRange: '€799 - €899',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Dyson-V15-Detect-Submarine-stofzuiger/dp/B0C1234567?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/71jQPKKxHCL._AC_SL1500_.jpg'
};

const gift_kerst_2025_3: Gift = {
  productName: 'Sony WH-1000XM5',
  description: 'Premium noise cancelling hoofdtelefoon met uitzonderlijke geluidskwaliteit, 30 uur batterijduur en kristalheldere gesprekken.',
  priceRange: '€349 - €399',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Sony-WH-1000XM5-Wireless-Industry-Leading-Cancelling/dp/B0B2JZQZ8N?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg'
};

const gift_kerst_2025_4: Gift = {
  productName: 'LEGO Art Set - Creative Fun',
  description: 'Nieuwe LEGO Art collectie waarmee je kunt tekenen met LEGO blokjes. Combineert creativiteit met de vertrouwde LEGO bouwervaring.',
  priceRange: '€119 - €149',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/LEGO-Art-Creative-Fun-Set/dp/B08G4Y3S8N?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/81gM6I3pqJL._AC_SL1500_.jpg'
};

const gift_kerst_2025_5: Gift = {
  productName: 'DeLonghi Dinamica ECAM350.75.S',
  description: 'Geavanceerde espressomachine met melkopschuimer, touchscreen bediening en automatische reiniging. Perfect voor thuisbarista\'s.',
  priceRange: '€899 - €999',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/DeLonghi-Dinamica-ECAM350-75-S-automatische-espressomachine/dp/B07P8Z8QZR?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61XzN5j8XDL._AC_SL1500_.jpg'
};

const gift_kerst_2025_6: Gift = {
  productName: 'DJI Mini 4 Pro',
  description: 'Ultralichte drone met 4K/60fps video, 34 minuten vluchtijd, ActiveTrack 360° en intelligente vluchtmodi. Inclusief RC-N1 afstandsbediening.',
  priceRange: '€899 - €999',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/DJI-Mini-4-Pro-Drone/dp/B0C1234568?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/71T5N2vBJhL._AC_SL1500_.jpg'
};

const gift_kerst_2025_7: Gift = {
  productName: 'Apple Watch Series 9',
  description: 'De nieuwste Apple Watch met S9 chip, dubbele luidsprekers, precisie dubbele frequentie GPS en geavanceerde gezondheidsfuncties.',
  priceRange: '€429 - €479',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/Apple-Watch-Series-9-GPS/dp/B0C1234569?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61y2WV3ZM+L._AC_SL1500_.jpg'
};

const gift_kerst_2025_8: Gift = {
  productName: 'KitchenAid Pro Line Series Stand Mixer',
  description: 'Professionele keukenmachine met 7 liter roestvrijstalen kom, 10 snelheden, digitale timer en professionele accessoires voor elke bakbehoefte.',
  priceRange: '€1.199 - €1.299',
  retailers: [
    { name: 'Amazon.nl', affiliateLink: 'https://www.amazon.nl/KitchenAid-Pro-Line-Series-standmixer/dp/B08G4Y3S8N?tag=gifteez77-21' }
  ],
  imageUrl: 'https://m.media-amazon.com/images/I/61Q7Z8zK8EL._AC_SL1500_.jpg'
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'ai-smart-home-gadgets-2025',
    title: 'AI & Smart Home Gadgets (2025): 25+ Innovatieve Apparaten voor een Slimmere Woning',
    excerpt: 'Ontdek de nieuwste AI-gadgets en smart home apparaten die je leven makkelijker maken. Van voice assistants tot beveiligingssystemen.',
    imageUrl: '/images/trending-tech.png',
    category: 'Tech',
    author: { name: 'Tech Expert', avatarUrl: 'https://i.pravatar.cc/150?u=tech' },
    publishedDate: '2025-09-08',
    content: [
      { type: 'paragraph', content: 'In 2025 is je huis niet langer dom – het is intelligent, adaptief en helpt je dagelijks. AI en smart home technologie maken woningen veiliger, efficiënter en comfortabeler dan ooit. Van spraakgestuurde assistenten tot geautomatiseerde beveiligingssystemen, deze gadgets transformeren hoe we thuis leven.' },
      { type: 'paragraph', content: 'Ben je nieuw met smart home? Begin klein met een voice assistant. Zoek je een complete setup? Bekijk onze <a href="/blog/duurzame-eco-vriendelijke-cadeaus">Duurzame Cadeaus gids</a> voor eco-vriendelijke smart apparaten.' },
      { type: 'heading', content: 'Waarom Smart Home Gadgets in 2025?' },
      { type: 'paragraph', content: 'Volgens onderzoek van Statista zal de smart home markt in 2025 €180 miljard bereiken. AI maakt apparaten slimmer: ze leren van je gewoonten, voorspellen je behoeften en werken samen voor optimale efficiency. Gemiddeld besparen huishoudens €200-€400 per jaar aan energiekosten.' },
      { type: 'heading', content: 'Voice Assistants & AI Speakers' },
      { type: 'paragraph', content: 'De toegangspoort tot je smart home. Moderne AI-assistants begrijpen context, meerdere talen en integreren naadloos met duizenden apparaten.' },
      { type: 'gift', content: gift_ai_1 },
      { type: 'gift', content: gift_ai_4 },
      { type: 'heading', content: 'Slimme Beveiliging' },
      { type: 'paragraph', content: 'AI-gedreven camera\'s herkennen gezichten, dieren en bewegingen. Lokale opslag voorkomt privacy issues en maandelijkse kosten.' },
      { type: 'gift', content: gift_ai_2 },
      { type: 'gift', content: gift_ai_6 },
      { type: 'gift', content: gift_ai_7 },
      { type: 'heading', content: 'Slimme Verlichting & Atmosfeer' },
      { type: 'paragraph', content: 'Creëer de perfecte sfeer met miljoenen kleuren, automatische timers en integratie met je dagelijkse routine.' },
      { type: 'gift', content: gift_ai_3 },
      { type: 'heading', content: 'Smart Plugs & Energie Management' },
      { type: 'paragraph', content: 'Bespaar energie door apparaten automatisch uit te schakelen. Monitor verbruik en creëer routines voor efficiency.' },
      { type: 'gift', content: gift_ai_5 },
      { type: 'heading', content: 'Smart Home Hubs & Integratie' },
      { type: 'paragraph', content: 'Het brein van je smart home. Centraliseert controle en zorgt voor naadloze communicatie tussen apparaten.' },
      { type: 'gift', content: gift_ai_8 },
      { type: 'heading', content: 'Budget vs Premium: Wat Past Bij Jou?' },
      { type: 'comparisonTable', headers: ['Budget (€0-€100)', 'Middenklasse (€100-€200)', 'Premium (€200+)'], rows: [
          { feature: 'Voorbeelden', values: ['Echo Dot, Smart Plugs', 'Ring Cam, Philips Hue', 'Eufy Doorbell, Logitech Circle'] },
          { feature: 'Setup Moeilijkheid', values: ['Zeer eenvoudig', 'Middelmatig', 'Geavanceerd'] },
          { feature: 'Features', values: ['Basis voice control', 'Video, kleuren, energie', '4K video, AI herkenning'] },
          { feature: 'Besparingspotentieel', values: ['€50-€100/jaar', '€100-€200/jaar', '€200-€400/jaar'] },
          { feature: 'Geschikt Voor', values: ['Beginners, kleine woningen', 'Gezinnen, gemiddelde huizen', 'Tech lovers, grote woningen'] }
        ] },
      { type: 'heading', content: 'Privacy & Beveiliging: Belangrijke Overwegingen' },
      { type: 'paragraph', content: 'Kies apparaten met lokale verwerking en sterke encryptie. Vermijd systemen die al je data naar de cloud sturen. Europese merken zoals Ring en Eufy bieden betere privacy bescherming dan sommige Aziatische alternatieven.' },
      { type: 'heading', content: 'Installatie & Setup Tips' },
      { type: 'paragraph', content: 'Begin met één ruimte (bijv. woonkamer) en breid uit. Gebruik dezelfde merk/ecosysteem voor eenvoudigere integratie. Test alle apparaten grondig voordat je ze weggeeft.' },
      { type: 'heading', content: 'Toekomst van Smart Home in 2025' },
      { type: 'paragraph', content: 'Matter standaard zorgt voor betere cross-brand compatibiliteit. AI wordt slimmer in het voorspellen van behoeften. Energie management wordt crucialer met stijgende prijzen.' },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Start met Echo Dot of Nest Mini', content: 'Voor beginners: begin met een voice assistant (€30-€50) en bouw vanaf daar uit. Voor gevorderden: investeer in een complete beveiligings- en verlichtingssetup. Het gemiddelde huishouden ziet ROI binnen 6-12 maanden door energiebesparingen en convenience.' }
    ]
  },
  {
    slug: 'duurzame-eco-vriendelijke-cadeaus',
    title: 'Duurzame & Eco‑vriendelijke Cadeaus: 40+ Ideeën die Echt Verschil Maken (2025)',
    excerpt: 'Bewust geven? Deze uitgebreide gids helpt je het perfecte duurzame cadeau te kiezen – van zero waste & energie tot refurbished en ervaringen.',
    imageUrl: '/images/trending-eco.png',
    category: 'Duurzaam',
    author: { name: 'Linda Groen', avatarUrl: 'https://i.pravatar.cc/150?u=lindagroen' },
    publishedDate: '2025-09-07',
    content: [
      { type: 'paragraph', content: 'Duurzaam geven is meer dan “iets groens” kopen. Het gaat om producten (of ervaringen) die écht gebruikt worden, langer meegaan, minder verspilling veroorzaken of zelfs positieve impact creëren. In deze gids breken we het op in overzichtelijke thema\'s zodat je gericht kunt kiezen.' },
  { type: 'paragraph', content: 'Liever een ervaring of tech-upgrade i.p.v. spullen? Bekijk ook onze gids met <a href="/blog/beste-ervaringscadeaus-2025">Ervaringscadeaus</a> en de <a href="/blog/cadeaus-voor-tech-liefhebbers">Tech Cadeaus 2025</a>.' },
      { type: 'heading', content: 'Waarom Kiezen voor Duurzame Cadeaus?' },
      { type: 'paragraph', content: 'Een duurzaam cadeau vertelt een verhaal: minder afval, langere levensduur, eerlijke productie of lokale impact. Zeker bij bewuste ontvangers voelt het persoonlijker omdat je laat zien dat je hun waarden deelt.' },
      { type: 'heading', content: 'Dagelijkse Gewoonten' },
      { type: 'paragraph', content: 'Kleine dingen die je elke dag gebruikt hebben op lange termijn de grootste invloed. Vervang wegwerp door stijlvol herbruikbaar of slimmer verbruik.' },
      { type: 'gift', content: gift_duurzaam_1 },
      { type: 'gift', content: gift_duurzaam_7 },
      { type: 'gift', content: gift_duurzaam_3 },
      { type: 'heading', content: 'Energie & Slim Thuis' },
      { type: 'paragraph', content: 'Direct inzicht in energieverbruik motiveert gedragsverandering. Combineer slimme stekkers met routines (lampen / opladers uit). Ook solar powerbanks verlengen de levensduur van apparaten onderweg.' },
      { type: 'gift', content: gift_duurzaam_4 },
      { type: 'gift', content: gift_tech_8 },
      { type: 'heading', content: 'Natuur & Biodiversiteit' },
      { type: 'paragraph', content: 'Cadeaus die natuur helpen zijn educatief én zichtbaar. Een bijenhotel laat letterlijk leven terugkomen in tuin of balkon.' },
      { type: 'gift', content: gift_duurzaam_6 },
      { type: 'heading', content: 'Circulair & Refurbished' },
      { type: 'paragraph', content: 'Refurbished elektronica verlaagt CO₂‑uitstoot en grondstoffenverbruik. Let op batterijconditie, garantie & transparantie van aanbieder.' },
      { type: 'gift', content: gift_duurzaam_5 },
      { type: 'heading', content: 'Eerlijk & Ethisch Genieten' },
      { type: 'paragraph', content: 'Fairtrade en bio producten (koffie, thee, chocolade) maken een fijn verwenmoment betekenisvoller. Voeg een kaartje toe met herkomstverhaal.' },
      { type: 'gift', content: gift_duurzaam_8 },
      { type: 'heading', content: 'Impact Cadeaus' },
      { type: 'paragraph', content: 'Sommige merken doneren een deel van de winst aan sociale of ecologische projecten. Dit vergroot de \"multiplicator\" van jouw cadeau.' },
      { type: 'gift', content: gift_duurzaam_2 },
      { type: 'heading', content: 'Vergelijking: Drie Duurzame Cadeau Types' },
      { type: 'comparisonTable', headers: ['Herbruikbare Beker', 'Refurbished Smartphone', 'Slimme Stekker'], rows: [
          { feature: 'Dagelijks Gebruik', values: ['Ja (koffie / thee)', 'Intensief', 'Passief / monitoring'] },
          { feature: 'Footprint Besparing', values: ['Afvalreductie', 'CO₂ + grondstoffen', 'Stroomverbruik'] },
          { feature: 'Levensduur', values: ['2–4 jaar', '2–5 jaar extra', '3–6 jaar'] },
          { feature: 'Complexiteit', values: ['Geen', 'Laag (setup)', 'Laag'] },
          { feature: 'Story Value', values: ['Bewust kiezen', 'Circulair denken', 'Data = inzicht'] },
        ] },
      { type: 'heading', content: 'Plus- & Minpunten per Segment' },
      { type: 'prosCons', items: [
        { title: 'Herbruikbare Dagelijkse Items', pros: ['Meteen inzetbaar', 'Goedkoop', 'Bewustzijnstrigger'], cons: ['Soms al in bezit', 'Kan verzamelgedrag worden'] },
        { title: 'Refurbished Tech', pros: ['Grote footprint winst', 'Premium kwaliteit goedkoper', 'Garantie vaak inbegrepen'], cons: ['Vertrouwen aanbieder nodig', 'Accu niet altijd 100% nieuw'] },
        { title: 'Slimme Energie Tools', pros: ['Meetbaar effect', 'Bewustwording gezin', 'Betaalbaar instapniveau'], cons: ['Vraagt soms app', 'Data zonder actie = geen winst'] },
      ] },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Hoe kies je hét duurzame cadeau?', content: 'Kies iets dat dagelijks gebruikt wordt (herbruikbare beker, slimme stekker) voor maximale routine-impact. Voor een groter gebaar met verhaal: ga refurbished of combineer een tastbaar item met een ervaring (workshop, natuuruitje). Vermijd “groene gimmicks” – functionaliteit + echte adoptie bepalen of een cadeau duurzaam voelt én is.' }
    ]
  },
  {
    slug: 'cadeaus-voor-tech-liefhebbers',
    title: 'Cadeaus voor Tech-Liefhebbers: 25+ Ideeën van Budget tot High‑End (2025)',
    excerpt: 'Op zoek naar een cadeau voor een gadgetfreak? Van betaalbare desk-upgrades tot smart home en VR – deze gids helpt je de perfecte tech verrassing te kiezen.',
  // Gebruik dezelfde "trending" afbeelding als in de Trending Cadeaugidsen sectie i.p.v. de OG-share image
  imageUrl: '/images/trending-tech.png',
    category: 'Tech',
    author: { name: 'Gifteez Redactie', avatarUrl: 'https://i.pravatar.cc/150?u=techlover' },
    publishedDate: '2025-09-07',
    content: [
      { type: 'paragraph', content: 'Tech-liefhebbers zijn geweldig om voor te shoppen – maar ook lastig. Ze hebben vaak al “alles” of zijn kritisch over specs. Geen paniek: in deze gids vind je gestructureerde cadeau-ideeën per thema en budget. Van kleine upgrades die elke dag plezier geven tot indrukwekkende high‑end gadgets.' },
  { type: 'paragraph', content: 'Zoek je iets dat geen ruimte inneemt of juist eco-impact maakt? Bekijk ook onze gids met <a href="/blog/beste-ervaringscadeaus-2025">Ervaringscadeaus</a> of de <a href="/blog/duurzame-eco-vriendelijke-cadeaus">Duurzame Cadeaus 2025</a>.' },
      { type: 'heading', content: 'Budget & Desk Essentials (< €50)' },
      { type: 'paragraph', content: 'Klein maar functioneel: accessoires die dagelijks gebruikt worden winnen het vaak van flashy gimmicks. Denk aan kabelmanagement, ergonomie of laadoplossingen.' },
      { type: 'gift', content: gift_tech_1 },
      { type: 'gift', content: gift_tech_8 },
      { type: 'heading', content: 'Productiviteit & Creatie' },
      { type: 'paragraph', content: 'Tools die typen, concentreren of content maken prettiger maken zijn goud waard. Een goed mechanisch toetsenbord is vaak de grootste “quality of life” upgrade aan een bureau.' },
      { type: 'gift', content: gift_tech_2 },
      { type: 'heading', content: 'Audio & Focus' },
      { type: 'paragraph', content: 'Hybride werk en drukke omgevingen vragen om comfort + ruisdemping. Een mid-range noise cancelling koptelefoon biedt tegenwoordig premium functies zonder topprijs.' },
      { type: 'gift', content: gift_tech_3 },
      { type: 'heading', content: 'Slim Wonen' },
      { type: 'paragraph', content: 'Een smart home starterkit is het perfecte “gateway” cadeau: meteen resultaat (licht, automation) en uitbreidbaar.' },
      { type: 'gift', content: gift_tech_4 },
      { type: 'heading', content: 'Opslag & Data' },
      { type: 'paragraph', content: 'Creators, fotografen en studenten hebben nooit genoeg snelle, betrouwbare opslag. Een portable SSD versnelt workflows dramatisch t.o.v. klassieke HDDs.' },
      { type: 'gift', content: gift_tech_5 },
      { type: 'heading', content: 'Lezen & Ontspanning' },
      { type: 'paragraph', content: 'Een e-reader haalt ruis uit het lezen: geen notificaties, wel lange accuduur. Perfect voor minimalisten én reizigers.' },
      { type: 'gift', content: gift_tech_6 },
      { type: 'heading', content: 'Immersive & Fun' },
      { type: 'paragraph', content: 'VR blijft groeien en is ideaal voor early adopters. Let op comfort, resolutie en stand‑alone mogelijkheden.' },
      { type: 'gift', content: gift_tech_7 },
      { type: 'heading', content: 'Vergelijking: Drie Populaire Tech Cadeau Types' },
      { type: 'comparisonTable', headers: ['Wireless Charger', 'Portable SSD', 'Noise Cancelling Headphones'], rows: [
          { feature: 'Dagelijks Gebruik', values: ['Elke dag op bureau', 'Project / backup sessies', 'Werk & reizen'] },
          { feature: 'Impact Direct', values: ['Direct minder kabelstress', 'Snellere workflows', 'Meer focus & rust'] },
          { feature: 'Leercurve', values: ['Geen', 'Laag', 'Geen'] },
          { feature: 'Upgrade Plezier', values: ['Laag', 'Middel', 'Hoog'] },
          { feature: 'Persoonlijk', values: ['Functioneel', 'Semi-persoonlijk', 'Ervaren als luxe'] },
        ]
      },
      { type: 'heading', content: 'Plus- & Minpunten per Segment' },
      { type: 'prosCons', items: [
          { title: 'Smart Home Starter', pros: ['Direct zichtbaar resultaat', 'Uit te breiden', 'Energiebesparing'], cons: ['Vraagt soms hub/app', 'Niet iedereen wil automatisering'] },
          { title: 'Mechanisch Toetsenbord', pros: ['Verbeterde typervaring', 'Custom switches & keycaps', 'Duurzaam'], cons: ['Geluid kan storend zijn', 'Keuze kan overweldigend zijn'] },
          { title: 'Noise Cancelling Headset', pros: ['Focus & rust', 'Comfortabel voor reizen', 'Betere call kwaliteit'], cons: ['Duurdere modellen voor top ANC', 'Accu slijtage na jaren'] },
        ]
      },
      { type: 'heading', content: 'Duurzame & Verantwoorde Tech' },
      { type: 'paragraph', content: 'Let op: refurbished premium devices of modulair ontwerp (Fairphone / Framework) kunnen een groen alternatief zijn – geef “circulair” als story cadeau.' },
      { type: 'heading', content: 'Ons Eindoordeel' },
      { type: 'verdict', title: 'Wat kies je voor welke tech-liefhebber?', content: 'Wil je safe maar nuttig? Ga voor de \n**Portable SSD** of de **Wireless Charger**. Zoek je een “wow”-effect: kies **VR Headset** of een **mechanisch toetsenbord** dat past bij hun stijl. Voor focus en welzijn wint de **Noise Cancelling Koptelefoon**. En twijfel je? Combineer een kleiner desk-accessoire met iets persoonlijks (kaartje / inside joke) – dat maakt ook een technisch cadeau emotioneel waardevol.' }
    ]
  },
  {
    slug: "ultieme-gids-kerstcadeaus",
    title: "De Ultieme Gids voor Kerstcadeaus 2025",
    excerpt: "Van de nieuwste tech-gadgets tot persoonlijke en duurzame cadeaus. Met deze complete gids vind je gegarandeerd het perfecte kerstcadeau voor iedereen op je lijst.",
  imageUrl: "https://picsum.photos/seed/christmas-gifts/800/600",
    category: "Kerstmis",
    author: { name: "Gifteez Redactie", avatarUrl: "https://i.pravatar.cc/150?u=redactie" },
    publishedDate: "2025-11-15",
    content: [
        { type: 'paragraph', content: "De feestdagen staan weer voor de deur en dat betekent maar één ding: de jacht op het perfecte kerstcadeau is geopend! Stress? Niet nodig. Of je nu zoekt naar iets voor je partner, ouders, vrienden of collega's, met onze tips en suggesties wordt het vinden van het perfecte cadeau een fluitje van een cent." },
        { type: 'heading', content: "Tip 1: Het Altijd-Goed Verwenpakket" },
        { type: 'paragraph', content: "Je kunt er bijna niet de mist mee ingaan: een luxe verwenpakket. Ideaal voor wie wel wat ontspanning kan gebruiken na een druk jaar. Denk aan heerlijke geuren, zachte crèmes en een momentje voor zichzelf. Merken als Rituals en L'Occitane hebben prachtige sets voor zowel mannen als vrouwen. Een veilige, maar zeer gewaardeerde keuze." },
        { type: 'gift', content: gift_kerst_1 },
        { type: 'heading', content: "Tip 2: Voor de Tech Liefhebber" },
        { type: 'paragraph', content: "Is jouw dierbare altijd op de hoogte van de nieuwste gadgets? Dan is een tech-cadeau een schot in de roos. Denk aan slimme-huis apparaten, een goede koptelefoon met noise-cancelling of een draadloze oplader. Een draagbare speaker van hoge kwaliteit is ook een fantastisch cadeau voor muziekliefhebbers." },
        { type: 'gift', content: gift_kerst_2 },
    ]
  },
  {
    slug: "vergelijking-draadloze-oordopjes",
    title: "De Beste Draadloze Oordopjes Onder €100 (2025)",
    excerpt: "Op zoek naar de beste 'bang for your buck'? We vergelijken de Anker Soundcore Life P3, JBL Tune 230NC en Sony WF-C500 om jou te helpen de perfecte keuze te maken.",
  imageUrl: "https://picsum.photos/seed/earbuds-wireless/800/600",
    category: "Tech",
    author: { name: "Mark de Cadeau-Expert", avatarUrl: "https://i.pravatar.cc/150?u=mark" },
    publishedDate: "2025-02-01",
    content: [
      { type: 'paragraph', content: "Draadloze oordopjes zijn een fantastisch cadeau, maar de keuze is reusachtig. Zeker in de populaire prijscategorie onder de 100 euro. Geen zorgen, wij hebben het uitzoekwerk voor je gedaan! We zetten drie topmodellen naast elkaar: de veelzijdige Anker Soundcore Life P3, de bas-rijke JBL Tune 230NC en de op geluid gefocuste Sony WF-C500." },
      { type: 'heading', content: "De Kandidaten" },
      { type: 'paragraph', content: "Hieronder introduceren we de drie kanshebbers die we uitgebreid gaan vergelijken." },
      { type: 'gift', content: gift_earbuds_1 },
      { type: 'gift', content: gift_earbuds_2 },
      { type: 'gift', content: gift_earbuds_3 },
      { type: 'heading', content: "Specificaties Vergeleken" },
      {
        type: 'comparisonTable',
        headers: ['Anker Soundcore Life P3', 'JBL Tune 230NC TWS', 'Sony WF-C500'],
        rows: [
          { feature: 'Noise Cancelling', values: ['Ja (Adaptief)', 'Ja (Actief)', 'Nee'] },
          { feature: 'Accuduur (oortjes)', values: ['7 uur', '8 uur', '10 uur'] },
          { feature: 'Accuduur (met case)', values: ['35 uur', '40 uur', '20 uur'] },
          { feature: 'Draadloos Opladen', values: ['Ja', 'Nee', 'Nee'] },
          { feature: 'Waterbestendigheid', values: ['IPX5 (Spatwaterdicht)', 'IPX4 (Spatwaterdicht)', 'IPX4 (Spatwaterdicht)'] },
        ]
      },
      { type: 'heading', content: "Plus- & Minpunten per Model" },
      {
        type: 'prosCons',
        items: [
          {
            title: 'Anker Soundcore Life P3',
            pros: ['Beste noise cancelling in de test', 'Draadloos oplaadbaar', 'Uitgebreide app met equalizer'],
            cons: ['Iets minder diepe bas dan JBL'],
          },
          {
            title: 'JBL Tune 230NC',
            pros: ['Krachtig en diep basgeluid', 'Lange accuduur met case', 'Comfortabele pasvorm'],
            cons: ['Noise cancelling is minder effectief dan Anker', 'Geen draadloos opladen'],
          },
          {
            title: 'Sony WF-C500',
            pros: ['Beste algehele geluidskwaliteit', 'Langste accuduur (oortjes zelf)', 'Compact en lichtgewicht'],
            cons: ['Geen noise cancelling', 'Minder accucapaciteit in de case'],
          }
        ]
      },
      { type: 'heading', content: "Ons Eindoordeel" },
      {
        type: 'verdict',
        title: "Welke moet je kiezen?",
        content: "Voor de meeste mensen is de **Anker Soundcore Life P3** de beste allround keuze. De combinatie van goede noise cancelling, draadloos opladen en een prima geluid voor deze prijs is onverslaanbaar. Zoek je specifiek naar een diepe bas voor genres als hiphop of dance, dan is de **JBL Tune 230NC** een uitstekende concurrent. Ben je een echte audiofiel en is pure geluidskwaliteit voor jou het allerbelangrijkst (en kun je leven zonder noise cancelling)? Dan is de **Sony WF-C500** de winnaar op het gebied van audio."
      }
    ]
  },
  {
    slug: "originele-cadeaus-voor-de-man",
    title: "10 Originele Cadeaus voor de Man Die Alles Al Heeft",
    excerpt: "Moeite met het vinden van een cadeau voor hem? Deze lijst staat vol met unieke en verrassende ideeën die gegarandeerd in de smaak vallen.",
  imageUrl: "https://picsum.photos/seed/gifts-for-him/600/400",
    category: "Voor Hem",
    author: { name: "Mark de Cadeau-Expert", avatarUrl: "https://i.pravatar.cc/150?u=mark" },
    publishedDate: "2025-10-28",
    content: [
      { type: 'paragraph', content: "Het is een jaarlijks terugkerend probleem: wat geef je de man die beweert niets nodig te hebben, of alles al heeft? Geen zorgen, we hebben een lijst samengesteld met cadeaus die hem echt zullen verrassen en die hij misschien niet eens wist dat hij wilde." },
      { type: 'heading', content: "Voor de Man met Gevoel voor Nostalgie" },
      { type: 'paragraph', content: "Iedere man heeft een innerlijk kind. Speel daarop in met een cadeau dat hem terugbrengt naar zijn jeugd, maar dan met een volwassen twist. Een complexe LEGO Technic set is niet alleen leuk om te bouwen, maar staat ook nog eens stoer in zijn kantoor of man-cave." },
      { type: 'gift', content: gift_man_1 },
      { type: 'heading', content: "Voor de Man die van Rituelen Houdt" },
      { type: 'paragraph', content: "Upgrade zijn dagelijkse routine. Een luxe scheerset transformeert een alledaagse handeling in een moment van pure verwennerij. Het is een stijlvol en praktisch cadeau dat laat zien dat je om zijn welzijn geeft." },
      { type: 'gift', content: gift_man_2 },
    ]
  },
  {
    slug: "duurzame-cadeaus-die-goed-doen",
    title: "Duurzame Cadeaus: Geef Een Gift Die Goed Doet",
    excerpt: "Ontdek onze selectie van milieuvriendelijke en ethisch verantwoorde cadeaus. Perfect voor de bewuste consument die de wereld een beetje beter wil maken.",
  imageUrl: "https://picsum.photos/seed/sustainable-gifts/600/400",
    category: "Duurzaam",
    author: { name: "Linda Groen", avatarUrl: "https://i.pravatar.cc/150?u=linda" },
    publishedDate: "2025-10-12",
    content: [
        { type: 'paragraph', content: "Een cadeau geven is leuk, maar een cadeau geven dat ook nog eens goed is voor de planeet, is nog beter! Steeds meer mensen kiezen voor duurzame opties. Hier zijn een paar van onze favorieten die bewijzen dat 'bewust' en 'begeerlijk' perfect samengaan." },
        { type: 'heading', content: "Begin de dag goed én groen" },
        { type: 'paragraph', content: "Wist je dat de wegwerpbekertjes voor koffie een enorme bron van afval zijn? Een stijlvolle, herbruikbare beker is een perfect cadeau voor de koffie- of theeliefhebber die vaak onderweg is. De HuskeeCup is zelfs gemaakt van restmateriaal uit de koffieproductie!" },
        { type: 'gift', content: gift_duurzaam_1 },
        { type: 'heading', content: "Een cadeau met een grote boodschap" },
        { type: 'paragraph', content: "Sommige cadeaus hebben een verhaal. The Good Roll is zo'n merk. Hun toiletpapier is niet alleen gemaakt van 100% gerecycled papier, maar hun missie is om iedereen ter wereld toegang te geven tot veilige en schone toiletten. Een praktisch cadeau met een enorme impact." },
        { type: 'gift', content: gift_duurzaam_2 },
    ]
  },
  {
    slug: "valentijnsdag-cadeau-gids",
    title: "De Ultieme Gids voor Valentijnsdag Cadeaus",
    excerpt: "Of je nu op zoek bent naar iets romantisch, persoonlijks of gewoon leuks, hier vind je de beste cadeaus om je liefde te tonen en de dag onvergetelijk te maken.",
  imageUrl: "https://picsum.photos/seed/valentines-gifts/600/400",
    category: "Valentijnsdag",
    author: { name: "Gifteez Redactie", avatarUrl: "https://i.pravatar.cc/150?u=redactie" },
    publishedDate: "2025-01-10",
    content: [
      { type: 'paragraph', content: "Liefde zit in de lucht! Valentijnsdag is het perfecte moment om je partner te laten zien hoeveel je om hem of haar geeft. Sla de standaard chocolaatjes en bloemen over en kies voor iets echt speciaals met onze tips. We helpen je om een cadeau te vinden dat recht uit het hart komt." },
      { type: 'heading', content: "Tip 1: Geef een Ervaring" },
      { type: 'paragraph', content: "De mooiste cadeaus zijn vaak geen spullen, maar herinneringen. Tijd samen doorbrengen is onbetaalbaar. Plan een romantisch weekendje weg, boek een workshop die jullie samen kunnen doen (zoals pottenbakken of een kookcursus), of koop kaartjes voor een concert van zijn of haar favoriete artiest. Deze cadeaus creëren verhalen die jullie nog jaren zullen delen." },
      { type: 'heading', content: "Tip 2: Een Persoonlijk Sieraad" },
      { type: 'paragraph', content: "Een sieraad is een klassiek romantisch cadeau, maar maak het extra speciaal door het te personaliseren. Laat een ketting, armband of ring graveren met jullie initialen, een belangrijke datum of een korte, betekenisvolle boodschap. Het is een blijvend symbool van jullie liefde." },
    ]
  },
  {
    slug: 'kerstcadeaus-2025-gids',
    title: 'De Ultieme Gids voor Kerstcadeaus 2025',
    excerpt: 'Ontdek de beste kerstcadeaus voor 2025! Van gaming consoles tot smart home gadgets - wij hebben de ultieme gids samengesteld met cadeaus voor iedereen op je lijstje.',
    imageUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    category: 'Cadeau Gidsen',
    author: { name: 'Gifteez Redactie', avatarUrl: 'https://i.pravatar.cc/150?u=gifteezredactie' },
    publishedDate: '2025-12-01',
    content: [
      { type: 'heading', content: "Inleiding: Kerstcadeaus 2025" },
      { type: 'paragraph', content: "Kerstmis 2025 staat voor de deur en dat betekent weer tijd voor het perfecte cadeau! Of je nu op zoek bent naar cadeaus voor je partner, kinderen, ouders of vrienden - wij hebben alles voor je samengesteld. Deze gids bevat de beste kerstcadeaus van 2025, zorgvuldig geselecteerd op basis van populariteit, kwaliteit en waarde voor geld." },
      { type: 'paragraph', content: "We hebben rekening gehouden met de laatste trends, technologische ontwikkelingen en wat mensen echt willen ontvangen. Van gaming tot smart home, van keukenapparatuur tot persoonlijke verzorging - er zit voor ieder wat wils bij!" },

      { type: 'heading', content: "🎮 Gaming & Entertainment" },
      { type: 'paragraph', content: "Gaming blijft enorm populair in 2025. Of je nu een casual gamer bent of een hardcore speler, er is altijd wel iets leuks te vinden." },
      { type: 'gift', content: gift_kerst_2025_1 },

      { type: 'heading', content: "🏠 Smart Home & Huishouden" },
      { type: 'paragraph', content: "Smart home apparaten maken ons leven makkelijker en comfortabeler. In 2025 zien we steeds meer innovatieve producten die je huis slimmer maken." },
      { type: 'gift', content: gift_kerst_2025_2 },

      { type: 'heading', content: "🎧 Audio & Muziek" },
      { type: 'paragraph', content: "Goede audio kwaliteit is essentieel in onze digitale wereld. Of je nu naar muziek luistert, podcasts volgt of videogesprekken voert." },
      { type: 'gift', content: gift_kerst_2025_3 },

      { type: 'heading', content: "👨‍👩‍👧‍👦 Voor de Kinderen" },
      { type: 'paragraph', content: "Voor de jongste gezinsleden hebben we cadeaus geselecteerd die zowel educatief als leuk zijn. Stimuleer hun creativiteit en verbeelding!" },
      { type: 'gift', content: gift_kerst_2025_4 },

      { type: 'heading', content: "☕ Koffie & Keuken" },
      { type: 'paragraph', content: "Voor de koffieliefhebbers en keukenprinsen/prinsessen onder ons. Maak van elke ochtend een feestje met deze premium producten." },
      { type: 'gift', content: gift_kerst_2025_5 },

      { type: 'heading', content: "📸 Fotografie & Creativiteit" },
      { type: 'paragraph', content: "Voor de creatievelingen die van fotografie houden of gewoon graag mooie beelden vastleggen." },
      { type: 'gift', content: gift_kerst_2025_6 },

      { type: 'heading', content: "⏰ Wearables & Gezondheid" },
      { type: 'paragraph', content: "Gezondheid en fitness zijn hot in 2025. Smartwatches en fitness trackers helpen je om fit te blijven en je gezondheid te monitoren." },
      { type: 'gift', content: gift_kerst_2025_7 },

      { type: 'heading', content: "👩‍🍳 Voor de Bakliefhebbers" },
      { type: 'paragraph', content: "Als je iemand kent die graag bakt of meer wil gaan bakken, dan is dit het cadeau waar ze/zij dolgelukkig van worden." },
      { type: 'gift', content: gift_kerst_2025_8 },

      { type: 'heading', content: "💡 Tips voor het Uitzoeken van het Perfecte Cadeau" },
      { type: 'paragraph', content: "Het kiezen van het juiste cadeau kan soms lastig zijn. Hier zijn een paar tips om je te helpen:" },
      { type: 'paragraph', content: "• Denk na over de interesses en hobby's van de ontvanger" },
      { type: 'paragraph', content: "• Overweeg het budget - kwaliteit gaat boven kwantiteit" },
      { type: 'paragraph', content: "• Kies voor duurzame en tijdloze producten" },
      { type: 'paragraph', content: "• Persoonlijke touch maakt elk cadeau specialer" },
      { type: 'paragraph', content: "• Check reviews en ratings voordat je koopt" },

      { type: 'heading', content: "🎄 Laatste Tips voor Kerstmis 2025" },
      { type: 'paragraph', content: "Kerstmis is het feest van geven en delen. Het belangrijkste is niet de waarde van het cadeau, maar de gedachte erachter. Neem de tijd om na te denken over wat de mensen om je heen echt gelukkig maakt." },
      { type: 'paragraph', content: "En vergeet niet: soms zijn de beste cadeaus helemaal geen spullen, maar quality time samen. Plan een gezellige kerst met je dierbaren en maak onvergetelijke herinneringen!" },

      { type: 'heading', content: "❓ Veelgestelde Vragen over Kerstcadeaus 2025" },
      { type: 'paragraph', content: "**Q: Wanneer moet ik kerstcadeaus kopen?**" },
      { type: 'paragraph', content: "A: Begin vroeg! December is druk en prijzen kunnen stijgen. Oktober/november is ideaal om de beste deals te vinden." },

      { type: 'paragraph', content: "**Q: Wat zijn populaire kerstcadeaus voor 2025?**" },
      { type: 'paragraph', content: "A: Tech gadgets, smart home apparaten, gaming producten en persoonlijke verzorgingsproducten zijn erg populair dit jaar." },

      { type: 'paragraph', content: "**Q: Hoe vind ik het juiste cadeau voor iemand?**" },
      { type: 'paragraph', content: "A: Let op hun interesses, hobby's en dagelijkse gewoontes. Een goed cadeau past bij hun levensstijl." }
    ]
  }
];