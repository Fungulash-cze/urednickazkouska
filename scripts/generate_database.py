import urllib.request
import html
import re
import json

def strip_tags(text):
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    # clean multiple spaces
    text = re.sub(r'[ \t]+', ' ', text)
    # clean leading/trailing spaces on lines
    lines = [l.strip() for l in text.split('\n')]
    return '\n'.join([l for l in lines if l]).strip()

def detect_law(q_id, question_text, explanation_text):
    full_text = (question_text + " " + explanation_text).lower()
    
    if q_id >= 276:
        return "Právo Evropské unie (Smlouva o EU / SFEU)"
    
    if "listina" in full_text or "čl. 1 " in full_text or "čl. 2 " in full_text or "základních práv" in full_text and q_id < 75:
        return "Listina základních práv a svobod (č. 2/1993 Sb.)"
    if "ústava" in full_text or "ústavy" in full_text or ("čl." in full_text and q_id <= 45):
        return "Ústava České republiky (č. 1/1993 Sb.)"
    if "obcích" in full_text or "obecní" in full_text or "zastupitelstvo obce" in full_text or "starost" in full_text:
        return "Zákon o obcích (č. 128/2000 Sb.)"
    if "krajích" in full_text or "krajské" in full_text or "hejtman" in full_text:
        return "Zákon o krajích (č. 129/2000 Sb.)"
    if "praze" in full_text or "hlavním městě" in full_text:
        return "Zákon o hl. m. Praze (č. 131/2000 Sb.)"
    if "ministerstev" in full_text or "kompetenční" in full_text:
        return "Kompetenční zákon (č. 2/1969 Sb.)"
    if q_id >= 111 and q_id <= 125 or "státní službě" in full_text or "služební" in full_text:
        return "Zákon o státní službě (č. 234/2014 Sb.)"
    if "správní řád" in full_text or "správním řádu" in full_text or "správní orgán" in full_text:
        return "Správní řád (č. 500/2004 Sb.)"
    if "přestupk" in full_text:
        return "Zákon o odpovědnosti za přestupky (č. 250/2016 Sb.)"
    if "finanční kontrol" in full_text:
        return "Zákon o finanční kontrole (č. 320/2001 Sb.)"
    if "rozpočtov" in full_text:
        return "Rozpočtová pravidla (č. 218/2000 Sb. / 250/2000 Sb.)"
    if "veřejných zakáz" in full_text:
        return "Zákon o zadávání veřejných zakázek (č. 134/2016 Sb.)"
    if "svobodném přístupu" in full_text or "106/1999" in full_text:
        return "Zákon o svobodném přístupu k informacím (č. 106/1999 Sb.)"
    if "osobních údaj" in full_text or "gdpr" in full_text or "110/2019" in full_text:
        return "Zákon o zpracování osobních údajů (č. 110/2019 Sb.)"
    if "registru smluv" in full_text or "340/2015" in full_text:
        return "Zákon o registru smluv (č. 340/2015 Sb.)"
    if "kontrolní řád" in full_text or "255/2012" in full_text:
        return "Kontrolní řád (č. 255/2012 Sb.)"
    if "archivn" in full_text or "spisov" in full_text:
        return "Zákon o archivnictví a spisové službě (č. 499/2004 Sb.)"
    if "zákoník práce" in full_text or "zákoníku práce" in full_text:
        return "Zákoník práce (č. 262/2006 Sb.)"
    if "odpovědnosti za škodu" in full_text or "82/1998" in full_text:
        return "Zákon o odpovědnosti za škodu způsobenou výkonem veřejné moci (č. 82/1998 Sb.)"
    if "krizov" in full_text or "bezpečnost" in full_text:
        return "Krizové řízení a bezpečnost ČR"
    
    # Defaults based on range
    if q_id <= 45:
        return "Ústava České republiky (č. 1/1993 Sb.)"
    elif q_id <= 75:
        return "Listina základních práv a svobod (č. 2/1993 Sb.)"
    elif q_id <= 110:
        return "Územní samospráva (obce a kraje)"
    elif q_id <= 125:
        return "Zákon o státní službě (č. 234/2014 Sb.)"
    elif q_id <= 185:
        return "Správní řád a kontrolní činnost"
    elif q_id <= 275:
        return "Právní předpisy ve státní správě"
    else:
        return "Právo Evropské unie"

