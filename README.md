# Úřednická zkouška – Příprava na obecnou část (300 otázek)

Moderní interaktivní webová aplikace pro kompletní přípravu na **obecnou část úřednické zkoušky** v České republice. Obsahuje všech **300 oficiálních testových otázek**, správné odpovědi, detailní zdůvodnění a přesné citace zákonných předpisů (dle Ministerstva vnitra ČR a podkladů z webu [svata-cesta.cz](https://svata-cesta.cz)).

Aplikace funguje 100% na straně klienta (offline ready), bez nutnosti externího backendu či databáze, a veškerý studijní pokrok ukládá do prohlížeče (`localStorage`).

---

## 🚀 Hlavní funkce

1. **Procvičovací kvíz (Všech 300 otázek)**
   - Okamžité vyhodnocení odpovědí s barevnou indikací (zelená správná / červená špatná).
   - Kompletní **zdůvodnění a přesná citace zákona** (§ a čl.) ke každé otázce.
   - Filtrování podle **4 oficiálních tematických okruhů**:
     - *1. okruh: Organizace a činnost veřejné správy* (otázky 1–110)
     - *2. okruh: Práva, povinnosti a pravidla etiky státního zaměstnance* (otázky 111–125)
     - *3. okruh: Právní předpisy obecně dopadající na činnost státní správy* (otázky 126–275)
     - *4. okruh: Právo Evropské unie* (otázky 276–300)
   - Filtrování podle konkrétních zákonů (Ústava ČR, Listina, Zákon o státní službě, Správní řád, Zákon o zadávání veřejných zakázek, Registr smluv atd.).
   - Rychlý skok na libovolné číslo otázky (1–300) nebo náhodný výběr.
   - **Interaktivní mapa všech 300 otázek** s barevným stavem (zvládnuto / chyba / neprocvičeno / záložka).

2. **Simulace ostré zkoušky**
   - **30 náhodně vybraných otázek** v přesném poměru okruhů dle metodiky MV ČR.
   - **Časový limit 30 minut** s odpočtem a varováním při vypršení limitu.
   - Možnost **označit otázky k revizi (vlaječka)** před odevzdáním.
   - Oficiální kritérium: **úspěch při zisku alespoň 23 bodů ze 30 (75 %)**.
   - Podrobný výsledkový certifikát, rozpad skóre po okruzích a rozbor chyb s možností **uložit všechny chybné otázky do záložek jedním klikem**.

3. **Seznam všech otázek se správnými odpověďmi (Studijní přehled & Tisk / PDF)**
   - Kompletní přehled všech 300 otázek s okamžitě vyznačenou správnou odpovědí.
   - Možnost přepnout na režim *„Pouze správné odpovědi“* pro rychlé čtení.
   - Tlačítko pro **tisk nebo export do PDF** optimalizované pro čistý tisk bez ovládacích prvků (`@media print`).

4. **Kartičky (Flashcards)**
   - Režim aktivního vybavování: líc (otázka a možnosti), rub (správná odpověď a zdůvodnění).
   - Tlačítka *„Znám“* a *„Musím zopakovat“* pro oddělení zvládnuté látky.
   - Klávesové zkratky: mezerník pro otočení, šipky pro listování.

5. **Fulltextový katalog a vyhledávač**
   - Hledání podle libovolného klíčového slova v otázkách, možnostech i v textech paragrafů (např. *„zkušební doba“*, *„prezident“*, *„odvolání“*, *„50 000“*).
   - Rychlé zkopírování otázky a citace do schránky pro vlastní studijní poznámky.

6. **Tmavý režim (Dark mode)**
   - Plnohodnotný světlý i tmavý režim šetrný k očím při večerním studiu.
   - Automatická detekce preferencí systému a uložení volby uživatele.

7. **Předčítání nahlas (Text-to-Speech)**
   - Hlasová syntéza v češtině pro poslech otázek při dojíždění či odpočinku očí.

8. **Statistika, Chybotéka a správa dat**
   - Sledování celkového pokroku a úspěšnosti v jednotlivých okruzích.
   - Speciální režim *„Procvičit pouze chyby“*.
   - Možnost **exportovat zálohu pokroku do JSON souboru** a opětovně ji nahrát do jiného zařízení.

---

## 🛠️ Použité technologie

- **React 19** & **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide React** (moderní ikony)
- **Web Speech API** (česká hlasová syntéza)
- **Local Storage API** (lokální persistence bez nutnosti registrace)

---

## 💻 Spuštění na vlastním počítači

### Požadavky
- [Node.js](https://nodejs.org/) v18+ nebo v20+
- npm (součástí Node.js)

### Krok za krokem:

1. **Naklonujte repozitář:**
   ```bash
   git clone https://github.com/<vase-uzivatelske-jmeno>/<nazev-repozitare>.git
   cd <nazev-repozitare>
   ```

2. **Nainstalujte závislosti:**
   ```bash
   npm install
   ```

3. **Spusťte vývojový server:**
   ```bash
   npm run dev
   ```
   Aplikace poběží na adrese `http://localhost:3000`.

---

## 📦 Sestavení pro produkci

Pro vygenerování statických souborů do složky `dist`:

```bash
npm run build
```

Náhled produkčního sestavení:
```bash
npm run preview
```

---

## 🌐 Publikace na GitHub Pages

Repozitář obsahuje připravený automatický workflow pro GitHub Actions (`.github/workflows/deploy.yml`).

### Jak zprovoznit GitHub Pages:

1. Vytvořte nový repozitář na GitHubu a nahrajte do něj kód:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Urednicka zkouska 300 otazek"
   git branch -M main
   git remote add origin https://github.com/<vase-uzivatelske-jmeno>/<nazev-repozitare>.git
   git push -u origin main
   ```

2. V nastavení repozitáře na GitHubu (**Settings**):
   - Přejděte v levém menu do sekce **Pages**.
   - V položce **Build and deployment** -> **Source** vyberte **GitHub Actions**.

3. Při každém `git push` do větve `main` se webovka automaticky zkompiluje a publikuje na adrese:
   `https://<vase-uzivatelske-jmeno>.github.io/<nazev-repozitare>/`

Díky konfiguraci `base: './'` v souboru `vite.config.ts` fungují všechny cesty ke stylům a skriptům bez ohledu na název repozitáře.

---

## ⚖️ Zdroj dat a licence

- Otázky, správné odpovědi a odůvodnění vycházejí z veřejných materiálů Ministerstva vnitra České republiky a studijních podkladů dostupných na [svata-cesta.cz](https://svata-cesta.cz).
- Kód aplikace je šířen pod licencí **Apache-2.0**.
