import urllib.request
import html
import re
import json

def clean_inline_text(text):
    text = html.unescape(text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def clean_explanation_text(text, next_q_id=None):
    text = html.unescape(text)
    # Turn paragraph tags and breaks into newlines
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>|</div>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # If next_q_id is provided, cut off anything starting from next_q_id
    if next_q_id:
        m_cut = re.search(rf'(?:\n|\s|^){next_q_id}\.\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', text)
        if m_cut:
            text = text[:m_cut.start()]
            
    # Cut off standard navigation or footer artifacts
    text = re.sub(r'(?:nahoru|zpět\s+nahoru|otázky\s+č\.\s*\d+).*$', '', text, flags=re.IGNORECASE | re.DOTALL)

    lines = []
    for line in text.split('\n'):
        line = re.sub(r'[ \t]+', ' ', line).strip()
        if line and not any(line.lower().startswith(x) for x in ["nápověda pro přípravu", "obecná část úřednické"]):
            lines.append(line)
            
    res = '\n'.join(lines).strip()
    return res

def get_law_label(qid, qtext, exp):
    t = (qtext + " " + exp).lower()
    if qid >= 276:
        return "Právo Evropské unie"
    if qid >= 111 and qid <= 125:
        return "Zákon o státní službě (č. 234/2014 Sb.)"
    if "listina" in t or "čl. 1" in t or "čl. 2" in t or "základních práv" in t:
        if qid <= 110:
            return "Listina základních práv a svobod (č. 2/1993 Sb.)"
    if "ústava" in t or "ústavy" in t or ("čl." in t and qid <= 45):
        return "Ústava České republiky (č. 1/1993 Sb.)"
    if "obcích" in t or "obecní" in t or "starost" in t or "zastupitelstv" in t and qid <= 110:
        return "Zákon o obcích (č. 128/2000 Sb.)"
    if "krajích" in t or "krajsk" in t and qid <= 110:
        return "Zákon o krajích (č. 129/2000 Sb.)"
    if "praze" in t or "hlavním městě" in t:
        return "Zákon o hl. m. Praze (č. 131/2000 Sb.)"
    if "ministerstev" in t or "kompetenční" in t:
        return "Kompetenční zákon (č. 2/1969 Sb.)"
    if "správní řád" in t or "správním řádu" in t or "správní orgán" in t:
        return "Správní řád (č. 500/2004 Sb.)"
    if "přestupk" in t:
        return "Zákon o přestupcích (č. 250/2016 Sb.)"
    if "finanční kontrol" in t:
        return "Zákon o finanční kontrole (č. 320/2001 Sb.)"
    if "rozpočtov" in t:
        return "Rozpočtová pravidla (č. 218/2000 Sb.)"
    if "veřejných zakáz" in t:
        return "Zákon o zadávání veřejných zakázek (č. 134/2016 Sb.)"
    if "svobodném přístupu" in t or "106/1999" in t:
        return "Zákon o svobodném přístupu k informacím (č. 106/1999 Sb.)"
    if "osobních údaj" in t or "gdpr" in t or "110/2019" in t:
        return "Zákon o zpracování osobních údajů (č. 110/2019 Sb.)"
    if "registru smluv" in t or "340/2015" in t:
        return "Zákon o registru smluv (č. 340/2015 Sb.)"
    if "kontrolní řád" in t or "255/2012" in t:
        return "Kontrolní řád (č. 255/2012 Sb.)"
    if "archivn" in t or "spisov" in t:
        return "Zákon o archivnictví (č. 499/2004 Sb.)"
    if "zákoník práce" in t or "zákoníku práce" in t:
        return "Zákoník práce (č. 262/2006 Sb.)"
    if "odpovědnosti za škodu" in t or "82/1998" in t:
        return "Odpovědnost za škodu způsobenou veřejnou mocí (č. 82/1998 Sb.)"
    if "krizov" in t or "bezpečnost" in t:
        return "Krizové řízení a bezpečnost ČR"
    
    if qid <= 45: return "Ústava České republiky"
    if qid <= 75: return "Listina základních práv a svobod"
    if qid <= 110: return "Územní samospráva (obce a kraje)"
    if qid <= 185: return "Správní řád a kontrolní činnost"
    return "Právní předpisy ve státní správě"

def parse_all():
    pages = [
        (1, 1, 100, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_1.html"),
        (2, 101, 200, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_2.html"),
        (3, 201, 300, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_3.html")
    ]
    
    questions = []
    
    for page_idx, q_min, q_max, url in pages:
        print(f"Loading page {page_idx}...")
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read().decode("utf-8", errors="replace")
        unescaped = html.unescape(raw)
        
        for q_id in range(q_min, q_max + 1):
            next_id = q_id + 1
            
            # Start position
            if q_id == 1:
                m_start = re.search(r'1\.\s+(?:<[^>]+>\s*)*Přijaté zákony podepisuje', unescaped)
            else:
                m_start = re.search(rf'(?:<a\s+name=[\"\']?{q_id}[\"\']?>|(?<=>|\n))\s*{q_id}\.\s*(?:<[^>]+>\s*)*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', unescaped)
                if not m_start:
                    m_start = re.search(rf'\b{q_id}\.\s*(?:<[^>]+>\s*)*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', unescaped)
            
            if not m_start:
                raise Exception(f"Start not found for Q{q_id}")
                
            start_pos = m_start.start()
            
            # End position
            if q_id < q_max:
                m_end = re.search(rf'(?:<a\s+name=[\"\']?{next_id}[\"\']?>|(?<=>|\n))\s*{next_id}\.\s*(?:<[^>]+>\s*)*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', unescaped[start_pos + 15:])
                if not m_end:
                    m_end = re.search(rf'\b{next_id}\.\s*(?:<[^>]+>\s*)*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', unescaped[start_pos + 15:])
                if m_end:
                    end_pos = start_pos + 15 + m_end.start()
                else:
                    end_pos = start_pos + 4500
            else:
                end_pos = unescaped.find("</body>", start_pos)
                if end_pos == -1:
                    end_pos = start_pos + 7000
                    
            chunk = unescaped[start_pos:end_pos]
            
            # 1. Question prompt
            m_q = re.search(rf'{q_id}\.\s*(.*?)(?=(?:<[^>]+>\s*)*a\))', chunk, re.DOTALL | re.IGNORECASE)
            if m_q:
                q_text = clean_inline_text(m_q.group(1))
            else:
                q_text = ""
                
            q_text = re.sub(r'^\s*\d+\.\s*', '', q_text).strip()
            
            # 2. Option A
            m_a = re.search(r'a\)\s*(.*?)(?=(?:<[^>]+>\s*)*b\))', chunk, re.DOTALL)
            opt_a = clean_inline_text(m_a.group(1)) if m_a else ""
            opt_a = re.sub(r'^\s*a\)\s*', '', opt_a).strip()
            
            # 3. Option B
            m_b = re.search(r'b\)\s*(.*?)(?=(?:<[^>]+>\s*)*c\))', chunk, re.DOTALL)
            opt_b = clean_inline_text(m_b.group(1)) if m_b else ""
            opt_b = re.sub(r'^\s*b\)\s*', '', opt_b).strip()

            # 4. Option C and Explanation
            pos_c = chunk.find("c)")
            c_part = chunk[pos_c:] if pos_c != -1 else ""
            m_c = re.search(r'c\)\s*(.*?)(?=</big>|<p|<div|<span style=\"font-style:|<span style=\"color|<b>Zdůvodnění)', c_part, re.DOTALL | re.IGNORECASE)
            
            if m_c:
                opt_c = clean_inline_text(m_c.group(1))
                raw_exp = c_part[m_c.end():]
            else:
                lines = c_part.splitlines()
                opt_c = clean_inline_text(lines[0])
                raw_exp = "\n".join(lines[1:])
                
            opt_c = re.sub(r'^\s*c\)\s*', '', opt_c).strip()
            clean_exp = clean_explanation_text(raw_exp, next_id if q_id < q_max else None)
            
            # 5. Correct answer determination
            correct = None
            if q_id == 158:
                correct = 'b'
            else:
                if re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*(?:<br\s*/?>)?\s*a\)', chunk, re.IGNORECASE) or \
                   re.search(r'a\)\s*(?:<span[^>]*font-weight:\s*bold|<b>|<strong>)', chunk, re.IGNORECASE):
                    correct = 'a'
                elif re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*(?:<br\s*/?>)?\s*b\)', chunk, re.IGNORECASE) or \
                     re.search(r'b\)\s*(?:<span[^>]*font-weight:\s*bold|<b>|<strong>)', chunk, re.IGNORECASE):
                    correct = 'b'
                elif re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*(?:<br\s*/?>)?\s*c\)', chunk, re.IGNORECASE) or \
                     re.search(r'c\)\s*(?:<span[^>]*font-weight:\s*bold|<b>|<strong>)', chunk, re.IGNORECASE):
                    correct = 'c'

            # 6. Okruh
            if q_id <= 110:
                okruh_id = 1
                okruh_title = "1. okruh: Organizace a činnost veřejné správy"
            elif q_id <= 125:
                okruh_id = 2
                okruh_title = "2. okruh: Práva, povinnosti a etika státního zaměstnance"
            elif q_id <= 275:
                okruh_id = 3
                okruh_title = "3. okruh: Právní předpisy obecně dopadající na činnost státní správy"
            else:
                okruh_id = 4
                okruh_title = "4. okruh: Právo Evropské unie"

            questions.append({
                "id": q_id,
                "question": q_text,
                "options": {
                    "a": opt_a,
                    "b": opt_b,
                    "c": opt_c
                },
                "correct": correct,
                "explanation": clean_exp,
                "okruhId": okruh_id,
                "okruhTitle": okruh_title,
                "law": get_law_label(q_id, q_text, clean_exp)
            })

    print(f"Total questions processed: {len(questions)}")
    with open("./src/data/questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("Done writing ./src/data/questions.json!")

if __name__ == '__main__':
    parse_all()