def generate_database():
    pages = [
        (1, 1, 100, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_1.html"),
        (2, 101, 200, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_2.html"),
        (3, 201, 300, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_3.html")
    ]
    
    questions = []
    
    for page_idx, q_min, q_max, url in pages:
        print(f"Fetching page {page_idx} from {url}...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        raw = urllib.request.urlopen(req).read().decode("utf-8", errors="replace")
        unescaped = html.unescape(raw)
        
        for q_id in range(q_min, q_max + 1):
            next_id = q_id + 1
            
            patterns = [
                rf'<a\s+name=[\"\']?{q_id}[\"\']?>',
                rf'(?:<big>|<br\s*/?>|<td>|<tr>|\n|^)\s*{q_id}\.\s+'
            ]
            m_start = None
            for p in patterns:
                m_start = re.search(p, unescaped, re.IGNORECASE)
                if m_start:
                    break
            
            if not m_start:
                m_start = re.search(rf'\b{q_id}\.\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', unescaped)
                
            if not m_start:
                raise Exception(f"Cannot find Q{q_id}")
                
            start_pos = m_start.start()
            
            if q_id < q_max:
                next_patterns = [
                    rf'<a\s+name=[\"\']?{next_id}[\"\']?>',
                    rf'(?:<big>|<br\s*/?>|<td>|<tr>|\n|^)\s*{next_id}\.\s+'
                ]
                m_end = None
                for np in next_patterns:
                    m_end = re.search(np, unescaped[start_pos + 15:], re.IGNORECASE)
                    if m_end:
                        break
                if m_end:
                    end_pos = start_pos + 15 + m_end.start()
                else:
                    end_pos = start_pos + 4500
            else:
                end_pos = unescaped.find("</body>", start_pos)
                if end_pos == -1:
                    end_pos = start_pos + 7000
                    
            chunk = unescaped[start_pos:end_pos]
            
            # Question text
            m_q = re.search(rf'(?:{q_id}\.\s*)(.*?)(?=<br[^>]*>\s*(?:<span[^>]*>)?\s*a\)|<p[^>]*>\s*(?:<span[^>]*>)?\s*a\)|(?:<span[^>]*>)?\s*a\))', chunk, re.DOTALL | re.IGNORECASE)
            if m_q:
                q_text = strip_tags(m_q.group(1))
            else:
                m_q2 = re.search(rf'{q_id}\.\s*(.*?)(?=\ba\))', chunk, re.DOTALL)
                q_text = strip_tags(m_q2.group(1)) if m_q2 else ""

            q_text = re.sub(r'^\s*\d+\.\s*', '', q_text).strip()
            
            # Options
            opt_a_match = re.search(r'a\)\s*(.*?)(?=(?:<br\s*/?>|\n)*\s*(?:<span[^>]*>|<b>|<strong>)?\s*b\)|$)', chunk, re.DOTALL | re.IGNORECASE)
            opt_b_match = re.search(r'b\)\s*(.*?)(?=(?:<br\s*/?>|\n)*\s*(?:<span[^>]*>|<b>|<strong>)?\s*c\)|$)', chunk, re.DOTALL | re.IGNORECASE)
            opt_c_match = re.search(r'c\)\s*(.*?)(?=(?:<br\s*/?>\s*)*\s*(?:</big>|<p|<div|<span style="color|<b>Zdůvodnění|$))', chunk, re.DOTALL | re.IGNORECASE)

            opt_a = strip_tags(opt_a_match.group(1)) if opt_a_match else ""
            opt_b = strip_tags(opt_b_match.group(1)) if opt_b_match else ""
            opt_c = strip_tags(opt_c_match.group(1)) if opt_c_match else ""

            opt_a = re.sub(r'^\s*a\)\s*', '', opt_a).strip()
            opt_b = re.sub(r'^\s*b\)\s*', '', opt_b).strip()
            opt_c = re.sub(r'^\s*c\)\s*', '', opt_c).strip()

            # Determine correct option
            correct = None
            if q_id == 158:
                correct = 'b'
            else:
                # check if bold is applied to a), b) or c)
                # pattern: <span style="...font-weight: bold..."> optional <br> a) ...
                if re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*(?:<br\s*/?>)?\s*a\)', chunk, re.IGNORECASE) or \
                   re.search(r'a\)\s*(?:<span[^>]*font-weight:\s*bold|<b>|<strong>)', chunk, re.IGNORECASE):
                    correct = 'a'
                elif re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*(?:<br\s*/?>)?\s*b\)', chunk, re.IGNORECASE) or \
                     re.search(r'b\)\s*(?:<span[^>]*font-weight:\s*bold|<b>|<strong>)', chunk, re.IGNORECASE):
                    correct = 'b'
                elif re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*(?:<br\s*/?>)?\s*c\)', chunk, re.IGNORECASE) or \
                     re.search(r'c\)\s*(?:<span[^>]*font-weight:\s*bold|<b>|<strong>)', chunk, re.IGNORECASE):
                    correct = 'c'

            # Explanation: everything after option c up to end of chunk
            pos_c = chunk.find("c)")
            explanation = ""
            if pos_c != -1:
                # Find the line break after c) ...
                c_part = chunk[pos_c:]
                m_after_c = re.search(r'c\)\s*[^\n<]+(?:<br\s*/?>|\n)+', c_part, re.IGNORECASE)
                if m_after_c:
                    explanation = strip_tags(c_part[m_after_c.end():])
                else:
                    lines = c_part.splitlines()
                    explanation = strip_tags("\n".join(lines[1:]))

            exp_lines = []
            for l in explanation.split('\n'):
                l = l.strip()
                if not l:
                    continue
                if any(x in l.lower() for x in ["zpět nahoru", "urednicka_zkouska", "otázky č.", "obecná část", "nápověda pro přípravu"]):
                    continue
                exp_lines.append(l)
            clean_exp = '\n'.join(exp_lines).strip()
            
            # Okruh
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

            law_tag = detect_law(q_id, q_text, clean_exp)

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
                "law": law_tag
            })
            
    # Verify everything
    assert len(questions) == 300, f"Expected 300 questions, got {len(questions)}"
    for q in questions:
        assert q["id"] >= 1 and q["id"] <= 300
        assert q["question"], f"Missing question for Q{q['id']}"
        assert q["options"]["a"], f"Missing option a for Q{q['id']}"
        assert q["options"]["b"], f"Missing option b for Q{q['id']}"
        assert q["options"]["c"], f"Missing option c for Q{q['id']}"
        assert q["correct"] in ["a", "b", "c"], f"Invalid correct answer '{q['correct']}' for Q{q['id']}"
        assert q["explanation"], f"Missing explanation for Q{q['id']}"

    print("ALL 300 QUESTIONS VALIDATED SUCCESSFULLY!")
    
    # Save to src/data/questions.json
    import os
    os.makedirs("./src/data", exist_ok=True)
    with open("./src/data/questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("Saved ./src/data/questions.json successfully!")

if __name__ == '__main__':
    generate_database()
